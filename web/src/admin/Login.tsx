import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { useMeta } from "../lib/useMeta";

export function AdminLogin() {
  useMeta("MXK Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await api.post<{ token: string }>("/api/admin/login", { email, password });
      setToken(r.token);
      nav("/admin");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  const field = "w-full rounded-lg border border-line bg-ink-3 px-4 py-3 text-sm text-chrome outline-none focus:border-blue";
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glow absolute inset-0 -z-10 opacity-40" />
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-line bg-ink-2 p-8">
        <p className="display text-3xl text-chrome">MXK</p>
        <p className="mt-1 text-sm text-fog">Admin dashboard</p>
        <div className="mt-6 space-y-3">
          <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          <input className={field} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {err && <p className="text-sm text-red">{err}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-chrome px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-60">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
