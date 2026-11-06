"use client";

import { ArrowLeft, MessageSquare, Paperclip, Plus, Search, X } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileAttachmentField, type LocalAttachment } from "../../components/FileAttachmentField";
import { RichTextEditor, sanitizeRichTextHtml } from "../../components/RichTextEditor";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import {
  defectRegisters,
  issuePriorityLabel,
  issueStatusLabel,
  issueTypeLabel,
  mockDefectIssues,
  type DefectIssue,
  type IssuePriority,
  type IssueStatus,
  type IssueType,
} from "../../lib/defects";
import { getMockProjects } from "../../lib/projects";
import { getMockPlanningDocuments, getMockPlanningRequirements, requirementStatusLabel } from "../../lib/planning";

const pageSize = 5;
const input =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-[#4D405F] outline-none placeholder:text-[#978BAA] focus:border-violet";
const badge = "rounded-full bg-lavender px-2 py-1 text-xs font-semibold text-violet";

export default function DefectsPage() {
  return (
    <Suspense fallback={null}>
      <DefectsContent />
    </Suspense>
  );
}

function DefectsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const projects = getMockProjects();
  const [issues, setIssues] = useState(mockDefectIssues);
  const [projectId, setProjectId] = useState("PRJ-1001");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<IssueType | "ALL">("ALL");
  const [status, setStatus] = useState<IssueStatus | "ALL">("ALL");
  const [documentId, setDocumentId] = useState("ALL");
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState("");
  const selectedId = params.get("issueId");
  const serviceType = params.get("serviceType") as "ADMIN" | "USER" | null;
  const [environment, setEnvironment] = useState(params.get("environment") ?? "DEV");
  const selected = issues.find((item) => item.id === selectedId);
  const planningDocuments = getMockPlanningDocuments().filter(
    (document) =>
      document.projectId === projectId &&
      (document.service ?? "ADMIN") === serviceType &&
      (document.environments ?? ["DEV"]).includes(environment as "DEV" | "STAGING" | "LIVE"),
  );
  const registerIdsForService = new Set(
    mockDefectIssues
      .filter((issue) => issue.environment?.toUpperCase().includes(serviceType ?? ""))
      .map((issue) => issue.registerId),
  );
  const registers = defectRegisters.filter((item) => item.projectId === projectId && registerIdsForService.has(item.id));
  const activeRegisterId = registers[0]?.id ?? "";
  const activeDocumentId = planningDocuments.some((document) => document.documentId === documentId) ? documentId : "ALL";
  const filtered = useMemo(
    () =>
      issues.filter(
        (item) =>
          item.projectId === projectId &&
          item.environment?.toUpperCase().includes(serviceType ?? "") &&
          item.environment?.toUpperCase().includes(environment) &&
          (activeDocumentId === "ALL" || getMockPlanningRequirements().some((requirement) => requirement.requirementId === item.requirementId && requirement.documentId === activeDocumentId)) &&
          item.title.toLowerCase().includes(query.toLowerCase()) &&
          (type === "ALL" || item.type === type) &&
          (status === "ALL" || item.status === status),
      ),
    [issues, projectId, serviceType, environment, activeDocumentId, query, type, status],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const statusCounts = {
    OPEN: filtered.filter((item) => item.status === "OPEN").length,
    IN_PROGRESS: filtered.filter((item) => item.status === "IN_PROGRESS").length,
    RESOLVED: filtered.filter((item) => item.status === "RESOLVED").length,
  };

  function updateFilters(update: () => void) {
    update();
    setPage(1);
  }
  if (!serviceType) return <DefectServiceSelection onSelect={(service) => router.push(`/defects?serviceType=${service}`)} />;
  function addIssue(
    draft: Omit<DefectIssue, "id" | "author" | "createdAt" | "updatedAt" | "comments" | "history" | "projectTitle">,
  ) {
    const project = projects.find((item) => item.projectId === projectId);
    if (!project) return;
    setIssues((current) => [
      {
        ...draft,
        id: `ISSUE-DEMO-${Date.now()}`,
        projectTitle: project.projectTitle,
        author: "FRONTEND DEMO",
        createdAt: "방금",
        updatedAt: "방금",
        comments: [],
        history: [{ at: "방금", by: "FRONTEND DEMO", status: "OPEN" }],
      },
      ...current,
    ]);
    setDrawer(false);
    setNotice("이슈를 브라우저 세션 목업 목록에만 추가했습니다. API 연동 전에는 저장되지 않습니다.");
  }
  if (selected)
    return (
      <IssueDetail
        issue={selected}
        onBack={() => router.push(`/defects?serviceType=${serviceType}`)}
        onUpdate={(next) => setIssues((items) => items.map((item) => (item.id === next.id ? next : item)))}
      />
    );

  return (
    <WorkspaceShell pageTitle={"결함 관리"}>
      <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#211A35] px-5 py-4 shadow-lg">
            <div><p className="text-[11px] font-bold tracking-[.16em] text-[#D7C7FF]">INCIDENT CONTROL</p><div className="mt-1 flex items-center gap-2"><button type="button" onClick={() => router.push("/defects")} className="text-lg font-bold text-white">결함 관리</button><span className="text-[#978BAA]">/</span><span className="text-sm font-bold text-[#E7DFFF]">{serviceType}</span></div></div>
            <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-[11px] font-bold tracking-[.12em] text-[#BFB1D6]">ENVIRONMENT</span>{(serviceType === "USER" ? ["DEV", "STAGING", "LIVE"] : ["DEV", "LIVE"]).map((item) => <button type="button" key={item} onClick={() => setEnvironment(item)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${environment === item ? "border-white bg-white text-[#211A35]" : "border-[#625775] bg-transparent text-[#E7DFFF] hover:border-[#D7C7FF] hover:bg-[#352B4C]"}`}>{item}</button>)}</div>
          </div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">{"개발 후 발견된 오류와 개선 요청을 관리합니다."}</p>
              <h1 className="mt-1 text-2xl font-bold text-[#211A35]">{"결함 관리"}</h1>
            </div>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#D94B62] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#BF3B51]"
            >
              <Plus size={16} />
              {"이슈 등록"}
            </button>
          </div>
          {notice && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-[#E2D7F6] bg-lavender px-4 py-3 text-sm text-[#4C237F]">
              <span>{notice}</span>
              <button onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}
          <section className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="border-b border-line bg-gradient-to-r from-[#FFF8F9] via-[#FCFAFF] to-white px-5 py-5 md:px-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[.14em] text-[#C83E55]">ISSUE TRIAGE QUEUE</p>
                  <h2 className="mt-1 text-lg font-bold text-[#211A35]">{"결함 이슈 작업 목록"}</h2>
                  <p className="mt-1 text-sm text-muted">{"우선순위와 진행 상태를 한눈에 확인하세요."}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-lg bg-[#FFF0F2] px-2.5 py-2 text-[#C83E55]">
                    {"접수 "}
                    {statusCounts.OPEN}
                  </span>
                  <span className="rounded-lg bg-[#FFF5E8] px-2.5 py-2 text-[#9A5C10]">
                    {"진행 중 "}
                    {statusCounts.IN_PROGRESS}
                  </span>
                  <span className="rounded-lg bg-[#EAF8F0] px-2.5 py-2 text-[#287D61]">
                    {"조치 완료 "}
                    {statusCounts.RESOLVED}
                  </span>
                </div>
              </div>
              <div className="mt-5 grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(190px,1fr)_150px_150px]">
                <select
                  value={projectId}
                  onChange={(event) =>
                    updateFilters(() => {
                      setProjectId(event.target.value);
                      setDocumentId("ALL");
                    })
                  }
                  className={input}
                >
                  {projects.map((item) => (
                    <option key={item.projectId} value={item.projectId}>
                      {item.projectTitle}
                    </option>
                  ))}
                </select>
                <select value={activeDocumentId} onChange={(event) => updateFilters(() => setDocumentId(event.target.value))} className={input}>
                  <option value="ALL">기획문서 전체</option>
                  {planningDocuments.map((document) => <option key={document.documentId} value={document.documentId}>{document.documentTitle}</option>)}
                </select>
                <label className="relative">
                  <Search size={16} className="absolute left-3 top-2.5 text-[#978BAA]" />
                  <input
                    value={query}
                    onChange={(event) => updateFilters(() => setQuery(event.target.value))}
                    className={input + " pl-9"}
                    placeholder={"이슈 검색"}
                  />
                </label>
                <select
                  value={type}
                  onChange={(event) => updateFilters(() => setType(event.target.value as IssueType | "ALL"))}
                  className={input}
                >
                  <option value="ALL">{"전체 유형"}</option>
                  {Object.entries(issueTypeLabel).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={status}
                  onChange={(event) => updateFilters(() => setStatus(event.target.value as IssueStatus | "ALL"))}
                  className={input}
                >
                  <option value="ALL">{"전체 상태"}</option>
                  {Object.entries(issueStatusLabel).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="divide-y divide-[#F0ECF6] bg-white">
              {visible.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push(`/defects?serviceType=${serviceType}&issueId=${item.id}`)}
                  className="group grid w-full grid-cols-[4px_minmax(0,1fr)] text-left transition hover:bg-[#FCFAFF] md:grid-cols-[4px_104px_minmax(0,1fr)_104px_100px_150px]"
                >
                  <span
                    className={`my-4 rounded-r-full ${item.priority === "URGENT" ? "bg-rose-400" : item.priority === "HIGH" ? "bg-violet" : "bg-[#D9C8F3]"}`}
                  />
                  <div className="px-4 py-4 md:px-3">
                    <p className="text-xs font-bold text-[#978BAA]">{item.id}</p>
                    <p className="mt-1 text-xs text-[#625775]">{issueTypeLabel[item.type]}</p>
                  </div>
                  <div className="min-w-0 px-1 py-4 md:px-3">
                    <p className="truncate text-sm font-bold text-[#211A35] group-hover:text-violet">{item.title}</p>
                    <p className="mt-1 truncate text-xs text-[#978BAA]">{item.requirement || "연결된 요구사항 없음"}</p>
                    <div className="mt-2 flex items-center gap-2 md:hidden">
                      <span className={badge}>{issueStatusLabel[item.status]}</span>
                      <span className="text-xs text-[#625775]">{issuePriorityLabel[item.priority]}</span>
                      <span className="text-xs text-muted">{item.author}</span>
                    </div>
                  </div>
                  <div className="hidden px-3 py-4 md:block">
                    <span className={badge}>{issueStatusLabel[item.status]}</span>
                    <p className="mt-2 text-xs text-[#625775]">{issuePriorityLabel[item.priority]}</p>
                  </div>
                  <div className="hidden px-3 py-4 text-sm text-[#625775] md:block">
                    {item.author}
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#978BAA]">
                      <MessageSquare size={13} />
                      {item.comments.length}
                    </p>
                  </div>
                  <div className="hidden px-3 py-4 text-right text-xs text-[#978BAA] md:block">{item.updatedAt}</div>
                </button>
              ))}
              {visible.length === 0 && (
                <div className="py-16 text-center text-sm text-muted">{"조건에 맞는 이슈가 없습니다."}</div>
              )}
            </div>{" "}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1 border-t border-line bg-white p-4">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => setPage(index + 1)}
                    className={`h-8 w-8 rounded-lg text-sm ${page === index + 1 ? "bg-violet text-white" : "text-muted hover:bg-lavender"}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      {drawer && (
        <IssueDrawer projectId={projectId} registerId={activeRegisterId} onClose={() => setDrawer(false)} onSave={addIssue} />
      )}
    </WorkspaceShell>
  );
}

function DefectServiceSelection({ onSelect }: { onSelect: (service: "ADMIN" | "USER") => void }) {
  const cards = [
    { service: "ADMIN" as const, title: "ADMIN", label: "운영 콘솔", description: "관리자 기능과 운영 도구의 결함을 확인합니다.", environments: ["DEV", "LIVE"] },
    { service: "USER" as const, title: "USER", label: "사용자 앱", description: "사용자 서비스와 앱 경험의 결함을 확인합니다.", environments: ["DEV", "STAGING", "LIVE"] },
  ];
  return (
    <WorkspaceShell pageTitle="결함 관리">
      <main className="min-h-0 flex-1 overflow-y-auto bg-[#F8F7FB] p-5 md:p-8">
        <section className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-[#211A35] px-7 py-8 text-white shadow-xl md:px-10 md:py-10">
            <p className="text-xs font-bold tracking-[.18em] text-[#D7C7FF]">ISSUE TRIAGE</p>
            <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div><h1 className="text-3xl font-bold tracking-tight md:text-4xl">어느 채널의 이슈를<br />확인할까요?</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#CFC4DF]">서비스를 선택하면 해당 채널의 환경, 기획문서, 결함 이슈를 한 번에 확인할 수 있습니다.</p></div>
              <span className="w-fit rounded-full border border-[#625775] bg-[#312742] px-3 py-1.5 text-xs font-bold text-[#E7DFFF]">실시간 트리아지</span>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {cards.map((card) => <button type="button" key={card.service} onClick={() => onSelect(card.service)} className={`group rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${card.service === "ADMIN" ? "border-[#E7D5D9] bg-[#FFF9FA] hover:border-[#D94B62]" : "border-[#D8E4F5] bg-[#F8FBFF] hover:border-[#3B78C2]"}`}><div className="flex items-start justify-between"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black ${card.service === "ADMIN" ? "bg-[#FFE7EB] text-[#C83E55]" : "bg-[#E4F0FF] text-[#2C67AE]"}`}>{card.title.slice(0, 1)}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${card.service === "ADMIN" ? "bg-[#FDEFF1] text-[#C83E55]" : "bg-[#EAF3FF] text-[#2C67AE]"}`}>{card.label}</span></div><p className={`mt-8 text-xs font-bold tracking-[.16em] ${card.service === "ADMIN" ? "text-[#C83E55]" : "text-[#2C67AE]"}`}>{card.title}</p><h2 className="mt-2 text-2xl font-bold text-[#211A35]">{card.label}</h2><p className="mt-3 text-sm leading-6 text-[#625775]">{card.description}</p><div className="mt-6 flex items-center justify-between border-t border-current/10 pt-4"><div className="flex gap-1.5">{card.environments.map((environment) => <span key={environment} className="rounded bg-white px-2 py-1 text-[11px] font-bold text-[#625775]">{environment}</span>)}</div><span className="text-sm font-bold text-[#4D405F] group-hover:text-violet">이슈 보기 →</span></div></button>)}
          </div>
        </section>
      </main>
    </WorkspaceShell>
  );
}

function IssueDrawer({
  projectId,
  registerId,
  onClose,
  onSave,
}: {
  projectId: string;
  registerId: string;
  onClose: () => void;
  onSave: (
    draft: Omit<DefectIssue, "id" | "author" | "createdAt" | "updatedAt" | "comments" | "history" | "projectTitle">,
  ) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<IssueType>("BUG");
  const [priority, setPriority] = useState<IssuePriority>("NORMAL");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [requirementId, setRequirementId] = useState<string | undefined>();
  const [environment, setEnvironment] = useState("");
  const documents = getMockPlanningDocuments();
  const requirementOptions = getMockPlanningRequirements().flatMap((item) => {
    const document = documents.find((doc) => doc.documentId === item.documentId);
    return document?.projectId === projectId ? [{ requirement: item, document }] : [];
  });
  const selectedRequirement = requirementOptions.find((item) => item.requirement.requirementId === requirementId);
  return (
    <Drawer title={"이슈 등록"} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (title.trim())
            onSave({
              projectId,
              registerId,
              title,
              type,
              status: "OPEN",
              priority,
              content,
              requirementId,
              requirement: selectedRequirement
                ? `${selectedRequirement.requirement.requirementNo} ${selectedRequirement.requirement.requirementTitle}`
                : undefined,
              environment,
              attachments,
            });
        }}
      >
        <p className="rounded-lg bg-[#FAF8FF] px-3 py-2 text-xs text-muted">
          {"현재 프로젝트와 결함관리 대장이 자동 적용됩니다."}
        </p>
        <Field label={"제목"}>
          <input required value={title} onChange={(event) => setTitle(event.target.value)} className={input} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={"유형"}>
            <select value={type} onChange={(event) => setType(event.target.value as IssueType)} className={input}>
              {Object.entries(issueTypeLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={"우선순위"}>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as IssuePriority)}
              className={input}
            >
              {Object.entries(issuePriorityLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <RichTextEditor label={"상세 내용"} value={content} onChange={setContent} />
        <FileAttachmentField label={"이미지 및 파일 첨부"} onFilesChange={setAttachments} />
        <div className="grid grid-cols-2 gap-3">
          <RequirementPicker
            options={requirementOptions}
            selected={selectedRequirement}
            onSelect={(value) => setRequirementId(value?.requirement.requirementId)}
          />
          <Field label={"발생 환경 (선택)"}>
            <input
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}
              className={input}
              placeholder="ADMIN · DEV"
            />
          </Field>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm">
            {"취소"}
          </button>
          <button className="rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-white">{"등록"}</button>
        </div>
      </form>
    </Drawer>
  );
}

function RequirementPicker({
  options,
  selected,
  onSelect,
}: {
  options: {
    requirement: ReturnType<typeof getMockPlanningRequirements>[number];
    document: ReturnType<typeof getMockPlanningDocuments>[number];
  }[];
  selected?: {
    requirement: ReturnType<typeof getMockPlanningRequirements>[number];
    document: ReturnType<typeof getMockPlanningDocuments>[number];
  };
  onSelect: (value?: {
    requirement: ReturnType<typeof getMockPlanningRequirements>[number];
    document: ReturnType<typeof getMockPlanningDocuments>[number];
  }) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const results = options
    .filter(({ requirement, document }) =>
      `${requirement.requirementNo} ${requirement.requirementTitle} ${document.documentTitle}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 6);
  const content = selected?.requirement.requirementContent ?? "";
  return (
    <div className="col-span-2">
      <Field label={"관련 요구사항 (선택)"}>
        {selected ? (
          <div className="rounded-xl border border-[#D9C8F3] bg-[#FAF8FF] p-3">
            <div className="flex items-start justify-between gap-3">
              <button type="button" className="min-w-0 text-left" onClick={() => setOpen((value) => !value)}>
                <p className="truncate text-sm font-bold text-[#211A35]">{selected.requirement.requirementTitle}</p>
                <p className="mt-1 text-xs text-[#625775]">
                  {selected.requirement.requirementNo}
                  {" · "}
                  {selected.document.documentTitle}
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelect();
                  setQuery("");
                }}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-[#978BAA] hover:bg-white hover:text-rose-500"
              >
                {"해제"}
              </button>
            </div>
            <div className="mt-3 border-t border-[#EAE3F5] pt-3">
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="rounded bg-white px-2 py-1 text-violet">{selected.document.service ?? "ADMIN"}</span>
                {(selected.document.environments ?? ["DEV"]).map((environment) => (
                  <span key={environment} className="rounded bg-white px-2 py-1 text-[#625775]">
                    {environment}
                  </span>
                ))}
                <span className="rounded bg-white px-2 py-1 text-[#625775]">
                  {requirementStatusLabel[selected.requirement.requirementStatus]}
                </span>
              </div>
              <div
                className={`mt-3 text-sm leading-6 text-[#4D405F] ${expanded ? "" : "line-clamp-3"}`}
                dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(content) }}
              />
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="text-xs font-semibold text-violet"
                >
                  {expanded ? "접기" : "더 보기"}
                </button>
                <a
                  href={`/planning?serviceType=${selected.document.service ?? "ADMIN"}&documentId=${selected.document.documentId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#625775] hover:text-violet"
                >
                  {"원본 요구사항 보기"}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <input
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
                setOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((value) => Math.min(value + 1, results.length - 1));
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((value) => Math.max(value - 1, 0));
                }
                if (event.key === "Enter" && results[active]) {
                  event.preventDefault();
                  onSelect(results[active]);
                  setOpen(false);
                  setQuery("");
                }
                if (event.key === "Escape") setOpen(false);
              }}
              className={input}
              placeholder={"번호, 제목, 기획문서명으로 검색"}
            />
            {open && (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-soft">
                {results.length ? (
                  results.map((item, index) => (
                    <button
                      key={item.requirement.requirementId}
                      type="button"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => {
                        onSelect(item);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`w-full rounded-lg px-3 py-2.5 text-left ${active === index ? "bg-lavender" : "hover:bg-[#FAF8FF]"}`}
                    >
                      <p className="truncate text-sm font-semibold text-[#211A35]">
                        {item.requirement.requirementTitle}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#625775]">
                        {item.requirement.requirementNo}
                        {" · "}
                        {item.document.documentTitle}
                        {" · "}
                        {item.document.service ?? "ADMIN"}
                        {" / "}
                        {(item.document.environments ?? ["DEV"]).join(", ")}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-8 text-center text-sm text-muted">{"검색 결과가 없습니다."}</p>
                )}
              </div>
            )}
          </div>
        )}
      </Field>
    </div>
  );
}
function IssueDetail({
  issue,
  onBack,
  onUpdate,
}: {
  issue: DefectIssue;
  onBack: () => void;
  onUpdate: (issue: DefectIssue) => void;
}) {
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [commentFiles, setCommentFiles] = useState<LocalAttachment[]>([]);
  function submitComment() {
    if (!comment.replace(/<[^>]+>/g, "").trim()) return;
    onUpdate({
      ...issue,
      comments: [
        ...issue.comments,
        {
          id: `COMMENT-DEMO-${Date.now()}`,
          parentId: replyTo ?? undefined,
          author: "FRONTEND DEMO",
          createdAt: "방금",
          content: comment,
          attachments: commentFiles,
        },
      ],
      updatedAt: "방금",
    });
    setComment("");
    setReplyTo(null);
    setCommentFiles([]);
  }
  return (
    <WorkspaceShell pageTitle={"결함 관리"}>
      <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-violet"
          >
            <ArrowLeft size={16} />
            {"목록으로"}
          </button>
          <article className="rounded-xl border border-line bg-white p-5 md:p-7">
            <div className="flex flex-wrap justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="text-sm text-violet">{issue.id}</p>
                <h1 className="mt-1 text-2xl font-bold text-[#211A35]">{issue.title}</h1>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted">
                  <span>{issueTypeLabel[issue.type]}</span>
                  <span className={badge}>{issueStatusLabel[issue.status]}</span>
                  <span>{issuePriorityLabel[issue.priority]}</span>
                  <span>
                    {issue.author} · {issue.createdAt}
                  </span>
                </div>
              </div>
              <select
                value={issue.status}
                onChange={(event) => {
                  const status = event.target.value as IssueStatus;
                  onUpdate({
                    ...issue,
                    status,
                    updatedAt: "방금",
                    history: [...issue.history, { at: "방금", by: "FRONTEND DEMO", status }],
                  });
                }}
                className="h-10 rounded-lg border border-line px-3 text-sm"
              >
                {Object.entries(issueStatusLabel).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="prose prose-sm mt-6 max-w-none text-[#4D405F] [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(issue.content) }}
            />
            {(issue.attachments.length > 0 || issue.requirement || issue.environment) && (
              <div className="mt-6 grid gap-3 rounded-xl bg-[#FAF8FF] p-4 md:grid-cols-3">
                <Info
                  label={"첨부파일"}
                  value={issue.attachments.length ? issue.attachments.map((file) => file.name).join(", ") : "-"}
                />
                <Info label={"관련 요구사항"} value={issue.requirement || "-"} />
                <Info label={"발생 환경"} value={issue.environment || "-"} />
              </div>
            )}
          </article>
          <section className="mt-5 rounded-xl border border-line bg-white p-5 md:p-7">
            <h2 className="font-bold text-[#211A35]">
              {"댓글"} <span className="text-violet">{issue.comments.length}</span>
            </h2>
            <div className="mt-5 space-y-4">
              {issue.comments
                .filter((item) => !item.parentId)
                .map((item) => (
                  <Comment
                    key={item.id}
                    item={item}
                    replies={issue.comments.filter((reply) => reply.parentId === item.id)}
                    onReply={() => setReplyTo(item.id)}
                  />
                ))}
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-2 text-sm font-semibold text-[#4D405F]">{replyTo ? "답글 작성" : "댓글 작성"}</p>
              <RichTextEditor label={"내용"} value={comment} onChange={setComment} />
              <div className="mt-3">
                <FileAttachmentField label={"첨부파일"} onFilesChange={setCommentFiles} />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                {replyTo && (
                  <button onClick={() => setReplyTo(null)} className="rounded-lg border border-line px-3 py-2 text-sm">
                    {"답글 취소"}
                  </button>
                )}
                <button
                  onClick={submitComment}
                  className="rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-white"
                >
                  {"등록"}
                </button>
              </div>
            </div>
          </section>
          <section className="mt-5 rounded-xl border border-line bg-white p-5">
            <h2 className="font-bold text-[#211A35]">{"상태 변경 이력"}</h2>
            <div className="mt-3 divide-y divide-line">
              {issue.history.map((item, index) => (
                <div key={index} className="flex justify-between gap-3 py-3 text-sm">
                  <span>
                    {item.by} · {issueStatusLabel[item.status]}
                  </span>
                  <span className="text-muted">{item.at}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </WorkspaceShell>
  );
}
function Comment({
  item,
  replies,
  onReply,
}: {
  item: DefectIssue["comments"][number];
  replies: DefectIssue["comments"];
  onReply: () => void;
}) {
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex justify-between gap-3">
        <p className="text-sm font-bold text-[#4D405F]">{item.author}</p>
        <span className="text-xs text-muted">{item.createdAt}</span>
      </div>
      <div
        className="mt-2 text-sm text-[#4D405F]"
        dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(item.content) }}
      />
      {item.attachments?.length ? (
        <p className="mt-2 text-xs text-muted">
          <Paperclip size={13} className="mr-1 inline" />
          {item.attachments.map((file) => file.name).join(", ")}
        </p>
      ) : null}
      <div className="mt-3 flex gap-3">
        <button onClick={onReply} className="text-xs font-semibold text-violet">
          {"답글 달기"}
        </button>
        {item.author === "FRONTEND DEMO" && (
          <>
            <button className="text-xs text-muted">{"수정"}</button>
            <button className="text-xs text-rose-500">{"삭제"}</button>
          </>
        )}
      </div>
      {replies.map((reply) => (
        <div key={reply.id} className="ml-5 mt-4 border-l-2 border-lavender pl-4">
          <Comment item={reply} replies={[]} onReply={onReply} />
        </div>
      ))}
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm text-[#4D405F]">{value}</p>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[#4D405F]">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#211A35]/20">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl">
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
