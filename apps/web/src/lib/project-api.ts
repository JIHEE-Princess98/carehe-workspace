import type { ProjectStatus, ProjectSummary } from "@carehe/shared-types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";
type ProjectResponse = { projectId: number; projectTitle: string; projectContent: string | null; projectStatus: ProjectStatus; requirementCount: number; openDefectCount: number; updatedAt: string };

function headers() { return { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("issue-access-token") ?? ""}` }; }
function summary(project: ProjectResponse): ProjectSummary { return { projectId: String(project.projectId), projectTitle: project.projectTitle, description: project.projectContent ?? "", projectStatus: project.projectStatus, requirementCount: project.requirementCount, openDefectCount: project.openDefectCount, updatedAt: new Date(project.updatedAt).toLocaleDateString("ko-KR") }; }
async function request(path: string, options?: RequestInit) { const response = await fetch(`${apiUrl}${path}`, { ...options, headers: { ...headers(), ...options?.headers } }); if (!response.ok) throw new Error(response.status === 401 ? "로그인이 필요합니다." : response.status === 403 ? "프로젝트 접근 권한이 없습니다." : "요청을 처리하지 못했습니다."); return response; }

export async function fetchProjects() { return (await (await request("/projects")).json() as ProjectResponse[]).map(summary); }
export async function fetchProject(projectId: string) { return summary(await (await request(`/projects/${projectId}`)).json() as ProjectResponse); }
export async function createProject(input: { projectTitle: string; description: string; projectStatus: ProjectStatus }) { return await (await request("/projects", { method: "POST", body: JSON.stringify({ projectTitle: input.projectTitle, projectContent: input.description, projectStatus: input.projectStatus }) })).json() as { projectId: number }; }

export async function fetchProjectMembers(projectId: string) {
  return await (await request(`/projects/${projectId}/members`)).json() as Array<{ userId: number; userName: string; loginId: string; teamName: string | null; memberRole: string; memberRoleName: string; invitationStatus: string; invitationStatusName: string; createdAt: string }>;
}
export async function fetchAvailableProjectMembers(projectId: string) { return await (await request(`/projects/${projectId}/available-members`)).json() as Array<{ userId: number; userName: string; loginId: string; teamName: string | null }>; }
export async function inviteProjectMember(projectId: string, userId: number, memberRole: "EDITOR" | "VIEWER" = "EDITOR") { await request(`/projects/${projectId}/members`, { method: "POST", body: JSON.stringify({ userId, memberRole }) }); }
export async function fetchProjectDocuments(projectId: string) { return await (await request(`/projects/${projectId}/documents`)).json() as Array<{ documentId: number; documentNo: string; documentTitle: string; documentContent: string | null; documentStatus: string; documentStatusName: string; updatedAt: string; updatedBy: string; requirementCount: number }>; }
