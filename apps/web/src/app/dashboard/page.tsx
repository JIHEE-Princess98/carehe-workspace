"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderKanban,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { mockDefectIssues, issueStatusLabel } from "../../lib/defects";
import { getMockPlanningDocuments, getMockPlanningRequirements, requirementStatusLabel } from "../../lib/planning";
import { getMockProjects, projectStatusLabel } from "../../lib/projects";

const weeklyFlow = [38, 52, 46, 67, 61, 76, 72];
const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

export default function Dashboard() {
  const router = useRouter();
  const projects = getMockProjects();
  const documents = getMockPlanningDocuments();
  const requirements = getMockPlanningRequirements();
  const openIssues = mockDefectIssues.filter((issue) => !["RESOLVED", "CLOSED"].includes(issue.status));
  const activeProjects = projects.filter((project) => project.projectStatus === "IN_PROGRESS");
  const reviewRequirements = requirements.filter((requirement) => ["DISCUSSING", "CONFIRMED"].includes(requirement.requirementStatus));
  const maxFlow = Math.max(...weeklyFlow);

  const kpis = [
    { label: "진행 프로젝트", value: activeProjects.length, detail: `전체 ${projects.length}개 프로젝트`, icon: FolderKanban, tone: "violet" },
    { label: "검토 필요 요구사항", value: reviewRequirements.length, detail: "담당자 확인 필요", icon: ClipboardList, tone: "amber" },
    { label: "미처리 결함", value: openIssues.length, detail: "우선순위 기준 정렬", icon: AlertTriangle, tone: "rose" },
    { label: "기획문서", value: documents.length, detail: "서비스별 최신 문서", icon: FileText, tone: "blue" },
  ] as const;

  return (
    <WorkspaceShell pageTitle="대시보드">
      <main className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-5 md:p-7">
        <div className="mx-auto max-w-[1500px]">
          <section className="relative overflow-hidden rounded-3xl bg-[#211A35] px-6 py-7 text-white shadow-xl md:px-8 md:py-8">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-violet/30 blur-2xl" />
            <div className="absolute bottom-0 right-40 h-28 w-28 rounded-full bg-[#E59BBD]/20 blur-xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div><p className="text-xs font-bold tracking-[.18em] text-[#DCCBFF]">WORKSPACE COMMAND CENTER</p><h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">오늘의 업무 흐름을<br className="md:hidden" /> 빠르게 확인하세요.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#D7CEE5]">프로젝트 진행 상황과 검토가 필요한 요구사항, 미처리 결함을 한 곳에서 살펴볼 수 있습니다.</p></div>
              <div className="flex flex-wrap gap-2"><button type="button" onClick={() => router.push("/planning?serviceType=ADMIN&create=document")} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#36264F] hover:bg-[#F1EBFC]"><Plus size={16} />기획문서 등록</button><button type="button" onClick={() => router.push("/defects?serviceType=ADMIN")} className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">결함 현황 보기<ArrowUpRight size={16} /></button></div>
            </div>
          </section>

          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => <KpiCard key={item.label} {...item} />)}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]">
            <article className="rounded-2xl border border-[#E8E0F1] bg-white p-5 shadow-sm md:p-6">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold tracking-[.14em] text-violet">WEEKLY FLOW</p><h2 className="mt-1 text-xl font-bold text-[#211A35]">이번 주 업무 처리량</h2><p className="mt-1 text-sm text-muted">문서·요구사항·결함 처리 활동을 합산한 흐름입니다.</p></div><span className="inline-flex items-center gap-1 rounded-full bg-[#EAF8F0] px-2.5 py-1 text-xs font-bold text-[#287D61]"><TrendingUp size={13} />지난주 대비 +12%</span></div>
              <div className="mt-8 flex h-48 items-end gap-2 sm:gap-4">{weeklyFlow.map((value, index) => <div key={weekdays[index]} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-[#625775]">{value}</span><div className={`w-full max-w-12 rounded-t-xl transition-all ${index === weeklyFlow.length - 1 ? "bg-[#D94B62]" : "bg-gradient-to-t from-[#6D46B2] to-[#B99AE8]"}`} style={{ height: `${(value / maxFlow) * 100}%` }} /><span className="text-xs font-medium text-muted">{weekdays[index]}</span></div>)}</div>
            </article>

            <article className="rounded-2xl border border-[#F0D7DC] bg-[#FFF9FA] p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.14em] text-[#C83E55]">ATTENTION</p><h2 className="mt-1 text-xl font-bold text-[#211A35]">오늘 확인할 항목</h2></div><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFE7EB] text-[#C83E55]"><Target size={19} /></span></div><div className="mt-5 space-y-2">{[...openIssues.slice(0, 2).map((issue) => ({ title: issue.title, meta: `결함 · ${issueStatusLabel[issue.status]}`, href: "/defects?serviceType=ADMIN" })), ...reviewRequirements.slice(0, 2).map((requirement) => ({ title: requirement.requirementTitle, meta: `요구사항 · ${requirementStatusLabel[requirement.requirementStatus]}`, href: "/planning?serviceType=ADMIN" }))].map((item) => <button key={item.title} type="button" onClick={() => router.push(item.href)} className="flex w-full items-center gap-3 rounded-xl border border-[#F1DEE2] bg-white px-3 py-3 text-left hover:border-[#E2ABB6]"><span className="h-2 w-2 shrink-0 rounded-full bg-[#D94B62]" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#3F304A]">{item.title}</span><span className="mt-1 block text-xs text-[#978BAA]">{item.meta}</span></span><ChevronRight size={16} className="text-[#B78992]" /></button>)}</div></article>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
            <article className="rounded-2xl border border-[#E8E0F1] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#EEE8F5] px-5 py-4"><div><p className="text-xs font-bold tracking-[.14em] text-violet">PROJECT STATUS</p><h2 className="mt-1 text-lg font-bold text-[#211A35]">진행 중 프로젝트</h2></div><button type="button" onClick={() => router.push("/projects")} className="text-sm font-bold text-violet hover:underline">전체 보기</button></div><div className="divide-y divide-[#F0EBF6]">{activeProjects.map((project) => <button key={project.projectId} type="button" onClick={() => router.push(`/projects/${project.projectId}`)} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#FCFAFF]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEE5FF] text-sm font-black text-violet">{project.projectTitle.slice(0, 1)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-[#312640]">{project.projectTitle}</span><span className="mt-1 block text-xs text-muted">요구사항 {project.requirementCount} · 미처리 결함 {project.openDefectCount}</span></span><span className="hidden rounded-full bg-[#E9F0FF] px-2.5 py-1 text-xs font-bold text-[#3B5D98] sm:block">{projectStatusLabel[project.projectStatus]}</span><ChevronRight size={16} className="text-[#978BAA]" /></button>)}</div></article>
            <article className="rounded-2xl border border-[#E8E0F1] bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><BarChart3 size={18} className="text-violet" /><div><p className="text-xs font-bold tracking-[.14em] text-violet">WORKSPACE HEALTH</p><h2 className="mt-1 text-lg font-bold text-[#211A35]">업무 건강도</h2></div></div><div className="mt-6 space-y-5"><HealthRow label="요구사항 확정" value={72} color="bg-violet" /><HealthRow label="결함 조치" value={64} color="bg-[#D94B62]" /><HealthRow label="문서 최신화" value={86} color="bg-[#3B8E74]" /></div><div className="mt-6 rounded-xl bg-[#F7F3FC] p-3 text-sm leading-6 text-[#625775]"><CheckCircle2 size={16} className="mr-2 inline text-[#3B8E74]" />문서 최신화는 양호합니다. 미처리 결함과 검토 대기 요구사항을 우선 확인하세요.</div></article>
          </section>
        </div>
      </main>
    </WorkspaceShell>
  );
}

function KpiCard({ label, value, detail, icon: Icon, tone }: { label: string; value: number; detail: string; icon: typeof FolderKanban; tone: "violet" | "amber" | "rose" | "blue" }) {
  const tones = { violet: "bg-[#F2EDFC] text-violet", amber: "bg-[#FFF5E8] text-[#9A5C10]", rose: "bg-[#FFF0F2] text-[#C83E55]", blue: "bg-[#EAF3FF] text-[#2C67AE]" };
  return <article className="rounded-2xl border border-[#E8E0F1] bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><p className="text-sm font-bold text-[#625775]">{label}</p><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={18} /></span></div><p className="mt-5 text-3xl font-bold tracking-tight text-[#211A35]">{value}</p><p className="mt-2 text-xs text-muted">{detail}</p></article>;
}

function HealthRow({ label, value, color }: { label: string; value: number; color: string }) {
  return <div><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-[#4D405F]">{label}</span><span className="font-bold text-[#625775]">{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#EEE8F4]"><div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} /></div></div>;
}
