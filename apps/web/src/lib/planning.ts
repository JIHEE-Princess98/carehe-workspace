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
  service?: "ADMIN" | "USER";
  environments?: ("DEV" | "STAGING" | "LIVE")[];
  attachmentCount?: number;
  attachments?: { attachmentId?: number; name: string; size: number; mimeType?: string | null }[];
  referenceUrl?: string;
  referenceUrls?: string[];
}
export interface PlanningRequirement {
  requirementId: string;
  documentId: string;
  requirementNo: string;
  requirementTitle: string;
  requestType: RequirementType;
  priority: "LOW" | "NORMAL" | "HIGH";
  requirementStatus: RequirementProgressStatus;
  assigneeId?: number | null;
  assignee: string;
  requirementContent: string;
  referenceUrl?: string;
  referenceUrls?: string[];
  attachments?: { name: string; size: number }[];
  attachmentFiles?: File[];
  createdAt: string;
  updatedAt: string;
}

const docs: PlanningDocument[] = [
  {
    documentId: "DOC-1001",
    projectId: "PRJ-1001",
    projectTitle: "Carehe Workspace 고도화",
    documentNo: "PLAN-ADM-001",
    documentTitle: "케어해 관리자 기능 개선",
    documentContent:
      "2026 케어해 관리자 기능 개선 기획서입니다. 회원 통합, 로그인, 시스템 알림, 대시보드, 검진 패키지 관리 기능을 포함합니다.",
    documentStatus: "IN_PROGRESS",
    createdBy: "기획팀",
    createdAt: "2026.10.20",
    updatedAt: "2026.11.02",
    service: "ADMIN",
    environments: ["DEV", "LIVE"],
    attachmentCount: 1,
    attachments: [{ name: "케어해관리자_기능개선_기획서.xlsx", size: 184320 }],
  },
  {
    documentId: "DOC-1002",
    projectId: "PRJ-1001",
    projectTitle: "Carehe Workspace 고도화",
    documentNo: "PLAN-ADM-002",
    documentTitle: "개인정보 보호 및 동의서 관리",
    documentContent: "기업관리자와 병원관리자의 민감정보 제3자 제공 동의 및 위임장 조회 정책을 정리합니다.",
    documentStatus: "REVIEWING",
    createdBy: "기획팀",
    createdAt: "2026.10.16",
    updatedAt: "2026.10.30",
    service: "ADMIN",
    environments: ["DEV"],
  },
  {
    documentId: "DOC-2001",
    projectId: "PRJ-1001",
    projectTitle: "Carehe Workspace 고도화",
    documentNo: "PLAN-USR-001",
    documentTitle: "케어해 USER 개선 요청사항",
    documentContent:
      "로그인 대상자 선택, 검진권 회수, 검진예약, 마이데이터 결과 조회 등 사용자 서비스 개선 요청을 정리합니다.",
    documentStatus: "CONFIRMED",
    createdBy: "기획팀",
    createdAt: "2026.10.28",
    updatedAt: "2026.11.01",
    service: "USER",
    environments: ["DEV", "STAGING", "LIVE"],
    attachmentCount: 1,
    attachments: [{ name: "케어해USER_개선요청사항.xlsx", size: 163840 }],
  },
];

const reqs: PlanningRequirement[] = [
  {
    requirementId: "REQ-ADM-001",
    documentId: "DOC-1001",
    requirementNo: "PNX-AD-00-01-01",
    requirementTitle: "회원 데이터 통합 계정 구조 개선",
    requestType: "IMPROVEMENT",
    priority: "HIGH",
    requirementStatus: "IN_PROGRESS",
    assignee: "김지희",
    requirementContent: "TB_PERSON 중심으로 회원 식별 기준을 통합하고 동일인 중복 계정 생성을 방지합니다.",
    createdAt: "2026.10.20",
    updatedAt: "2026.11.02",
  },
  {
    requirementId: "REQ-ADM-002",
    documentId: "DOC-1001",
    requirementNo: "PNX-AD-00-01-02",
    requirementTitle: "회원 명단 엑셀 업로드 및 매칭",
    requestType: "NEW",
    priority: "HIGH",
    requirementStatus: "CONFIRMED",
    assignee: "김지희",
    requirementContent: "이름, 생년월일, 휴대폰 번호 기준으로 기존 회원을 매칭하고 결과를 확인할 수 있어야 합니다.",
    createdAt: "2026.10.21",
    updatedAt: "2026.10.31",
  },
  {
    requirementId: "REQ-ADM-003",
    documentId: "DOC-1001",
    requirementNo: "PNX-AD-00-01-03",
    requirementTitle: "관리자 로그인 및 계정 찾기",
    requestType: "NEW",
    priority: "HIGH",
    requirementStatus: "CONFIRMED",
    assignee: "김지희",
    requirementContent: "아이디와 비밀번호 찾기 기능을 제공하고 로그인 정책을 적용합니다.",
    createdAt: "2026.10.22",
    updatedAt: "2026.10.30",
  },
  {
    requirementId: "REQ-ADM-004",
    documentId: "DOC-1001",
    requirementNo: "PNX-AD-01-01-01",
    requirementTitle: "시스템 알림 전체 보기",
    requestType: "NEW",
    priority: "HIGH",
    requirementStatus: "IN_PROGRESS",
    assignee: "김지희",
    requirementContent: "검진 패키지, 회원 정보 변경, 정산 등 관리자 알림을 목록에서 확인합니다.",
    createdAt: "2026.10.23",
    updatedAt: "2026.11.02",
  },
  {
    requirementId: "REQ-ADM-005",
    documentId: "DOC-1001",
    requirementNo: "PNX-AD-03-01-01",
    requirementTitle: "케어해 관리자 대시보드",
    requestType: "NEW",
    priority: "HIGH",
    requirementStatus: "CONFIRMED",
    assignee: "김지희",
    requirementContent: "예약 현황, 검진 현황, 통계 다운로드, 공지사항과 케파 현황을 대시보드에서 제공합니다.",
    createdAt: "2026.10.24",
    updatedAt: "2026.10.30",
  },
  {
    requirementId: "REQ-ADM-006",
    documentId: "DOC-1002",
    requirementNo: "PNX-AD-04-01-02",
    requirementTitle: "민감정보 제공 동의 및 위임장 조회",
    requestType: "NEW",
    priority: "NORMAL",
    requirementStatus: "DISCUSSING",
    assignee: "김지희",
    requirementContent: "동의한 대상자에 한해 민감정보 제3자 제공 동의 및 위임장 내용을 조회하는 정책을 적용합니다.",
    createdAt: "2026.10.25",
    updatedAt: "2026.11.01",
  },
  {
    requirementId: "REQ-USR-001",
    documentId: "DOC-2001",
    requirementNo: "USR-LOGIN-001",
    requirementTitle: "로그인 대상자 선택 방식 개선",
    requestType: "IMPROVEMENT",
    priority: "HIGH",
    requirementStatus: "DONE",
    assignee: "김지희",
    requirementContent: "대상자가 한 명이면 즉시 선택하고, 두 명 이상인 경우에만 대상자 선택 목록을 제공합니다.",
    createdAt: "2026.10.20",
    updatedAt: "2026.10.29",
  },
  {
    requirementId: "REQ-USR-002",
    documentId: "DOC-2001",
    requirementNo: "USR-LOGIN-002",
    requirementTitle: "검진권 회수 기능",
    requestType: "NEW",
    priority: "HIGH",
    requirementStatus: "DONE",
    assignee: "김지희",
    requirementContent: "미예약 대상자의 검진권을 회수하고 본인 자격을 원복할 수 있어야 합니다.",
    createdAt: "2026.10.21",
    updatedAt: "2026.10.29",
  },
  {
    requirementId: "REQ-USR-003",
    documentId: "DOC-2001",
    requirementNo: "USR-RESV-001",
    requirementTitle: "검진항목 중복 선택 방지",
    requestType: "NEW",
    priority: "HIGH",
    requirementStatus: "DONE",
    assignee: "김지희",
    requirementContent: "이미 선택된 검진 항목은 하위 목록에서 자동 비활성화하여 중복 결제와 선택을 방지합니다.",
    createdAt: "2026.10.22",
    updatedAt: "2026.10.29",
  },
  {
    requirementId: "REQ-USR-004",
    documentId: "DOC-2001",
    requirementNo: "USR-MY-001",
    requirementTitle: "검진결과 그래프 시각화",
    requestType: "IMPROVEMENT",
    priority: "HIGH",
    requirementStatus: "CONFIRMED",
    assignee: "김지희",
    requirementContent: "종합건강검진 결과도 추이 그래프와 정상 범위 기준치 밴드로 확인할 수 있어야 합니다.",
    createdAt: "2026.10.23",
    updatedAt: "2026.10.31",
  },
  {
    requirementId: "REQ-USR-005",
    documentId: "DOC-2001",
    requirementNo: "USR-MY-002",
    requirementTitle: "검진결과 조회 기간 확대",
    requestType: "IMPROVEMENT",
    priority: "NORMAL",
    requirementStatus: "DONE",
    assignee: "김지희",
    requirementContent: "검진결과 조회 기간을 확대하고 결과 화면으로 이동하는 경로를 개선합니다.",
    createdAt: "2026.10.24",
    updatedAt: "2026.10.30",
  },
];

export const documentStatusLabel: Record<DocumentStatus, string> = {
  DRAFT: "진행 전",
  REVIEWING: "검토 중",
  CONFIRMED: "기획 확정",
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
  DISCUSSING: "논의 중",
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
    documentNo: `PLAN-DEMO-${String(docs.length + 1).padStart(3, "0")}`,
    createdBy: "FRONTEND DEMO",
    createdAt: "방금",
    updatedAt: "방금",
  };
}
export function createMockRequirement(
  v: Omit<PlanningRequirement, "requirementId" | "requirementNo" | "createdAt" | "updatedAt">,
): PlanningRequirement {
  return {
    ...v,
    requirementId: `REQ-DEMO-${Date.now()}`,
    requirementNo: `REQ-DEMO-${String(reqs.length + 1).padStart(3, "0")}`,
    createdAt: "방금",
    updatedAt: "방금",
  };
}
