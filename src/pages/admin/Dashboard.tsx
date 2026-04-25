import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { activity, formatRelative, logs, todayLogs, users } from "@/lib/mock-data";
import { ArrowRight, CheckCircle2, Clock, FileText, Users } from "lucide-react";

export default function AdminDashboard() {
  const completed = logs.filter((l) => l.status === "completed").length;
  const inProgress = logs.filter((l) => l.status === "in_progress").length;

  return (
    <AppShell role="admin" title="Admin overview" subtitle="Track team productivity at a glance.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active users" value={users.length - 1} icon={Users} delta={{ value: "+3", positive: true }} />
        <StatCard label="Logs today" value={todayLogs.length} icon={FileText} tone="info" delta={{ value: "+18%", positive: true }} />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} tone="success" delta={{ value: "+9%", positive: true }} />
        <StatCard label="In progress" value={inProgress} icon={Clock} tone="warning" delta={{ value: "+4%", positive: true }} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Today's activity</h2>
              <p className="text-xs text-muted-foreground">Latest logs across the team</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/admin/today">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </header>
          <ul className="divide-y divide-border">
            {logs.slice(0, 6).map((log) => (
              <li key={log.id}>
                <Link to={`/admin/logs/${log.id}`} className="grid grid-cols-12 items-center gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/50">
                  <div className="col-span-6 min-w-0">
                    <p className="truncate text-sm font-medium">{log.title}</p>
                    <p className="text-xs text-muted-foreground">{log.user}</p>
                  </div>
                  <div className="col-span-3"><StatusBadge status={log.status} /></div>
                  <div className="col-span-3 text-right text-xs text-muted-foreground">{formatRelative(log.date)}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-card">
          <header className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Audit feed</h2>
            <p className="text-xs text-muted-foreground">Recent events</p>
          </header>
          <ul className="divide-y divide-border">
            {activity.map((e) => (
              <li key={e.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{e.actor}</span>{" "}
                    <span className="text-muted-foreground">{e.action}</span>{" "}
                    <span className="font-medium">{e.target}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatRelative(e.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}