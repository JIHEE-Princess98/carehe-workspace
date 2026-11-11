"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronLeft, ChevronRight, FolderPlus, Plus, Search, X } from "lucide-react";
import type { ProjectStatus, ProjectSummary } from "@carehe/shared-types";
import { projectStatusLabel } from "../../lib/projects";
import { createProject, fetchProjects } from "../../lib/project-api";
import { WorkspaceShell } from "../../components/WorkspaceShell";

const PAGE_SIZE = 4;
const statusStyle: Record<ProjectStatus, string> = {
  NEW: "bg-[#EEE5FF] text-[#6533B1]",
  IN_PROGRESS: "bg-[#E9F0FF] text-[#3B5D98]",
  DONE: "bg-[#E7F5EC] text-[#287D61]",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | ProjectStatus>("ALL");
  const [page, setPage] = useState(1);
  const [sortDesc, setSortDesc] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProjects() {
    setLoading(true);
    try { setProjects(await fetchProjects()); }
    catch (error) { setNotice(error instanceof Error ? error.message : "프로젝트를 불러오지 못했습니다."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadProjects(); }, []);

  const filtered = useMemo(() => {
    const result = projects.filter((project) => {
      const matchesQuery = project.projectTitle.toLowerCase().includes(query.trim().toLowerCase());
      return matchesQuery && (status === "ALL" || project.projectStatus === status);
    });
    return result.sort((a, b) =>
      sortDesc ? b.updatedAt.localeCompare(a.updatedAt) : a.updatedAt.localeCompare(b.updatedAt),
    );
  }, [projects, query, sortDesc, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleProjects = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setQuery("");
    setStatus("ALL");
    setPage(1);
  }

  async function addProject(input: { projectTitle: string; description: string; projectStatus: ProjectStatus }) {
    await createProject(input);
    await loadProjects();
    setDrawerOpen(false);
    setNotice("데모 프로젝트를 목록에 추가했습니다. 실제 서버에는 저장되지 않습니다.");
    window.setTimeout(() => setNotice(""), 3500);
  }

  return (
    <WorkspaceShell pageTitle="프로젝트">
      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-5 md:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-violet">WORKSPACE</p>
            <h1 className="text-[26px] font-bold tracking-tight md:text-[30px]">프로젝트</h1>
            <p className="mt-1 text-sm text-[#655B76]">프로젝트를 선택해 기획 및 검수 업무를 관리하세요.</p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="primary inline-flex items-center gap-2 px-4"
          >
            <Plus size={18} /> 새 프로젝트
          </button>
        </div>

        {notice && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-[#D9C8F4] bg-[#F6F0FF] px-4 py-3 text-sm text-[#583D83]"
          >
            {notice}
          </div>
        )}

        <section aria-label="프로젝트 검색" className="mb-5 rounded-2xl border border-[#E8E0F1] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-line bg-white px-3">
              <Search size={17} className="text-muted" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="프로젝트명 검색"
                aria-label="프로젝트명 검색"
              />
            </label>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "ALL" | ProjectStatus);
                setPage(1);
              }}
              className="h-11 rounded-lg border border-line bg-white px-3 text-sm outline-none"
              aria-label="프로젝트 상태"
            >
              <option value="ALL">전체 상태</option>
              <option value="NEW">신규</option>
              <option value="IN_PROGRESS">진행중</option>
              <option value="DONE">종료</option>
            </select>
            <button
              type="button"
              onClick={resetFilters}
              className="h-11 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-[#625775] hover:bg-lavender"
            >
              검색 초기화
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#E8E0F1] bg-white shadow-sm" aria-label="프로젝트 목록">
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? <p className="col-span-full py-12 text-center text-muted">프로젝트를 불러오는 중입니다.</p> : visibleProjects.map((project) => <ProjectCard key={project.projectId} project={project} />)}
          </div>
          <div className="hidden overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-line bg-[#F5F1FC] text-[#655A78]">
                <tr>
                  <th className="px-5 py-4 font-bold">
                    <button
                      type="button"
                      onClick={() => setSortDesc((value) => !value)}
                      className="inline-flex items-center gap-1"
                    >
                      프로젝트명 <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="px-5 py-4 font-bold">간단 설명</th>
                  <th className="px-5 py-4 font-bold">상태</th>
                  <th className="px-5 py-4 text-center font-bold">요구사항</th>
                  <th className="px-5 py-4 text-center font-bold">미처리 결함</th>
                  <th className="px-5 py-4 font-bold">최근 수정일</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((project) => (
                  <tr key={project.projectId} className="border-b border-[#F0EBF7] last:border-0 hover:bg-[#FBF9FF]">
                    <td className="max-w-[220px] px-5 py-4 font-semibold">
                      <Link
                        href={`/projects/${project.projectId}`}
                        className="block truncate text-violet hover:underline"
                      >
                        {project.projectTitle}
                      </Link>
                    </td>
                    <td className="max-w-[300px] px-5 py-4 text-[#655B76]">
                      <span className="block truncate">{project.description || "설명이 없습니다."}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`tag ${statusStyle[project.projectStatus]}`}>
                        {projectStatusLabel[project.projectStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-semibold">{project.requirementCount}</td>
                    <td className="px-5 py-4 text-center font-semibold">{project.openDefectCount}</td>
                    <td className="px-5 py-4 text-muted">{project.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && projects.length === 0 ? (
            <EmptyState
              title="등록된 프로젝트가 없습니다."
              description="새 프로젝트를 만들어 업무를 시작해 보세요."
              onCreate={() => setDrawerOpen(true)}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="검색 결과가 없습니다."
              description="검색어 또는 상태 필터를 다시 확인해 주세요."
              onCreate={resetFilters}
              actionLabel="필터 초기화"
            />
          ) : null}
          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
              <span className="text-sm text-muted">
                총 <b className="text-ink">{filtered.length}</b>개
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((value) => value - 1)}
                  className="rounded-lg border border-line bg-white p-2 disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-lg border border-line bg-white p-2 disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
      {drawerOpen && <ProjectDrawer onClose={() => setDrawerOpen(false)} onSave={addProject} />}
    </WorkspaceShell>
  );
}

function ProjectCard({ project }: { project: ProjectSummary }) {
  const initial = project.projectTitle.slice(0, 1).toUpperCase();
  return <article className="group relative overflow-hidden rounded-2xl border border-[#EAE4F2] bg-gradient-to-b from-white to-[#FCFAFF] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#CDBAEF] hover:shadow-lg"><div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[80px] bg-[#F3EEFC] transition group-hover:bg-[#E9DFFD]" /><div className="relative flex items-start justify-between gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEE5FF] text-lg font-black text-violet">{initial}</span><span className={`tag ${statusStyle[project.projectStatus]}`}>{projectStatusLabel[project.projectStatus]}</span></div><div className="relative mt-5"><Link href={`/projects/${project.projectId}`} className="line-clamp-1 text-lg font-bold text-[#211A35] transition group-hover:text-violet">{project.projectTitle}</Link><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#746988]">{project.description || "프로젝트 설명이 없습니다."}</p></div><div className="relative mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#F6F2FC] px-3 py-2.5"><p className="text-[11px] font-bold text-[#85799A]">요구사항</p><p className="mt-1 text-lg font-bold text-[#45345D]">{project.requirementCount}</p></div><div className={`rounded-xl px-3 py-2.5 ${project.openDefectCount ? "bg-[#FFF1F3]" : "bg-[#EEF8F2]"}`}><p className={`text-[11px] font-bold ${project.openDefectCount ? "text-[#B14C60]" : "text-[#43826A]"}`}>미처리 결함</p><p className={`mt-1 text-lg font-bold ${project.openDefectCount ? "text-[#A12E41]" : "text-[#287D61]"}`}>{project.openDefectCount}</p></div></div><div className="relative mt-5 flex items-center justify-between border-t border-[#EEE8F5] pt-4"><span className="text-xs text-[#978BAA]">최근 수정 {project.updatedAt}</span><Link href={`/projects/${project.projectId}`} className="inline-flex items-center gap-1 text-xs font-bold text-violet hover:underline">상세 보기 <ChevronRight size={15} /></Link></div></article>;
}

function EmptyState({
  title,
  description,
  onCreate,
  actionLabel = "새 프로젝트",
}: {
  title: string;
  description: string;
  onCreate: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-lavender text-violet">
        <FolderPlus size={21} />
      </div>
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-violet hover:bg-lavender"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function ProjectDrawer({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (input: { projectTitle: string; description: string; projectStatus: ProjectStatus }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("NEW");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("프로젝트명을 입력해 주세요.");
      return;
    }
    setSaving(true);
    window.setTimeout(
      () => onSave({ projectTitle: title.trim(), description: description.trim(), projectStatus: status }),
      450,
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="프로젝트 생성 닫기"
        onClick={onClose}
      />
      <form onSubmit={submit} className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">새 프로젝트</h2>
            <p className="mt-1 text-sm text-muted">데모 목록에만 추가됩니다.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-lavender" aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-5 overflow-y-auto p-6">
          <div>
            <label htmlFor="project-title" className="mb-2 block text-sm font-bold">
              프로젝트명 <span className="text-[#A12E41]">*</span>
            </label>
            <input
              id="project-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError("");
              }}
              className="field"
              placeholder="프로젝트명을 입력해 주세요"
              autoFocus
            />
            {error && (
              <p role="alert" className="mt-2 text-sm text-[#A12E41]">
                {error}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="project-description" className="mb-2 block text-sm font-bold">
              프로젝트 설명 <span className="font-normal text-muted">(선택)</span>
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28 w-full resize-none rounded-xl border border-[#DAD3E9] bg-white p-3 text-sm outline-none focus:border-violet focus:ring-4 focus:ring-lavender"
              placeholder="프로젝트의 목적이나 범위를 간단히 적어 주세요."
            />
          </div>
          <div>
            <label htmlFor="project-status" className="mb-2 block text-sm font-bold">
              프로젝트 상태
            </label>
            <select
              id="project-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as ProjectStatus)}
              className="field"
            >
              <option value="NEW">신규</option>
              <option value="IN_PROGRESS">진행중</option>
              <option value="DONE">종료</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-line p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-bold hover:bg-lavender"
          >
            취소
          </button>
          <button disabled={saving} className="primary px-4">
            {saving ? "생성 중..." : "프로젝트 생성"}
          </button>
        </div>
      </form>
    </div>
  );
}
