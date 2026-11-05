/**
 * Pet Studio Routes
 * Dedicated API endpoints for Pet Sprite Extraction, Watermark Removal,
 * Interactive Mask Protection, and Spritesheet Generation.
 */

const express = require('express');
const router = express.Router();
router.use(require('../middlewares/auth.middleware').requireAdmin);
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const DEFAULT_VIDEO_DIR = 'C:\\Users\\phant\\Downloads\\ado';

const videoRoot = path.resolve(process.env.PET_STUDIO_VIDEO_DIR || DEFAULT_VIDEO_DIR);
const python = process.env.PET_STUDIO_PYTHON || (process.platform === 'win32' ? 'py' : 'python3');

function resolveVideo(input) {
  if (typeof input !== 'string' || path.extname(input).toLowerCase() !== '.mp4') return null;
  try {
    const fullPath = fs.realpathSync(input);
    const relative = path.relative(fs.realpathSync(videoRoot), fullPath);
    return relative && relative !== '..' && !relative.startsWith('..' + path.sep)
      && !path.isAbsolute(relative) && fs.statSync(fullPath).isFile() ? fullPath : null;
  } catch {
    return null;
  }
}

// 1. Get available videos in Downloads/ado
router.get('/videos', (req, res) => {
  try {
    const customDir = videoRoot;
    if (!fs.existsSync(customDir)) {
      return res.json({ success: true, data: { directory: customDir, videos: [] } });
    }

    const files = fs.readdirSync(customDir);
    const mp4Files = files
      .filter(f => resolveVideo(path.join(customDir, f)))
      .map(f => {
        const fullPath = path.join(customDir, f);
        const stat = fs.statSync(fullPath);
        return {
          filename: f,
          fullPath,
          sizeMb: (stat.size / (1024 * 1024)).toFixed(2),
          modifiedTime: stat.mtime
        };
      })
      .sort((a, b) => b.modifiedTime - a.modifiedTime);

    res.json({
      success: true,
      data: {
        directory: customDir,
        videos: mp4Files
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Extract a preview frame for a cell at a specific second
router.post('/preview-cell', (req, res) => {
  const { videoPath: inputVideo, cellIndex = 1, timestampSec = 0.5, watermarkBox, greenThresh = 40, despill = true } = req.body;

  const videoPath = resolveVideo(inputVideo);
  if (!videoPath) {
    return res.status(400).json({ success: false, error: 'Video path not found' });
  }

  const scriptPath = path.join(__dirname, '..', 'tools', 'pet_sprite_studio.py');
  const tempPreviewDir = path.join(__dirname, '..', 'public', 'assets', 'pets', '_preview');
  fs.mkdirSync(tempPreviewDir, { recursive: true });

  const py = spawn(python, [
    scriptPath,
    '--video', videoPath,
    '--cell', String(cellIndex),
    '--start', String(timestampSec),
    '--end', String(Number(timestampSec) + 0.1),
    '--frames', '1',
    '--size', '128',
    '--name', '_temp_prev',
    '--out', tempPreviewDir
  ], { timeout: 30000 });

  py.stdout.resume();
  py.stderr.resume();

  py.on('error', () => {});
  py.on('close', code => {
    if (code !== 0) {
      return res.status(500).json({ success: false, error: 'Không xử lý được video. Kiểm tra cấu hình Python và video nguồn.' });
    }

    try {
      const stillPath = path.join(tempPreviewDir, '_temp_prev', '03_spritesheet', '_temp_prev_still.png');
      const rawPath = path.join(tempPreviewDir, '_temp_prev', '01_raw_frames', 'frame_000.png');

      let stillBase64 = null;
      let rawBase64 = null;
      if (fs.existsSync(stillPath)) {
        stillBase64 = 'data:image/png;base64,' + fs.readFileSync(stillPath).toString('base64');
      }
      if (fs.existsSync(rawPath)) {
        rawBase64 = 'data:image/png;base64,' + fs.readFileSync(rawPath).toString('base64');
      }

      res.json({
        success: true,
        data: {
          rawImage: rawBase64,
          cleanImage: stillBase64
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
});

// 3. Process & Export Full Sprite Set
router.post('/export', (req, res) => {
  const {
    videoPath: inputVideo,
    cellIndex = 1,
    petName = 'pet_custom',
    startSec = 0.0,
    endSec = 4.0,
    numFrames = 8,
    targetSize = 84,
    greenThresh = 40,
    despill = true,
    protectMaskBase64
  } = req.body;

  const videoPath = resolveVideo(inputVideo);
  if (!videoPath) {
    return res.status(400).json({ success: false, error: 'Video path not found' });
  }

  if (!Number.isInteger(numFrames) || numFrames < 1 || numFrames > 60
    || !Number.isInteger(targetSize) || targetSize < 16 || targetSize > 512
    || !Number.isFinite(startSec) || !Number.isFinite(endSec) || startSec < 0
    || endSec <= startSec || endSec - startSec > 60
    || typeof petName !== 'string' || !/^[a-z0-9_]{1,64}$/i.test(petName)
    || (protectMaskBase64 != null && (typeof protectMaskBase64 !== 'string' || protectMaskBase64.length > 500000))) {
    return res.status(400).json({ success: false, error: 'Thông số xuất ảnh không hợp lệ.' });
  }

  // Save mask to temp file if provided
  let maskPath = null;
  if (protectMaskBase64 && protectMaskBase64.includes('base64,')) {
    const base64Data = protectMaskBase64.split('base64,')[1];
    maskPath = path.join(__dirname, '..', 'public', 'assets', 'pets', '_temp_mask_' + require('node:crypto').randomUUID() + '.png');
    fs.writeFileSync(maskPath, Buffer.from(base64Data, 'base64'));
  }

  const scriptPath = path.join(__dirname, '..', 'tools', 'pet_sprite_studio.py');
  const exportBaseDir = path.join(__dirname, '..', 'public', 'assets', 'pets');

  const args = [
    scriptPath,
    '--video', videoPath,
    '--cell', String(cellIndex),
    '--name', String(petName).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    '--start', String(startSec),
    '--end', String(endSec),
    '--frames', String(numFrames),
    '--size', String(targetSize),
    '--out', exportBaseDir
  ];

  if (maskPath) {
    args.push('--mask', maskPath);
  }

  const py = spawn(python, args, { timeout: 120000 });
  py.stdout.resume();
  py.stderr.resume();

  py.on('error', () => {});
  py.on('close', code => {
    // Clean up mask
    if (maskPath && fs.existsSync(maskPath)) {
      try { fs.unlinkSync(maskPath); } catch (_) {}
    }

    if (code !== 0) {
      return res.status(500).json({ success: false, error: 'Không xử lý được video. Kiểm tra cấu hình Python và video nguồn.' });
    }

    try {
      const cleanPetName = String(petName).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const petDir = path.join(exportBaseDir, cleanPetName);
      const sheetDir = path.join(petDir, '03_spritesheet');
      const gifPath = path.join(sheetDir, `${cleanPetName}_anim.gif`);
      const stripPath = path.join(sheetDir, `${cleanPetName}_strip.png`);
      const stillPath = path.join(sheetDir, `${cleanPetName}_still.png`);

      let gifBase64 = null;
      if (fs.existsSync(gifPath)) {
        gifBase64 = 'data:image/gif;base64,' + fs.readFileSync(gifPath).toString('base64');
      }

      res.json({
        success: true,
        data: {
          petName: cleanPetName,
          petDir,
          webPaths: {
            strip: `/assets/pets/${cleanPetName}/03_spritesheet/${cleanPetName}_strip.png`,
            still: `/assets/pets/${cleanPetName}/03_spritesheet/${cleanPetName}_still.png`,
            gif: `/assets/pets/${cleanPetName}/03_spritesheet/${cleanPetName}_anim.gif`
          },
          gifBase64
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
});

module.exports = router;
