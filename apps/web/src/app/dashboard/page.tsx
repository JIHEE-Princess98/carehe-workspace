"use client";

import { AlertCircle, CheckCircle2, ClipboardList, FolderKanban } from "lucide-react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { summary } from "../../lib/mock";

const icons = [FolderKanban, ClipboardList, AlertCircle, CheckCircle2];

export default function Dashboard() {
  return (
    <WorkspaceShell pageTitle="대시보드">
      <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-7">
        <section className="mb-6">
          <p className="mb-1 text-xs font-semibold tracking-wide text-violet">WORKSPACE / OVERVIEW</p>
          <h1 className="text-[26px] font-bold tracking-tight md:text-[30px]">대시보드</h1>
          <p className="mt-1 text-sm text-[#655B76]">프로젝트와 이슈 현황을 확인하세요.</p>
        </section>
        <section aria-label="주요 현황" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((item, index) => {
            const Icon = icons[index];
            return (
              <article key={item.label} className="surface rounded-xl p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[#665A79]">{item.label}</span>
                  <div className="text-violet">
                    <Icon size={19} />
                  </div>
                </div>
                <div className="text-[34px] font-extrabold tracking-tight">
                  {item.value}
                  <span className="ml-1 text-sm font-medium text-muted">건</span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  <span className="font-bold text-[#287D61]">{item.delta}</span> 지난 기간 대비 · 예시
                </p>
              </article>
            );
          })}
        </section>
      </div>
    </WorkspaceShell>
  );
}
