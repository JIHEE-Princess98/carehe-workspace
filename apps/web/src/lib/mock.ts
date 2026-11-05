export const summary = [
  { label: "진행 중 프로젝트", value: 8, delta: "+2", icon: "folder" },
  { label: "전체 요구사항", value: 124, delta: "+12", icon: "list" },
  { label: "미처리 결함", value: 23, delta: "+5", icon: "bug" },
  { label: "처리 완료", value: 86, delta: "+18", icon: "check" },
] as const;
export const issues = [
  {
    id: "ISS-284",
    title: "로그인 세션 만료 처리 개선",
    project: "관리자 서비스",
    priority: "높음",
    status: "진행중",
    date: "11.02",
  },
  {
    id: "ISS-283",
    title: "검색 필터 조건 저장 기능 추가",
    project: "운영 관리",
    priority: "보통",
    status: "검토중",
    date: "11.01",
  },
  {
    id: "ISS-282",
    title: "대시보드 차트 데이터 불일치 수정",
    project: "분석 플랫폼",
    priority: "높음",
    status: "재검수",
    date: "10.31",
  },
  {
    id: "ISS-281",
    title: "사용자 권한 설정 UX 개선",
    project: "공통 모듈",
    priority: "낮음",
    status: "처리완료",
    date: "10.30",
  },
];
export const todo = ["요구사항 문서 검토 (R-102)", "결함 재현 테스트 진행", "프로젝트 주간 회의 자료 준비"];
