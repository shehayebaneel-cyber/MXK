import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import { PageTitle } from "./ui";

type Overview = { releases: number; events: number; bookings: number; newBookings: number; archive: number };

export function AdminDashboard() {
  useMeta("Dashboard — MXK Admin");
  const [o, setO] = useState<Overview | null>(null);
  useEffect(() => { api.get<Overview>("/api/admin/overview").then(setO).catch(() => {}); }, []);

  const cards = [
    { label: "Releases", value: o?.releases, to: "/admin/releases" },
    { label: "Live shows", value: o?.events, to: "/admin/events" },
    { label: "Archive items", value: o?.archive, to: "/admin/archive" },
    { label: "New bookings", value: o?.newBookings, to: "/admin/bookings", alert: (o?.newBookings ?? 0) > 0 },
  ];

  return (
    <div>
      <PageTitle title="Dashboard" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-2xl border border-line bg-ink-2 p-5 transition hover:border-blue">
            <p className="text-sm text-fog">{c.label}</p>
            <p className={`mt-1 display text-4xl ${c.alert ? "text-blue" : "text-chrome"}`}>{c.value ?? "—"}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Add a release", "/admin/releases"], ["Add a show", "/admin/events"],
          ["Add archive media", "/admin/archive"], ["Edit homepage & bio", "/admin/settings"],
          ["View bookings", "/admin/bookings"], ["Open live site ↗", "/"],
        ].map(([label, to]) => (
          <Link key={label} to={to} className="rounded-xl border border-line bg-ink-2 px-5 py-4 text-sm font-semibold text-chrome transition hover:border-blue">{label}</Link>
        ))}
      </div>
    </div>
  );
}
