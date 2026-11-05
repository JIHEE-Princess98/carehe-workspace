"use client";

import { ArrowUpRight, CheckCircle2, ClipboardList, Clock3, FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "../../components/WorkspaceShell";

const metrics = [
  { label: "전체 기획문서", value: "24", hint: "이번 주 +3", icon: FileText },
  { label: "전체 요구사항", value: "124", hint: "이번 주 +12", icon: ClipboardList },
  { label: "검토 필요", value: "8", hint: "확인 대기", icon: Clock3 },
  { label: "처리 완료", value: "86", hint: "완료율 69%", icon: CheckCircle2 },
];

const activity = [
  { title: "건강관리 데이터 UI 개편", detail: "요구사항 2건이 수정되었습니다.", time: "10분 전", version: "v3" },
  { title: "운영자 권한 정책 정리", detail: "검토 요청 상태로 변경되었습니다.", time: "2시간 전", version: "v2" },
  { title: "검진 결과 조회 흐름", detail: "새 기획문서가 등록되었습니다.", time: "어제", version: "v1" },
];

export default function Dashboard() {
  const router = useRouter();
  return (
    <WorkspaceShell pageTitle="대시보드">
      <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-7">
        <section className="mb-8 flex flex-col gap-5 border-b border-line pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[.14em] text-violet">WORKSPACE / OVERVIEW</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">업무 현황</h1>
            <p className="mt-2 text-sm text-muted">기획 문서와 요구사항의 변경 흐름을 한눈에 확인하세요.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/planning")}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-[#5D5076] hover:bg-lavender"
            >
              <FileText size={16} />
              기획문서 등록
            </button>
          </div>
        </section>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-xl border border-line bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#665A79]">{item.label}</span>
                  <Icon size={18} className="text-violet" />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight">{item.value}</p>
                <p className="mt-2 text-xs text-muted">{item.hint}</p>
              </article>
            );
          })}
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
          <article className="surface rounded-xl p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-violet">RECENT DOCUMENTS</p>
                <h2 className="mt-1 text-lg font-bold">최근 변경된 문서</h2>
              </div>
              <button onClick={() => router.push("/planning")} className="text-sm font-semibold text-violet">
                전체 보기
              </button>
            </div>
            <div className="mt-5 divide-y divide-line">
              {activity.map((item) => (
                <button
                  key={item.title}
                  onClick={() => router.push("/planning")}
                  className="flex w-full items-center gap-4 py-4 text-left hover:bg-[#FCFBFF]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lavender text-violet">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 truncate text-xs text-muted">{item.detail}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-lavender px-2 py-1 text-xs font-semibold text-violet">
                      {item.version}
                    </span>
                    <p className="mt-2 text-xs text-muted">{item.time}</p>
                  </div>
                </button>
              ))}
            </div>
          </article>
          <article className="rounded-xl border border-line bg-[#FAF8FF] p-5 md:p-6">
            <div className="flex items-center gap-2 text-violet">
              <Sparkles size={18} />
              <span className="text-xs font-semibold tracking-wide">FOCUS</span>
            </div>
            <h2 className="mt-2 text-lg font-bold">검토가 필요한 요구사항</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              오늘 확인이 필요한 요구사항이 8건 있습니다. 담당자와 진행 상태를 정리해 보세요.
            </p>
            <div className="mt-5 space-y-3">
              {["검색 조건 UI 개선", "운영자 권한 정책 정리", "PDF 다운로드 기능"].map((title, index) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-lg border border-white bg-white/80 px-3 py-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lavender text-xs font-bold text-violet">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
                  <ArrowUpRight size={16} className="text-muted" />
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/planning")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet"
            >
              요구사항 확인 <ArrowUpRight size={15} />
            </button>
          </article>
        </section>
      </div>
    </WorkspaceShell>
  );
}
