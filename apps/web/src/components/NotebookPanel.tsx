"use client";

import { useEffect, useState } from "react";
import { BookOpen, ExternalLink, LoaderCircle, RefreshCw, X } from "lucide-react";

const notebookUrl = "https://notebook.google.com/notebook/8434be5b-876c-47c9-9c71-c4f640622db8?pli=1";
type NotebookData = { displayName: string; sources: Array<{ id?: string; displayName: string; state: string; originalUrl?: string }> };

export function NotebookPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [data, setData] = useState<NotebookData>();
  const [status, setStatus] = useState<"idle" | "loading" | "not_connected" | "configuration" | "error">("idle");
  async function load() {
    setStatus("loading");
    const response = await fetch("/api/notebook");
    if (response.status === 401) return setStatus("not_connected");
    if (!response.ok) return setStatus(response.status === 500 ? "configuration" : "error");
    setData(await response.json());
    setStatus("idle");
  }
  useEffect(() => { if (open) void load(); }, [open]);
  if (!open) return null;
  return <aside className="absolute inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-white shadow-[-14px_0_36px_rgba(52,31,85,.14)] sm:w-[390px]" aria-label="Gemini Notebook">
    <div className="flex items-center justify-between border-b border-line px-5 py-4"><div className="flex items-center gap-2"><BookOpen size={19} className="text-violet" /><div><h2 className="text-sm font-bold">Gemini Notebook</h2><p className="text-xs text-muted">연결된 노트북 소스</p></div></div><button type="button" aria-label="Notebook 패널 닫기" onClick={onClose} className="rounded-lg p-2 hover:bg-lavender"><X size={18} /></button></div>
    <div className="min-h-0 flex-1 overflow-y-auto p-5">
      {status === "loading" && <div className="flex justify-center py-12 text-muted"><LoaderCircle className="animate-spin" /></div>}
      {status === "not_connected" && <PanelMessage title="Google 계정을 연결하세요" detail="개인 Google 계정으로 Notebook 읽기 권한을 승인하면 이 노트북의 소스를 표시합니다." action="Google 연결" onAction={() => { window.location.href = `/api/google/authorize?returnTo=${encodeURIComponent(window.location.pathname)}`; }} />}
      {status === "configuration" && <PanelMessage title="연동 설정이 필요합니다" detail="Google Cloud OAuth 값과 노트북 ID를 환경 변수에 추가해 주세요." />}
      {status === "error" && <PanelMessage title="노트북을 불러오지 못했습니다" detail="권한과 Notebook API 설정을 확인한 뒤 다시 시도해 주세요." action="다시 시도" onAction={() => void load()} />}
      {status === "idle" && data && <><div className="rounded-xl bg-[#F6F1FF] p-4"><p className="text-xs font-bold tracking-[.12em] text-violet">CONNECTED NOTEBOOK</p><h3 className="mt-1 text-base font-bold text-[#312640]">{data.displayName}</h3><p className="mt-2 text-xs text-muted">소스 {data.sources.length}개</p></div><div className="mt-5 flex items-center justify-between"><h3 className="text-sm font-bold">소스</h3><button type="button" onClick={() => void load()} className="rounded-md p-1.5 text-muted hover:bg-lavender" aria-label="새로고침"><RefreshCw size={16} /></button></div><div className="mt-2 space-y-2">{data.sources.map((source) => <a key={source.id} href={source.originalUrl} target="_blank" rel="noreferrer" className="block rounded-xl border border-line p-3 hover:bg-[#FAF8FF]"><div className="flex gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${source.state === "ACTIVE" ? "bg-[#3B8E74]" : "bg-[#D69C2F]"}`} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#4D405F]">{source.displayName}</span><span className="mt-1 block text-xs text-muted">{source.state === "ACTIVE" ? "준비됨" : "처리 중"}</span></span>{source.originalUrl && <ExternalLink size={15} className="shrink-0 text-muted" />}</div></a>)}{data.sources.length === 0 && <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">표시할 소스가 없습니다.</p>}</div></>}
    </div>
    <div className="border-t border-line p-4"><a href={notebookUrl} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet px-4 py-3 text-sm font-bold text-white hover:bg-[#6533b1]"><ExternalLink size={16} />Google Notebook에서 열기</a></div>
  </aside>;
}

function PanelMessage({ title, detail, action, onAction }: { title: string; detail: string; action?: string; onAction?: () => void }) {
  return <div className="rounded-xl border border-line bg-[#FAF8FF] p-5 text-center"><BookOpen size={24} className="mx-auto text-violet" /><h3 className="mt-3 text-sm font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{detail}</p>{action && <button type="button" onClick={onAction} className="mt-4 rounded-lg bg-violet px-3 py-2 text-sm font-bold text-white hover:bg-[#6533b1]">{action}</button>}</div>;
}
