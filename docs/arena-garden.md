# Live ranked garden lobby

Chosen direction: demo 01, with a quieter cream overlay and a compact layout. Applied to the ranked 1v1 lobby only. Casual-room, battle and matchmaking server logic are unchanged.

Source illustration: the approved garden atlas generated for arena-studio, cropped at desktop x=0..1052 / mobile x=1064..1536. Original PNG retained in the generated-images directory. Runtime derivatives are `desktop.avif/.webp` and `mobile.avif/.webp` under `public/assets/arena-garden/`, exported from the source PNG at AVIF quality42 /WebP70. CSS uses proportional cover; mobile receives its own composition. No seasonal corner decorations are layered over this lobby.

The ranked panel keeps all existing IDs and onclick/onchange handlers. CSS and wrapper classes group subject, rank cards and live find-match button into a desktop footer, stacked on mobile. Pet selection remains at the existing pet page link. Current pet renderer is unchanged; the large question-mark emoji is replaced by a subdued pet silhouette. Background loads only when the ranked panel is visible.

Validation: `node tests/test_arena_garden.js` checks 320/390/768/1440/1920 widths, light/dark, no overflow, minimum touch size, subject rank updates, existing find-match callback via local spy (no real queue request), leaderboard/back navigation, and responsive/hidden image requests. Local screenshots reviewed at390 and1440. No production data was altered during testing.
