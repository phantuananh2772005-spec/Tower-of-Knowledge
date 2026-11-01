# Autumn study scenic skin v1

Approved reference: exec-ac5ab77e-ddd3-4cdc-b541-901ec3bda67e.png.
Generated background sources retained in Codex generated_images:
- Header: exec-afe7fc4c PNG.
- Sidebar: exec-fd81241c PNG.
- Transparent welcome frame: exec-6ae9ea7f PNG.

Only crop/resize and compression applied to generated art. No text or UI is baked into the images.
Header exports: 1440 and 640 px, AVIF with WebP fallback. Sidebar: 320px AVIF/WebP. Desktop transparent frame: 960px WebP; mobile uses cropped corner and book layers (240px / 160px), not a stretched desktop frame. Actual newly requested artwork in Chrome: desktop 179206 bytes, mobile 29810 bytes. Only one responsive set/format downloads. No sidebar painting request on mobile. Full inventory with fallback sizes: sizes.json.

The scenic skin is a separate opt-out autumn illustration setting (tok-scenic-skin on/off) in Settings, independent of the seasonal light/dark button. Turning it off makes zero scenic-art requests on a fresh page. Existing SVG pumpkin animation and theme controls remain unchanged. No changes to course logic, economy or database.
