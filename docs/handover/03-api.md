# 03 — Danh mục HTTP

Đường dẫn gồm prefix mount từ [server.js](../../server.js). Route dùng envelope `success/data` hoặc `success/error`. QR và tài nguyên tĩnh trả dữ liệu trực tiếp. “Công khai” trong bảng nghĩa là không thấy middleware JWT tại điểm khai báo, vẫn có thể có kiểm tra trong handler.

| Method | URL | Cửa xác thực | Nguồn |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | [routes/admin.routes.js:10](../../routes/admin.routes.js#L10) |
| POST | `/api/admin/courses` | Admin | [routes/admin.routes.js:20](../../routes/admin.routes.js#L20) |
| PUT | `/api/admin/courses/:id` | Admin | [routes/admin.routes.js:29](../../routes/admin.routes.js#L29) |
| DELETE | `/api/admin/courses/:id` | Admin | [routes/admin.routes.js:38](../../routes/admin.routes.js#L38) |
| POST | `/api/admin/chapters` | Admin | [routes/admin.routes.js:48](../../routes/admin.routes.js#L48) |
| PUT | `/api/admin/chapters/:id` | Admin | [routes/admin.routes.js:57](../../routes/admin.routes.js#L57) |
| DELETE | `/api/admin/chapters/:id` | Admin | [routes/admin.routes.js:66](../../routes/admin.routes.js#L66) |
| POST | `/api/admin/checkpoints` | Admin | [routes/admin.routes.js:76](../../routes/admin.routes.js#L76) |
| PUT | `/api/admin/checkpoints/:id` | Admin | [routes/admin.routes.js:85](../../routes/admin.routes.js#L85) |
| DELETE | `/api/admin/checkpoints/:id` | Admin | [routes/admin.routes.js:94](../../routes/admin.routes.js#L94) |
| GET | `/api/admin/questions` | Admin | [routes/admin.routes.js:104](../../routes/admin.routes.js#L104) |
| POST | `/api/admin/questions` | Admin | [routes/admin.routes.js:113](../../routes/admin.routes.js#L113) |
| PUT | `/api/admin/questions/:id` | Admin | [routes/admin.routes.js:122](../../routes/admin.routes.js#L122) |
| DELETE | `/api/admin/questions/:id` | Admin | [routes/admin.routes.js:131](../../routes/admin.routes.js#L131) |
| POST | `/api/admin/questions/bulk` | Admin | [routes/admin.routes.js:140](../../routes/admin.routes.js#L140) |
| GET | `/api/admin/users` | Admin | [routes/admin.routes.js:151](../../routes/admin.routes.js#L151) |
| PUT | `/api/admin/users/:id/role` | Admin | [routes/admin.routes.js:160](../../routes/admin.routes.js#L160) |
| POST | `/api/admin/users/:id/coins` | Admin | [routes/admin.routes.js:170](../../routes/admin.routes.js#L170) |
| GET | `/api/admin/logs` | Admin | [routes/admin.routes.js:181](../../routes/admin.routes.js#L181) |
| GET | `/api/admin/learning-activity` | Admin | [routes/admin.routes.js:191](../../routes/admin.routes.js#L191) |
| GET | `/api/admin/learners` | Admin | [routes/admin.routes.js:201](../../routes/admin.routes.js#L201) |
| GET | `/api/admin/learners/:id/telemetry` | Admin | [routes/admin.routes.js:211](../../routes/admin.routes.js#L211) |
| GET | `/api/admin/transactions` | Admin | [routes/admin.routes.js:221](../../routes/admin.routes.js#L221) |
| GET | `/api/admin/pets` | Admin | [routes/admin.routes.js:231](../../routes/admin.routes.js#L231) |
| POST | `/api/admin/pets` | Admin | [routes/admin.routes.js:240](../../routes/admin.routes.js#L240) |
| PUT | `/api/admin/pets/:id` | Admin | [routes/admin.routes.js:249](../../routes/admin.routes.js#L249) |
| DELETE | `/api/admin/pets/:id` | Admin | [routes/admin.routes.js:258](../../routes/admin.routes.js#L258) |
| GET | `/api/arena/room-qr.png` | Công khai | [routes/arena.routes.js:5](../../routes/arena.routes.js#L5) |
| POST | `/api/arena/create-match` | JWT | [routes/arena.routes.js:18](../../routes/arena.routes.js#L18) |
| GET | `/api/arena/leaderboard` | Công khai | [routes/arena.routes.js:33](../../routes/arena.routes.js#L33) |
| GET | `/api/arena/:matchId` | JWT | [routes/arena.routes.js:105](../../routes/arena.routes.js#L105) |
| POST | `/api/arena/:matchId/turn` | JWT | [routes/arena.routes.js:114](../../routes/arena.routes.js#L114) |
| POST | `/api/arena/:matchId/surrender` | JWT | [routes/arena.routes.js:154](../../routes/arena.routes.js#L154) |
| POST | `/api/arena/:matchId/conclude` | JWT | [routes/arena.routes.js:174](../../routes/arena.routes.js#L174) |
| GET | `/api/auth/config` | Công khai | [routes/auth.routes.js:15](../../routes/auth.routes.js#L15) |
| POST | `/api/auth/password-recovery/lookup` | Giới hạn tần suất, proof theo bước | [routes/auth.routes.js:28](../../routes/auth.routes.js#L28) |
| POST | `/api/auth/password-recovery/request` | Giới hạn tần suất, proof theo bước | [routes/auth.routes.js:28](../../routes/auth.routes.js#L28) |
| POST | `/api/auth/password-recovery/reset` | Giới hạn tần suất, proof theo bước | [routes/auth.routes.js:28](../../routes/auth.routes.js#L28) |
| GET | `/api/auth/google/challenge` | JWT tùy chọn | [routes/auth.routes.js:36](../../routes/auth.routes.js#L36) |
| POST | `/api/auth/google` | Công khai | [routes/auth.routes.js:44](../../routes/auth.routes.js#L44) |
| POST | `/api/auth/google/recover` | Công khai | [routes/auth.routes.js:48](../../routes/auth.routes.js#L48) |
| POST | `/api/auth/google/link` | JWT | [routes/auth.routes.js:53](../../routes/auth.routes.js#L53) |
| DELETE | `/api/auth/google/link` | JWT | [routes/auth.routes.js:57](../../routes/auth.routes.js#L57) |
| POST | `/api/auth/register` | Công khai | [routes/auth.routes.js:62](../../routes/auth.routes.js#L62) |
| POST | `/api/auth/login` | Công khai | [routes/auth.routes.js:71](../../routes/auth.routes.js#L71) |
| GET | `/api/auth/me` | JWT | [routes/auth.routes.js:80](../../routes/auth.routes.js#L80) |
| PUT | `/api/auth/settings` | JWT | [routes/auth.routes.js:89](../../routes/auth.routes.js#L89) |
| PUT | `/api/auth/account` | JWT | [routes/auth.routes.js:98](../../routes/auth.routes.js#L98) |
| PUT | `/api/auth/password` | JWT | [routes/auth.routes.js:102](../../routes/auth.routes.js#L102) |
| GET | `/api/courses` | JWT tùy chọn | [routes/course.routes.js:7](../../routes/course.routes.js#L7) |
| GET | `/api/my-courses` | JWT | [routes/course.routes.js:18](../../routes/course.routes.js#L18) |
| POST | `/api/courses/:slug/enroll` | JWT | [routes/course.routes.js:28](../../routes/course.routes.js#L28) |
| GET | `/api/courses/:slug` | JWT tùy chọn | [routes/course.routes.js:38](../../routes/course.routes.js#L38) |
| GET | `/api/checkpoints/:id` | JWT | [routes/course.routes.js:51](../../routes/course.routes.js#L51) |
| POST | `/api/checkpoints/:id/complete-theory` | JWT | [routes/course.routes.js:65](../../routes/course.routes.js#L65) |
| POST | `/api/checkpoints/:id/submit-step` | JWT | [routes/course.routes.js:75](../../routes/course.routes.js#L75) |
| POST | `/api/checkpoints/:id/abandon-step` | JWT | [routes/course.routes.js:89](../../routes/course.routes.js#L89) |
| POST | `/api/checkpoints/:id/submit` | JWT | [routes/course.routes.js:103](../../routes/course.routes.js#L103) |
| POST | `/api/checkpoints/:id/check-answer` | JWT | [routes/course.routes.js:117](../../routes/course.routes.js#L117) |
| GET | `/api/economy/transactions` | JWT | [routes/economy.routes.js:7](../../routes/economy.routes.js#L7) |
| GET | `/api/economy/quests-status` | JWT | [routes/economy.routes.js:18](../../routes/economy.routes.js#L18) |
| POST | `/api/economy/claim-quest` | JWT | [routes/economy.routes.js:22](../../routes/economy.routes.js#L22) |
| POST | `/api/economy/onboarding-gift` | JWT | [routes/economy.routes.js:26](../../routes/economy.routes.js#L26) |
| POST | `/api/extreme/start` | JWT tùy chọn | [routes/extreme.routes.js:7](../../routes/extreme.routes.js#L7) |
| POST | `/api/extreme/next-batch` | JWT tùy chọn | [routes/extreme.routes.js:19](../../routes/extreme.routes.js#L19) |
| POST | `/api/extreme/check-answer` | JWT tùy chọn | [routes/extreme.routes.js:30](../../routes/extreme.routes.js#L30) |
| POST | `/api/extreme/finish` | JWT tùy chọn | [routes/extreme.routes.js:44](../../routes/extreme.routes.js#L44) |
| GET | `/api/items` | JWT | [routes/inventory.routes.js:5](../../routes/inventory.routes.js#L5) |
| POST | `/api/items/:id/buy` | JWT | [routes/inventory.routes.js:9](../../routes/inventory.routes.js#L9) |
| PUT | `/api/items/equipped` | JWT | [routes/inventory.routes.js:13](../../routes/inventory.routes.js#L13) |
| POST | `/api/pets/care` | JWT | [routes/pet.routes.js:5](../../routes/pet.routes.js#L5) |
| GET | `/api/pets` | JWT tùy chọn | [routes/pet.routes.js:10](../../routes/pet.routes.js#L10) |
| POST | `/api/pets/:id/buy` | JWT | [routes/pet.routes.js:20](../../routes/pet.routes.js#L20) |
| POST | `/api/pets/:id/equip` | JWT | [routes/pet.routes.js:29](../../routes/pet.routes.js#L29) |
| GET | `/api/pet-studio/videos` | Công khai | [routes/petStudioRoutes.js:16](../../routes/petStudioRoutes.js#L16) |
| POST | `/api/pet-studio/preview-cell` | Công khai | [routes/petStudioRoutes.js:51](../../routes/petStudioRoutes.js#L51) |
| POST | `/api/pet-studio/export` | Công khai | [routes/petStudioRoutes.js:111](../../routes/petStudioRoutes.js#L111) |
| GET | `/api/profile/journey` | JWT | [routes/profile.routes.js:4](../../routes/profile.routes.js#L4) |

Ngoài bảng có `GET /health`, redirect `/admin.html`, static `/admin/`, và fallback lỗi API tại server. Kiểm tra contract request/response ở handler được dẫn và [luồng chức năng](01-flows.md).

Tổng route khai báo trong thư mục routes: 78.
