# Garden V3 — seven directly joinable scenes

Generated with the built-in `image_gen` tool on 2026-11-27. No CLI/API fallback.

## Artwork and runtime files

- `bench.png`: reading bench, book, stepping stones and small shrubs.
- `ferns.png`: sapling, rocks and ferns.
- `planter.png`: planter, simple leaves, rocks and grass tufts.
- canopy.png, ranch.png, 	runk.png, allen-log.png: large cropped garden details entering through the image edges. Prompts and layering are documented in EXTRA_PROMPTS.md.
- Source PNGs are 1024×1536 RGBA and are **not inside the public directory**.
- Runtime exports: `public/assets/garden-v3/{bench,ferns,planter,canopy,branch,trunk,fallen-log}-{480,1024}.webp`.
- All variants preserve the 2:3 width:height ratio. Mobile is 480×720; PC is 1024×1536.
- Sizes are recorded in `public/assets/garden-v3/sizes.json`.

## Connector contract

All scenes are transparent decoration layers over one continuous CSS ground.
The first and last 128 source rows have no visible artwork. Generated alpha=1
noise is discarded during export; visible painted pixels are not altered.
Exports are decoded again to verify completely empty alpha at their top/bottom.

There is no CSS mask, blur, opacity fade, overlapping tile or edge crossfade.
Illustrations meet at their exact full-height boundary. The ground beneath both
sides is the same element and color. The test checks rendered pixels at adjacent scene pairs at widths 375/768/1280/1920.

`public/js/learning-garden.js` renders one scenery layer across **all** chapters.
Its scene height is width × 1.5 and does not depend on chapter length. More nodes
add more scenes. The first scene starts at -25% of its height so its empty top
connector does not create a blank first screen. ResizeObserver adjusts scenes
when available map width changes, including sidebar changes. IntersectionObserver
loads nearby assets; the browser reuses the same seven URLs down the map.

The neutral garden decorations are shared by the existing seasonal themes; the
ground palette and existing node icons still follow the selected theme. This
delivery contains seven neutral garden scenes, not nine new holiday sets.
Dark mode adjusts ground and decoration brightness. No additional animation is
necessary to make the connectors work.

## Rebuild and verify

Requires Python/Pillow and the repository's npm dependencies with local Chrome.

```powershell
python scripts/build-garden-v3.py
node --check public/js/learning-garden.js
node --test tests/test_garden_scene_layout.js
git diff --check
```

The UI test uses a static server and explicit in-memory course fixtures; it does
not create accounts, courses, progress or rewards in the application database.
Tests preserve theory/practice navigation, node counts, independent stage stars,
image proportions, viewport resizing and the absence of faded joins.
Screenshots are written into `outputs/`, including `garden-v3-scenes-preview.png`.

## Prompt set

Each initial generation used `transparent_background: true` and the common
prompt below with the corresponding scene sentence inserted after the canvas spec.

```text
Use case: stylized-concept. Create ONE production background decoration layer for a vertically scrolling educational game garden map. Portrait canvas 1024 x 1536. PNG with genuine transparent background.
[SCENE SENTENCE]
Art style: clean minimal hand-painted 2D storybook game illustration, muted sage green, warm pale stone, low contrast, simple broad painted shapes and clean contours, very few details, soft natural daylight, no photorealistic texture. All objects sit on a top-down/three-quarter garden ground plane, no horizon or sky. Composition critical: objects only in outer left 22% and right 22% of canvas, only between y=380 and y=1160. Center 56% completely transparent for UI learning path. TOP 320 pixels AND BOTTOM 320 pixels entirely transparent with ZERO marks, ZERO shadows, ZERO foliage; these are exact empty connector zones for assembling seamless maps. Keep all artwork away from canvas edges by 20 px. Small tight ground contact shadows permitted only beneath objects inside middle area. NO full scene fill, NO colored background, NO gradient background, NO text, no frames, no UI, no characters, no path painted in the picture, no sparkles, no flowers. This is a restrained quiet decoration cutout layer, not a framed illustration. Transparent outside the sparse middle-edge objects.
```

Scene sentences:

```text
Scene A: a modest little wooden garden bench with one closed book, three rounded stepping stones near LEFT margin in middle third; small group of simple green shrubs near RIGHT margin slightly lower. No flowers.

Scene B: a small cluster of smooth warm gray stones and fern fronds near RIGHT margin in middle third; a single small leafy sapling near LEFT margin, asymmetrical and spacious. No bench, no flowers.

Scene C: one low terracotta planter with simple rounded green leaves near LEFT margin in middle third; a loose cluster of pale stones with two grass tufts near RIGHT margin slightly higher. No bench, no flowers.
```

Each generated image was then edited individually with `image_gen`, preserving
transparency, using this refinement prompt:

```text
Precise object edit for a production seamless game decoration layer. Preserve the same objects, same placements, same portrait 1024x1536 canvas and restrained simple hand-painted style. REMOVE EVERY diffuse colored glow, mist, haze, ambient blob, feathered ground patch and wide shadow surrounding the objects. Restore clean genuine transparent pixels around each object. Only the sharply bounded actual objects and a tiny crisp ground-contact shadow directly under their feet should remain. The current wide fuzzy brown/green halos must be completely gone. Object colors should be opaque and clear, leaves readable. TOP 320px and BOTTOM 320px must be completely empty transparent alpha=0, with NO residual low-opacity speckles at all. Central 50% also transparent; no background. No fade effects anywhere. Do not add objects or flowers or text. This is a clean cutout on transparent canvas, NOT a vignette or atmospheric illustration.
```

The original three-scene delivery measured 256 empty rows; the expanded seven-scene connector contract is **128 measured rows**, rather than an
assumption that every requested 320-row margin was obeyed exactly by generation.
