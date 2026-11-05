"use client";

import { Download, History, RotateCcw, X } from "lucide-react";
import { useState } from "react";

type VersionHistoryDrawerProps = { title: string; onClose: () => void };

const versions = [
  { version: "v3", date: "2026.11.02 14:20", user: "\uAE40\uC9C0\uD76C", changes: ["\uC0C1\uD0DC\uB97C \uC9C4\uD589 \uC911\uC73C\uB85C \uBCC0\uACBD", "\uC0C1\uC138 \uB0B4\uC6A9 \uBCF4\uC644"], files: ["\uC694\uAD6C\uC0AC\uD56D_\uC815\uB9AC.pdf"] },
  { version: "v2", date: "2026.10.30 10:05", user: "\uC774\uB3C4\uC724", changes: ["\uB2F4\uB2F9\uC790 \uBCC0\uACBD", "\uCCA8\uBD80\uD30C\uC77C \uCD94\uAC00"], files: ["wireframe.png"] },
  { version: "v1", date: "2026.10.20 16:40", user: "\uAE40\uC9C0\uD76C", changes: ["\uCD5C\uCD08 \uB4F1\uB85D"], files: [] },
];

export function VersionHistoryDrawer({ title, onClose }: VersionHistoryDrawerProps) {
  const [selected, setSelected] = useState(versions[0]);
  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-[#211A35]/30">
      <aside aria-label={"\uBC84\uC804 \uC774\uB825"} className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-line p-6">
          <div><p className="text-xs font-semibold text-violet">VERSION HISTORY · DEMO</p><h2 className="mt-1 text-lg font-bold text-[#211A35]">{"\uBCC0\uACBD \uC774\uB825"}</h2><p className="mt-1 truncate text-sm text-muted">{title}</p></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-lavender" aria-label={"\uB2EB\uAE30"}><X size={20} /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mb-5 rounded-xl bg-lavender px-4 py-3 text-sm text-[#4C237F]"><History size={16} className="mr-2 inline" />{"\uD604\uC7AC \uBC84\uC804 "}<strong>{versions[0].version}</strong>{" · API \uC5F0\uB3D9 \uC804 \uB370\uBAA8 \uC774\uB825\uC785\uB2C8\uB2E4."}</div>
          <div className="space-y-2">{versions.map((item) => <button type="button" key={item.version} onClick={() => setSelected(item)} className={`w-full rounded-xl border p-4 text-left transition ${selected.version === item.version ? "border-violet bg-lavender" : "border-line hover:border-violet"}`}><div className="flex items-center justify-between"><strong className="text-violet">{item.version}</strong><span className="text-xs text-[#978BAA]">{item.date}</span></div><p className="mt-1 text-sm text-[#4D405F]">{item.user}</p><p className="mt-2 text-xs text-muted">{item.changes.join(" · ")}</p></button>)}</div>
          <section className="mt-6 rounded-xl border border-line p-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-[#211A35]">{selected.version} {"\uBCC0\uACBD \uB0B4\uC6A9"}</h3><span className="text-xs text-[#978BAA]">{"\uD604\uC7AC \uBC84\uC804\uACFC \uBE44\uAD50"}</span></div><ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[#625775]">{selected.changes.map((change) => <li key={change}>{change}</li>)}</ul><div className="mt-4 border-t border-[#F0ECF6] pt-3"><p className="text-xs font-medium text-muted">{"\uCCA8\uBD80\uD30C\uC77C"}</p>{selected.files.length ? selected.files.map((name) => <div key={name} className="mt-2 flex items-center justify-between text-sm text-[#4D405F]">{name}<Download size={15} className="text-[#978BAA]" /></div>) : <p className="mt-2 text-sm text-[#978BAA]">{"\uCCA8\uBD80\uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."}</p>}</div></section>
        </div>
        <footer className="border-t border-line p-4"><button type="button" className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#CDBAEF] px-4 py-2.5 text-sm font-semibold text-violet hover:bg-lavender"><RotateCcw size={16} />{selected.version}{"\uC73C\uB85C \uBCF5\uC6D0"}</button><p className="mt-2 text-center text-xs text-[#978BAA]">{"\uBCF5\uC6D0\uC740 API \uC5F0\uB3D9 \uD6C4 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."}</p></footer>
      </aside>
    </div>
  );
}
