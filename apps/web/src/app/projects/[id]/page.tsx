"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, ExternalLink, History, Search, X } from "lucide-react";
import type { ProjectStatus } from "@carehe/shared-types";
import {
  getMockStatusHistory,
  getMockProject,
  getWorkspaceItems,
  projectStatusLabel,
  type WorkspaceItem,
  type WorkspaceItemStatus,
  type WorkspaceKind,
} from "../../../lib/projects";
import { WorkspaceShell } from "../../../components/WorkspaceShell";
import { ExcelRequirementImport } from "../../../components/ExcelRequirementImport";

const tabs: { id: WorkspaceKind; label: string }[] = [
  { id: "overview", label: "개요" },
  { id: "documents", label: "기획 문서" },
  { id: "requirements", label: "요구사항" },
  { id: "defects", label: "결함대장" },
  { id: "members", label: "참여자" },
];

const statusStyle: Record<ProjectStatus | WorkspaceItemStatus, string> = {
  NEW: "bg-[#EEE5FF] text-[#6533B1]",
  IN_PROGRESS: "bg-[#E9F0FF] text-[#3B5D98]",
  DONE: "bg-[#E7F5EC] text-[#287D61]",
  신규: "bg-[#EEE5FF] text-[#6533B1]",
  검토중: "bg-[#FFF1DB] text-[#875714]",
  진행중: "bg-[#E9F0FF] text-[#3B5D98]",
  대기: "bg-[#F3F0F7] text-[#655B76]",
  처리완료: "bg-[#E7F5EC] text-[#287D61]",
  종료: "bg-[#E7F5EC] text-[#287D61]",
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const project = getMockProject(projectId);
  const [tab, setTab] = useState<WorkspaceKind>("overview");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<WorkspaceItem | null>(null);
  const [excelOpen, setExcelOpen] = useState(false);

  useEffect(() => {
    setSelected(null);
    setQuery("");
    setStatus("ALL");
  }, [projectId, tab]);

  useEffect(() => {
    if (!selected) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  const items = useMemo(
    () =>
      getWorkspaceItems(tab).filter(
        (item) => item.title.includes(query.trim()) && (status === "ALL" || item.status === status),
      ),
    [query, status, tab],
  );

  if (!project) {
    return (
      <WorkspaceShell pageTitle="프로젝트">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-8">
          <h1 className="text-xl font-bold">프로젝트를 찾을 수 없습니다.</h1>
          <Link href="/projects" className="mt-4 text-sm font-semibold text-violet hover:underline">
            프로젝트 목록으로 돌아가기
          </Link>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell pageTitle="프로젝트">
      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
        <section className="border-b border-line bg-white px-5 py-5 md:px-7">
          <Link
            href="/projects"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-violet"
          >
            <ArrowLeft size={16} /> 프로젝트 목록
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[24px] font-bold tracking-tight">{project.projectTitle}</h1>
                <span className={`tag ${statusStyle[project.projectStatus]}`}>
                  {projectStatusLabel[project.projectStatus]}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#655B76]">{project.description || "프로젝트 설명이 없습니다."}</p>
            </div>
            <button
              type="button"
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-[#625775] hover:bg-lavender"
            >
              프로젝트 정보 수정
            </button>
          </div>
        </section>

        <nav aria-label="프로젝트 상세 탭" className="sticky top-0 z-10 border-b border-line bg-white px-5 md:px-7">
          <div className="flex gap-5 overflow-x-auto">
            {tabs.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`shrink-0 border-b-2 px-1 py-4 text-sm font-bold transition-colors ${active ? "border-violet text-violet" : "border-transparent text-muted hover:text-[#625775]"}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <main className="min-w-0 p-5 md:p-7">
          {tab === "overview" ? (
            <Overview project={project} onRequirements={() => setTab("requirements")} />
          ) : (
            <WorkspaceList
              tab={tab}
              items={items}
              query={query}
              status={status}
              onQuery={setQuery}
              onStatus={setStatus}
              onExcelImport={() => setExcelOpen(true)}
              onDocumentCreate={() => router.push("/planning?serviceType=ADMIN&create=document")}
              onSelect={(item) => {
                if (tab !== "members") setSelected(item);
              }}
            />
          )}
        </main>
      </div>
      {selected && tab !== "overview" && <ItemDrawer kind={tab} item={selected} onClose={() => setSelected(null)} />}
      {excelOpen && <ExcelRequirementImport onClose={() => setExcelOpen(false)} />}
    </WorkspaceShell>
  );
}

function Overview({
  project,
  onRequirements,
}: {
  project: NonNullable<ReturnType<typeof getMockProject>>;
  onRequirements: () => void;
}) {
  return (
    <div className="max-w-6xl space-y-7">
      <section>
        <h2 className="text-lg font-bold">프로젝트 개요</h2>
        <p className="mt-1 text-sm text-muted">업무 현황과 최근 변경 내용을 확인하세요.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="surface rounded-xl p-5">
          <p className="text-sm text-muted">요구사항</p>
          <p className="mt-2 text-3xl font-bold text-violet">{project.requirementCount}</p>
          <button type="button" onClick={onRequirements} className="mt-4 text-sm font-bold text-violet hover:underline">
            요구사항 보기 <ChevronRight size={15} className="inline" />
          </button>
        </article>
        <article className="surface rounded-xl p-5">
          <p className="text-sm text-muted">미처리 결함</p>
          <p className="mt-2 text-3xl font-bold text-violet">{project.openDefectCount}</p>
          <p className="mt-4 text-sm text-muted">결함대장에서 상태를 관리합니다.</p>
        </article>
        <article className="surface rounded-xl p-5">
          <p className="text-sm text-muted">최근 수정일</p>
          <p className="mt-2 text-xl font-bold">{project.updatedAt}</p>
          <p className="mt-4 text-sm text-muted">현재 데이터는 데모 목업입니다.</p>
        </article>
      </section>
      <section className="border-t border-line pt-6">
        <h2 className="text-lg font-bold">최근 변경 사항</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          <ChangeLine title="REQ-042 프로젝트 목록 상태 필터가 진행중으로 변경되었습니다." date="2026.11.02" />
          <ChangeLine title="DOC-012 서비스 기획서 v1.4가 수정되었습니다." date="2026.11.01" />
          <ChangeLine title="DEF-018 결함이 등록되었습니다." date="2026.10.31" />
        </div>
      </section>
    </div>
  );
}

function ChangeLine({ title, date }: { title: string; date: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
      <span>{title}</span>
      <span className="text-xs text-muted">{date}</span>
    </div>
  );
}

function WorkspaceList({
  tab,
  items,
  query,
  status,
  onQuery,
  onStatus,
  onSelect,
  onExcelImport,
  onDocumentCreate,
}: {
  tab: Exclude<WorkspaceKind, "overview">;
  items: WorkspaceItem[];
  query: string;
  status: string;
  onQuery: (value: string) => void;
  onStatus: (value: string) => void;
  onSelect: (item: WorkspaceItem) => void;
  onExcelImport: () => void;
  onDocumentCreate: () => void;
}) {
  const labels: Record<Exclude<WorkspaceKind, "overview">, string> = {
    documents: "기획 문서",
    requirements: "요구사항",
    defects: "결함대장",
    members: "참여자",
  };
  const columns: Record<Exclude<WorkspaceKind, "overview">, string[]> = {
    documents: ["문서명", "상태", "버전 · 요구사항", "최종 수정일"],
    requirements: ["번호", "요구사항", "상태", "우선순위 · 영역", "담당자", "최종 수정일"],
    defects: ["번호", "결함 제목", "상태", "우선순위 · 환경", "담당자", "최종 수정일"],
    members: ["이름", "역할", "참여 상태", "최근 수정일"],
  };
  return (
    <section className="min-w-0">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{labels[tab]}</h2>
          <p className="mt-1 text-sm text-muted">항목을 선택하면 상세 내용을 열 수 있습니다.</p>
        </div>
        <button type="button" onClick={tab === "requirements" ? onExcelImport : tab === "documents" ? onDocumentCreate : undefined} className="primary px-4 py-2.5 text-sm">{tab === "requirements" ? "\uC5D1\uC140\uB85C \uB4F1\uB85D\uD558\uAE30" : "\uD56D\uBAA9 \uCD94\uAC00"}</button>
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-line bg-white px-3">
          <Search size={16} className="text-muted" />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={`${labels[tab]} 검색`}
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        {tab !== "members" && (
          <select
            value={status}
            onChange={(event) => onStatus(event.target.value)}
            className="h-10 rounded-lg border border-line bg-white px-3 text-sm"
          >
            <option value="ALL">전체 상태</option>
            <option value="신규">신규</option>
            <option value="검토중">검토중</option>
            <option value="진행중">진행중</option>
            <option value="대기">대기</option>
            <option value="처리완료">처리완료</option>
          </select>
        )}
      </div>
      <div className="overflow-x-auto border-y border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#F5F1FC] text-[#655A78]">
            <tr>
              {columns[tab].map((column) => (
                <th key={column} className="px-4 py-3.5 font-bold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={columns[tab].length} className="p-12 text-center text-muted">
                  조건에 맞는 항목이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item) => <WorkspaceTableRow key={item.id} tab={tab} item={item} onSelect={onSelect} />)
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function WorkspaceTableRow({
  tab,
  item,
  onSelect,
}: {
  tab: Exclude<WorkspaceKind, "overview">;
  item: WorkspaceItem;
  onSelect: (item: WorkspaceItem) => void;
}) {
  const rowClass = "cursor-pointer border-t border-line hover:bg-[#FBF9FF]";
  if (tab === "documents")
    return (
      <tr onClick={() => onSelect(item)} className={rowClass}>
        <td className="max-w-[360px] px-4 py-4">
          <p className="truncate font-semibold text-violet">{item.title}</p>
        </td>
        <td className="px-4 py-4">
          <span className={`tag ${statusStyle[item.status]}`}>{item.status}</span>
        </td>
        <td className="px-4 py-4 text-[#655B76]">{item.meta}</td>
        <td className="px-4 py-4 text-muted">{item.updatedAt}</td>
      </tr>
    );
  if (tab === "members")
    return (
      <tr onClick={() => onSelect(item)} className={rowClass}>
        <td className="px-4 py-4 font-semibold text-violet">{item.title}</td>
        <td className="px-4 py-4">{item.meta}</td>
        <td className="px-4 py-4">
          <span className={`tag ${statusStyle[item.status]}`}>{item.status}</span>
        </td>
        <td className="px-4 py-4 text-muted">{item.updatedAt}</td>
      </tr>
    );
  return (
    <tr onClick={() => onSelect(item)} className={rowClass}>
      <td className="px-4 py-4 font-semibold text-violet">{item.id}</td>
      <td className="max-w-[360px] px-4 py-4">
        <p className="truncate font-semibold">{item.title}</p>
      </td>
      <td className="px-4 py-4">
        <span className={`tag ${statusStyle[item.status]}`}>{item.status}</span>
      </td>
      <td className="px-4 py-4 text-[#655B76]">{item.meta}</td>
      <td className="px-4 py-4">{item.owner}</td>
      <td className="px-4 py-4 text-muted">{item.updatedAt}</td>
    </tr>
  );
}
function ItemDrawer({
  kind,
  item,
  onClose,
}: {
  kind: Exclude<WorkspaceKind, "overview">;
  item: WorkspaceItem;
  onClose: () => void;
}) {
  const target = kind === "requirements" ? "requirement" : kind === "defects" ? "issue" : null;
  const history = target ? getMockStatusHistory(target, item.id) : [];
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" aria-label="상세 정보 닫기" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${item.title} 상세 정보`}
        className="relative flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div className="min-w-0">
            <span className="text-xs font-bold text-violet">{item.id}</span>
            <h2 className="mt-1 truncate text-xl font-bold">{item.title}</h2>
            <span className={`mt-3 tag ${statusStyle[item.status]}`}>{item.status}</span>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-lavender" aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        <div className="scrollbar-hidden flex-1 overflow-y-auto p-6">
          <dl className="space-y-6 text-sm">
            <div>
              <dt className="font-bold text-muted">내용</dt>
              <dd className="mt-2 leading-7">{item.description}</dd>
            </div>
            <div>
              <dt className="font-bold text-muted">작성자 및 수정일</dt>
              <dd className="mt-2 font-medium">
                {item.owner} · {item.updatedAt}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-muted">관련 정보</dt>
              <dd className="mt-2 font-medium">{item.related}</dd>
            </div>
          </dl>
          {target && (
            <section className="mt-8 border-t border-line pt-6">
              <h3 className="flex items-center gap-2 font-bold">
                <History size={17} className="text-violet" /> 상태 변경 이력
              </h3>
              <ol className="mt-4 space-y-4 border-l border-[#DCCFF0] pl-4">
                {history.map((entry) => (
                  <li
                    key={entry.historyId}
                    className="relative text-sm before:absolute before:-left-[21px] before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-violet"
                  >
                    <p className="font-medium">
                      {entry.beforeStatus
                        ? `${entry.beforeStatus} → ${entry.afterStatus}`
                        : `${entry.afterStatus}으로 등록`}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {entry.changedBy} · {entry.createdAt}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
        <div className="border-t border-line p-5">
          <button type="button" className="primary w-full px-3 py-2.5 text-sm">
            상세 보기 <ExternalLink size={15} className="ml-1 inline" />
          </button>
        </div>
      </aside>
    </div>
  );
}
