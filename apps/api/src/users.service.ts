import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { hashPassword } from "./auth.service";
import { DatabaseService } from "./database.service";

type UserRow = RowDataPacket & { userId: number; loginId: string; email: string | null; name: string; teamId: number | null; teamName: string | null; useYn: number; lastLoginAt: string | null; roleId: number | null; roleName: string | null };
type UserInput = { loginId: string; email?: string; teamId: number; roleIds: number[] };

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async list() {
    const [rows] = await this.database.connection.query<UserRow[]>("SELECT u.user_id AS userId, u.user_login_id AS loginId, u.user_email AS email, u.user_name AS name, u.team_id AS teamId, t.team_name AS teamName, u.use_yn AS useYn, u.last_login_at AS lastLoginAt, r.role_id AS roleId, r.role_name AS roleName FROM tb_users u LEFT JOIN tb_teams t ON t.team_id = u.team_id LEFT JOIN tb_user_roles ur ON ur.user_id = u.user_id LEFT JOIN tb_roles r ON r.role_id = ur.role_id WHERE u.del_yn = 0 ORDER BY u.created_at DESC");
    const users = Array.from(new Map(rows.map((row) => [row.userId, { userId: row.userId, loginId: row.loginId, email: row.email, name: row.name, teamId: row.teamId ?? 0, teamName: row.teamName ?? "무소속", useYn: Boolean(row.useYn), lastLoginAt: row.lastLoginAt, roleIds: [] as number[], roleNames: [] as string[] }])).values());
    rows.forEach((row) => { const user = users.find((item) => item.userId === row.userId); if (user && row.roleId && row.roleName) { user.roleIds.push(row.roleId); user.roleNames.push(row.roleName); } });
    return users;
  }

  async meta() {
    const [teams] = await this.database.connection.query<Array<RowDataPacket & { teamId: number; teamName: string }>>("SELECT team_id AS teamId, team_name AS teamName FROM tb_teams WHERE use_yn = 1 ORDER BY team_name");
    const [roles] = await this.database.connection.query<Array<RowDataPacket & { roleId: number; roleName: string; description: string | null }>>("SELECT role_id AS roleId, role_name AS roleName, description FROM tb_roles WHERE use_yn = 1 ORDER BY role_name");
    return { teams: [{ teamId: 0, teamName: "무소속" }, ...teams], roles };
  }

  async create(input: UserInput & { name: string }) {
    return this.save(input, async (connection) => {
      const [existing] = await connection.execute<RowDataPacket[]>("SELECT user_id FROM tb_users WHERE user_login_id = ? LIMIT 1", [input.loginId]);
      if (existing.length) throw new BadRequestException("Login ID already exists.");
      const [result] = await connection.execute<ResultSetHeader>("INSERT INTO tb_users (user_login_id, user_email, user_name, password_hash, password_change_required, team_id) VALUES (?, ?, ?, ?, 1, ?)", [input.loginId, input.email || null, input.name, await hashPassword("0000"), input.teamId || null]);
      return result.insertId;
    });
  }

  async update(userId: number, input: UserInput) {
    return this.save(input, async (connection) => {
      const [existing] = await connection.execute<RowDataPacket[]>("SELECT user_id FROM tb_users WHERE user_id = ? AND del_yn = 0", [userId]);
      if (!existing.length) throw new NotFoundException("User not found.");
      const [duplicate] = await connection.execute<RowDataPacket[]>("SELECT user_id FROM tb_users WHERE user_login_id = ? AND user_id <> ? LIMIT 1", [input.loginId, userId]);
      if (duplicate.length) throw new BadRequestException("Login ID already exists.");
      await connection.execute("UPDATE tb_users SET user_login_id = ?, user_email = ?, team_id = ? WHERE user_id = ?", [input.loginId, input.email || null, input.teamId || null, userId]);
      await connection.execute("DELETE FROM tb_user_roles WHERE user_id = ?", [userId]);
      return userId;
    });
  }

  private async save(input: UserInput, persist: (connection: PoolConnection) => Promise<number>) {
    const connection = await this.database.connection.getConnection();
    try {
      await connection.beginTransaction();
      const [team] = input.teamId ? await connection.execute<RowDataPacket[]>("SELECT team_id FROM tb_teams WHERE team_id = ? AND use_yn = 1", [input.teamId]) : [[{ team_id: 0 }]];
      const [roles] = await connection.query<RowDataPacket[]>("SELECT role_id FROM tb_roles WHERE use_yn = 1 AND role_id IN (?)", [input.roleIds]);
      if (!team.length || roles.length !== input.roleIds.length) throw new BadRequestException("Invalid team or role.");
      const userId = await persist(connection);
      await connection.query("INSERT INTO tb_user_roles (user_id, role_id) VALUES ?", [input.roleIds.map((roleId) => [userId, roleId])]);
      await connection.commit();
      return { id: userId };
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }

  async resetPassword(userId: number) { const [result] = await this.database.connection.execute<ResultSetHeader>("UPDATE tb_users SET password_hash = ?, password_change_required = 1 WHERE user_id = ? AND del_yn = 0", [await hashPassword("0000"), userId]); if (!result.affectedRows) throw new NotFoundException("User not found."); }
  async updateStatus(userId: number, useYn: boolean) { const [result] = await this.database.connection.execute<ResultSetHeader>("UPDATE tb_users SET use_yn = ? WHERE user_id = ? AND del_yn = 0", [useYn ? 1 : 0, userId]); if (!result.affectedRows) throw new NotFoundException("User not found."); }
}
