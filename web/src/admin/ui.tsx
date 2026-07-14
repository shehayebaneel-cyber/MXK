import { ReactNode } from "react";

export const inputCls = "w-full rounded-lg border border-line bg-ink-3 px-3 py-2 text-sm text-chrome outline-none focus:border-blue placeholder:text-fog/50";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-fog">{label}</span>
      {children}
    </label>
  );
}

export function PageTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <h1 className="display text-4xl text-chrome">{title}</h1>
      {action}
    </div>
  );
}

export const btnPrimary = "rounded-full bg-chrome px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-60";
export const btnGhost = "rounded-full border border-line px-4 py-2 text-sm font-semibold text-fog transition hover:text-chrome";
