"use client";

import { AlertTriangle, X } from "lucide-react";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "default" | "danger";
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ title, description, confirmLabel = "확인", tone = "default", onClose, onConfirm }: ConfirmDialogProps) {
  const danger = tone === "danger";
  return <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button type="button" className="absolute inset-0 bg-[#211A35]/35 backdrop-blur-[1px]" aria-label="확인 창 닫기" onClick={onClose}/><section role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="relative w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-2xl"><div className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-rose-50 text-rose-500" : "bg-lavender text-violet"}`}><AlertTriangle size={19}/></span><div className="min-w-0 flex-1"><h2 id="confirm-dialog-title" className="text-lg font-bold text-[#211A35]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#625775]">{description}</p></div><button type="button" onClick={onClose} className="rounded-lg p-1 text-[#978BAA] hover:bg-lavender" aria-label="닫기"><X size={18}/></button></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-[#625775] hover:bg-[#FAF8FF]">취소</button><button type="button" onClick={onConfirm} className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${danger ? "bg-rose-500 hover:bg-rose-600" : "bg-violet hover:bg-[#6533B1]"}`}>{confirmLabel}</button></div></section></div>;
}