# Carehe Issue Workspace

Next.js + Tailwind CSS 프론트엔드, NestJS 최소 API, Nx + pnpm 모노레포.

## 준비
- Node.js 20.11 이상 (권장 Node.js 22)
- pnpm 9 (`corepack enable` 후 `corepack prepare pnpm@9.15.9 --activate`)

## 실행
```bash
pnpm install
pnpm dev
```
- 웹: http://localhost:8000/login
- API 상태 확인: http://localhost:8080/health
- 각각 실행: `pnpm dev:web`, `pnpm dev:api`
- 타입 검사: `pnpm typecheck`

## 현재 구현 범위
- 로그인 UI: 데모 모드. **실제 비밀번호 검증/권한 검증 없음.** 임의의 아이디/비밀번호를 입력하면 대시보드 이동. 브라우저 sessionStorage에 데모 사용자 ID만 저장. 실제 운영 배포 금지.
- 대시보드: 통계/차트/이슈/할 일은 모두 예시 데이터. 최근 이슈 검색과 할 일 체크 동작.
- NestJS: `/health` 엔드포인트만 제공. DB 연결하지 않음.
- 좌측 메뉴의 다른 기능은 추후 구현 예정.
- Carehe 로고는 사용자가 제공한 Firebase Storage SVG URL을 사용합니다. 네트워크 접근 또는 해당 URL 만료 시 표시되지 않을 수 있으므로, 운영 전 소유권/사용 권한 확인 후 로컬 정적 자산으로 관리하세요.

## 다음 개발
1. TypeORM + MySQL 연결, 첨부 DDL 기반 Entity/마이그레이션
2. `tb_users`, `tb_roles`, `tb_user_roles`, `tb_token` 기반 인증 및 인가 API
3. 서버측 세션 또는 HttpOnly 쿠키 기반 인증, 비밀번호 해시 검증, 로그인 실패 제한
4. `tb_project_members` ACCEPTED 권한 기반 프로젝트/이슈 조회
5. API 연결 후 데모 로그인 완전 제거

> 이 패키지는 **초기 프론트 UI 스캐폴드**이며, 사용자 DB에 쿼리나 DDL을 실행하지 않습니다.
