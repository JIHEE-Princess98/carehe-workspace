import type { DocumentStatus, RequirementProgressStatus, RequirementType } from "@carehe/shared-types";
export interface PlanningDocument {
  documentId: string;
  projectId: string;
  projectTitle: string;
  documentNo: string;
  documentTitle: string;
  documentContent: string;
  documentStatus: DocumentStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface PlanningRequirement {
  requirementId: string;
  documentId: string;
  requirementNo: string;
  requirementTitle: string;
  requestType: RequirementType;
  priority: "LOW" | "NORMAL" | "HIGH";
  requirementStatus: RequirementProgressStatus;
  assignee: string;
  requirementContent: string;
  createdAt: string;
  updatedAt: string;
}
const docs: PlanningDocument[] = [
  {
    documentId: "DOC-1001",
    projectId: "PRJ-1001",
    projectTitle: "Carehe Workspace 고도화",
    documentNo: "PLAN-001",
    documentTitle: "건강관리 데이터 UI 개편",
    documentContent: "건강관리 데이터를 더 쉽게 조회하고 관리하기 위한 화면 개편 문서입니다.",
    documentStatus: "IN_PROGRESS",
    createdBy: "김은정",
    createdAt: "2026.10.20",
    updatedAt: "2026.11.02",
  },
  {
    documentId: "DOC-1002",
    projectId: "PRJ-1001",
    projectTitle: "Carehe Workspace 고도화",
    documentNo: "PLAN-002",
    documentTitle: "운영자 권한 정책 정리",
    documentContent: "운영자 권한과 메뉴별 접근 기준을 정리합니다.",
    documentStatus: "REVIEWING",
    createdBy: "김은정",
    createdAt: "2026.10.16",
    updatedAt: "2026.10.30",
  },
  {
    documentId: "DOC-2001",
    projectId: "PRJ-1002",
    projectTitle: "건강검진 결과 연계",
    documentNo: "PLAN-003",
    documentTitle: "검진 결과 조회 흐름",
    documentContent: "검진 결과 연계 및 조회 흐름을 정의합니다.",
    documentStatus: "DRAFT",
    createdBy: "박서윤",
    createdAt: "2026.10.28",
    updatedAt: "2026.10.28",
  },
];
const reqs: PlanningRequirement[] = [
  {
    requirementId: "REQ-1001",
    documentId: "DOC-1001",
    requirementNo: "REQ-001",
    requirementTitle: "검색조건 UI 개선",
    requestType: "IMPROVEMENT",
    priority: "HIGH",
    requirementStatus: "IN_PROGRESS",
    assignee: "이도윤",
    requirementContent: "검색 조건을 묶고 초기화 및 선택값을 제공합니다.",
    createdAt: "2026.10.21",
    updatedAt: "2026.11.02",
  },
  {
    requirementId: "REQ-1002",
    documentId: "DOC-1001",
    requirementNo: "REQ-002",
    requirementTitle: "테이블 디자인 개선",
    requestType: "IMPROVEMENT",
    priority: "NORMAL",
    requirementStatus: "CONFIRMED",
    assignee: "박서윤",
    requirementContent: "목록 테이블의 정보 위계를 개선합니다.",
    createdAt: "2026.10.22",
    updatedAt: "2026.10.31",
  },
  {
    requirementId: "REQ-1003",
    documentId: "DOC-1001",
    requirementNo: "REQ-003",
    requirementTitle: "PDF 다운로드 기능 추가",
    requestType: "NEW",
    priority: "NORMAL",
    requirementStatus: "NEW",
    assignee: "김은정",
    requirementContent: "검색 결과를 PDF로 내려받습니다.",
    createdAt: "2026.10.24",
    updatedAt: "2026.10.24",
  },
];
export const documentStatusLabel: Record<DocumentStatus, string> = {
  DRAFT: "진행 전",
  REVIEWING: "검토 중",
  CONFIRMED: "확정",
  IN_PROGRESS: "진행 중",
  CLOSED: "완료",
};
export const requirementTypeLabel: Record<RequirementType, string> = {
  NEW: "신규",
  IMPROVEMENT: "개선",
  OTHER: "기타",
};
export const requirementStatusLabel: Record<RequirementProgressStatus, string> = {
  NEW: "진행 전",
  DISCUSSING: "협의 중",
  CONFIRMED: "기획 확정",
  IN_PROGRESS: "진행 중",
  DONE: "완료",
};
export const priorityLabel: Record<PlanningRequirement["priority"], string> = {
  LOW: "낮음",
  NORMAL: "보통",
  HIGH: "높음",
};
export const getMockPlanningDocuments = () => docs;
export const getMockPlanningRequirements = () => reqs;
export function createMockDocument(
  v: Omit<PlanningDocument, "documentId" | "documentNo" | "createdAt" | "updatedAt" | "createdBy">,
): PlanningDocument {
  return {
    ...v,
    documentId: `DOC-DEMO-${Date.now()}`,
    documentNo: `PLAN-${String(docs.length + 1).padStart(3, "0")}`,
    createdBy: "김은정",
    createdAt: "방금 전",
    updatedAt: "방금 전",
  };
}
export function createMockRequirement(
  v: Omit<PlanningRequirement, "requirementId" | "requirementNo" | "createdAt" | "updatedAt">,
): PlanningRequirement {
  return {
    ...v,
    requirementId: `REQ-DEMO-${Date.now()}`,
    requirementNo: `REQ-${String(reqs.length + 1).padStart(3, "0")}`,
    createdAt: "방금 전",
    updatedAt: "방금 전",
  };
}
