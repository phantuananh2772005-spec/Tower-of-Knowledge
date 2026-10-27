/* Read-only PostgreSQL inventory. Never prints credentials or user records. */
const {Client}=require('pg');
const fs=require('fs');
async function main(){
  const client=new Client({connectionString:process.env.DATABASE_URL,ssl:process.env.PG_INSPECT_SSL==='true'?{rejectUnauthorized:false}:false,connectionTimeoutMillis:15000,statement_timeout:15000});
  try{
    await client.connect();await client.query('BEGIN READ ONLY');
    const version=(await client.query('SHOW server_version')).rows[0].server_version;
    const columns=(await client.query("SELECT table_name,column_name,data_type,is_nullable,column_default,character_maximum_length FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position")).rows;
    const constraints=(await client.query("SELECT c.relname AS table_name,con.conname AS constraint_name,con.contype AS type,pg_get_constraintdef(con.oid) AS definition FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' ORDER BY c.relname,con.conname")).rows;
    const indexes=(await client.query("SELECT tablename AS table_name,indexname,indexdef FROM pg_indexes WHERE schemaname='public' ORDER BY tablename,indexname")).rows;
    const counts={};
    for(const table of [...new Set(columns.map(c=>c.table_name))])counts[table]=Number((await client.query('SELECT COUNT(*) AS n FROM "'+table.replaceAll('"','""')+'"')).rows[0].n);
    const integrity=(await client.query(`SELECT
      (SELECT COUNT(*) FROM nguoi_dung WHERE xu_tri_thuc<0 OR tong_diem_kinh_nghiem<0) AS negative_balances,
      (SELECT COUNT(*) FROM (SELECT ma_nguoi_dung FROM thu_cung_so_huu WHERE dang_kich_hoat=true GROUP BY ma_nguoi_dung HAVING COUNT(*)>1) p) AS multiple_active_pets,
      (SELECT COUNT(*) FROM nguoi_dung u WHERE u.phu_kien_dang_dung IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vat_pham_so_huu v WHERE v.ma_nguoi_dung=u.ma_nguoi_dung AND v.ma_vat_pham=u.phu_kien_dang_dung)) AS accessory_without_ownership,
      (SELECT COUNT(*) FROM nguoi_dung WHERE ma_nguoi_dung LIKE 'usr_bot_%' AND vai_tro<>'HE_THONG') AS bots_with_wrong_role
    `)).rows[0];
    await client.query('COMMIT');
    const report={checkedAt:new Date().toISOString(),source:process.env.SCHEMA_SOURCE_LABEL||'PostgreSQL',serverVersion:version,columns,constraints,indexes,counts,integrity};
    if(process.env.SCHEMA_OUTPUT_PATH){
      fs.writeFileSync(process.env.SCHEMA_OUTPUT_PATH,JSON.stringify(report,null,2));
      const lines=['# Kiểm kê cấu trúc PostgreSQL', '', 'Nguồn: '+report.source+'. Kiểm tra chỉ đọc lúc '+report.checkedAt+'. PostgreSQL '+version+'.', '', 'Không chứa mật khẩu, connection string hay hồ sơ cá nhân.', '', '## Bảng, trường dữ liệu và số bản ghi', ''];
      for(const [table,count] of Object.entries(counts)){
        lines.push('### `'+table+'` — '+count+' bản ghi','','| Trường | Kiểu | Cho phép NULL | Mặc định |','|---|---|---|---|');
        for(const c of columns.filter(c=>c.table_name===table))lines.push('| `'+c.column_name+'` | '+c.data_type+(c.character_maximum_length?'('+c.character_maximum_length+')':'')+' | '+c.is_nullable+' | '+String(c.column_default??'').replaceAll('|','\\|')+' |');
        lines.push('','Ràng buộc:','');
        for(const c of constraints.filter(c=>c.table_name===table))lines.push('- `'+c.constraint_name+'`: `'+c.definition+'`');
        lines.push('');
      }
      lines.push('## Kiểm tra bất nhất dữ liệu','','```json',JSON.stringify(integrity,null,2),'```','', 'Các trường cấp độ, danh hiệu và % EXP được suy ra từ EXP; không cần thêm cột cấp riêng. Cấu hình danh mục phụ kiện nằm trong mã nguồn, còn quyền sở hữu và phụ kiện đang dùng được lưu trong CSDL.');
      fs.writeFileSync(process.env.SCHEMA_OUTPUT_PATH.replace(/\.json$/,'.md'),lines.join('\n'));
      console.log(JSON.stringify({source:report.source,serverVersion:version,tables:Object.keys(counts).length,columns:columns.length,counts,integrity,artifact:process.env.SCHEMA_OUTPUT_PATH}));
    }else console.log(JSON.stringify(report));
  }finally{await client.end();}
}
main().catch(error=>{console.error('Schema inspection failed:',error.code||error.message);process.exitCode=1;});
