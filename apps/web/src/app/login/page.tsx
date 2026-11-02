"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers3,
  ShieldCheck,
  ChartNoAxesCombined,
  LockKeyhole,
} from "lucide-react";
import { Brand } from "../../components/Brand";
export default function Login() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim() || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    sessionStorage.setItem("issue-demo-user", id.trim());
    setLeaving(true);
    window.setTimeout(() => router.push("/dashboard"), 240);
  }
  return (
    <main className={`min-h-dvh bg-[radial-gradient(circle_at_15%_15%,#E8D8FF,transparent_42%),radial-gradient(circle_at_90%_85%,#DED3FF,transparent_45%),#F7F5FF] p-3 sm:p-6 ${leaving ? "login-leaving" : ""}`}>
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[32px] border border-white/90 bg-white/75 shadow-[0_28px_80px_rgba(70,35,125,.14)] sm:min-h-[calc(100dvh-3rem)] lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#F1EEF6] via-[#FAF9FC] to-[#E8E2EF] p-12 lg:flex lg:flex-col lg:justify-between">
          <Brand />
          <div className="relative z-10">
            <div className="mb-7 inline-flex rounded-full border border-[#D8CEE6] bg-white/70 px-4 py-2 text-[11px] font-bold tracking-[.16em] text-[#735692]">
              PROJECT · REQUIREMENT · ISSUE
            </div>
            <h1 className="text-[clamp(42px,4vw,66px)] font-semibold leading-[1.2] tracking-[-.045em] text-[#30263C]">
              일의 흐름을,
              <br />
              <span className="text-[#6B4A91]">더 선명하게.</span>
            </h1>
            <p className="mt-6 max-w-md text-[17px] leading-8 text-[#70667D]">
              프로젝트와 요구사항, 결함 관리까지.
              <br />
              흩어진 업무를 하나의 공간에서 연결하세요.
            </p>
            <div className="relative mt-12 max-w-lg rounded-[24px] border border-white/90 bg-white/75 p-6 shadow-[0_16px_42px_rgba(67,45,98,.08)] backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <span className="font-bold">이번 주 업무 현황</span>
                <span className="rounded-full bg-lavender px-3 py-1 text-xs font-bold text-violet">
                  Overview
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["08", "진행 프로젝트"],
                  ["23", "미처리 이슈"],
                  ["86", "처리 완료"],
                ].map(([v, k]) => (
                  <div key={k} className="rounded-xl bg-[#F7F4FE] p-3">
                    <div className="text-3xl font-bold text-[#6B4A91]">
                      {v}
                    </div>
                    <div className="mt-1 text-xs text-muted">{k}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex h-20 items-end gap-2">
                {[30, 46, 38, 65, 50, 75, 58, 87, 67, 96, 79, 100].map(
                  (v, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-[#8463AB] to-[#DCD2E9]"
                      style={{ height: `${v}%` }}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="relative z-10 flex gap-7 text-sm text-[#625775]">
            <span className="flex items-center gap-2">
              <Layers3 size={17} /> 통합 업무 관리
            </span>
            <span className="flex items-center gap-2">
              <ChartNoAxesCombined size={17} /> 진행 현황 한눈에
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={17} /> 권한 기반 접근
            </span>
          </div>
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border-[55px] border-white/35" />
        </section>
        <section className="flex items-center justify-center px-6 py-14 sm:px-14">
          <div className="w-full max-w-[410px]">
            <div className="mb-12 lg:hidden">
              <Brand />
            </div>
            <div className="mb-10">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender text-violet">
                <LockKeyhole size={24} />
              </div>
              <p className="mb-2 text-sm font-bold text-violet">WELCOME BACK</p>
              <h2 className="text-4xl font-extrabold tracking-tight">
                다시 만나 반가워요.
              </h2>
              <p className="mt-3 leading-7 text-muted">
                계정으로 로그인하고 업무를 이어가세요.
              </p>
            </div>
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label
                  htmlFor="login-id"
                  className="mb-2 block text-sm font-bold"
                >
                  아이디
                </label>
                <input
                  id="login-id"
                  className="field"
                  autoComplete="username"
                  placeholder="아이디를 입력해 주세요"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-bold"
                >
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    className="field pr-12"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="비밀번호를 입력해 주세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={show ? "비밀번호 숨기기" : "비밀번호 표시"}
                    className="absolute right-4 top-3 text-muted"
                    onClick={() => setShow(!show)}
                  >
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}
              <button disabled={leaving} className="primary flex w-full items-center justify-center gap-2">
                로그인 <ArrowRight size={18} />
              </button>
            </form>
            <div className="mt-7 rounded-xl border border-[#E4D8FA] bg-[#F8F4FF] p-4 text-sm leading-6 text-[#5C4C79]">
              <div className="mb-1 flex items-center gap-2 font-bold">
                <CheckCircle2 size={16} /> 프론트엔드 데모 모드
              </div>
              현재는 실제 인증 API가 연결되지 않았습니다. 임의의 아이디와
              비밀번호로 화면을 체험할 수 있습니다.
            </div>
            <p className="mt-12 text-center text-xs text-muted">
              © Carehe Issue Workspace
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
