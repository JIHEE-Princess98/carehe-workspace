import { LOGO_URL } from "../lib/brand";
export function Brand({
  compact = false,
  showWorkspaceLabel = true,
}: {
  compact?: boolean;
  showWorkspaceLabel?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={LOGO_URL}
        alt="Carehe 로고"
        width={compact ? 112 : 145}
        height={32}
        className="max-h-9 w-auto max-w-[145px] object-contain"
      />
      {showWorkspaceLabel && (
        <span className="hidden border-l border-line pl-3 text-xs font-semibold tracking-wide text-violet sm:block">
          ISSUE WORKSPACE
        </span>
      )}
    </div>
  );
}
