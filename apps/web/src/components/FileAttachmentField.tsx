"use client";

import { Download, FileText, Paperclip, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

export type LocalAttachment = { name: string; size: number };
type FileAttachmentFieldProps = { label?: string; onFilesChange?: (files: LocalAttachment[]) => void };

function formatSize(size: number) {
  return size < 1024 * 1024 ? `${Math.max(1, Math.ceil(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function FileAttachmentField({ label = "\uCCA8\uBD80\uD30C\uC77C", onFilesChange }: FileAttachmentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  function setNextFiles(next: File[]) {
    setFiles(next);
    onFilesChange?.(next.map((file) => ({ name: file.name, size: file.size })));
  }

  function addFiles(next: FileList | null) {
    if (!next) return;
    const merged = [...files, ...Array.from(next)].filter((file, index, all) => all.findIndex((item) => item.name === file.name && item.size === file.size) === index);
    setNextFiles(merged);
  }

  return (
    <section aria-label={label}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#4D405F]">{label}</span>
        <span className="text-right text-xs text-[#978BAA]">{"\uB370\uBAA8: \uC774 \uD654\uBA74\uC5D0\uC11C\uB9CC \uC720\uC9C0\uB429\uB2C8\uB2E4"}</span>
      </div>
      <input ref={inputRef} type="file" multiple className="sr-only" onChange={(event) => addFiles(event.target.files)} />
      <button type="button" onClick={() => inputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }} className={`flex w-full flex-col items-center rounded-xl border border-dashed px-4 py-5 text-center transition ${dragging ? "border-violet bg-lavender" : "border-[#DAD3E9] bg-[#FAF8FF]/70 hover:border-violet hover:bg-lavender/50"}`}>
        <UploadCloud size={20} className="mb-2 text-violet" />
        <span className="text-sm font-semibold text-[#4D405F]">{"\uD30C\uC77C\uC744 \uB04C\uC5B4 \uB193\uAC70\uB098 \uC120\uD0DD\uD558\uC138\uC694"}</span>
        <span className="mt-1 text-xs text-[#978BAA]">{"\uC5EC\uB7EC \uD30C\uC77C \uC120\uD0DD \uAC00\uB2A5 \u00B7 \uC2E4\uC81C \uC5C5\uB85C\uB4DC\uB294 API \uC5F0\uB3D9 \uD6C4 \uC81C\uACF5\uB429\uB2C8\uB2E4"}</span>
      </button>
      {files.length > 0 && <ul className="mt-3 space-y-2">{files.map((file) => <li key={`${file.name}-${file.size}`} className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2"><FileText size={16} className="shrink-0 text-violet" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#4D405F]">{file.name}</p><p className="text-xs text-[#978BAA]">{formatSize(file.size)} {"\u00B7 \uC120\uD0DD\uB428 (\uC5C5\uB85C\uB4DC \uB300\uAE30)"}</p></div><button type="button" title={"\uB2E4\uC6B4\uB85C\uB4DC\uB294 \uC800\uC7A5\uB41C \uCCA8\uBD80\uD30C\uC77C\uC5D0\uC11C \uC81C\uACF5\uB429\uB2C8\uB2E4"} aria-label={`${file.name} \uB2E4\uC6B4\uB85C\uB4DC`} className="rounded p-1.5 text-[#978BAA]" disabled><Download size={15} /></button><button type="button" onClick={() => setNextFiles(files.filter((item) => item !== file))} aria-label={`${file.name} \uC0AD\uC81C`} className="rounded p-1.5 text-[#978BAA] hover:bg-rose-50 hover:text-rose-500"><Trash2 size={15} /></button></li>)}</ul>}
      {files.length === 0 && <div className="mt-2 flex items-center gap-1.5 text-xs text-[#978BAA]"><Paperclip size={13} />{"\uCCA8\uBD80\uB41C \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."}</div>}
    </section>
  );
}
