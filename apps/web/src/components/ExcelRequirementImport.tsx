"use client";

import ExcelJS from "exceljs";
import { Download, FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

type ExcelRequirementImportProps = { onClose: () => void };

const columns = ["\uC694\uAD6C\uC0AC\uD56D \uC81C\uBAA9", "\uAD6C\uBD84", "\uC6B0\uC120\uC21C\uC704", "\uC9C4\uD589\uC0C1\uD0DC", "\uB2F4\uB2F9\uC790", "\uC11C\uBE44\uC2A4", "\uC801\uC6A9 \uD658\uACBD", "\uC0C1\uC138 \uC694\uAD6C\uC0AC\uD56D"];
const sample = ["\uAC80\uC0C9 \uC870\uAC74 UI \uAC1C\uC120", "\uAC1C\uC120", "\uC0C1", "\uC9C4\uD589 \uC911", "\uAE40\uC9C0\uD76C", "USER", "STAGING", "\uCD08\uAE30\uD654 \uBC0F \uBCF5\uC218 \uC870\uAC74 \uC120\uD0DD \uD750\uB984\uC744 \uAC1C\uC120\uD569\uB2C8\uB2E4."];

async function downloadTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("요구사항 등록");
  sheet.addRow(columns);
  sheet.addRow(sample);
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.getRow(1).font = { bold: true, color: { argb: "FF4C237F" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F1FC" } };
  sheet.columns = [{ width: 30 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 16 }, { width: 14 }, { width: 16 }, { width: 54 }];
  const lists: Record<string, string> = { B: '"신규,개선,기타"', C: '"낮음,보통,높음"', D: '"진행 전,논의 중,기획 확정,진행 중,완료"', F: '"ADMIN,USER"', G: '"DEV,STAGING,LIVE"' };
  Object.entries(lists).forEach(([column, formulae]) => { for (let row = 2; row <= 201; row += 1) sheet.getCell(`${column}${row}`).dataValidation = { type: "list", allowBlank: false, formulae: [formulae] }; });
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "requirement-import-sample.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}

export function ExcelRequirementImport({ onClose }: ExcelRequirementImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-[#211A35]/30">
      <aside role="dialog" aria-modal="true" aria-label={"\uC5D1\uC140\uB85C \uC694\uAD6C\uC0AC\uD56D \uB4F1\uB85D"} className="flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-line px-6 py-5"><div><p className="text-xs font-semibold tracking-wide text-violet">EXCEL IMPORT · DEMO</p><h2 className="mt-1 text-xl font-bold text-[#211A35]">{"\uC5D1\uC140\uB85C \uB4F1\uB85D\uD558\uAE30"}</h2><p className="mt-1 text-sm text-muted">{"Tab 1. 2026\uCF00\uC5B4\uD574 Admin \uC591\uC2DD\uC744 \uAE30\uC900\uC73C\uB85C \uC791\uC131\uD55C \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694."}</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-lavender" aria-label={"\uB2EB\uAE30"}><X size={20} /></button></header>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <section className="rounded-xl border border-line bg-[#FAF8FF] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender text-violet"><FileSpreadsheet size={20} /></span><div><h3 className="font-bold text-[#211A35]">{"\uC5D1\uC140 \uC591\uC2DD"}</h3><p className="text-sm text-muted">{"\uB4F1\uB85D \uC804 \uC591\uC2DD\uACFC \uD544\uC218 \uC5F4\uC744 \uD655\uC778\uD558\uC138\uC694."}</p></div></div><button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-lg border border-[#CDBAEF] bg-white px-3 py-2 text-sm font-semibold text-violet hover:bg-lavender"><Download size={16} />{"\uC0D8\uD50C \uC591\uC2DD \uB2E4\uC6B4\uB85C\uB4DC"}</button></div></section>
          <input ref={inputRef} type="file" accept=".xlsx,.xls" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 flex w-full flex-col items-center rounded-xl border border-dashed border-[#DAD3E9] bg-white px-5 py-7 text-center hover:border-violet hover:bg-lavender/40"><UploadCloud size={22} className="mb-2 text-violet" /><span className="font-semibold text-[#4D405F]">{"\uC5D1\uC140 \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694"}</span><span className="mt-1 text-xs text-[#978BAA]">.xlsx, .xls · {"\uC120\uD0DD\uD55C \uD30C\uC77C\uC740 \uC2E4\uC81C\uB85C \uC5C5\uB85C\uB4DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."}</span></button>
          {file && <div className="mt-3 rounded-lg border border-[#CDBAEF] bg-lavender px-4 py-3 text-sm text-[#4C237F]"><strong>{file.name}</strong> · {(file.size / 1024).toFixed(1)} KB · {"\uC5C5\uB85C\uB4DC \uB300\uAE30 (\uB370\uBAA8)"}</div>}
          <section className="mt-7"><div className="flex items-baseline justify-between"><h3 className="font-bold text-[#211A35]">{"\uC0D8\uD50C \uC591\uC2DD \uBBF8\uB9AC\uBCF4\uAE30"}</h3><span className="text-xs text-[#978BAA]">{"\uD544\uC218: \uC694\uAD6C\uC0AC\uD56D \uC81C\uBAA9, \uAD6C\uBD84, \uC6B0\uC120\uC21C\uC704, \uC9C4\uD589\uC0C1\uD0DC, \uC11C\uBE44\uC2A4, \uC801\uC6A9 \uD658\uACBD"}</span></div><div className="mt-3 overflow-x-auto rounded-xl border border-line"><table className="min-w-[1280px] w-full text-left text-xs"><thead className="bg-[#F5F1FC] text-[#625775]"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap border-b border-line px-3 py-3 font-bold">{column}</th>)}</tr></thead><tbody><tr className="text-[#4D405F]">{sample.map((value, index) => <td key={columns[index]} className="max-w-[220px] border-b border-[#F0ECF6] px-3 py-3 align-top leading-5">{value}</td>)}</tr></tbody></table></div></section>
        </div>
        <footer className="flex justify-end gap-2 border-t border-line p-5"><button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-[#625775] hover:bg-lavender">{"\uCDE8\uC18C"}</button><button type="button" disabled={!file} className="rounded-lg bg-violet px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{"\uC591\uC2DD \uAC80\uC99D \uD6C4 \uB4F1\uB85D"}</button></footer>
      </aside>
    </div>
  );
}
