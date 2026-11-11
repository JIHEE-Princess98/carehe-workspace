import type { DocumentStatus, RequirementProgressStatus, RequirementType } from "@carehe/shared-types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";
export type DocumentAttachment = { attachmentId: number; name: string; size: number; mimeType?: string | null };
export type PlanningDocument = { documentId: string; projectId: string; projectTitle: string; documentNo: string; documentTitle: string; documentContent: string; documentStatus: DocumentStatus; createdBy: string; createdAt: string; updatedAt: string; serviceType: "ADMIN" | "USER"; environments: string[]; requirementCount: number; attachments: DocumentAttachment[]; referenceUrls: string[] };
export type PlanningRequirement = { requirementId: string; documentId: string; requirementNo: string; requirementTitle: string; requirementContent: string; requestType: RequirementType; priority: "LOW" | "NORMAL" | "HIGH"; requirementStatus: RequirementProgressStatus; assigneeId?: number | null; assignee?: string; createdAt: string; updatedAt: string; referenceUrls: string[] };
type DocumentInput = { projectId: string; documentTitle: string; documentContent: string; documentStatus: DocumentStatus; serviceType: "ADMIN" | "USER"; environments: string[]; referenceUrls: string[] };
type RequirementInput = { requirementTitle: string; requirementContent: string; requestType: RequirementType; priority: "LOW" | "NORMAL" | "HIGH"; requirementStatus: RequirementProgressStatus; assigneeId?: number | null; referenceUrls: string[] };

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("issue-access-token") ?? ""}`, ...options?.headers } });
  if (!response.ok) throw new Error(response.status === 403 ? "Project access is denied." : "Request failed.");
  return response;
}
const mapDocument = (item: Omit<PlanningDocument, "documentId" | "projectId"> & { documentId: number; projectId: number }) => ({ ...item, documentId: String(item.documentId), projectId: String(item.projectId) });
const mapRequirement = (item: Omit<PlanningRequirement, "requirementId" | "documentId"> & { requirementId: number; documentId: number }) => ({ ...item, requirementId: String(item.requirementId), documentId: String(item.documentId) });

export async function listDocuments(filters: { projectId?: string; serviceType: "ADMIN" | "USER"; environment: string; search?: string }) {
  const query = new URLSearchParams({ serviceType: filters.serviceType, environment: filters.environment });
  if (filters.projectId && filters.projectId !== "ALL") query.set("projectId", filters.projectId);
  if (filters.search) query.set("search", filters.search);
  return (await (await request(`/planning/documents?${query}`)).json() as Parameters<typeof mapDocument>[0][]).map(mapDocument);
}
export async function saveDocument(input: DocumentInput, documentId?: string) {
  const response = await request(documentId ? `/planning/documents/${documentId}` : "/planning/documents", { method: documentId ? "PATCH" : "POST", body: JSON.stringify({ ...input, projectId: Number(input.projectId) }) });
  if (documentId) return documentId;
  return String((await response.json() as { documentId: number }).documentId);
}
export async function uploadDocumentAttachments(documentId: string, files: File[]) {
  await Promise.all(files.map(async (file) => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${apiUrl}/planning/documents/${documentId}/attachments`, { method: "POST", headers: { Authorization: `Bearer ${sessionStorage.getItem("issue-access-token") ?? ""}` }, body: form });
    if (!response.ok) throw new Error("Attachment upload failed.");
  }));
}
export async function downloadDocumentAttachment(attachmentId: number, name: string) {
  const response = await fetch(`${apiUrl}/planning/attachments/${attachmentId}/download`, { headers: { Authorization: `Bearer ${sessionStorage.getItem("issue-access-token") ?? ""}` } });
  if (!response.ok) throw new Error("Attachment download failed.");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
export async function removeDocument(documentId: string) { await request(`/planning/documents/${documentId}`, { method: "DELETE" }); }
export async function listRequirements(documentId: string, filters: { search?: string; requirementStatus?: string; page: number; pageSize: number }) {
  const query = new URLSearchParams({ page: String(filters.page), pageSize: String(filters.pageSize) });
  if (filters.search) query.set("search", filters.search);
  if (filters.requirementStatus && filters.requirementStatus !== "ALL") query.set("requirementStatus", filters.requirementStatus);
  const body = await (await request(`/planning/documents/${documentId}/requirements?${query}`)).json() as { items: Parameters<typeof mapRequirement>[0][]; total: number; totalPages: number };
  return { ...body, items: body.items.map(mapRequirement) };
}
export async function saveRequirement(documentId: string, input: RequirementInput, requirementId?: string) { await request(requirementId ? `/planning/requirements/${requirementId}` : `/planning/documents/${documentId}/requirements`, { method: requirementId ? "PATCH" : "POST", body: JSON.stringify(input) }); }
export async function removeRequirement(requirementId: string) { await request(`/planning/requirements/${requirementId}`, { method: "DELETE" }); }
