# PostgreSQL V1 local · Tháp Tri Thức

Bộ SQL dành cho PostgreSQL **16**, cơ sở dữ liệu **thaptrithuc_v1**, schema **app_v1**. Chạy bằng role quản trị local để tạo schema và role quyền **thaptrithuc_v1_runtime**. Role này không có quyền đăng nhập. Ứng dụng dùng login riêng **thaptrithuc_v1_app** với quyền thừa hưởng từ role runtime.

## Chạy bằng Docker trên Windows

Chạy các lệnh dưới đây trong PowerShell ở thư mục gốc của worktree **local-pg-v1**. Với container đã tạo theo hướng dẫn, dùng **docker start thaptrithuc-pg-v1** nếu nó đang dừng rồi tiếp tục từ bước kiểm kết nối.

```powershell
docker desktop start --detach
docker info --format '{{.ServerVersion}}'
docker pull postgres:16

$pgV1SqlPath = (Resolve-Path -LiteralPath 'database/pg-v1').Path
$pgV1Password = Read-Host 'Mat khau quan tri PostgreSQL local' -AsSecureString
$env:POSTGRES_PASSWORD = [System.Net.NetworkCredential]::new('', $pgV1Password).Password
try {
    docker run -d --name thaptrithuc-pg-v1 --label 'com.thaptrithuc.environment=local-pg-v1' --publish 127.0.0.1:55432:5432 --env POSTGRES_DB=thaptrithuc_v1 --env POSTGRES_PASSWORD --mount 'type=volume,source=thaptrithuc-pg-v1-data,target=/var/lib/postgresql/data' --mount "type=bind,source=$pgV1SqlPath,target=/pg-v1,readonly" postgres:16
} finally {
    Remove-Item Env:POSTGRES_PASSWORD
}
```

Đợi Docker Engine sẵn sàng trước khi pull. Kiểm tra kết nối đến khi báo **accepting connections**, sau đó chạy theo thứ tự dưới đây. Các script dừng ở lỗi đầu tiên. Kết nối bằng **docker exec** để psql dùng socket trong container. Cổng **127.0.0.1:55432** dành cho kết nối ứng dụng local sau này.

```powershell
docker exec thaptrithuc-pg-v1 pg_isready -U postgres -d thaptrithuc_v1
docker exec thaptrithuc-pg-v1 psql -X -U postgres -d thaptrithuc_v1 -f /pg-v1/001_schema.sql
docker exec thaptrithuc-pg-v1 psql -X -U postgres -d thaptrithuc_v1 -f /pg-v1/seed_reference.sql
docker exec thaptrithuc-pg-v1 psql -X -q -U postgres -d thaptrithuc_v1 -f /pg-v1/verify_v1.sql
```

Mở psql trong container để xem sơ đồ vật lý qua danh mục hoặc chạy truy vấn.

```powershell
docker exec -it thaptrithuc-pg-v1 psql -X -U postgres -d thaptrithuc_v1
```

Trong psql, nhập `\dt app_v1.*` để liệt kê bảng và `\dv app_v1.*` để liệt kê view. Để xem định nghĩa một bảng, dùng `\d app_v1.questions`.

## Login ứng dụng local

Sau khi áp DDL, dùng psql với quyền quản trị **local** và chạy một lần. Lệnh `\password` hỏi mật khẩu riêng của login ứng dụng.

```sql
CREATE ROLE thaptrithuc_v1_app LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT thaptrithuc_v1_runtime TO thaptrithuc_v1_app;
ALTER ROLE thaptrithuc_v1_app IN DATABASE thaptrithuc_v1 SET search_path TO app_v1, pg_catalog;
\password thaptrithuc_v1_app
```

Tạo `.env.local` ở thư mục gốc từ `.env.local.example`. Điền mật khẩu của login ứng dụng đã mã hóa theo cú pháp URL và một `JWT_SECRET` riêng cho local. Chạy `npm ci`, `node --test tests/test_db_adapter.js` rồi `npm start`. Server nghe loopback tại cổng `PORT` trong tệp.

## Chạy với PostgreSQL cài local

Dùng PostgreSQL 16 có **psql** và **createdb**, mặc định máy chủ nghe địa chỉ loopback và cổng 5432. Dùng các lệnh sau trong worktree.

```powershell
createdb -h 127.0.0.1 -U postgres --encoding=UTF8 --template=template0 thaptrithuc_v1
psql -X -h 127.0.0.1 -U postgres -d thaptrithuc_v1 -f database/pg-v1/001_schema.sql
psql -X -h 127.0.0.1 -U postgres -d thaptrithuc_v1 -f database/pg-v1/seed_reference.sql
psql -X -q -h 127.0.0.1 -U postgres -d thaptrithuc_v1 -f database/pg-v1/verify_v1.sql
```

## Tệp và hành vi

- [001_schema.sql](001_schema.sql) là điểm chạy DDL. Các tệp trong **schema/** được nạp theo thứ tự bằng psql. Lần chạy lại kiểm dấu phiên bản và số bảng/cột, không tạo bản sao hay ghi lại dữ liệu.
- [seed_reference.sql](seed_reference.sql) nạp danh mục Pet, phụ kiện, hai môn mẫu, nhiệm vụ ngày và mùa đầu từ nguồn trong repo. Dữ liệu đã có được giữ khi chạy lại.
- [verify_v1.sql](verify_v1.sql) in kết quả theo ca. Fixture chạy trong transaction rồi rollback. Kiểm thử đối soát mọi ví sau khi thưởng, mua và rollback, với ví không có giao dịch được tính là 0 Xu.
- [rollback_001.sql](rollback_001.sql) gỡ schema **app_v1** của V1 và toàn bộ dữ liệu trong schema đó, kể cả seed. Chỉ dùng để đặt lại DB local này. Role dùng chung ở cấp PostgreSQL được giữ để có thể áp lại schema.

Muốn đặt lại V1 trên Docker, chạy lệnh sau rồi chạy lại ba script theo thứ tự ở trên.

```powershell
docker exec thaptrithuc-pg-v1 psql -X -U postgres -d thaptrithuc_v1 -f /pg-v1/rollback_001.sql
```

Tài liệu tham chiếu môi trường [Docker PostgreSQL](https://docs.docker.com/guides/postgresql/) và [psql PostgreSQL 16](https://www.postgresql.org/docs/16/app-psql.html).
