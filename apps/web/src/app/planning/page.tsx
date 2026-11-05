"use client";

import { Suspense, useMemo, useState } from "react";
import { FileText, Paperclip, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DocumentStatus, RequirementProgressStatus, RequirementType } from "@carehe/shared-types";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { VersionHistoryDrawer } from "../../components/VersionHistoryDrawer";
import { RichTextEditor } from "../../components/RichTextEditor";
import { FileAttachmentField } from "../../components/FileAttachmentField";
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
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-[#4D405F] outline-none placeholder:text-[#978BAA] focus:border-violet";
const statusClass = "rounded-full bg-lavender px-2.5 py-1 text-xs font-semibold text-violet";

type DocDraft = Pick<PlanningDocument, "projectId" | "documentTitle" | "documentContent" | "documentStatus" | "service" | "environments" | "attachmentCount" | "attachments">;
type ReqDraft = Pick<
  PlanningRequirement,
  "documentId" | "requirementTitle" | "requestType" | "priority" | "requirementStatus" | "assignee" | "requirementContent"
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
  const [docDrawer, setDocDrawer] = useState<PlanningDocument | "new" | null>(() => params.get("create") === "document" ? "new" : null);
  const [reqDrawer, setReqDrawer] = useState<PlanningRequirement | "new" | null>(null);
  const [versionTitle, setVersionTitle] = useState<string | null>(null);
  const [documentPanel, setDocumentPanel] = useState<"content" | "attachments" | null>(null);
  const serviceType = params.get("serviceType") as "ADMIN" | "USER" | null;
  const [environment, setEnvironment] = useState("DEV");

  const visibleDocuments = useMemo(
    () =>
      documents.filter(
        (doc) =>
          (doc.service ?? "ADMIN") === serviceType &&
          (doc.environments ?? ["DEV"]).includes(environment as "DEV" | "STAGING" | "LIVE") &&
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

  if (!serviceType) return <ServiceSelection onSelect={(service) => router.push(`/planning?serviceType=${service}`)} />;

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
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col p-4 md:px-6 md:py-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-2"><button type="button" onClick={() => router.push("/planning")} className="shrink-0 text-sm font-bold text-violet">{"기획 및 요구사항"}</button><span className="text-muted">/</span><span className="text-sm font-bold text-[#211A35]">{serviceType}</span></div>
          <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold tracking-[.12em] text-[#625775]">ENV</span>{(serviceType === "USER" ? ["DEV", "STAGING", "LIVE"] : ["DEV", "LIVE"]).map((item) => <button type="button" key={item} onClick={() => setEnvironment(item)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${environment === item ? "border-violet bg-violet text-white" : "border-[#CDBAEF] bg-white text-[#625775] hover:border-violet hover:bg-lavender"}`}>{item}</button>)}</div>
        </div>
        {notice && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-[#E2D7F6] bg-lavender px-4 py-3 text-sm text-[#4C237F]">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}{" "}
        <section className="grid min-h-[660px] flex-1 overflow-hidden rounded-xl border border-line bg-white lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-b border-line lg:border-b-0 lg:border-r">
            <div className="border-b border-[#F0ECF6] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-[#211A35]">기획문서</h2>
                <button
                  onClick={() => setDocDrawer("new")}
                  className="inline-flex items-center gap-1 rounded-lg bg-violet px-2.5 py-2 text-xs font-semibold text-white"
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
                <Search className="absolute left-3 top-2.5 text-[#978BAA]" size={15} />
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
                        (active ? "bg-lavender ring-1 ring-violet-200" : "hover:bg-[#FAF8FF]")
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2 text-sm font-semibold text-[#211A35]">{doc.documentTitle}</span>
                        <span className={statusClass}>{documentStatusLabel[doc.documentStatus]}</span>
                      </div>
                      <p className="mt-2 text-xs text-[#978BAA]">
                        {doc.documentNo} · 요구사항 {count}건
                      </p>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-sm text-[#978BAA]">검색 결과가 없습니다.</div>
              )}
            </div>
          </aside>
          <div className="min-h-0 min-w-0 overflow-y-auto p-4 md:p-6">
            {selected ? (
              <>
                <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-violet">{selected.projectTitle}</p>
                    <h2 className="mt-1 text-xl font-bold text-[#211A35]">{selected.documentTitle}</h2>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
                      <span>{selected.documentNo}</span>
                      <span>작성자 {selected.createdBy}</span>
                      <span className={statusClass}>{documentStatusLabel[selected.documentStatus]}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setVersionTitle(selected.documentTitle)} className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-[#625775]">변경 이력</button>
                    <button
                      onClick={() => setDocDrawer(selected)}
                      className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-[#625775]"
                    >
                      <Pencil size={15} />
                      수정
                    </button>
                    <button
                      onClick={deleteDocument}
                      className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-rose-500"
                    >
                      <Trash2 size={15} />
                      삭제
                    </button>
                  </div>
                </header>
                <section className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-[#FAF8FF] p-3">
                  <span className="mr-1 text-xs font-bold tracking-[.1em] text-[#625775]">DOCUMENT</span>
                  <button type="button" onClick={() => setDocumentPanel("content")} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#4D405F] transition hover:text-violet">
                    <FileText size={15} />{"\uAE30\uD68D \uB0B4\uC6A9 \uBCF4\uAE30"}
                  </button>
                  <button type="button" onClick={() => setDocumentPanel("attachments")} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#4D405F] transition hover:text-violet">
                    <Paperclip size={15} />{"\uCCA8\uBD80\uD30C\uC77C"}<span className="rounded-full bg-lavender px-1.5 py-0.5 text-xs text-violet">{selected.attachments?.length ?? 0}</span>
                  </button>
                  <p className="ml-auto text-xs text-[#978BAA]">{"\uC694\uAD6C\uC0AC\uD56D "}{selectedRequirements.length}{"\uAC74\uC744 \uAD00\uB9AC\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4."}</p>
                </section>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-[#211A35]">요구사항 목록</h3>
                    <p className="mt-1 text-sm text-[#978BAA]">총 {selectedRequirements.length}건 · 최신 등록순</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReqDrawer("new")}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-violet px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6533B1]"
                  >
                    <Plus size={16} />+ 요구사항 등록
                  </button>
                </div>
                <div className="mt-4 flex flex-col gap-2 rounded-lg bg-[#FAF8FF] p-3 sm:flex-row sm:items-center">
                  <label className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-2.5 text-[#978BAA]" size={15} />
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
                    className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-[#4D405F] outline-none sm:w-36"
                  >
                    <option value="ALL">전체 상태</option>
                    {Object.entries(requirementStatusLabel).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 overflow-x-auto border-y border-line">
                  <table className="min-w-[760px] w-full text-left text-sm">
                    <thead className="bg-[#FAF8FF] text-xs text-muted">
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
                          <tr key={item.requirementId} className="border-t border-[#F0ECF6]">
                            <td className="px-4 py-3 text-[#978BAA]">{item.requirementNo}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setReqDrawer(item)}
                                className="font-semibold text-[#211A35] hover:text-violet"
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
                            <td className="px-4 py-3 text-muted">{item.createdAt}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-[#978BAA]">
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
                          (page === i + 1 ? "bg-violet text-white" : "text-muted hover:bg-lavender")
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
                <FileText className="text-[#B7ADC4]" size={38} />
                <h2 className="mt-4 font-bold text-[#4D405F]">선택할 기획문서가 없습니다</h2>
                <p className="mt-1 text-sm text-[#978BAA]">새 기획문서를 등록해 시작해 보세요.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      {versionTitle && <VersionHistoryDrawer title={versionTitle} onClose={() => setVersionTitle(null)} />}
      {documentPanel && selected && <DocumentPreviewDrawer document={selected} view={documentPanel} onClose={() => setDocumentPanel(null)} />}
      {docDrawer && (
        <DocumentDrawer
          document={docDrawer === "new" ? null : docDrawer}
          projects={projects}
          initialProjectId={projectId === "ALL" ? (projects[0]?.projectId ?? "") : projectId}
          service={serviceType}
          environment={environment as "DEV" | "STAGING" | "LIVE"}
          onClose={() => setDocDrawer(null)}
          onSave={saveDocument}
        />
      )}
      {reqDrawer && selected && (
        <RequirementDrawer
          requirement={reqDrawer === "new" ? null : reqDrawer}
          parentDocument={selected}
          onClose={() => setReqDrawer(null)}
          onSave={saveRequirement}
        />
      )}
    </WorkspaceShell>
  );
}

function ServiceSelection({ onSelect }: { onSelect: (service: "ADMIN" | "USER") => void }) {
  const cards = [
    { service: "ADMIN" as const, title: "ADMIN", subtitle: "관리자 서비스", description: "관리자 기획문서 및 요구사항 관리" },
    { service: "USER" as const, title: "USER", subtitle: "사용자 서비스", description: "사용자 기획문서 및 요구사항 관리" },
  ];
  return <WorkspaceShell pageTitle={"기획 및 요구사항"}><main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6"><section className="w-full max-w-3xl"><div className="mb-10 text-center"><p className="text-xs font-semibold tracking-[.14em] text-violet">PLANNING WORKSPACE</p><h1 className="mt-3 text-2xl font-bold text-[#211A35] md:text-3xl">{"어떤 서비스를 관리하시겠어요?"}</h1><p className="mt-3 text-sm text-muted">{"서비스를 선택하면 해당 기획문서와 요구사항을 바로 확인할 수 있습니다."}</p></div><div className="grid gap-4 md:grid-cols-2">{cards.map((card) => <button type="button" key={card.service} onClick={() => onSelect(card.service)} className="service-card-enter group min-h-56 rounded-2xl border border-line bg-white p-7 text-left transition duration-200 hover:-translate-y-[3px] hover:border-violet focus-visible:-translate-y-[3px]"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lavender text-sm font-extrabold text-violet">{card.title.slice(0, 1)}</span><p className="mt-6 text-xs font-semibold tracking-[.12em] text-violet">{card.title}</p><h2 className="mt-2 text-xl font-bold text-[#211A35]">{card.subtitle}</h2><p className="mt-3 text-sm leading-6 text-muted">{card.description}</p></button>)}</div></section></main></WorkspaceShell>;
}
function DocumentPreviewDrawer({ document, view, onClose }: { document: PlanningDocument; view: "content" | "attachments"; onClose: () => void }) {
  const title = view === "content" ? "\uAE30\uD68D \uB0B4\uC6A9" : "\uCCA8\uBD80\uD30C\uC77C";
  return <Drawer title={title} onClose={onClose}><div className="space-y-3">{view === "content" ? <div className="min-h-64 whitespace-pre-wrap rounded-xl border border-line bg-[#FAF8FF] p-4 text-sm leading-7 text-[#4D405F]">{document.documentContent || "\uB4F1\uB85D\uB41C \uAE30\uD68D \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."}</div> : (document.attachments?.length ? <ul className="space-y-2">{document.attachments.map((file) => <li key={file.name} className="rounded-xl border border-line bg-[#FAF8FF] px-3 py-3 text-sm text-[#4D405F]"><FileText size={15} className="mr-2 inline text-violet" />{file.name}<span className="ml-2 text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</span></li>)}</ul> : <p className="py-16 text-center text-sm text-[#978BAA]">{"\uCCA8\uBD80\uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."}</p>)}</div></Drawer>;
}
function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#211A35]/20">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-lavender">
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
  service,
  environment,
  onClose,
  onSave,
}: {
  document: PlanningDocument | null;
  projects: ReturnType<typeof getMockProjects>;
  initialProjectId: string;
  service: "ADMIN" | "USER";
  environment: "DEV" | "STAGING" | "LIVE";
  onClose: () => void;
  onSave: (v: DocDraft) => void;
}) {
  const [v, setV] = useState<DocDraft>({
    projectId: document?.projectId ?? initialProjectId,
    documentTitle: document?.documentTitle ?? "",
    documentContent: document?.documentContent ?? "",
    documentStatus: document?.documentStatus ?? "DRAFT",
    service: document?.service ?? service,
    environments: document?.environments ?? [environment],
    attachmentCount: document?.attachmentCount ?? 0,
    attachments: document?.attachments ?? [],
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
        <Field label={"프로젝트"}><select value={v.projectId} onChange={(e) => setV({ ...v, projectId: e.target.value })} className={input}>{projects.map((project) => <option key={project.projectId} value={project.projectId}>{project.projectTitle}</option>)}</select></Field>
        <Field label={"기획문서명"}><input required value={v.documentTitle} onChange={(e) => setV({ ...v, documentTitle: e.target.value })} className={input} /></Field>
        <Field label={"상태"}><select value={v.documentStatus} onChange={(e) => setV({ ...v, documentStatus: e.target.value as DocumentStatus })} className={input}>{Object.entries(documentStatusLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
        <div className="rounded-lg bg-[#FAF8FF] px-3 py-2 text-xs text-muted">{"현재 서비스 · "}{service}{" · "}{environment}{" · 등록 후 문서별 환경을 추가할 수 있습니다."}</div>
        <Field label={"문서 내용"}><textarea value={v.documentContent} onChange={(e) => setV({ ...v, documentContent: e.target.value })} className={input + " min-h-32"} /></Field>
        <FileAttachmentField onFilesChange={(attachments) => setV({ ...v, attachments, attachmentCount: attachments.length })} />
        <div className="flex justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            취소
          </button>
          <button className="rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-white">저장</button>
        </div>
      </form>
    </Drawer>
  );
}
function RequirementDrawer({ requirement, parentDocument, onClose, onSave }: { requirement: PlanningRequirement | null; parentDocument: PlanningDocument; onClose: () => void; onSave: (v: ReqDraft) => void }) {
  const [v, setV] = useState<ReqDraft>({
    documentId: requirement?.documentId ?? "",
    requirementTitle: requirement?.requirementTitle ?? "",
    requestType: requirement?.requestType ?? "NEW",
    priority: requirement?.priority ?? "NORMAL",
    requirementStatus: requirement?.requirementStatus ?? "NEW",
    assignee: requirement?.assignee ?? "",
    requirementContent: requirement?.requirementContent ?? "",
  });
  return <Drawer title={requirement ? "요구사항 수정" : "요구사항 등록"} onClose={onClose}><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (v.requirementTitle.trim()) onSave(v); }}>
    <div className="rounded-lg border border-line bg-[#FAF8FF] px-3 py-2 text-xs text-muted">{"상위 기획문서 설정 상속 · "}{parentDocument.service ?? "ADMIN"}{" · "}{(parentDocument.environments ?? ["DEV"]).join(" / ")}{" · 별도 환경 변경은 API 연동 후 제공됩니다."}</div>
    <Field label={"요구사항 제목"}><input required value={v.requirementTitle} onChange={(event) => setV({ ...v, requirementTitle: event.target.value })} className={input} /></Field>
    <div className="grid grid-cols-2 gap-3"><Field label={"구분"}><select value={v.requestType} onChange={(event) => setV({ ...v, requestType: event.target.value as RequirementType })} className={input}>{Object.entries(requirementTypeLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field><Field label={"우선순위"}><select value={v.priority} onChange={(event) => setV({ ...v, priority: event.target.value as ReqDraft["priority"] })} className={input}>{Object.entries(priorityLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field></div>
    <Field label={"진행상태"}><select value={v.requirementStatus} onChange={(event) => setV({ ...v, requirementStatus: event.target.value as RequirementProgressStatus })} className={input}>{Object.entries(requirementStatusLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
    <Field label={"담당자"}><input value={v.assignee} onChange={(event) => setV({ ...v, assignee: event.target.value })} className={input} /></Field>
    <RichTextEditor label={"상세 요구사항"} value={v.requirementContent} onChange={(requirementContent) => setV({ ...v, requirementContent })} />
    <div className="flex justify-end gap-2 pt-3"><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">취소</button><button className="rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-white">저장</button></div>
  </form></Drawer>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[#4D405F]">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
