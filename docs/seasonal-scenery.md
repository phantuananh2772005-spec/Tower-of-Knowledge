# Seasonal study scenery

Eight image packs complement the existing Halloween pack: everyday garden, 20 November, Christmas, New Year, Tet, Valentine, 8 March, 26 March. Generated with the built-in image generation tool.

Art direction / prompt set: refined watercolor illustrations for adult students; contemporary Vietnamese courtyards, tropical sunlight, greenery, notebooks and simple flowers. Teachers Day uses a modest bouquet and pens; Christmas uses a small evergreen and warm lights without snow; New Year uses star confetti and light strings; Tet uses apricot/peach blossoms and plain red envelopes; Valentine uses roses and a plain envelope; 8 March uses tulips and flowers; 26 March uses seedlings, daisies and blue wildflowers. Exclude bronze drums, flags/emblems, pagodas, stereotypical cultural props and European fantasy castles. No words or UI rendered into images.

Each generated atlas has six separate compositions in a 3-column, 2-row grid: desktop header; transparent desktop card frame; sidebar still life; transparent mobile upper-right corner; transparent mobile lower-right cluster; mobile header. `tools/export_scenic_themes.py` crops 5px cell gutters, removes alpha below 40 to clean faint transparency residue, resizes and exports AVIF/WebP. Originals stay outside the runtime public directory.

Desktop uses header + sidebar + card frame. Mobile (<768px) uses its own header and two small transparent decorations, with no desktop frame/sidebar fetches. CSS uses `cover` or aspect-preserving sizes, never stretches mobile artwork. Only the selected theme loads. The existing theme selector and automatic date schedule control scenery as well as the switch. Tet currently follows the existing 2027 date window.

Actual new-pack AVIF-capable payload: desktop roughly 57–75 KiB; mobile 21–30 KiB per selected theme. Existing Halloween: about 175 KiB desktop /29 KiB mobile. WebP fallback is larger. Exact per-file bytes are in each pack's `sizes.json`.

Verification: `node tests/test_scenic_themes.js`, `node tests/test_scenic_skin.js`, `node tests/test_season_switch.js`, `node tests/test_theme_reveal.js`. Tests use a static preview on localhost:3002; no production database data is changed.
