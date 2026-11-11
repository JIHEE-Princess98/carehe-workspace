"use client";

import { AlertTriangle, X } from "lucide-react";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "default";
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ title, description, confirmLabel, tone = "default", onClose, onConfirm }: ConfirmDialogProps) {
  const confirmClass = tone === "danger" ? "bg-[#C83E55] hover:bg-[#A12E41]" : "bg-violet hover:bg-[#6533b1]";
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 p-4" role="presentation"><section role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone === "danger" ? "bg-[#FFF0F2] text-[#C83E55]" : "bg-lavender text-violet"}`}><AlertTriangle size={20} /></span><button type="button" onClick={onClose} aria-label="닫기" className="rounded-lg p-2 text-muted hover:bg-lavender"><X size={18} /></button></div><h2 id="confirm-dialog-title" className="mt-5 text-lg font-bold text-[#211A35]">{title}</h2><p className="mt-2 text-sm leading-6 text-muted">{description}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-muted hover:bg-lavender">취소</button><button type="button" onClick={onConfirm} className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white ${confirmClass}`}>{confirmLabel}</button></div></section></div>;
}
