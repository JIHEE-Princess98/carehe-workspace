"use client";

import { Suspense, useMemo, useState } from "react";
import { FileText, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DocumentStatus, RequirementProgressStatus, RequirementType } from "@carehe/shared-types";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { getMockProjects } from "../../lib/projects";
import {
  createMockDocument,
  createMockRequirement,
  documentStatusLabel,
  getMockPlanningDocuments,
  getMockPlanningRequirements,
  priorityLabel,
  requirementStatusLabel,
  requirementTypeLabel,
  type PlanningDocument,
  type PlanningRequirement,
} from "../../lib/planning";

const PAGE_SIZE = 5;
const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-violet-400";
const statusClass = "rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700";

type DocDraft = Pick<PlanningDocument, "projectId" | "documentTitle" | "documentContent" | "documentStatus">;
type ReqDraft = Pick<
  PlanningRequirement,
  "requirementTitle" | "requestType" | "priority" | "requirementStatus" | "assignee" | "requirementContent"
>;

export default function PlanningPage() {
  return (
    <Suspense fallback={null}>
      <PlanningContent />
    </Suspense>
  );
}

function PlanningContent() {
  const router = useRouter();
  const params = useSearchParams();
  const projects = getMockProjects();
  const [documents, setDocuments] = useState(() => getMockPlanningDocuments());
  const [requirements, setRequirements] = useState(() => getMockPlanningRequirements());
  const [projectId, setProjectId] = useState(params.get("projectId") ?? "ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [requirementSearch, setRequirementSearch] = useState("");
  const [requirementStatus, setRequirementStatus] = useState<RequirementProgressStatus | "ALL">("ALL");
  const [notice, setNotice] = useState("");
  const [docDrawer, setDocDrawer] = useState<PlanningDocument | "new" | null>(null);
  const [reqDrawer, setReqDrawer] = useState<PlanningRequirement | "new" | null>(null);

  const visibleDocuments = useMemo(
    () =>
      documents.filter(
        (doc) =>
          (projectId === "ALL" || doc.projectId === projectId) &&
          doc.documentTitle.toLowerCase().includes(search.toLowerCase()),
      ),
    [documents, projectId, search],
  );
  const selectedId = params.get("documentId");
  const selected = documents.find((doc) => doc.documentId === selectedId) ?? visibleDocuments[0] ?? null;
  const selectedRequirements = useMemo(
    () =>
      selected
        ? requirements
            .filter((item) => item.documentId === selected.documentId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : [],
    [requirements, selected],
  );
  const totalPages = Math.max(1, Math.ceil(selectedRequirements.length / PAGE_SIZE));
  const paged = selectedRequirements.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function selectDocument(id: string, nextProjectId = projectId) {
    const next = new URLSearchParams(params.toString());
    next.set("documentId", id);
    if (nextProjectId === "ALL") next.delete("projectId");
    else next.set("projectId", nextProjectId);
    router.replace("/planning?" + next.toString());
    setPage(1);
  }
  function changeProject(nextId: string) {
    setProjectId(nextId);
    const first = documents.find((doc) => nextId === "ALL" || doc.projectId === nextId);
    if (first) selectDocument(first.documentId, nextId);
  }
  function saveDocument(draft: DocDraft) {
    const project = projects.find((item) => item.projectId === draft.projectId);
    if (!project) return;
    if (docDrawer === "new") {
      const next = createMockDocument({
        ...draft,
        projectTitle: project.projectTitle,
      });
      setDocuments((items) => [next, ...items]);
      setDocDrawer(null);
      setNotice("기획문서를 목업 목록에 추가했습니다. 새로고침하면 초기화됩니다.");
      selectDocument(next.documentId, draft.projectId);
    } else if (docDrawer) {
      setDocuments((items) =>
        items.map((item) =>
          item.documentId === docDrawer.documentId
            ? {
                ...item,
                ...draft,
                projectTitle: project.projectTitle,
                updatedAt: "방금 전",
              }
            : item,
        ),
      );
      setDocDrawer(null);
      setNotice("기획문서를 목업 목록에서 수정했습니다. 새로고침하면 초기화됩니다.");
    }
  }
  function saveRequirement(draft: ReqDraft) {
    if (!selected) return;
    if (reqDrawer === "new") {
      const next = createMockRequirement({
        ...draft,
        documentId: selected.documentId,
      });
      setRequirements((items) => [next, ...items]);
      setReqDrawer(null);
      setNotice("요구사항을 목업 목록에 추가했습니다. 새로고침하면 초기화됩니다.");
    } else if (reqDrawer) {
      setRequirements((items) =>
        items.map((item) =>
          item.requirementId === reqDrawer.requirementId ? { ...item, ...draft, updatedAt: "방금 전" } : item,
        ),
      );
      setReqDrawer(null);
      setNotice("요구사항을 목업 목록에서 수정했습니다. 새로고침하면 초기화됩니다.");
    }
  }
  function deleteDocument() {
    if (!selected) return;
    if (selectedRequirements.length) {
      setNotice("연결된 요구사항이 있어 기획문서를 삭제할 수 없습니다.");
      return;
    }
    const rest = documents.filter((item) => item.documentId !== selected.documentId);
    setDocuments(rest);
    setNotice("목업 기획문서를 삭제했습니다. 새로고침하면 초기화됩니다.");
    const next = rest.find((item) => projectId === "ALL" || item.projectId === projectId);
    if (next) selectDocument(next.documentId);
    else router.replace("/planning");
  }

  return (
    <WorkspaceShell pageTitle="기획 및 요구사항">
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col p-4 md:p-6">
        <div className="mb-5">
          <p className="text-sm text-slate-400">프로젝트별 기획문서와 요구사항을 관리합니다</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">기획 및 요구사항</h1>
        </div>
        {notice && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}{" "}
        <section className="grid min-h-[660px] flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-slate-800">기획문서</h2>
                <button
                  onClick={() => setDocDrawer("new")}
                  className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-2 text-xs font-semibold text-white"
                >
                  <Plus size={14} />
                  등록
                </button>
              </div>
              <select value={projectId} onChange={(e) => changeProject(e.target.value)} className={input}>
                <option value="ALL">전체 프로젝트</option>
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.projectTitle}
                  </option>
                ))}
              </select>
              <label className="relative mt-2 block">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={input + " pl-9"}
                  placeholder="기획문서명 검색"
                />
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {visibleDocuments.length ? (
                visibleDocuments.map((doc) => {
                  const count = requirements.filter((r) => r.documentId === doc.documentId).length;
                  const active = selected?.documentId === doc.documentId;
                  return (
                    <button
                      key={doc.documentId}
                      onClick={() => selectDocument(doc.documentId)}
                      className={
                        "mb-1 w-full rounded-lg p-3 text-left " +
                        (active ? "bg-violet-50 ring-1 ring-violet-200" : "hover:bg-slate-50")
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2 text-sm font-semibold text-slate-800">{doc.documentTitle}</span>
                        <span className={statusClass}>{documentStatusLabel[doc.documentStatus]}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {doc.documentNo} · 요구사항 {count}건
                      </p>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-sm text-slate-400">검색 결과가 없습니다.</div>
              )}
            </div>
          </aside>
          <div className="min-w-0 p-4 md:p-6">
            {selected ? (
              <>
                <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-violet-600">{selected.projectTitle}</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">{selected.documentTitle}</h2>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                      <span>{selected.documentNo}</span>
                      <span>작성자 {selected.createdBy}</span>
                      <span className={statusClass}>{documentStatusLabel[selected.documentStatus]}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDocDrawer(selected)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
                    >
                      <Pencil size={15} />
                      수정
                    </button>
                    <button
                      onClick={deleteDocument}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-rose-500"
                    >
                      <Trash2 size={15} />
                      삭제
                    </button>
                  </div>
                </header>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">요구사항 목록</h3>
                    <p className="mt-1 text-sm text-slate-400">총 {selectedRequirements.length}건 · 최신 등록순</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReqDrawer("new")}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
                  >
                    <Plus size={16} />+ 요구사항 등록
                  </button>
                </div>
                <div className="mt-4 flex flex-col gap-2 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center">
                  <label className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input
                      value={requirementSearch}
                      onChange={(event) => {
                        setRequirementSearch(event.target.value);
                        setPage(1);
                      }}
                      className={input + " pl-9"}
                      placeholder="요구사항 제목 검색"
                    />
                  </label>
                  <select
                    value={requirementStatus}
                    onChange={(event) => {
                      setRequirementStatus(event.target.value as RequirementProgressStatus | "ALL");
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none sm:w-36"
                  >
                    <option value="ALL">전체 상태</option>
                    {Object.entries(requirementStatusLabel).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 overflow-x-auto border-y border-slate-200">
                  <table className="min-w-[760px] w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                      <tr>
                        {["No", "요구사항 제목", "구분", "우선순위", "진행 상태", "담당자", "등록일"].map((h) => (
                          <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length ? (
                        paged.map((item) => (
                          <tr key={item.requirementId} className="border-t border-slate-100">
                            <td className="px-4 py-3 text-slate-400">{item.requirementNo}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setReqDrawer(item)}
                                className="font-semibold text-slate-800 hover:text-violet-600"
                              >
                                {item.requirementTitle}
                              </button>
                            </td>
                            <td className="px-4 py-3">{requirementTypeLabel[item.requestType]}</td>
                            <td className="px-4 py-3">{priorityLabel[item.priority]}</td>
                            <td className="px-4 py-3">
                              <span className={statusClass}>{requirementStatusLabel[item.requirementStatus]}</span>
                            </td>
                            <td className="px-4 py-3">{item.assignee}</td>
                            <td className="px-4 py-3 text-slate-500">{item.createdAt}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                            등록된 요구사항이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={
                          "h-8 w-8 rounded-md text-sm " +
                          (page === i + 1 ? "bg-violet-600 text-white" : "text-slate-500 hover:bg-slate-100")
                        }
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full min-h-[450px] flex-col items-center justify-center text-center">
                <FileText className="text-slate-300" size={38} />
                <h2 className="mt-4 font-bold text-slate-700">선택할 기획문서가 없습니다</h2>
                <p className="mt-1 text-sm text-slate-400">새 기획문서를 등록해 시작해 보세요.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      {docDrawer && (
        <DocumentDrawer
          document={docDrawer === "new" ? null : docDrawer}
          projects={projects}
          initialProjectId={projectId === "ALL" ? (projects[0]?.projectId ?? "") : projectId}
          onClose={() => setDocDrawer(null)}
          onSave={saveDocument}
        />
      )}
      {reqDrawer && selected && (
        <RequirementDrawer
          requirement={reqDrawer === "new" ? null : reqDrawer}
          onClose={() => setReqDrawer(null)}
          onSave={saveRequirement}
        />
      )}
    </WorkspaceShell>
  );
}

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/20">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function DocumentDrawer({
  document,
  projects,
  initialProjectId,
  onClose,
  onSave,
}: {
  document: PlanningDocument | null;
  projects: ReturnType<typeof getMockProjects>;
  initialProjectId: string;
  onClose: () => void;
  onSave: (v: DocDraft) => void;
}) {
  const [v, setV] = useState<DocDraft>({
    projectId: document?.projectId ?? initialProjectId,
    documentTitle: document?.documentTitle ?? "",
    documentContent: document?.documentContent ?? "",
    documentStatus: document?.documentStatus ?? "DRAFT",
  });
  return (
    <Drawer title={document ? "기획문서 수정" : "기획문서 등록"} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (v.documentTitle.trim()) onSave(v);
        }}
      >
        <Field label="프로젝트">
          <select
            disabled={!!document}
            value={v.projectId}
            onChange={(e) => setV({ ...v, projectId: e.target.value })}
            className={input}
          >
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectTitle}
              </option>
            ))}
          </select>
        </Field>
        <Field label="기획문서명">
          <input
            required
            value={v.documentTitle}
            onChange={(e) => setV({ ...v, documentTitle: e.target.value })}
            className={input}
          />
        </Field>
        <Field label="진행 상태">
          <select
            value={v.documentStatus}
            onChange={(e) => setV({ ...v, documentStatus: e.target.value as DocumentStatus })}
            className={input}
          >
            {Object.entries(documentStatusLabel).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="기획문서 설명">
          <textarea
            value={v.documentContent}
            onChange={(e) => setV({ ...v, documentContent: e.target.value })}
            className={input + " min-h-32"}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            취소
          </button>
          <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">저장</button>
        </div>
      </form>
    </Drawer>
  );
}
function RequirementDrawer({
  requirement,
  onClose,
  onSave,
}: {
  requirement: PlanningRequirement | null;
  onClose: () => void;
  onSave: (v: ReqDraft) => void;
}) {
  const [v, setV] = useState<ReqDraft>({
    requirementTitle: requirement?.requirementTitle ?? "",
    requestType: requirement?.requestType ?? "NEW",
    priority: requirement?.priority ?? "NORMAL",
    requirementStatus: requirement?.requirementStatus ?? "NEW",
    assignee: requirement?.assignee ?? "",
    requirementContent: requirement?.requirementContent ?? "",
  });
  return (
    <Drawer title={requirement ? "요구사항 수정" : "요구사항 등록"} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (v.requirementTitle.trim()) onSave(v);
        }}
      >
        <Field label="요구사항 제목">
          <input
            required
            value={v.requirementTitle}
            onChange={(e) => setV({ ...v, requirementTitle: e.target.value })}
            className={input}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="구분">
            <select
              value={v.requestType}
              onChange={(e) => setV({ ...v, requestType: e.target.value as RequirementType })}
              className={input}
            >
              {Object.entries(requirementTypeLabel).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="우선순위">
            <select
              value={v.priority}
              onChange={(e) => setV({ ...v, priority: e.target.value as ReqDraft["priority"] })}
              className={input}
            >
              {Object.entries(priorityLabel).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="진행 상태">
          <select
            value={v.requirementStatus}
            onChange={(e) =>
              setV({
                ...v,
                requirementStatus: e.target.value as RequirementProgressStatus,
              })
            }
            className={input}
          >
            {Object.entries(requirementStatusLabel).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="담당자">
          <input value={v.assignee} onChange={(e) => setV({ ...v, assignee: e.target.value })} className={input} />
        </Field>
        <Field label="상세 요구사항 내용">
          <textarea
            value={v.requirementContent}
            onChange={(e) => setV({ ...v, requirementContent: e.target.value })}
            className={input + " min-h-32"}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            취소
          </button>
          <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">저장</button>
        </div>
      </form>
    </Drawer>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
