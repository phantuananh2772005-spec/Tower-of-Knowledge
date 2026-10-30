# Map design study

Preview: `/design/map-studio.html`. Four independent visual treatments share a scrollable 15-node demonstration. No API calls or real learning progress updates are performed. This does not replace the production learning map.

Generated with the built-in image_gen tool; originals preserved under the Codex generated_images directory. WebP conversion/resizing only, using Pillow. The natural treatment is synthetic, not a photograph of a real location. The clay tree preserves genuine alpha transparency. Combined delivery size is approximately 850 KB, reused across chapters.

## Assets and prompts

### painted-meadow.webp (960 × 1440)

Create one production-quality raster background asset for a Vietnamese educational game's vertically scrolling learning map. Portrait 2:3 composition, no text, no UI, no path, no milestones, no characters. Beautiful hand-painted gouache and watercolor meadow, soft sage grass with natural brush texture, small flowering shrubs and rounded leafy trees arranged along the far left and far right margins, a few warm cream pebbles and tiny pastel wildflowers, airy daylight, delicate paper grain. The central 55 percent must remain quiet uninterrupted light grass for interactive lesson nodes to be drawn later. Sophisticated illustrated storybook landscape, varied organic foliage, art-directed restrained palette, inviting not childish. Entire scene viewed almost overhead with a slight isometric suggestion. Avoid geometric SVG-looking trees, flat circles, candy shapes, excessive tiny detail, dark shadows. Plants cropped naturally at edges, an open continuous meadow at top and bottom so the image can be placed along a long scroll.

### natural-meadow.webp (960 × 1440)

Create one photorealistic raster background asset for a learning-map web interface. Portrait 2:3, overhead drone-like view of a tranquil small botanical meadow in soft morning daylight. Rich realistic grass blades, soft moss, ferns, small flowering perennials, tiny daisies and low rounded shrubs only along the leftmost and rightmost quarter of the composition. Central 55 percent is very calm pale green short lawn, almost empty, gently defocused to provide clear space for interactive learning nodes later. No visible path, no text, no people, no buildings, no water, no UI, no animal. Natural soft texture and physically plausible light, restrained cinematic color grading, a calm real garden rather than fantasy scenery. No heavy vignette, no excessive contrast. Keep center uncluttered and edges detailed.

### clay-tree.webp (640 × 640, transparent)

A single beautifully rendered miniature leafy garden tree for a 2.5D educational map, isolated on a truly transparent background. Three-quarter isometric view, full tree including its little irregular grassy island base and a tiny clump of cream daisies. Handmade clay and soft felt diorama aesthetic, rounded layered leaves with nuanced organic texture, natural sage and pear green colors, warm brown trunk visibly branching, soft ambient occlusion and believable gentle lighting, subtle contact shadow restricted to the small grassy island. Polished cozy premium casual-game asset, not a flat icon, not polygonal low-poly, not a sphere on a stick, no text, no watermark, no backdrop, no border. Occupy most of the square canvas with generous transparent breathing room.

## Interaction and validation

The ASCII scene is drawn with text/CSS, inspired by the supplied screenshot; it does not identify or reuse the product shown there. Motion can be paused and respects prefers-reduced-motion. Completed chapters increase scene color and add flowers. Progress, frame width and node selection are demo state only.

Validated at widths 375, 768, 1280 and 1600: all four styles, 15 nodes, vertical scrolling, completed chapter states, return-to-current button, motion toggle, four-card comparison, no horizontal page overflow and no JavaScript errors.
