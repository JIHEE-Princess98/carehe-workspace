import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { RowDataPacket } from "mysql2";
import { DatabaseService } from "./database.service";

const scrypt = promisify(scryptCallback);
type UserRow = RowDataPacket & { user_id: number; user_login_id: string; user_email: string | null; user_name: string; password_hash: string; password_change_required: number };
type RoleRow = RowDataPacket & { role_name: string };
type PermissionRow = RowDataPacket & { permission_code: string };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

async function passwordMatches(password: string, encoded: string): Promise<boolean> {
  const [algorithm, salt, savedHash] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !savedHash) return false;
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(savedHash, "hex");
  return expected.length === hash.length && timingSafeEqual(expected, hash);
}

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService, private readonly jwt: JwtService) {}

  async login(loginId: string, password: string) {
    const [rows] = await this.database.connection.execute<UserRow[]>("SELECT user_id, user_login_id, user_email, user_name, password_hash, password_change_required FROM tb_users WHERE user_login_id = ? AND use_yn = 1 AND del_yn = 0 LIMIT 1", [loginId]);
    const user = rows[0];
    if (!user?.password_hash || !(await passwordMatches(password, user.password_hash))) throw new UnauthorizedException("Invalid login credentials.");
    await this.database.connection.execute("UPDATE tb_users SET last_login_at = NOW() WHERE user_id = ?", [user.user_id]);
    const [roles] = await this.database.connection.execute<RoleRow[]>("SELECT r.role_name FROM tb_roles r INNER JOIN tb_user_roles ur ON ur.role_id = r.role_id WHERE ur.user_id = ? AND r.use_yn = 1", [user.user_id]);
    const permissionCodes = await this.permissionCodes(user.user_id);
    const accessToken = await this.jwt.signAsync({ sub: user.user_id, loginId: user.user_login_id, name: user.user_name, roles: roles.map((role) => role.role_name), permissions: permissionCodes });
    return { accessToken, permissions: permissionCodes, mustChangePassword: Boolean(user.password_change_required), user: { id: user.user_id, loginId: user.user_login_id, email: user.user_email, name: user.user_name } };
  }

  async permissionCodes(userId: number) {
    const [permissions] = await this.database.connection.execute<PermissionRow[]>("SELECT DISTINCT p.permission_code FROM tb_permissions p INNER JOIN tb_role_permissions rp ON rp.permission_id = p.permission_id INNER JOIN tb_user_roles ur ON ur.role_id = rp.role_id WHERE ur.user_id = ?", [userId]);
    return permissions.map((permission) => permission.permission_code);
  }

  async changePassword(userId: number, password: string) {
    if (password.length < 8) throw new BadRequestException("Password must be at least 8 characters.");
    await this.database.connection.execute("UPDATE tb_users SET password_hash = ?, password_change_required = 0 WHERE user_id = ? AND del_yn = 0", [await hashPassword(password), userId]);
  }
}
