# Seasonal interface icons

Eight built-in image generation packs: Halloween, Teachers Day 20 November, Christmas, New Year, Tet, Valentine, 8 March and 26 March. Thirteen icons per pack: hub, enrolled, saga, catalog, minigame, pet, shop, arena, ranked, casual, extreme, leaderboard, quests.

Prompt set: strict 4x4 transparent atlas, first 13 cells occupied and last 3 empty; crisp illustrated dimensional cel-painted artwork in navy/azure/ivory/gold matching the existing navigation tower and blue dragon references. Keep each function's silhouette readable at 28–42px. Small seasonal accessories only. Halloween pumpkin/bat accents; Teachers Day cream chrysanthemums and ribbon; Christmas evergreen/lights/red ornament without snow; New Year gold stars; Tet apricot/peach blossom and plain red envelope; Valentine dusty rose and heart seal; 8 March tulip; 26 March sprout and daisy. No text, tiles, backgrounds, cultural stereotypes, bronze drums, official emblems or traditional headgear. Dragon identity preserves orange horns, blue face and cream muzzle.

`tools/export_seasonal_icons.py` extracts cells, cleans low-alpha residue, centers their alpha bounds inside a 128x128 WebP canvas with a 112px maximum illustration. This preserves aspect ratio and common visual spacing for desktop and Android. Each pack has exact byte counts in sizes.json.

Image slots retain their original fixed width/height, class, accessible labels and click targets. The theme selector swaps their sources, while the everyday theme restores original neutral artwork. Placeholder sources avoid downloading an unused neutral pack before loading the selected holiday. Brand logo, account avatars, pet sprites, map learning/boss node artwork and interaction logic remain unchanged.

Verification: `node tests/test_seasonal_icons.js` against the static preview on localhost:3002 checks selected-pack-only initial requests, all 13 identities, decoded images, all eight themes plus everyday, both viewport widths, persistence and no horizontal overflow.
