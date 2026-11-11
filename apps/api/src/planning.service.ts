import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { basename, extname, resolve } from "path";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Pool, PoolConnection } from "mysql2/promise";
import { DatabaseService } from "./database.service";

type ServiceType = "ADMIN" | "USER";
type DocumentStatus = "DRAFT" | "REVIEWING" | "CONFIRMED" | "IN_PROGRESS" | "CLOSED";
type RequirementStatus = "NEW" | "DISCUSSING" | "CONFIRMED" | "IN_PROGRESS" | "DONE";
type DocumentInput = { projectId: number; documentTitle: string; documentContent?: string; documentStatus: DocumentStatus; serviceType: ServiceType; environments: string[]; referenceUrls: string[] };
type RequirementInput = { requirementTitle: string; requirementContent?: string; requestType: "NEW" | "IMPROVEMENT" | "OTHER"; priority: "LOW" | "NORMAL" | "HIGH"; requirementStatus: RequirementStatus; assigneeId?: number | null; referenceUrls: string[] };

@Injectable()
export class PlanningService {
  constructor(private readonly database: DatabaseService) {}

  async documents(query: Record<string, unknown>, userId: number) {
    const values: Array<string | number> = [userId];
    const clauses = ["pm.user_id = ?", "pm.invitation_status = 'ACCEPTED'", "d.del_yn = 0"];
    if (this.integer(query.projectId)) { clauses.push("d.project_id = ?"); values.push(this.integer(query.projectId)!); }
    if (this.service(query.serviceType)) { clauses.push("se.service_type = ?"); values.push(query.serviceType); }
    if (this.environment(query.environment)) { clauses.push("se.environment_code = ?"); values.push(query.environment); }
    if (this.documentStatus(query.documentStatus)) { clauses.push("d.document_status = ?"); values.push(query.documentStatus); }
    if (typeof query.search === "string" && query.search.trim()) { clauses.push("d.document_title LIKE ?"); values.push(`%${query.search.trim()}%`); }
    const [rows] = await this.database.connection.execute<RowDataPacket[]>(`SELECT d.document_id AS documentId, d.project_id AS projectId, p.project_title AS projectTitle, d.document_no AS documentNo, d.document_title AS documentTitle, d.document_content AS documentContent, d.document_status AS documentStatus, u.user_name AS createdBy, d.created_at AS createdAt, d.updated_at AS updatedAt, GROUP_CONCAT(DISTINCT se.environment_code ORDER BY se.environment_code) AS environments, MAX(se.service_type) AS serviceType, COUNT(DISTINCT r.requirement_id) AS requirementCount, (SELECT reference_url FROM tb_references ref WHERE ref.document_id = d.document_id ORDER BY ref.reference_id DESC LIMIT 1) AS referenceUrl FROM tb_planning_documents d JOIN tb_projects p ON p.project_id = d.project_id JOIN tb_project_members pm ON pm.project_id = d.project_id JOIN tb_users u ON u.user_id = d.created_by JOIN tb_document_environments de ON de.document_id = d.document_id JOIN tb_service_environments se ON se.environment_id = de.environment_id LEFT JOIN tb_requirements r ON r.document_id = d.document_id AND r.del_yn = 0 WHERE ${clauses.join(" AND ")} GROUP BY d.document_id ORDER BY d.updated_at DESC`, values);
    return this.withDocumentRelations(rows);
  }

  async document(documentId: number, userId: number) { const row = await this.documentRow(documentId, userId); return row; }

  async createDocument(input: DocumentInput, userId: number) {
    const connection = await this.database.connection.getConnection();
    try {
      await connection.beginTransaction();
      await this.assertEditor(connection, input.projectId, userId);
      const environmentIds = await this.environmentIds(connection, input.serviceType, input.environments);
      const [result] = await connection.execute<ResultSetHeader>("INSERT INTO tb_planning_documents (project_id, document_no, document_title, document_content, document_status, created_by) VALUES (?, ?, ?, ?, ?, ?)", [input.projectId, `PENDING-${randomUUID()}`, input.documentTitle, input.documentContent || null, input.documentStatus, userId]);
      await connection.execute("UPDATE tb_planning_documents SET document_no = ? WHERE document_id = ?", [`DOC-${String(result.insertId).padStart(6, "0")}`, result.insertId]);
      await connection.query("INSERT INTO tb_document_environments (document_id, environment_id) VALUES ?", [environmentIds.map((environmentId) => [result.insertId, environmentId])]);
      await this.replaceReferences(connection, "document_id", result.insertId, input.referenceUrls, userId);
      await connection.execute("INSERT INTO tb_document_history (document_id, action_type, changed_by) VALUES (?, 'CREATED', ?)", [result.insertId, userId]);
      await connection.commit(); return { documentId: result.insertId };
    } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
  }

  async updateDocument(documentId: number, input: DocumentInput, userId: number) {
    const connection = await this.database.connection.getConnection();
    try {
      await connection.beginTransaction();
      const [existing] = await connection.execute<RowDataPacket[]>("SELECT project_id AS projectId FROM tb_planning_documents WHERE document_id = ? AND del_yn = 0 FOR UPDATE", [documentId]);
      if (!existing.length) throw new NotFoundException("Document not found.");
      if (existing[0].projectId !== input.projectId) throw new BadRequestException("Document project cannot be changed.");
      await this.assertEditor(connection, input.projectId, userId);
      const environmentIds = await this.environmentIds(connection, input.serviceType, input.environments);
      await connection.execute("UPDATE tb_planning_documents SET document_title = ?, document_content = ?, document_status = ?, updated_by = ? WHERE document_id = ?", [input.documentTitle, input.documentContent || null, input.documentStatus, userId, documentId]);
      await connection.execute("DELETE FROM tb_document_environments WHERE document_id = ?", [documentId]);
      await connection.query("INSERT INTO tb_document_environments (document_id, environment_id) VALUES ?", [environmentIds.map((environmentId) => [documentId, environmentId])]);
      await this.replaceReferences(connection, "document_id", documentId, input.referenceUrls, userId);
      await connection.execute("INSERT INTO tb_document_history (document_id, action_type, changed_by) VALUES (?, 'UPDATED', ?)", [documentId, userId]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
  }

  async deleteDocument(documentId: number, userId: number) {
    const connection = await this.database.connection.getConnection();
    try {
      await connection.beginTransaction(); const [rows] = await connection.execute<RowDataPacket[]>("SELECT project_id AS projectId FROM tb_planning_documents WHERE document_id = ? AND del_yn = 0 FOR UPDATE", [documentId]);
      if (!rows.length) throw new NotFoundException("Document not found."); await this.assertEditor(connection, rows[0].projectId, userId);
      const [requirements] = await connection.execute<RowDataPacket[]>("SELECT 1 FROM tb_requirements WHERE document_id = ? AND del_yn = 0 LIMIT 1", [documentId]);
      if (requirements.length) throw new BadRequestException("Documents with active requirements cannot be deleted.");
      await connection.execute("UPDATE tb_planning_documents SET del_yn = 1, updated_by = ? WHERE document_id = ?", [userId, documentId]); await connection.commit();
    } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
  }

  async uploadDocumentAttachment(documentId: number, file: { originalname: string; mimetype: string; size: number; buffer: Buffer }, userId: number) {
    await this.assertDocumentEditor(documentId, userId);
    if (!file?.buffer?.length || file.size > 25 * 1024 * 1024) throw new BadRequestException("Attachment must be smaller than 25 MB.");
    const storageKey = `${randomUUID()}${extname(file.originalname).slice(0, 20)}`;
    const directory = this.attachmentDirectory();
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(resolve(directory, storageKey), file.buffer);
    try {
      const [result] = await this.database.connection.execute<ResultSetHeader>("INSERT INTO tb_attachments (document_id, original_file_name, storage_key, mime_type, file_size, created_by) VALUES (?, ?, ?, ?, ?, ?)", [documentId, basename(file.originalname).slice(0, 255), storageKey, file.mimetype?.slice(0, 100) || null, file.size, userId]);
      return { attachmentId: result.insertId, name: basename(file.originalname), size: file.size, mimeType: file.mimetype };
    } catch (error) {
      await fs.unlink(resolve(directory, storageKey)).catch(() => undefined);
      throw error;
    }
  }

  async documentAttachment(attachmentId: number, userId: number) {
    const [rows] = await this.database.connection.execute<RowDataPacket[]>("SELECT a.attachment_id AS attachmentId, a.document_id AS documentId, a.original_file_name AS name, a.storage_key AS storageKey, a.mime_type AS mimeType FROM tb_attachments a WHERE a.attachment_id = ? AND a.document_id IS NOT NULL", [attachmentId]);
    if (!rows.length) throw new NotFoundException("Attachment not found.");
    await this.documentRow(rows[0].documentId, userId);
    const storageKey = basename(String(rows[0].storageKey));
    const path = resolve(this.attachmentDirectory(), storageKey);
    try { await fs.access(path); } catch { throw new NotFoundException("Attachment file not found."); }
    return { path, name: rows[0].name, mimeType: rows[0].mimeType || "application/octet-stream" };
  }

  async requirements(documentId: number, query: Record<string, unknown>, userId: number) {
    await this.documentRow(documentId, userId); const page = Math.max(1, this.integer(query.page) ?? 1); const pageSize = Math.min(100, Math.max(1, this.integer(query.pageSize) ?? 5)); const values: Array<string | number> = [documentId]; const clauses = ["r.document_id = ?", "r.del_yn = 0"];
    if (typeof query.search === "string" && query.search.trim()) { clauses.push("r.requirement_title LIKE ?"); values.push(`%${query.search.trim()}%`); }
    if (this.requirementStatus(query.requirementStatus)) { clauses.push("r.requirement_status = ?"); values.push(query.requirementStatus); }
    const where = clauses.join(" AND "); const [count] = await this.database.connection.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM tb_requirements r WHERE ${where}`, values);
    const [rows] = await this.database.connection.execute<RowDataPacket[]>(`SELECT r.requirement_id AS requirementId, r.document_id AS documentId, r.requirement_no AS requirementNo, r.requirement_title AS requirementTitle, r.requirement_content AS requirementContent, r.request_type AS requestType, r.priority, r.requirement_status AS requirementStatus, r.assignee_id AS assigneeId, u.user_name AS assignee, r.created_at AS createdAt, r.updated_at AS updatedAt, (SELECT reference_url FROM tb_references ref WHERE ref.requirement_id = r.requirement_id ORDER BY ref.reference_id DESC LIMIT 1) AS referenceUrl FROM tb_requirements r LEFT JOIN tb_users u ON u.user_id = r.assignee_id WHERE ${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`, [...values, pageSize, (page - 1) * pageSize]);
    const total = Number(count[0].total); return { items: await this.withRequirementReferences(rows), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async requirement(requirementId: number, userId: number) { const [rows] = await this.database.connection.execute<RowDataPacket[]>("SELECT r.document_id AS documentId FROM tb_requirements r WHERE r.requirement_id = ? AND r.del_yn = 0", [requirementId]); if (!rows.length) throw new NotFoundException("Requirement not found."); await this.documentRow(rows[0].documentId, userId); const result = await this.requirements(rows[0].documentId, { page: 1, pageSize: 100 }, userId); return (result.items as Array<{ requirementId: number }>).find((item) => item.requirementId === requirementId); }

  async createRequirement(documentId: number, input: RequirementInput, userId: number) { const connection = await this.database.connection.getConnection(); try { await connection.beginTransaction(); const [document] = await connection.execute<RowDataPacket[]>("SELECT project_id AS projectId FROM tb_planning_documents WHERE document_id = ? AND del_yn = 0 FOR UPDATE", [documentId]); if (!document.length) throw new NotFoundException("Document not found."); await this.assertEditor(connection, document[0].projectId, userId); await this.assertAssignee(connection, input.assigneeId); const [result] = await connection.execute<ResultSetHeader>("INSERT INTO tb_requirements (document_id, requirement_no, requirement_title, requirement_content, requirement_status, request_type, priority, assignee_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [documentId, `PENDING-${randomUUID()}`, input.requirementTitle, input.requirementContent || null, input.requirementStatus, input.requestType, input.priority, input.assigneeId || null, userId]); await connection.execute("UPDATE tb_requirements SET requirement_no = ? WHERE requirement_id = ?", [`REQ-${String(result.insertId).padStart(6, "0")}`, result.insertId]); await this.replaceReferences(connection, "requirement_id", result.insertId, input.referenceUrls, userId); await connection.execute("INSERT INTO tb_status_history (requirement_id, before_status, after_status, change_reason, changed_by) VALUES (?, NULL, ?, 'CREATED', ?)", [result.insertId, input.requirementStatus, userId]); await connection.commit(); return { requirementId: result.insertId }; } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); } }

  async updateRequirement(requirementId: number, input: RequirementInput, userId: number) { const connection = await this.database.connection.getConnection(); try { await connection.beginTransaction(); const [rows] = await connection.execute<RowDataPacket[]>("SELECT r.document_id AS documentId, r.requirement_status AS requirementStatus, d.project_id AS projectId FROM tb_requirements r JOIN tb_planning_documents d ON d.document_id = r.document_id WHERE r.requirement_id = ? AND r.del_yn = 0 FOR UPDATE", [requirementId]); if (!rows.length) throw new NotFoundException("Requirement not found."); await this.assertEditor(connection, rows[0].projectId, userId); await this.assertAssignee(connection, input.assigneeId); await connection.execute("UPDATE tb_requirements SET requirement_title = ?, requirement_content = ?, requirement_status = ?, request_type = ?, priority = ?, assignee_id = ? WHERE requirement_id = ?", [input.requirementTitle, input.requirementContent || null, input.requirementStatus, input.requestType, input.priority, input.assigneeId || null, requirementId]); if (rows[0].requirementStatus !== input.requirementStatus) await connection.execute("INSERT INTO tb_status_history (requirement_id, before_status, after_status, change_reason, changed_by) VALUES (?, ?, ?, 'STATUS_UPDATED', ?)", [requirementId, rows[0].requirementStatus, input.requirementStatus, userId]); await this.replaceReferences(connection, "requirement_id", requirementId, input.referenceUrls, userId); await connection.commit(); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); } }

  async deleteRequirement(requirementId: number, userId: number) { const connection = await this.database.connection.getConnection(); try { await connection.beginTransaction(); const [rows] = await connection.execute<RowDataPacket[]>("SELECT r.document_id AS documentId, d.project_id AS projectId FROM tb_requirements r JOIN tb_planning_documents d ON d.document_id = r.document_id WHERE r.requirement_id = ? AND r.del_yn = 0 FOR UPDATE", [requirementId]); if (!rows.length) throw new NotFoundException("Requirement not found."); await this.assertEditor(connection, rows[0].projectId, userId); await connection.execute("UPDATE tb_requirements SET del_yn = 1 WHERE requirement_id = ?", [requirementId]); await connection.commit(); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); } }

  async documentHistory(documentId: number, userId: number) { await this.documentRow(documentId, userId); const [rows] = await this.database.connection.execute<RowDataPacket[]>("SELECT h.history_id AS historyId, h.action_type AS actionType, u.user_name AS changedBy, h.created_at AS createdAt FROM tb_document_history h JOIN tb_users u ON u.user_id = h.changed_by WHERE h.document_id = ? ORDER BY h.created_at DESC", [documentId]); return rows; }
  async requirementHistory(requirementId: number, userId: number) { await this.requirement(requirementId, userId); const [rows] = await this.database.connection.execute<RowDataPacket[]>("SELECT h.history_id AS historyId, h.before_status AS beforeStatus, h.after_status AS afterStatus, h.change_reason AS changeReason, u.user_name AS changedBy, h.created_at AS createdAt FROM tb_status_history h JOIN tb_users u ON u.user_id = h.changed_by WHERE h.requirement_id = ? ORDER BY h.created_at DESC", [requirementId]); return rows; }

  validateDocument(body: Record<string, unknown>): DocumentInput { const referenceUrls = this.referenceUrls(body); if (!this.integer(body.projectId) || !this.text(body.documentTitle, 255) || !this.documentStatus(body.documentStatus) || !this.service(body.serviceType) || !Array.isArray(body.environments) || !body.environments.length || body.environments.some((value) => !this.environment(value)) || (body.documentContent !== undefined && typeof body.documentContent !== "string") || !referenceUrls) throw new BadRequestException("Invalid document input."); return { projectId: this.integer(body.projectId)!, documentTitle: this.text(body.documentTitle, 255)!, documentContent: typeof body.documentContent === "string" ? body.documentContent.trim() : undefined, documentStatus: body.documentStatus, serviceType: body.serviceType, environments: [...new Set(body.environments as string[])], referenceUrls }; }
  validateRequirement(body: Record<string, unknown>): RequirementInput { const referenceUrls = this.referenceUrls(body); if (!this.text(body.requirementTitle, 255) || !this.requirementStatus(body.requirementStatus) || !["NEW", "IMPROVEMENT", "OTHER"].includes(String(body.requestType)) || !["LOW", "NORMAL", "HIGH"].includes(String(body.priority)) || (body.requirementContent !== undefined && typeof body.requirementContent !== "string") || (body.assigneeId !== undefined && body.assigneeId !== null && !this.integer(body.assigneeId)) || !referenceUrls) throw new BadRequestException("Invalid requirement input."); return { requirementTitle: this.text(body.requirementTitle, 255)!, requirementContent: typeof body.requirementContent === "string" ? body.requirementContent.trim() : undefined, requirementStatus: body.requirementStatus, requestType: body.requestType as RequirementInput["requestType"], priority: body.priority as RequirementInput["priority"], assigneeId: this.integer(body.assigneeId), referenceUrls }; }

  private async documentRow(documentId: number, userId: number) { const [rows] = await this.database.connection.execute<RowDataPacket[]>("SELECT d.document_id AS documentId, d.project_id AS projectId FROM tb_planning_documents d JOIN tb_project_members pm ON pm.project_id = d.project_id WHERE d.document_id = ? AND d.del_yn = 0 AND pm.user_id = ? AND pm.invitation_status = 'ACCEPTED'", [documentId, userId]); if (!rows.length) throw new NotFoundException("Document not found."); return rows[0]; }
  private async assertDocumentEditor(documentId: number, userId: number) { const document = await this.documentRow(documentId, userId); await this.assertEditor(this.database.connection, document.projectId, userId); }
  private async withDocumentRelations(rows: RowDataPacket[]) {
    if (!rows.length) return [];
    const documentIds = rows.map((row) => row.documentId);
    const [attachments] = await this.database.connection.query<RowDataPacket[]>("SELECT attachment_id AS attachmentId, document_id AS documentId, original_file_name AS name, file_size AS size, mime_type AS mimeType FROM tb_attachments WHERE document_id IN (?) ORDER BY created_at ASC", [documentIds]);
    const byDocument = new Map<number, Array<{ attachmentId: number; name: string; size: number; mimeType: string | null }>>();
    attachments.forEach((attachment) => { const documentId = Number(attachment.documentId); const items = byDocument.get(documentId) ?? []; items.push({ attachmentId: Number(attachment.attachmentId), name: String(attachment.name), size: Number(attachment.size), mimeType: attachment.mimeType ? String(attachment.mimeType) : null }); byDocument.set(documentId, items); });
    const [references] = await this.database.connection.query<RowDataPacket[]>("SELECT document_id AS documentId, reference_url AS referenceUrl FROM tb_references WHERE document_id IN (?) ORDER BY reference_id ASC", [documentIds]);
    const referencesByDocument = this.referencesByTarget(references, "documentId");
    return rows.map((row) => ({ ...row, environments: String(row.environments ?? "").split(",").filter(Boolean), requirementCount: Number(row.requirementCount), attachments: byDocument.get(row.documentId) ?? [], referenceUrls: referencesByDocument.get(row.documentId) ?? [] }));
  }
  private attachmentDirectory() { return resolve(process.env.UPLOAD_DIR ?? resolve(process.cwd(), "uploads")); }
  private async assertEditor(connection: Pool | PoolConnection, projectId: number, userId: number) { const [rows] = await connection.execute<RowDataPacket[]>("SELECT 1 FROM tb_project_members WHERE project_id = ? AND user_id = ? AND invitation_status = 'ACCEPTED' AND member_role IN ('OWNER', 'EDITOR', 'MEMBER')", [projectId, userId]); if (!rows.length) throw new ForbiddenException("Project editor permission is required."); }
  private async environmentIds(connection: PoolConnection, serviceType: ServiceType, environments: string[]) { if (serviceType === "ADMIN" && environments.includes("STAGING")) throw new BadRequestException("ADMIN does not support STAGING."); const [rows] = await connection.query<RowDataPacket[]>("SELECT environment_id AS environmentId FROM tb_service_environments WHERE service_type = ? AND environment_code IN (?) AND use_yn = 1", [serviceType, environments]); if (rows.length !== environments.length) throw new BadRequestException("Invalid service environment."); return rows.map((row) => row.environmentId); }
  private async assertAssignee(connection: PoolConnection, assigneeId?: number | null) { if (!assigneeId) return; const [rows] = await connection.execute<RowDataPacket[]>("SELECT 1 FROM tb_users WHERE user_id = ? AND use_yn = 1 AND del_yn = 0", [assigneeId]); if (!rows.length) throw new BadRequestException("Invalid assignee."); }
  private async withRequirementReferences(rows: RowDataPacket[]) { if (!rows.length) return []; const ids = rows.map((row) => row.requirementId); const [references] = await this.database.connection.query<RowDataPacket[]>("SELECT requirement_id AS requirementId, reference_url AS referenceUrl FROM tb_references WHERE requirement_id IN (?) ORDER BY reference_id ASC", [ids]); const byRequirement = this.referencesByTarget(references, "requirementId"); return rows.map((row) => ({ ...row, referenceUrls: byRequirement.get(row.requirementId) ?? [] })); }
  private referencesByTarget(rows: RowDataPacket[], target: "documentId" | "requirementId") { const result = new Map<number, string[]>(); rows.forEach((row) => result.set(row[target], [...(result.get(row[target]) ?? []), row.referenceUrl])); return result; }
  private async replaceReferences(connection: PoolConnection, column: "document_id" | "requirement_id", id: number, urls: string[], userId: number) { await connection.execute(`DELETE FROM tb_references WHERE ${column} = ?`, [id]); if (urls.length) await connection.query(`INSERT INTO tb_references (${column}, reference_title, reference_url, created_by) VALUES ?`, [urls.map((url, index) => [id, `Reference URL ${index + 1}`, url, userId])]); }
  private integer(value: unknown) { const number = typeof value === "string" ? Number(value) : value; return Number.isInteger(number) && (number as number) > 0 ? number as number : undefined; }
  private text(value: unknown, max: number) { return typeof value === "string" && value.trim() && value.trim().length <= max ? value.trim() : undefined; }
  private url(value: unknown) { if (value === undefined || value === "") return true; if (typeof value !== "string" || value.length > 2048) return false; try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } }
  private referenceUrls(body: Record<string, unknown>) { const values = Array.isArray(body.referenceUrls) ? body.referenceUrls : body.referenceUrl === undefined ? [] : [body.referenceUrl]; if (!values.every((value) => typeof value === "string" && this.url(value))) return undefined; return [...new Set((values as string[]).map((value) => value.trim()).filter(Boolean))]; }
  private service(value: unknown): value is ServiceType { return value === "ADMIN" || value === "USER"; }
  private environment(value: unknown): value is string { return value === "DEV" || value === "STAGING" || value === "LIVE"; }
  private documentStatus(value: unknown): value is DocumentStatus { return ["DRAFT", "REVIEWING", "CONFIRMED", "IN_PROGRESS", "CLOSED"].includes(String(value)); }
  private requirementStatus(value: unknown): value is RequirementStatus { return ["NEW", "DISCUSSING", "CONFIRMED", "IN_PROGRESS", "DONE"].includes(String(value)); }
}
