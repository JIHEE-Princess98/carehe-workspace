import type { ProjectStatus, ProjectSummary } from "@carehe/shared-types";

export type WorkspaceKind = "overview" | "documents" | "requirements" | "defects" | "members";
export type WorkspaceItemStatus = "신규" | "검토중" | "진행중" | "대기" | "처리완료" | "종료";

export interface WorkspaceItem {
  id: string;
  title: string;
  status: WorkspaceItemStatus;
  meta: string;
  owner: string;
  updatedAt: string;
  description: string;
  related: string;
}

const initialProjects: ProjectSummary[] = [
  {
    projectId: "PRJ-1001",
    projectTitle: "Carehe Workspace 고도화",
    description: "기획 문서와 요구사항 관리 경험을 개선합니다.",
    projectStatus: "IN_PROGRESS",
    requirementCount: 42,
    openDefectCount: 6,
    updatedAt: "2026.11.02",
  },
  {
    projectId: "PRJ-1002",
    projectTitle: "건강검진 결과 연계",
    description: "검진 결과를 서비스 화면에 안전하게 연계합니다.",
    projectStatus: "NEW",
    requirementCount: 18,
    openDefectCount: 0,
    updatedAt: "2026.10.30",
  },
  {
    projectId: "PRJ-1003",
    projectTitle: "운영 관리자 화면 개선",
    description: "운영팀의 조회와 검수 흐름을 단순화합니다.",
    projectStatus: "IN_PROGRESS",
    requirementCount: 27,
    openDefectCount: 3,
    updatedAt: "2026.10.28",
  },
  {
    projectId: "PRJ-1004",
    projectTitle: "알림 정책 정비",
    description: "업무 알림 기준과 발송 이력을 정리합니다.",
    projectStatus: "DONE",
    requirementCount: 11,
    openDefectCount: 0,
    updatedAt: "2026.10.18",
  },
  {
    projectId: "PRJ-1005",
    projectTitle: "고객 문의 관리 전환",
    description: "엑셀 기반 문의 관리 대장을 웹으로 이전합니다.",
    projectStatus: "NEW",
    requirementCount: 8,
    openDefectCount: 1,
    updatedAt: "2026.10.15",
  },
];

export function getMockProjects(): ProjectSummary[] {
  return initialProjects;
}

export function createMockProject(input: {
  projectTitle: string;
  description: string;
  projectStatus: ProjectStatus;
}): ProjectSummary {
  return {
    projectId: `DEMO-${Date.now()}`,
    projectTitle: input.projectTitle,
    description: input.description,
    projectStatus: input.projectStatus,
    requirementCount: 0,
    openDefectCount: 0,
    updatedAt: "방금 전",
  };
}

export function getMockProject(projectId: string): ProjectSummary | undefined {
  return initialProjects.find((project) => project.projectId === projectId);
}

const workspaceItems: Record<Exclude<WorkspaceKind, "overview">, WorkspaceItem[]> = {
  documents: [
    {
      id: "DOC-012",
      title: "서비스 기획서",
      status: "진행중",
      meta: "v1.4 · 요구사항 18개",
      owner: "김은정",
      updatedAt: "2026.11.02",
      description: "화면 흐름과 업무 정책을 정리한 기획 문서입니다.",
      related: "요구사항 18개",
    },
    {
      id: "DOC-011",
      title: "운영 정책 정리",
      status: "검토중",
      meta: "v1.1 · 요구사항 7개",
      owner: "김은정",
      updatedAt: "2026.10.29",
      description: "운영 담당자가 참고할 정책과 예외 기준입니다.",
      related: "요구사항 7개",
    },
  ],
  requirements: [
    {
      id: "REQ-042",
      title: "프로젝트 목록 상태 필터",
      status: "진행중",
      meta: "높음 · 웹",
      owner: "이도윤",
      updatedAt: "2026.11.02",
      description: "프로젝트 상태를 기준으로 목록을 빠르게 좁힐 수 있어야 합니다.",
      related: "서비스 기획서 v1.4",
    },
    {
      id: "REQ-041",
      title: "요구사항 변경 이력 표시",
      status: "검토중",
      meta: "보통 · 웹",
      owner: "박서연",
      updatedAt: "2026.10.31",
      description: "요구사항 상세에서 수정 시점과 변경 내용을 확인합니다.",
      related: "서비스 기획서 v1.4",
    },
    {
      id: "REQ-040",
      title: "프로젝트 참여자 권한",
      status: "신규",
      meta: "높음 · 공통",
      owner: "김은정",
      updatedAt: "2026.10.28",
      description: "참여자별 조회 및 수정 권한을 관리합니다.",
      related: "운영 정책 정리 v1.1",
    },
  ],
  defects: [
    {
      id: "DEF-018",
      title: "상태 변경 후 목록 갱신 지연",
      status: "진행중",
      meta: "높음 · STAGING",
      owner: "이도윤",
      updatedAt: "2026.11.01",
      description: "상태를 변경한 뒤 목록이 즉시 갱신되지 않는 현상입니다.",
      related: "REQ-042",
    },
    {
      id: "DEF-017",
      title: "모바일에서 Drawer 버튼 겹침",
      status: "대기",
      meta: "보통 · WEB",
      owner: "박서연",
      updatedAt: "2026.10.30",
      description: "작은 화면에서 하단 버튼 영역이 겹치는 현상입니다.",
      related: "DOC-012",
    },
  ],
  members: [
    {
      id: "MEM-01",
      title: "김은정",
      status: "진행중",
      meta: "기획 책임자",
      owner: "김은정",
      updatedAt: "2026.10.15",
      description: "프로젝트 기획과 요구사항 검토를 담당합니다.",
      related: "참여 문서 2개",
    },
    {
      id: "MEM-02",
      title: "이도윤",
      status: "진행중",
      meta: "개발 담당자",
      owner: "이도윤",
      updatedAt: "2026.10.15",
      description: "요구사항 구현과 결함 조치를 담당합니다.",
      related: "담당 결함 1개",
    },
  ],
};

export function getWorkspaceItems(kind: WorkspaceKind): WorkspaceItem[] {
  if (kind === "overview") return [];
  return workspaceItems[kind];
}

export const projectStatusLabel: Record<ProjectStatus, string> = { NEW: "신규", IN_PROGRESS: "진행중", DONE: "종료" };
export interface StatusHistoryEntry {
  historyId: string;
  beforeStatus: string | null;
  afterStatus: string;
  changeReason: string;
  changedBy: string;
  createdAt: string;
  environmentName?: string;
}

export function getMockStatusHistory(target: "requirement" | "issue", itemId: string): StatusHistoryEntry[] {
  const isIssue = target === "issue";
  return [
    {
      historyId: `${itemId}-3`,
      beforeStatus: isIssue ? "검토중" : "협의중",
      afterStatus: "진행중",
      changeReason: isIssue
        ? "재현 절차 확인 후 조치 작업을 시작했습니다."
        : "정책 검토가 완료되어 개발 진행으로 변경했습니다.",
      changedBy: "김은정",
      createdAt: "2026.11.02 14:20",
      environmentName: isIssue ? "사용자 스테이징" : undefined,
    },
    {
      historyId: `${itemId}-2`,
      beforeStatus: "신규",
      afterStatus: isIssue ? "검토중" : "협의중",
      changeReason: "담당자 확인 및 내용 검토를 시작했습니다.",
      changedBy: "이도윤",
      createdAt: "2026.11.01 10:05",
      environmentName: isIssue ? "사용자 개발" : undefined,
    },
    {
      historyId: `${itemId}-1`,
      beforeStatus: null,
      afterStatus: "신규",
      changeReason: "항목을 등록했습니다.",
      changedBy: "김은정",
      createdAt: "2026.10.29 16:40",
      environmentName: isIssue ? "사용자 개발" : undefined,
    },
  ];
}
