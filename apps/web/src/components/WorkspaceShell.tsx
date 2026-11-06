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
  KeyRound,
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
  { label: "\uACB0\uD568 \uAD00\uB9AC", href: "/defects", icon: Bug },
];
const notifications = [
  { id: "assignment", title: "\uC0C8 \uC694\uAD6C\uC0AC\uD56D\uC774 \uBC30\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.", detail: "REQ-104 · \uAC80\uC0C9 \uC870\uAC74 UI \uAC1C\uC120", time: "10\uBD84 \uC804" },
  { id: "change", title: "\uB2F4\uB2F9 \uBB38\uC11C\uC5D0 \uBCC0\uACBD\uC774 \uC788\uC2B5\uB2C8\uB2E4.", detail: "\uD68C\uC6D0 \uD1B5\uD569 \uAE30\uD68D\uC11C · v3", time: "2\uC2DC\uAC04 \uC804" },
];

const adminNav: NavItem[] = [
  { label: "공통코드 관리", icon: Settings },
  { label: "권한 관리", icon: KeyRound },
  { label: "사용자 관리", icon: Users },
  { label: "메뉴 관리", icon: ClipboardList },
];

export function WorkspaceShell({ pageTitle, children }: WorkspaceShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [read, setRead] = useState(false);

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
            <div className="mb-3 mt-9 px-4 text-[11px] font-bold tracking-[.16em] text-[#978BAA]">ADMIN STATION</div>
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
              <div className="relative">
                <button type="button" onClick={() => { setNotificationsOpen((open) => !open); setRead(true); }} aria-label={"알림"} aria-expanded={notificationsOpen} className="relative rounded-lg p-2 text-[#5D5076] hover:bg-lavender">
                  <Bell size={19} />{!read && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#D9435F] ring-2 ring-white" />}
                </button>
                {notificationsOpen && <div role="status" className="absolute right-0 z-30 mt-2 w-[340px] overflow-hidden rounded-xl border border-line bg-white shadow-soft">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3"><div><p className="text-sm font-bold text-[#211A35]">{"알림"}</p><p className="mt-0.5 text-xs text-muted">{"담당 업무와 문서 변경 알림"}</p></div><span className="text-xs font-semibold text-violet">{"데모"}</span></div>
                  <div className="divide-y divide-line">{notifications.map((item) => <button key={item.id} type="button" onClick={() => { setNotificationsOpen(false); router.push("/planning"); }} className="w-full px-4 py-3 text-left hover:bg-[#FAF8FF]"><div className="flex gap-3"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#4D405F]">{item.title}</p><p className="mt-1 truncate text-xs text-muted">{item.detail}</p><p className="mt-1 text-xs text-[#978BAA]">{item.time}</p></div></div></button>)}</div>
                </div>}
              </div>
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
