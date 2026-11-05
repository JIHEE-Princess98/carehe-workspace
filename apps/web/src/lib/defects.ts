import type { LocalAttachment } from "../components/FileAttachmentField";

export type IssueType = "BUG" | "IMPROVEMENT" | "DESIGN";
export type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type IssuePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type DefectComment = { id: string; parentId?: string; author: string; createdAt: string; content: string; attachments?: LocalAttachment[] };
export type DefectIssue = { id: string; registerId: string; projectId: string; projectTitle: string; title: string; type: IssueType; status: IssueStatus; priority: IssuePriority; author: string; createdAt: string; updatedAt: string; content: string; requirement?: string; requirementId?: string; environment?: string; attachments: LocalAttachment[]; comments: DefectComment[]; history: { at: string; by: string; status: IssueStatus }[] };

export const issueTypeLabel: Record<IssueType, string> = { BUG: "오류", IMPROVEMENT: "개선", DESIGN: "디자인" };
export const issueStatusLabel: Record<IssueStatus, string> = { OPEN: "접수", IN_PROGRESS: "조치 중", RESOLVED: "처리완료", CLOSED: "종료" };
export const issuePriorityLabel: Record<IssuePriority, string> = { LOW: "낮음", NORMAL: "보통", HIGH: "높음", URGENT: "긴급" };
export const defectRegisters = [
  { id: "REG-1001", projectId: "PRJ-1001", title: "케어해 Admin DEV 결함관리대장" },
  { id: "REG-1002", projectId: "PRJ-1001", title: "케어해 USER 통합검수 결함관리대장" },
];

const history = (status: IssueStatus, at: string) => [{ at, by: "테스터 A", status }];
const issue = (input: Omit<DefectIssue, "projectId" | "projectTitle" | "registerId" | "comments" | "history"> & { comments?: DefectComment[] }): DefectIssue => ({ projectId: "PRJ-1001", projectTitle: "Carehe Workspace 고도화", registerId: "REG-1001", comments: [], history: history(input.status, input.createdAt), ...input });
export const mockDefectIssues: DefectIssue[] = [
  issue({ id: "O12", title: "전체 기업 통계 조회 방식 개선", type: "IMPROVEMENT", status: "RESOLVED", priority: "HIGH", author: "테스터 A", createdAt: "2026.01.14 09:40", updatedAt: "2026.03.07 15:20", environment: "ADMIN · DEV", requirementId: "REQ-ADM-005", requirement: "PNX-AD-03-01-01 케어해 관리자 대시보드", content: "<p><strong>전체 기업 통계 조회</strong>에서 기업을 먼저 선택하지 않아도 회차 기준으로 동일 회차를 사용하는 전체 기업 통계를 조회할 수 있어야 합니다.</p>", attachments: [] }),
  issue({ id: "O13", title: "미예약자 목록 및 알림톡 발송 기능", type: "IMPROVEMENT", status: "RESOLVED", priority: "HIGH", author: "테스터 B", createdAt: "2026.01.13 14:10", updatedAt: "2026.03.21 11:00", environment: "ADMIN · DEV", requirementId: "REQ-ADM-001", requirement: "PNX-AD-00-01-01 회원 데이터 통합 계정 구조 개선", content: "<p>회원 목록에서 미예약자 필터와 개별·일괄 알림톡 발송 기능이 필요합니다.</p>", attachments: [] }),
  issue({ id: "O14", title: "회차 복사 병원 검색 조건 초기화", type: "BUG", status: "IN_PROGRESS", priority: "URGENT", author: "테스터 A", createdAt: "2026.01.13 10:25", updatedAt: "2026.03.06 16:30", environment: "ADMIN · DEV", requirement: "회차 복사 기능", content: "<p>병원을 선택한 뒤 다른 병원으로 변경할 때 기존 선택값을 모두 초기화해야만 검색할 수 있는 문제가 발생합니다.</p>", attachments: [{ name: "회차복사_검색재현.png", size: 245760 }], comments: [{ id: "COMMENT-O14-1", author: "개발팀 A", createdAt: "2026.03.06 16:30", content: "<p>선택값 동기화 로직을 확인 중입니다.</p>" }] }),
  issue({ id: "O71", title: "추가검사 항목 미노출", type: "BUG", status: "RESOLVED", priority: "HIGH", author: "테스터 C", createdAt: "2025.12.15 13:50", updatedAt: "2026.03.07 11:10", environment: "ADMIN · DEV", requirement: "검진패키지 추가검사 설정", content: "<p>병원에서 추가검사를 등록한 뒤 검진패키지 설정에서 전체 항목을 선택해도 새 항목이 나타나지 않습니다.</p>", attachments: [{ name: "추가검사_항목미노출.png", size: 180224 }] }),
  issue({ id: "O73", title: "검진 패키지 기본항목 정렬 순서", type: "DESIGN", status: "RESOLVED", priority: "NORMAL", author: "테스터 C", createdAt: "2025.12.20 09:15", updatedAt: "2026.03.07 10:20", environment: "ADMIN · DEV", requirement: "검진패키지 상세", content: "<p>기본항목 검색 결과가 설정된 순서가 아닌 임의 순서로 표기되는 문제입니다.</p>", attachments: [] }),
  issue({ id: "O19", title: "회차 복사 후 검진패키지 상태", type: "BUG", status: "IN_PROGRESS", priority: "HIGH", author: "테스터 B", createdAt: "2026.01.28 11:30", updatedAt: "2026.03.05 13:40", environment: "ADMIN · DEV", requirement: "회차 복사 기능", content: "<p>회차 복사 또는 부분 복사 시 생성되는 검진패키지 상태가 정책에 맞게 등록대기로 초기화되어야 합니다.</p>", attachments: [] }),
  { ...issue({ id: "U01", title: "PASS 인증 실패 후 초기 화면 이동", type: "BUG", status: "CLOSED", priority: "HIGH", author: "테스터 D", createdAt: "2026.08.14 10:00", updatedAt: "2026.08.18 14:00", environment: "USER · DEV · iOS Safari", requirementId: "REQ-USR-001", requirement: "USR-LOGIN-001 로그인 대상자 선택 방식 개선", content: "<p>첫 로그인 시 PASS 인증 실패 후 로그아웃되거나 초기 화면으로 돌아가는 현상을 확인합니다.</p>", attachments: [] }), registerId: "REG-1002" },
  { ...issue({ id: "U02", title: "직무스트레스 평가 제출 후 화면 전환", type: "BUG", status: "CLOSED", priority: "HIGH", author: "테스터 D", createdAt: "2026.08.14 13:20", updatedAt: "2026.08.18 15:10", environment: "USER · DEV · iOS Safari", requirement: "직무스트레스 평가", content: "<p>설문 제출 완료 후 결과 화면으로 이동하지 않고 같은 설문을 다시 제출할 수 있습니다.</p>", attachments: [] }), registerId: "REG-1002" },
  { ...issue({ id: "U03", title: "내 정보 관리 수정 후 화면 유지", type: "IMPROVEMENT", status: "CLOSED", priority: "NORMAL", author: "테스터 E", createdAt: "2026.08.15 11:30", updatedAt: "2026.08.18 16:20", environment: "USER · DEV · Android", requirement: "마이페이지 내 정보 관리", content: "<p>정보 수정 후 홈으로 이동하지 않고 수정한 내용을 확인할 수 있도록 현재 화면에 머물러야 합니다.</p>", attachments: [] }), registerId: "REG-1002" },
  { ...issue({ id: "U04", title: "비밀번호 찾기 수단 개선", type: "IMPROVEMENT", status: "CLOSED", priority: "NORMAL", author: "테스터 E", createdAt: "2026.08.16 09:50", updatedAt: "2026.08.18 16:30", environment: "USER · STAGING · iOS Safari", requirement: "로그인 및 계정 찾기", content: "<p>이메일 정보가 없는 사용자도 본인 확인을 거쳐 비밀번호를 찾을 수 있는 수단이 필요합니다.</p>", attachments: [] }), registerId: "REG-1002" },
];