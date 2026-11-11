import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { DatabaseService } from "./database.service";

type RoleRow = RowDataPacket & { roleId: number; roleName: string; description: string | null; useYn: number; permissionId: number | null };
type PermissionRow = RowDataPacket & { permissionId: number; permissionCode: string; permissionName: string };

@Injectable()
export class PermissionsService {
  constructor(private readonly database: DatabaseService) {}

  async list() {
    const [roleRows] = await this.database.connection.query<RoleRow[]>("SELECT r.role_id AS roleId, r.role_name AS roleName, r.description, r.use_yn AS useYn, rp.permission_id AS permissionId FROM tb_roles r LEFT JOIN tb_role_permissions rp ON rp.role_id = r.role_id ORDER BY r.role_name");
    const [permissions] = await this.database.connection.query<PermissionRow[]>("SELECT permission_id AS permissionId, permission_code AS permissionCode, permission_name AS permissionName FROM tb_permissions ORDER BY permission_code");
    const roles = Array.from(new Map(roleRows.map((role) => [role.roleId, { id: role.roleId, name: role.roleName, description: role.description, useYn: Boolean(role.useYn), permissionIds: [] as number[] }])).values());
    roleRows.forEach((role) => { if (role.permissionId) roles.find((item) => item.id === role.roleId)?.permissionIds.push(role.permissionId); });
    return { roles, permissions };
  }

  async createRole(name: string, description?: string) {
    const [existing] = await this.database.connection.execute<RowDataPacket[]>("SELECT role_id FROM tb_roles WHERE role_name = ? LIMIT 1", [name]);
    if (existing.length) throw new BadRequestException("Role name already exists.");
    const [result] = await this.database.connection.execute<ResultSetHeader>("INSERT INTO tb_roles (role_name, description) VALUES (?, ?)", [name, description || null]);
    return { id: result.insertId };
  }

  async createPermission(code: string, name: string) {
    const [result] = await this.database.connection.execute<ResultSetHeader>("INSERT INTO tb_permissions (permission_code, permission_name) VALUES (?, ?)", [code, name]);
    return { id: result.insertId };
  }

  async updateRole(roleId: number, name: string, description: string, useYn: boolean) {
    const [duplicate] = await this.database.connection.execute<RowDataPacket[]>("SELECT role_id FROM tb_roles WHERE role_name = ? AND role_id <> ? LIMIT 1", [name, roleId]);
    if (duplicate.length) throw new BadRequestException("Role name already exists.");
    const [result] = await this.database.connection.execute<ResultSetHeader>("UPDATE tb_roles SET role_name = ?, description = ?, use_yn = ? WHERE role_id = ?", [name, description || null, useYn ? 1 : 0, roleId]);
    if (!result.affectedRows) throw new NotFoundException("Role not found.");
  }

  async replaceRolePermissions(roleId: number, permissionIds: number[]) {
    const connection = await this.database.connection.getConnection();
    try {
      await connection.beginTransaction();
      const [role] = await connection.execute<RowDataPacket[]>("SELECT role_id FROM tb_roles WHERE role_id = ? LIMIT 1", [roleId]);
      if (!role.length) throw new NotFoundException("Role not found.");
      await connection.execute("DELETE FROM tb_role_permissions WHERE role_id = ?", [roleId]);
      if (permissionIds.length) await connection.query("INSERT INTO tb_role_permissions (role_id, permission_id) VALUES ?", [permissionIds.map((permissionId) => [roleId, permissionId])]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }

  validateName(value: unknown, field: string) {
    if (typeof value !== "string" || !value.trim() || value.trim().length > 100) throw new BadRequestException(`Invalid ${field}.`);
    return value.trim();
  }
}
