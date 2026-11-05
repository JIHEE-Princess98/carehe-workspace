import type { LocalAttachment } from "../components/FileAttachmentField";

export type IssueType = "BUG" | "IMPROVEMENT" | "DESIGN";
export type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type IssuePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type DefectComment = { id: string; parentId?: string; author: string; createdAt: string; content: string; attachments?: LocalAttachment[] };
export type DefectIssue = { id: string; registerId: string; projectId: string; projectTitle: string; title: string; type: IssueType; status: IssueStatus; priority: IssuePriority; author: string; createdAt: string; updatedAt: string; content: string; requirement?: string; requirementId?: string; environment?: string; attachments: LocalAttachment[]; comments: DefectComment[]; history: { at: string; by: string; status: IssueStatus }[] };

export const issueTypeLabel: Record<IssueType, string> = { BUG: "오류", IMPROVEMENT: "개선", DESIGN: "디자인" };
export const issueStatusLabel: Record<IssueStatus, string> = { OPEN: "접수", IN_PROGRESS: "진행 중", RESOLVED: "조치 완료", CLOSED: "종료" };
export const issuePriorityLabel: Record<IssuePriority, string> = { LOW: "낮음", NORMAL: "보통", HIGH: "높음", URGENT: "긴급" };
export const defectRegisters = [{ id: "REG-1001", projectId: "PRJ-1001", title: "워크스페이스 결함 관리 대장" }, { id: "REG-1002", projectId: "PRJ-1001", title: "웹 접근성 개선 대장" }];

const base: Omit<DefectIssue, "id" | "title" | "type" | "status" | "priority" | "createdAt" | "updatedAt" | "comments" | "history"> = { registerId: "REG-1001", projectId: "PRJ-1001", projectTitle: "Carehe Workspace", author: "김은정", content: "<p>화면 확인 중 발견된 이슈입니다.</p>", requirement: "REQ-001 검색조건 UI 개선", environment: "ADMIN · DEV", attachments: [] };
export const mockDefectIssues: DefectIssue[] = Array.from({ length: 12 }, (_, index) => ({ ...base, id: `ISSUE-${String(index + 1).padStart(3, "0")}`, title: `결함 이슈 확인 사항 ${index + 1}`, type: index % 3 === 0 ? "BUG" : index % 3 === 1 ? "IMPROVEMENT" : "DESIGN", status: index % 4 === 0 ? "OPEN" : index % 4 === 1 ? "IN_PROGRESS" : index % 4 === 2 ? "RESOLVED" : "CLOSED", priority: index % 4 === 0 ? "URGENT" : index % 4 === 1 ? "HIGH" : "NORMAL", createdAt: `2026.11.${String(index + 1).padStart(2, "0")} 10:20`, updatedAt: `2026.11.${String(index + 2).padStart(2, "0")} 14:10`, comments: index === 0 ? [{ id: "COMMENT-1", author: "박서우", createdAt: "2026.11.02 11:10", content: "<p>재현 경로를 확인했습니다.</p>" }, { id: "COMMENT-2", parentId: "COMMENT-1", author: "김은정", createdAt: "2026.11.02 11:35", content: "<p>확인 후 요구사항에 반영하겠습니다.</p>" }] : [], history: [{ at: `2026.11.${String(index + 1).padStart(2, "0")} 10:20`, by: "김은정", status: "OPEN" }] }));