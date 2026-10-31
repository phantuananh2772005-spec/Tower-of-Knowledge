# Bí ngô Tri Thức — header integration

## Reference and scope
The supplied `Bí ngô Tri Thức – bản demo.html` remains untouched. Exactly its SVG and animation CSS are used, with one `play` instance. Preview-only rules and `.rp` are omitted. No demo page styles or demo script are imported. Existing layout, theme switch, bat and learning pages are unchanged.

## Files
- `public/css/header-pumpkin.css`: readable scoped reference CSS and slot placement.
- `public/js/header-pumpkin.js`: readable mount/config/layout observation. No JavaScript animation loop.
- `public/index.html`: two generated inline tags, `tt-header-pumpkin-style` and `tt-header-pumpkin-mount`, derived from the two source files above, avoiding extra network requests. When editing the sources, regenerate these two tags identically (CSS: remove comments and line breaks; JS: strip standalone comment lines and join lines).
- `tests/test_header_pumpkin.js`: layout, source structure, timed visual comparison, click-through, requests, reduced-motion and off-flag checks.

## Placement
Only `#app-topbar`, between the painted text edge of the breadcrumb/title and `#topbar-right`, with 16px clearance per side. Slot is absolute, clipped, container-query hidden at width <=135px. No layout contribution. `--ground:transparent` uses existing bottom border.

`--s` defaults to 104px; effective size is `min(104, (headerHeight-11)/0.63)`: 84.13px in the current 64px header, 71.43px in a 56px header. SVG bottom is `calc(var(--s) * -0.0958)`. Ground alignment differs by less than 1px; artwork stays at least 10px below header top. Narrow slots are hidden entirely.

## Names
All reference selectors retain their class names but are scoped below `.tt-halloween`. No geometry, color, animation percentage, duration, easing, transform-box or transform-origin changes.

| Reference keyframe | Integrated keyframe |
|---|---|
| vine | tt-vine |
| lfA | tt-lfA |
| lfB | tt-lfB |
| grow | tt-grow |
| ripe | tt-ripe |
| carve | tt-carve |
| holes | tt-holes |
| lit | tt-lit |
| ignite | tt-ignite |
| out | tt-out |
| flick | tt-flick |

SVG IDs: `ha{k}`, `gl{k}`, `lb{k}`, `ct{k}`, `mk{k}` become `ha-tt-header-pumpkin`, `gl-tt-header-pumpkin`, `lb-tt-header-pumpkin`, `ct-tt-header-pumpkin`, `mk-tt-header-pumpkin`; href and mask/gradient references follow identically.

## Flag
Set `window.TT_HEADER_PUMPKIN_ENABLED = false` before the mount executes to render no slot/SVG. Default is enabled. No date or theme state is introduced.

## Verification
Widths 1920 / 1440 / 1024 / 768 / 390, both themes, sidebar open/collapsed, short/long title. Header/title/theme/settings bounding boxes are identical with and without the slot. Exactly one SVG, unique IDs. Reference comparison at 1 / 3 / 5 / 7 / 9 / 12.5 seconds uses the original demo CSS/SVG, same sizing/clipping and background; All 12 final PNG comparisons match pixel-for-pixel. Reduced motion leaves the candle lit. No effect network requests or click interception.

Safety reference branch: `safety/header-pumpkin-base-20261031`.
