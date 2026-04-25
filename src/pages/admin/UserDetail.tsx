import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogsTable } from "@/components/LogsTable";
import { EmptyState, StatCard } from "@/components/StatCard";
import { users, logs } from "@/lib/mock-data";
import { ArrowLeft, CheckCircle2, Clock, FileText, Mail } from "lucide-react";

export default function UserDetail() {
  const { id } = useParams();
  const u = users.find((x) => x.id === id) ?? users[0];
  const userLogs = logs.filter((l) => l.user === u.name);
  const completed = userLogs.filter((l) => l.status === "completed").length;
  const inProgress = userLogs.filter((l) => l.status === "in_progress").length;

  return (
    <AppShell role="admin">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link to="/admin/users"><ArrowLeft className="mr-1 h-4 w-4" /> Back to users</Link>
        </Button>
      </div>

      <header className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-card">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-accent text-accent-foreground text-lg font-semibold">
            {u.name.split(" ").map((p) => p[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight">{u.name}</h1>
          <p className="text-sm text-muted-foreground">{u.team} · {u.role} · joined {u.joinedAt}</p>
        </div>
        <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Message</Button>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Total logs" value={userLogs.length} icon={FileText} />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} tone="success" />
        <StatCard label="In progress" value={inProgress} icon={Clock} tone="info" />
      </div>

      <h2 className="mb-3 text-sm font-semibold">Logs</h2>
      {userLogs.length ? (
        <LogsTable logs={userLogs} basePath="/admin/logs" />
      ) : (
        <EmptyState icon={FileText} title="No logs yet" description="This user hasn't created any work logs." />
      )}
    </AppShell>
  );
}