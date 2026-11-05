"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bug,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Brand } from "./Brand";

type WorkspaceShellProps = { pageTitle: string; children: ReactNode };

type NavItem = { label: string; href?: string; icon: typeof LayoutDashboard };

const workspaceNav: NavItem[] = [
  { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { label: "프로젝트", href: "/projects", icon: FolderKanban },
  { label: "기획 및 요구사항", href: "/planning", icon: ClipboardList },
  { label: "결함 관리", icon: Bug },
];
const adminNav: NavItem[] = [
  { label: "사용자 및 권한", icon: Users },
  { label: "설정", icon: Settings },
];

export function WorkspaceShell({ pageTitle, children }: WorkspaceShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("issue-demo-user");
    if (!savedUser) router.replace("/login");
    else setUser(savedUser);
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

  function isActive(item: NavItem) {
    return item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-muted">화면을 준비하고 있습니다...</div>;
  }

  const navButton = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item);
    return (
      <button
        key={item.label}
        type="button"
        title={item.href ? undefined : "준비 중인 메뉴입니다"}
        onClick={() => {
          if (item.href) router.push(item.href);
          setMenuOpen(false);
        }}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-semibold transition-colors ${active ? "bg-violet text-white shadow-[0_8px_20px_rgba(120,67,200,.20)]" : "text-[#625775] hover:bg-lavender/60"}`}
      >
        <Icon size={18} />
        {item.label}
      </button>
    );
  };

  return (
    <div
      className={`dashboard-theme dashboard-enter h-dvh overflow-hidden bg-canvas ${darkMode ? "dashboard-dark" : ""}`}
    >
      <div className="flex h-full min-h-0 w-full overflow-hidden bg-white">
        <aside
          className={`${menuOpen ? "fixed inset-y-0 left-0 z-40 flex" : "hidden"} h-full min-h-0 w-[258px] shrink-0 flex-col border-r border-line bg-[#FBFAFF] px-4 py-5 lg:flex`}
        >
          <div className="relative mb-7 flex shrink-0 items-center justify-center px-3">
            <Brand compact showWorkspaceLabel={false} />
            <button
              type="button"
              className="absolute right-3 lg:hidden"
              aria-label="메뉴 닫기"
              onClick={() => setMenuOpen(false)}
            >
              <X />
            </button>
          </div>
          <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mb-3 px-4 text-[11px] font-bold tracking-[.16em] text-[#978BAA]">WORKSPACE</div>
            <nav aria-label="주 메뉴" className="space-y-1">
              {workspaceNav.map(navButton)}
            </nav>
            <div className="mb-3 mt-9 px-4 text-[11px] font-bold tracking-[.16em] text-[#978BAA]">ADMINISTRATION</div>
            <nav aria-label="관리 메뉴" className="space-y-1">
              {adminNav.map(navButton)}
            </nav>
          </div>
        </aside>
        {menuOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/25 lg:hidden"
            aria-label="메뉴 닫기"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#FCFBFF]">
          <header className="flex h-[64px] shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-5 md:px-8">
            <div className="flex items-center gap-3">
              <button type="button" className="lg:hidden" aria-label="메뉴 열기" onClick={() => setMenuOpen(true)}>
                <Menu />
              </button>
              <span className="hidden text-sm text-muted sm:inline">Workspace</span>
              <ChevronRight size={15} className="hidden text-muted sm:inline" />
              <span className="text-sm font-bold">{pageTitle}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-xs text-muted md:block">FRONTEND DEMO</span>
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
                  <ChevronDown size={16} className="hidden text-muted sm:block" />
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
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-lavender"
                    >
                      <UserRound size={16} /> 개인정보 관리
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={toggleDarkMode}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-lavender"
                    >
                      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                      {darkMode ? "라이트 모드" : "다크 모드"}
                    </button>
                    <button
                      type="button"
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
          {children}
        </main>
      </div>
    </div>
  );
}
