import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ApiError, api, getToken, setToken } from "../lib/api";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/releases", label: "Music" },
  { to: "/admin/events", label: "Live" },
  { to: "/admin/tickets", label: "Tickets" },
  { to: "/admin/archive", label: "Archive" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/settings", label: "Settings" },
];

export function AdminLayout() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      nav("/admin/login");
      return;
    }
    api
      .get("/api/admin/overview")
      .then(() => setReady(true))
      .catch((e) => {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setToken(null);
          nav("/admin/login");
        } else setReady(true);
      });
  }, [nav]);

  const logout = () => {
    setToken(null);
    nav("/admin/login");
  };
  if (!ready) return <div className="text-fog flex min-h-screen items-center justify-center">Loading…</div>;

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-ink-3 text-chrome" : "text-fog hover:bg-ink-3/60 hover:text-chrome"}`;

  return (
    <div className="bg-ink flex min-h-screen">
      <aside className="border-line bg-ink-2 sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r p-3 md:flex">
        <Link to="/" className="display text-chrome px-2 py-3 text-2xl">
          MXK
        </Link>
        <nav className="mt-2 flex-1 space-y-1">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="text-fog hover:text-chrome rounded-lg px-3 py-2 text-sm">
          ↗ View site
        </Link>
        <button onClick={logout} className="text-fog hover:text-red mt-1 rounded-lg px-3 py-2 text-left text-sm">
          Sign out
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-line bg-ink-2 sticky top-0 z-20 flex items-center justify-between border-b px-4 py-3 md:hidden">
          <button onClick={() => setOpen((v) => !v)} className="text-chrome">
            ☰
          </button>
          <span className="display text-chrome text-xl">MXK Admin</span>
          <button onClick={logout} className="text-red text-sm">
            Sign out
          </button>
        </header>
        {open && (
          <nav className="border-line bg-ink-2 flex gap-1 overflow-x-auto border-b px-3 py-2 md:hidden">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${isActive ? "bg-chrome text-ink" : "bg-ink-3 text-fog"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
        <main className="mx-auto max-w-5xl p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
