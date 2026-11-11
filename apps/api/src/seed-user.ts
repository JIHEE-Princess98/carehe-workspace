import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });
import { createPool } from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import { hashPassword } from "./auth.service";

async function seed() {
  const { SEED_USER_LOGIN_ID, SEED_USER_EMAIL, SEED_USER_NAME, SEED_USER_PASSWORD } = process.env;
  const host = process.env.DB_HOST ?? process.env.MYSQL_HOST;
  const port = process.env.DB_PORT ?? process.env.MYSQL_PORT;
  const database = process.env.DB_DATABASE ?? process.env.MYSQL_DATABASE;
  const user = process.env.DB_USERNAME ?? process.env.MYSQL_USER;
  const password = process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD;
  if (!host || !database || !user || !password || !SEED_USER_LOGIN_ID || !SEED_USER_NAME || !SEED_USER_PASSWORD) throw new Error("Missing database or seed-user environment variables.");
  const pool = createPool({ host, port: Number(port ?? 3306), database, user, password });
  await pool.execute("INSERT INTO tb_users (user_login_id, user_email, user_name, password_hash) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE user_email = VALUES(user_email), user_name = VALUES(user_name), password_hash = VALUES(password_hash), use_yn = 1, del_yn = 0", [SEED_USER_LOGIN_ID, SEED_USER_EMAIL || null, SEED_USER_NAME, await hashPassword(SEED_USER_PASSWORD)]);
  const [users] = await pool.execute<Array<RowDataPacket & { user_id: number }>>("SELECT user_id FROM tb_users WHERE user_login_id = ?", [SEED_USER_LOGIN_ID]);
  let [roles] = await pool.execute<Array<RowDataPacket & { role_id: number }>>("SELECT role_id FROM tb_roles WHERE role_name = 'ADMIN' ORDER BY role_id LIMIT 1");
  if (!roles.length) {
    await pool.execute("INSERT INTO tb_roles (role_name, description) VALUES ('ADMIN', '사용자 관리 권한')");
    [roles] = await pool.execute<Array<RowDataPacket & { role_id: number }>>("SELECT role_id FROM tb_roles WHERE role_name = 'ADMIN' ORDER BY role_id LIMIT 1");
  }
  await pool.execute("INSERT IGNORE INTO tb_user_roles (user_id, role_id) VALUES (?, ?)", [users[0].user_id, roles[0].role_id]);
  const defaultPermissions = [
    ["DASHBOARD_VIEW", "대시보드 조회"], ["PROJECT_VIEW", "프로젝트 조회"], ["PLANNING_VIEW", "계획 관리 조회"], ["DEFECT_VIEW", "결함 관리 조회"],
    ["USER_VIEW", "사용자 조회"], ["USER_CREATE", "사용자 등록"], ["USER_UPDATE", "사용자 정보 수정"], ["USER_STATUS_UPDATE", "사용자 상태 변경"], ["USER_PASSWORD_RESET", "사용자 비밀번호 초기화"],
    ["ROLE_VIEW", "권한 조회"], ["ROLE_MANAGE", "권한 관리"], ["COMMON_CODE_VIEW", "공통코드 조회"], ["COMMON_CODE_MANAGE", "공통코드 관리"],
  ];
  await pool.query("INSERT IGNORE INTO tb_permissions (permission_code, permission_name) VALUES ?", [defaultPermissions]);
  await pool.query("INSERT IGNORE INTO tb_role_permissions (role_id, permission_id) SELECT ?, permission_id FROM tb_permissions WHERE permission_code IN (?)", [roles[0].role_id, defaultPermissions.map(([code]) => code)]);
  for (const teamName of ["전략기획팀", "HM사업부", "운영부", "개발본부"]) await pool.execute("INSERT INTO tb_teams (team_name) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM tb_teams WHERE team_name = ?)", [teamName, teamName]);
  await pool.end();
  console.log(`Seeded user: ${SEED_USER_LOGIN_ID}`);
}
seed().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
