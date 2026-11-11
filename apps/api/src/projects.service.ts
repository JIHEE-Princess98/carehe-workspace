import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { DatabaseService } from "./database.service";

type ProjectStatus = "NEW" | "IN_PROGRESS" | "DONE";
type MemberRole = "EDITOR" | "VIEWER";
type ProjectInput = { projectTitle: string; projectContent?: string; projectStatus: ProjectStatus };
type ProjectRow = RowDataPacket & { projectId: number; projectTitle: string; projectContent: string | null; projectStatus: ProjectStatus; createdBy: number; createdAt: string; updatedAt: string; requirementCount: number; openDefectCount: number };
type MemberRow = RowDataPacket & { userId: number; userName: string; loginId: string; teamName: string | null; memberRole: string; memberRoleName: string; invitationStatus: string; invitationStatusName: string; invitedBy: number | null; respondedAt: string | null; createdAt: string };

@Injectable()
export class ProjectsService {
  constructor(private readonly database: DatabaseService) {}

  async list(userId: number) {
    const [rows] = await this.database.connection.execute<ProjectRow[]>(this.projectsSql("WHERE pm.user_id = ? AND pm.invitation_status = 'ACCEPTED'"), [userId]);
    return rows.map((row) => this.project(row));
  }

  async get(projectId: number, userId: number) {
    await this.assertAcceptedMember(projectId, userId);
    const [rows] = await this.database.connection.execute<ProjectRow[]>(this.projectsSql("WHERE p.project_id = ?"), [projectId]);
    if (!rows.length) throw new NotFoundException("Project not found.");
    return this.project(rows[0]);
  }

  async documents(projectId: number, userId: number) {
    await this.assertAcceptedMember(projectId, userId);
    const [rows] = await this.database.connection.execute<RowDataPacket[]>("SELECT d.document_id AS documentId, d.document_no AS documentNo, d.document_title AS documentTitle, d.document_content AS documentContent, d.document_status AS documentStatus, COALESCE(status_code.code_name, d.document_status) AS documentStatusName, d.updated_at AS updatedAt, u.user_name AS updatedBy, COUNT(r.requirement_id) AS requirementCount FROM tb_planning_documents d LEFT JOIN tb_codes status_code ON status_code.code_group = 'DOCUMENT_STATUS' AND status_code.code = d.document_status AND status_code.use_yn = 1 LEFT JOIN tb_users u ON u.user_id = COALESCE(d.updated_by, d.created_by) LEFT JOIN tb_requirements r ON r.document_id = d.document_id AND r.del_yn = 0 WHERE d.project_id = ? AND d.del_yn = 0 GROUP BY d.document_id ORDER BY d.updated_at DESC", [projectId]);
    return rows.map((row) => ({ ...row, requirementCount: Number(row.requirementCount) }));
  }

  async create(input: ProjectInput, userId: number) {
    const connection = await this.database.connection.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute<ResultSetHeader>("INSERT INTO tb_projects (project_title, project_content, project_status, created_by) VALUES (?, ?, ?, ?)", [input.projectTitle, input.projectContent || null, input.projectStatus, userId]);
      await connection.execute("INSERT INTO tb_project_members (project_id, user_id, member_role, invitation_status, invited_by, responded_at) VALUES (?, ?, 'OWNER', 'ACCEPTED', ?, NOW())", [result.insertId, userId, userId]);
      await connection.commit();
      return { projectId: result.insertId };
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }

  async update(projectId: number, input: ProjectInput, userId: number) {
    await this.assertOwner(projectId, userId);
    const [result] = await this.database.connection.execute<ResultSetHeader>("UPDATE tb_projects SET project_title = ?, project_content = ?, project_status = ?, closed_at = IF(? = 'DONE', COALESCE(closed_at, NOW()), NULL) WHERE project_id = ? AND del_yn = 0", [input.projectTitle, input.projectContent || null, input.projectStatus, input.projectStatus, projectId]);
    if (!result.affectedRows) throw new NotFoundException("Project not found.");
  }

  async members(projectId: number, userId: number) {
    await this.assertAcceptedMember(projectId, userId);
    const [rows] = await this.database.connection.execute<MemberRow[]>("SELECT pm.user_id AS userId, u.user_name AS userName, u.user_login_id AS loginId, t.team_name AS teamName, pm.member_role AS memberRole, COALESCE(role_code.code_name, pm.member_role) AS memberRoleName, pm.invitation_status AS invitationStatus, COALESCE(status_code.code_name, pm.invitation_status) AS invitationStatusName, pm.invited_by AS invitedBy, pm.responded_at AS respondedAt, pm.created_at AS createdAt FROM tb_project_members pm JOIN tb_users u ON u.user_id = pm.user_id LEFT JOIN tb_teams t ON t.team_id = u.team_id LEFT JOIN tb_codes role_code ON role_code.code_group = 'PROJECT_MEMBER_ROLE' AND role_code.code = pm.member_role AND role_code.use_yn = 1 LEFT JOIN tb_codes status_code ON status_code.code_group = 'INVITATION_STATUS' AND status_code.code = pm.invitation_status AND status_code.use_yn = 1 WHERE pm.project_id = ? ORDER BY FIELD(pm.member_role, 'OWNER', 'EDITOR', 'VIEWER'), u.user_name", [projectId]);
    return rows;
  }

  async availableMembers(projectId: number, userId: number) {
    await this.assertOwner(projectId, userId);
    const [rows] = await this.database.connection.execute<RowDataPacket[]>("SELECT u.user_id AS userId, u.user_name AS userName, u.user_login_id AS loginId, t.team_name AS teamName FROM tb_users u LEFT JOIN tb_teams t ON t.team_id = u.team_id LEFT JOIN tb_project_members pm ON pm.project_id = ? AND pm.user_id = u.user_id AND pm.invitation_status IN ('PENDING', 'ACCEPTED') WHERE u.use_yn = 1 AND u.del_yn = 0 AND pm.user_id IS NULL ORDER BY t.team_name, u.user_name", [projectId]);
    return rows;
  }

  async invite(projectId: number, memberUserId: number, memberRole: MemberRole, invitedBy: number) {
    await this.assertOwner(projectId, invitedBy);
    const [users] = await this.database.connection.execute<RowDataPacket[]>("SELECT user_id FROM tb_users WHERE user_id = ? AND use_yn = 1 AND del_yn = 0", [memberUserId]);
    if (!users.length) throw new BadRequestException("Invalid project member.");
    const [existing] = await this.database.connection.execute<MemberRow[]>("SELECT member_role AS memberRole, invitation_status AS invitationStatus FROM tb_project_members WHERE project_id = ? AND user_id = ?", [projectId, memberUserId]);
    if (existing[0]?.memberRole === "OWNER") throw new BadRequestException("Project owner cannot be invited.");
    if (existing[0]?.invitationStatus === "ACCEPTED") throw new BadRequestException("User is already a project member.");
    await this.database.connection.execute("INSERT INTO tb_project_members (project_id, user_id, member_role, invitation_status, invited_by, responded_at) VALUES (?, ?, ?, 'PENDING', ?, NULL) ON DUPLICATE KEY UPDATE member_role = VALUES(member_role), invitation_status = 'PENDING', invited_by = VALUES(invited_by), responded_at = NULL", [projectId, memberUserId, memberRole, invitedBy]);
  }

  async respond(projectId: number, memberUserId: number, status: "ACCEPTED" | "DECLINED", userId: number) {
    if (memberUserId !== userId) throw new ForbiddenException("Only the invited user can respond.");
    const [result] = await this.database.connection.execute<ResultSetHeader>("UPDATE tb_project_members SET invitation_status = ?, responded_at = NOW() WHERE project_id = ? AND user_id = ? AND invitation_status = 'PENDING'", [status, projectId, userId]);
    if (!result.affectedRows) throw new NotFoundException("Pending invitation not found.");
  }

  async revoke(projectId: number, memberUserId: number, userId: number) {
    await this.assertOwner(projectId, userId);
    const [result] = await this.database.connection.execute<ResultSetHeader>("UPDATE tb_project_members SET invitation_status = 'REVOKED', responded_at = NOW() WHERE project_id = ? AND user_id = ? AND member_role <> 'OWNER' AND invitation_status IN ('PENDING', 'ACCEPTED')", [projectId, memberUserId]);
    if (!result.affectedRows) throw new NotFoundException("Active project member not found.");
  }

  validateProject(body: Record<string, unknown>): ProjectInput {
    if (typeof body.projectTitle !== "string" || !body.projectTitle.trim() || body.projectTitle.trim().length > 255 || (body.projectContent !== undefined && typeof body.projectContent !== "string") || !this.isProjectStatus(body.projectStatus)) throw new BadRequestException("Invalid project input.");
    return { projectTitle: body.projectTitle.trim(), projectContent: body.projectContent?.trim(), projectStatus: body.projectStatus };
  }

  private projectsSql(where: string) { return `SELECT p.project_id AS projectId, p.project_title AS projectTitle, p.project_content AS projectContent, p.project_status AS projectStatus, p.created_by AS createdBy, p.created_at AS createdAt, p.updated_at AS updatedAt, COUNT(DISTINCT r.requirement_id) AS requirementCount, COUNT(DISTINCT CASE WHEN i.issue_status NOT IN ('DONE', 'CLOSED') THEN i.issue_id END) AS openDefectCount FROM tb_projects p ${where.includes("pm.") ? "JOIN tb_project_members pm ON pm.project_id = p.project_id" : ""} LEFT JOIN tb_planning_documents d ON d.project_id = p.project_id AND d.del_yn = 0 LEFT JOIN tb_requirements r ON r.document_id = d.document_id AND r.del_yn = 0 LEFT JOIN tb_defect_registers dr ON dr.project_id = p.project_id AND dr.del_yn = 0 LEFT JOIN tb_issues i ON i.register_id = dr.register_id AND i.del_yn = 0 ${where} AND p.del_yn = 0 GROUP BY p.project_id ORDER BY p.updated_at DESC`; }
  private project(row: ProjectRow) { return { ...row, requirementCount: Number(row.requirementCount), openDefectCount: Number(row.openDefectCount) }; }
  private isProjectStatus(value: unknown): value is ProjectStatus { return value === "NEW" || value === "IN_PROGRESS" || value === "DONE"; }
  private async assertAcceptedMember(projectId: number, userId: number) { const [rows] = await this.database.connection.execute<RowDataPacket[]>("SELECT 1 FROM tb_project_members WHERE project_id = ? AND user_id = ? AND invitation_status = 'ACCEPTED'", [projectId, userId]); if (!rows.length) throw new ForbiddenException("Project membership is required."); }
  private async assertOwner(projectId: number, userId: number) { const [rows] = await this.database.connection.execute<RowDataPacket[]>("SELECT 1 FROM tb_project_members WHERE project_id = ? AND user_id = ? AND member_role = 'OWNER' AND invitation_status = 'ACCEPTED'", [projectId, userId]); if (!rows.length) throw new ForbiddenException("Project owner permission is required."); }
}
