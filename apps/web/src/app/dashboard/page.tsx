"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Bug,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Users,
  Shield,
  ChevronDown,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import { Brand } from "../../components/Brand";
import { summary } from "../../lib/mock";
const nav = [
  { name: "대시보드", icon: LayoutDashboard, active: true },
  { name: "프로젝트", icon: FolderKanban },
  { name: "기획 및 요구사항", icon: ClipboardList },
  { name: "결함 관리", icon: Bug },
  { name: "사용자 관리", icon: Users },
  { name: "권한 관리", icon: Shield },
  { name: "설정", icon: Settings },
];
const icons = [FolderKanban, ClipboardList, AlertCircle, CheckCircle2];
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [menu, setMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => {
    const u = sessionStorage.getItem("issue-demo-user");
    if (!u) {
      router.replace("/login");
    } else setUser(u);
    setDarkMode(localStorage.getItem("issue-theme") === "dark");
  }, [router]);
  function toggleDarkMode() {
    setDarkMode((current) => {
      const next = !current;
      localStorage.setItem("issue-theme", next ? "dark" : "light");
      return next;
    });
  }
  function logout() {
    sessionStorage.removeItem("issue-demo-user");
    router.replace("/login");
  }
  if (!user)
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        화면을 준비하고 있습니다...
      </div>
    );
  return (
    <div
      className={`dashboard-theme dashboard-enter h-dvh overflow-hidden bg-canvas ${darkMode ? "dashboard-dark" : ""}`}
    >
      <div className="flex h-full min-h-0 w-full overflow-hidden bg-white">
        <aside
          className={`${menu ? "fixed inset-y-0 left-0 z-40 flex" : "hidden"} h-full min-h-0 w-[258px] shrink-0 flex-col border-r border-line bg-[#FBFAFF] px-4 py-5 lg:flex`}
        >
          <div className="relative mb-7 flex shrink-0 items-center justify-center px-3">
            <Brand compact showWorkspaceLabel={false} />
            <button
              className="absolute right-3 lg:hidden"
              aria-label="메뉴 닫기"
              onClick={() => setMenu(false)}
            >
              <X />
            </button>
          </div>
          <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mb-3 px-4 text-[11px] font-bold tracking-[.16em] text-[#978BAA]">
              WORKSPACE
            </div>
            <nav aria-label="주 메뉴" className="space-y-1">
              {nav.slice(0, 5).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    title={!item.active ? "추후 구현 예정" : undefined}
                    onClick={() => item.active && setMenu(false)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-semibold ${item.active ? "bg-violet text-white shadow-[0_8px_20px_rgba(120,67,200,.20)]" : "text-[#625775] hover:bg-lavender/60"}`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </button>
                );
              })}
            </nav>
            <div className="mb-3 mt-9 px-4 text-[11px] font-bold tracking-[.16em] text-[#978BAA]">
              ADMINISTRATION
            </div>
            <nav className="space-y-1" aria-label="관리 메뉴">
              {nav.slice(5).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    title="추후 구현 예정"
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#625775] hover:bg-lavender/60"
                  >
                    <Icon size={18} />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
        {menu && (
          <button
            className="fixed inset-0 z-30 bg-black/25 lg:hidden"
            aria-label="메뉴 닫기"
            onClick={() => setMenu(false)}
          />
        )}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#FCFBFF]">
          <header className="flex h-[64px] shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-5 md:px-8">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden"
                aria-label="메뉴 열기"
                onClick={() => setMenu(true)}
              >
                <Menu />
              </button>
              <span className="hidden text-sm text-muted sm:inline">
                Workspace
              </span>
              <ChevronRight size={15} className="hidden text-muted sm:inline" />
              <span className="text-sm font-bold">대시보드</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-xs text-muted md:block">
                FRONTEND DEMO
              </span>
              <Bell size={19} className="text-[#5D5076]" />
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-label="프로필 메뉴"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full p-1 text-left hover:bg-lavender"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender text-sm font-bold text-violet">
                    {user.slice(0, 1).toUpperCase()}
                  </span>
                  <ChevronDown
                    size={16}
                    className="hidden text-muted sm:block"
                  />
                </button>
                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-line bg-white p-1.5 shadow-soft"
                  >
                    <div className="border-b border-line px-3 py-2.5">
                      <div className="truncate text-sm font-bold">{user}</div>
                      <div className="text-xs text-muted">데모 사용자</div>
                    </div>
                    <button
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-lavender"
                    >
                      <UserRound size={16} /> 개인정보 관리
                    </button>
                    <button
                      role="menuitem"
                      onClick={toggleDarkMode}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-lavender"
                    >
                      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                      {darkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                    <button
                      role="menuitem"
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#A12E41] hover:bg-[#FCE8E8]"
                    >
                      <LogOut size={16} /> 로그아웃
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-7">
            <section className="mb-6">
              <p className="mb-1 text-xs font-semibold tracking-wide text-violet">
                WORKSPACE / OVERVIEW
              </p>
              <h1 className="text-[26px] font-bold tracking-tight md:text-[30px]">
                대시보드
              </h1>
              <p className="mt-1 text-sm text-[#655B76]">
                프로젝트와 이슈 현황을 확인하세요.
              </p>
            </section>
            <section
              aria-label="주요 현황"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {summary.map((s, i) => {
                const Icon = icons[i];
                return (
                  <article key={s.label} className="surface rounded-xl p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#665A79]">
                        {s.label}
                      </span>
                      <div className="text-violet">
                        <Icon size={19} />
                      </div>
                    </div>
                    <div className="text-[34px] font-extrabold tracking-tight">
                      {s.value}
                      <span className="ml-1 text-sm font-medium text-muted">
                        건
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      <span className="font-bold text-[#287D61]">
                        {s.delta}
                      </span>{" "}
                      지난 기간 대비 · 예시
                    </p>
                  </article>
                );
              })}
            </section>
          </div>{" "}
        </main>
      </div>
    </div>
  );
}
