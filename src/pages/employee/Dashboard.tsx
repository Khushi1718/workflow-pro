import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, FileText, PlusCircle, ListChecks, ArrowRight } from "lucide-react";
import { activity, formatRelative, formatTime, myLogs } from "@/lib/mock-data";

export default function EmployeeDashboard() {
  const completed = myLogs.filter((l) => l.status === "completed").length;
  const inProgress = myLogs.filter((l) => l.status === "in_progress").length;
  const recent = myLogs.slice(0, 5);

  return (
    <AppShell
      role="employee"
      title="Good afternoon, Ava"
      subtitle="Here's a quick look at your work this week."
      actions={
        <Button asChild>
          <Link to="/employee/add-log"><PlusCircle className="mr-2 h-4 w-4" /> New work log</Link>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total logs" value={myLogs.length} icon={FileText} delta={{ value: "+12%", positive: true }} />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} tone="success" delta={{ value: "+8%", positive: true }} />
        <StatCard label="In progress" value={inProgress} icon={Clock} tone="info" delta={{ value: "-2%", positive: false }} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Recent logs</h2>
              <p className="text-xs text-muted-foreground">Your latest work entries</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/employee/logs">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </header>
          <ul className="divide-y divide-border">
            {recent.map((log) => (
              <li key={log.id}>
                <Link
                  to={`/employee/logs/${log.id}`}
                  className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <ListChecks className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{log.title}</p>
                      <StatusBadge status={log.status} />
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{log.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatTime(log.date)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-card">
          <header className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Activity</h2>
            <p className="text-xs text-muted-foreground">What your team is up to</p>
          </header>
          <ul className="divide-y divide-border">
            {activity.slice(0, 6).map((e) => (
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