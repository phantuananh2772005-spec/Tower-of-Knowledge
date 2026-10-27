import os
import sys
import glob
from PIL import Image
import numpy as np

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

TARGET_PETS = ["kylin_qilin", "spike_hedgehog", "stone_golem"]
BASE_DIR = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\public\assets\pets"
BRAIN_DIR = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29"

def flip_and_rebuild_pet(pet_id):
    pet_dir = os.path.join(BASE_DIR, pet_id)
    idle_dir = os.path.join(pet_dir, "02_processed_frames", "idle")
    atk_dir = os.path.join(pet_dir, "02_processed_frames", "attack")
    sheet_dir = os.path.join(pet_dir, "03_spritesheet")

    print(f"--- Processing {pet_id} ---")

    # 1. Flip idle frames
    idle_files = sorted(glob.glob(os.path.join(idle_dir, "clean_*.png")))
    if not idle_files:
        print(f"Error: no idle frames found for {pet_id}")
        return

    flipped_idle_images = []
    for fpath in idle_files:
        img = Image.open(fpath).convert("RGBA")
        flipped = img.transpose(Image.FLIP_LEFT_RIGHT)
        flipped.save(fpath)
        flipped_idle_images.append(flipped)

    # 2. Flip attack frames
    atk_files = sorted(glob.glob(os.path.join(atk_dir, "clean_*.png")))
    flipped_atk_images = []
    for fpath in atk_files:
        img = Image.open(fpath).convert("RGBA")
        flipped = img.transpose(Image.FLIP_LEFT_RIGHT)
        flipped.save(fpath)
        flipped_atk_images.append(flipped)

    # 3. Rebuild 24-frame strips (2400 x 100)
    w_total = len(flipped_idle_images) * 100
    idle_strip = Image.new("RGBA", (w_total, 100), (0, 0, 0, 0))
    for i, im in enumerate(flipped_idle_images):
        idle_strip.paste(im, (i * 100, 0))
    idle_strip.save(os.path.join(sheet_dir, f"{pet_id}_idle_strip.png"))
    idle_strip.save(os.path.join(sheet_dir, f"{pet_id}_strip.png"))

    if flipped_atk_images:
        w_atk = len(flipped_atk_images) * 100
        atk_strip = Image.new("RGBA", (w_atk, 100), (0, 0, 0, 0))
        for i, im in enumerate(flipped_atk_images):
            atk_strip.paste(im, (i * 100, 0))
        atk_strip.save(os.path.join(sheet_dir, f"{pet_id}_attack_strip.png"))

    # 4. Rebuild Still
    still_img = flipped_idle_images[0]
    still_img.save(os.path.join(sheet_dir, f"{pet_id}_still.png"))
    still_img.save(os.path.join(BRAIN_DIR, f"{pet_id}_still.png"))

    # 5. Rebuild transparent GIFs (70ms duration, loop 0, disposal 2)
    idle_gif_path = os.path.join(sheet_dir, f"{pet_id}_idle.gif")
    anim_gif_path = os.path.join(sheet_dir, f"{pet_id}_anim.gif")
    flipped_idle_images[0].save(
        idle_gif_path,
        save_all=True,
        append_images=flipped_idle_images[1:],
        duration=70,
        loop=0,
        disposal=2
    )
    flipped_idle_images[0].save(
        anim_gif_path,
        save_all=True,
        append_images=flipped_idle_images[1:],
        duration=70,
        loop=0,
        disposal=2
    )

    # Copy to brain dir
    flipped_idle_images[0].save(
        os.path.join(BRAIN_DIR, f"{pet_id}_idle.gif"),
        save_all=True,
        append_images=flipped_idle_images[1:],
        duration=70,
        loop=0,
        disposal=2
    )

    if flipped_atk_images:
        atk_gif_path = os.path.join(sheet_dir, f"{pet_id}_attack.gif")
        flipped_atk_images[0].save(
            atk_gif_path,
            save_all=True,
            append_images=flipped_atk_images[1:],
            duration=70,
            loop=0,
            disposal=2
        )
        flipped_atk_images[0].save(
            os.path.join(BRAIN_DIR, f"{pet_id}_attack.gif"),
            save_all=True,
            append_images=flipped_atk_images[1:],
            duration=70,
            loop=0,
            disposal=2
        )

    print(f"✓ Flipped and regenerated {pet_id} successfully!")

def rebuild_montage():
    all_pets = [
        "pyra_phoenix", "kim_quy_turtle", "stone_golem", "maneki_neko", "bambo_panda",
        "byte_robot", "astra_stag", "kylin_qilin", "inky_octopus", "spike_hedgehog"
    ]
    montage_w = 100 * 5
    montage_h = 100 * 2
    montage = Image.new("RGBA", (montage_w, montage_h), (20, 24, 39, 255)) # Dark navy background
    for i, pid in enumerate(all_pets):
        row = i // 5
        col = i % 5
        still_p = os.path.join(BASE_DIR, pid, "03_spritesheet", f"{pid}_still.png")
        if os.path.exists(still_p):
            im = Image.open(still_p).convert("RGBA")
            montage.paste(im, (col * 100, row * 100), im)
    montage_path = os.path.join(BRAIN_DIR, "top_10_pets_montage.png")
    montage.save(montage_path)
    print(f"✓ Rebuilt top_10_pets_montage.png at {montage_path}")

if __name__ == "__main__":
    for pid in TARGET_PETS:
        flip_and_rebuild_pet(pid)
    rebuild_montage()
    print("ALL TARGET PETS FLIPPED SUCCESSFULLY!")
