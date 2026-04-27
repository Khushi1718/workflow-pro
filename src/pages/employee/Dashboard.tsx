import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, FileText, PlusCircle, ListChecks, ArrowRight, TrendingUp, PieChart, Loader2 } from "lucide-react";
import { auth, workLogs } from "@/lib/api";
import { getGreeting } from "@/lib/utils";
import { toast } from "sonner";

export default function EmployeeDashboard() {
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [myLogs, setMyLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and logs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get current user profile
        const profileResponse = await auth.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setCurrentEmployee(profileResponse.data);
        }

        // Get user's logs
        const logsResponse = await workLogs.getMyLogs(100, 0);
        if (logsResponse.success && logsResponse.data) {
          setMyLogs(logsResponse.data);

          // Calculate stats
          const completed = logsResponse.data.filter((l: any) => l.status === "completed").length;
          const inProgress = logsResponse.data.filter((l: any) => l.status === "in_progress").length;
          const pending = logsResponse.data.filter((l: any) => l.status === "pending").length;

          setStats({ completed, inProgress, pending });
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <AppShell role="employee" title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading your dashboard...</span>
        </div>
      </AppShell>
    );
  }

  const firstName = currentEmployee?.name?.split(" ").pop() || "User";
  const recent = myLogs.slice(0, 5);

  const total = myLogs.length || 1;
  const completedPerc = Math.round((stats.completed / total) * 100);
  const inProgressPerc = Math.round((stats.inProgress / total) * 100);
  const pendingPerc = 100 - completedPerc - inProgressPerc;

  return (
    <AppShell
      role="employee"
      title={`${getGreeting()}, ${firstName}`}
      subtitle="Here's a quick look at your work and productivity this week."
      actions={
        <Button asChild className="shadow-sm">
          <Link to="/employee/add-log"><PlusCircle className="mr-2 h-4 w-4" /> New work log</Link>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total logs" value={myLogs.length} icon={FileText} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="success" />
        <StatCard label="In progress" value={stats.inProgress} icon={Clock} tone="info" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card flex flex-col">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent work logs</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Your latest daily entries</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Link to="/employee/logs">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </header>
          <ul className="divide-y divide-border flex-1 overflow-y-auto">
            {recent.map((log) => (
              <li key={log._id || log.id}>
                <Link
                  to={`/employee/logs/${log._id || log.id}`}
                  className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground shadow-xs">
                    <ListChecks className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{log.title}</p>
                      <StatusBadge status={log.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground leading-relaxed">{log.accomplishments}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <header className="border-b border-border px-5 py-4 flex items-center justify-between bg-secondary/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">Weekly Output</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Logs submitted</p>
                </div>
              </div>
            </header>
            <div className="p-5 pt-8 h-[220px] flex items-end justify-between gap-3">
              {(() => {
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const today = new Date();
                const currentDay = today.getDay();
                const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
                const weekDays = Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(today);
                  d.setDate(today.getDate() - diffToMonday + i);
                  const dateStr = d.toDateString();
                  const dayLabel = dayNames[d.getDay()].charAt(0);
                  const count = myLogs.filter((l: any) => new Date(l.date).toDateString() === dateStr).length;
                  return { day: dayLabel, val: count };
                });
                const maxVal = Math.max(...weekDays.map(d => d.val), 1);
                return weekDays.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
                    <div className="absolute -top-6 text-[10px] font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-secondary px-1.5 py-0.5 rounded shadow-xs">
                      {d.val}
                    </div>
                    <div className="w-full bg-secondary/40 rounded-sm flex items-end justify-center h-32 relative overflow-hidden group-hover:bg-secondary/60 transition-colors">
                      <div
                        className="w-full bg-primary/80 rounded-sm transition-all duration-500 group-hover:bg-primary shadow-xs"
                        style={{ height: `${Math.round((d.val / maxVal) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium uppercase">{d.day}</span>
                  </div>
                ));
              })()}
            </div>
          </section>


          <section className="rounded-xl border border-border bg-card shadow-card">
            <header className="border-b border-border px-5 py-4 flex items-center gap-2 bg-secondary/10">
              <PieChart className="h-4 w-4 text-primary" />
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Status Breakdown</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Your logs by status</p>
              </div>
            </header>
            <div className="p-5 space-y-6">
              {/* Stacked Progress Bar */}
              <div className="flex h-2.5 w-full rounded-full overflow-hidden shadow-xs bg-secondary/40">
                <div className="bg-success transition-all duration-500" style={{ width: `${completedPerc}%` }} title={`Completed: ${completedPerc}%`} />
                <div className="bg-info transition-all duration-500" style={{ width: `${inProgressPerc}%` }} title={`In Progress: ${inProgressPerc}%`} />
                <div className="bg-primary/30 transition-all duration-500" style={{ width: `${pendingPerc}%` }} title={`Pending: ${pendingPerc}%`} />
              </div>
              
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5 text-foreground font-medium">
                    <span className="h-2 w-2 rounded-full bg-success shadow-xs"></span> Completed
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">{stats.completed} logs</span>
                    <span className="font-semibold w-8 text-right">{completedPerc}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5 text-foreground font-medium">
                    <span className="h-2 w-2 rounded-full bg-info shadow-xs"></span> In Progress
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">{stats.inProgress} logs</span>
                    <span className="font-semibold w-8 text-right">{inProgressPerc}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5 text-foreground font-medium">
                    <span className="h-2 w-2 rounded-full bg-primary/30 shadow-xs"></span> Pending
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">{stats.pending} logs</span>
                    <span className="font-semibold w-8 text-right">{pendingPerc}%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}