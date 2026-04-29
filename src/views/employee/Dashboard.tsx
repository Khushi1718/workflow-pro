import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  PlusCircle, 
  ListChecks, 
  ArrowRight, 
  TrendingUp, 
  PieChart, 
  Loader2, 
  Target, 
  Circle,
  Zap,
  CheckSquare,
  Square,
  ChevronRight,
  Activity,
  Search
} from "lucide-react";
import { auth, workLogs } from "@/lib/api";
import { getGreeting, cn } from "@/lib/utils";
import { toast } from "sonner";
import { WorkLog, Task } from "@/lib/mock-data";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [myLogs, setMyLogs] = useState<WorkLog[]>([]);
  const [submittedLogs, setSubmittedLogs] = useState<WorkLog[]>([]);
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0,
  });
  const [todayLog, setTodayLog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const profileResponse = await auth.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setCurrentEmployee(profileResponse.data);
        }

        // Get all logs (for stats calculation)
        const logsResponse = await workLogs.getMyLogs(100, 0);
        if (logsResponse.success && logsResponse.data) {
          const logs = logsResponse.data;
          setMyLogs(logs);
          
          const completedCount = logs.filter((l: any) => l.status === 'completed').length;
          const inProgressCount = logs.filter((l: any) => l.status === 'in_progress').length;
          const pendingCount = logs.filter((l: any) => l.status === 'pending').length;
          
          setStats({ 
            completed: completedCount, 
            inProgress: inProgressCount, 
            pending: pendingCount 
          });
        }

        // Get submitted logs for history (excludes drafts)
        const submittedResponse = await workLogs.getMyLogs(100, 0, undefined, undefined, undefined, true);
        if (submittedResponse.success && submittedResponse.data) {
          setSubmittedLogs(submittedResponse.data);
        }

        // Get today's log (can be draft or submitted)
        const todayResponse = await workLogs.getTodayLog();
        if (todayResponse.success && todayResponse.data) {
          setTodayLog(todayResponse.data);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Set up listener for real-time updates from AddLog component
    const handleTodayLogUpdate = (event: any) => {
      console.log("Today's log updated:", event.detail);
      setTodayLog(event.detail);
      // Also refresh the full data to update stats
      fetchData();
    };

    // Also set up polling to refresh every 3 seconds while on dashboard
    const pollInterval = setInterval(async () => {
      try {
        const todayResponse = await workLogs.getTodayLog();
        if (todayResponse.success && todayResponse.data) {
          setTodayLog(prev => {
            // Only update if the data actually changed
            if (JSON.stringify(prev) !== JSON.stringify(todayResponse.data)) {
              return todayResponse.data;
            }
            return prev;
          });
        }
      } catch (e) {
        // Silently ignore polling errors
      }
    }, 3000);

    window.addEventListener("todayLogUpdated", handleTodayLogUpdate);
    return () => {
      window.removeEventListener("todayLogUpdated", handleTodayLogUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    if (!todayLog || (todayLog.state !== 'draft')) return;
    
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const res = await workLogs.updateTaskStatus(todayLog._id || todayLog.id, taskId, newStatus);
      if (res.success) {
        setTodayLog((prev: any) => {
          if (!prev) return prev;
          const newTasks = prev.tasks.map((t: any) => 
            t.id === taskId ? { ...t, status: newStatus } : t
          );
          return { ...prev, tasks: newTasks };
        });
        toast.success(`Task ${newStatus}`);
      }
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  if (isLoading) {
    return (
      <AppShell role="employee" title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Synchronizing your workspace...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  const firstName = currentEmployee?.name?.split(" ").pop() || "User";
  const isSeoUser = currentEmployee?.role === "SEO" || currentEmployee?.team?.toLowerCase() === "seo";

  const total = myLogs.length || 1;
  const completedPerc = Math.round((stats.completed / total) * 100);
  const inProgressPerc = Math.round((stats.inProgress / total) * 100);
  const pendingPerc = 100 - completedPerc - inProgressPerc;

  return (
    <AppShell
      role="employee"
      title={`${getGreeting()}, ${firstName}`}
      subtitle="Your daily performance and project velocity overview."
      actions={
        <Button asChild className="rounded-xl shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]">
          <Link to="/employee/add-log"><PlusCircle className="mr-2 h-4 w-4" /> Log Today's Work</Link>
        </Button>
      }
    >
      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Total Submissions" value={myLogs.length} icon={FileText} />
        <StatCard label="Completed Milestones" value={stats.completed} icon={CheckCircle2} tone="success" />
        <StatCard label="Active Operations" value={stats.inProgress} icon={Clock} tone="info" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        
        {/* LEFT: Tasks & Logs */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Today's To-Do Section */}
          <section className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
             <header className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 px-8 py-6 bg-zinc-50/30">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                        <CheckSquare className="h-6 w-6 text-primary" />
                     </div>
                     <div>
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Today's To-Do</h2>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                           {todayLog ? `${todayLog.tasks?.length || 0} tasks` : 'No log created'}
                        </p>
                     </div>
                  </div>
               </header>

               <div className="p-8">
                  {todayLog ? (
                    <>
                      <div className="space-y-2">
                         {todayLog.tasks && todayLog.tasks.length > 0 ? (
                           todayLog.tasks.map((task: any) => {
                              const isCompleted = task.status === 'completed';
                              const canToggle = todayLog.state === 'draft';
                              
                              return (
                                 <div 
                                   key={task.id} 
                                   onClick={() => canToggle && toggleTaskStatus(task.id, task.status)}
                                   className={cn(
                                     "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                     canToggle && "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                                     isCompleted ? "bg-zinc-50/30 border-zinc-100 dark:bg-zinc-900/20 dark:border-zinc-800" : "bg-white border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
                                   )}
                                 >
                                    <div className={cn(
                                      "h-4 w-4 rounded border-2 flex items-center justify-center transition-all shrink-0",
                                      isCompleted ? "bg-success border-success text-white" : "border-zinc-300 dark:border-zinc-600",
                                      !canToggle && "cursor-not-allowed"
                                    )}>
                                       {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                                    </div>
                                    <p className={cn(
                                      "text-sm font-medium flex-1",
                                      isCompleted ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-100"
                                    )}>
                                      {task.text}
                                    </p>
                                 </div>
                              );
                           })
                         ) : (
                           <div className="text-center py-8">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">No tasks yet</p>
                           </div>
                         )}
                      </div>

                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                         <div className="text-[10px] font-bold text-zinc-400 uppercase">
                            {todayLog.tasks?.length ? Math.round((todayLog.tasks.filter((t: any) => t.status === 'completed').length / todayLog.tasks.length) * 100) : 0}% Done
                         </div>
                         {todayLog.state === 'draft' ? (
                           <Button asChild className="h-9 rounded-lg bg-primary text-white text-xs font-bold">
                              <Link to={`/employee/logs/edit/${todayLog._id || todayLog.id}`}>
                                 Edit Log <ArrowRight className="ml-1 h-3.5 w-3.5" />
                              </Link>
                           </Button>
                         ) : (
                           <Button asChild variant="ghost" className="h-9 rounded-lg text-primary text-xs font-bold">
                              <Link to={`/employee/logs/${todayLog._id || todayLog.id}`}>
                                 View Log <ArrowRight className="ml-1 h-3.5 w-3.5" />
                              </Link>
                           </Button>
                         )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">
                       <Zap className="h-10 w-10 text-zinc-200 mb-4" />
                       <p className="text-sm font-bold text-zinc-400">No log for today yet.</p>
                       <Button asChild variant="link" className="text-primary font-bold mt-2">
                          <Link to="/employee/add-log">Create Today's Log →</Link>
                       </Button>
                    </div>
                  )}
               </div>
          </section>

          {isSeoUser && (
            <section className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <header className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 px-8 py-5 bg-zinc-50/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Today's SEO Summary</h2>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                      {todayLog ? "From today's log" : "No log created"}
                    </p>
                  </div>
                </div>
              </header>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Questions Answered Today</p>
                  <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{todayLog?.seoData?.questionsAnswered || 0}</p>
                </div>
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Backlinks Created Today</p>
                  <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{todayLog?.seoData?.backlinksCreated || 0}</p>
                </div>
              </div>
            </section>
          )}

          {/* All Logs Section */}
          <section className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <header className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 px-8 py-6">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">All Logs</h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Your submitted work records</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-zinc-400 hover:text-zinc-900">
                <Link to="/employee/logs">View All</Link>
              </Button>
            </header>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {submittedLogs.slice(0, 5).map((log) => (
                <li key={log._id || log.id}>
                  <Link
                    to={`/employee/logs/${log._id || log.id}`}
                    className="flex items-start gap-4 px-8 py-6 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shadow-sm">
                      <ListChecks className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="truncate text-sm font-bold text-zinc-900 dark:text-white">{log.title}</p>
                        <StatusBadge status={log.status} />
                      </div>
                      <p className="line-clamp-1 text-xs text-zinc-500 font-medium leading-relaxed">
                        {log.tasks && log.tasks.length > 0 
                          ? `${log.tasks.length} task${log.tasks.length !== 1 ? 's' : ''}`
                          : 'No tasks'
                        }
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <div className="flex -space-x-1">
                        {log.tasks && log.tasks.slice(0, 3).map((_, i) => (
                          <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary/40 ring-2 ring-white dark:ring-zinc-900" />
                        ))}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* RIGHT: Stats & Charts */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Weekly Output Chart */}
          <section className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <header className="border-b border-zinc-100 dark:border-zinc-800/50 px-8 py-6 bg-zinc-50/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Weekly Velocity</h2>
              </div>
            </header>
            <div className="p-8 pt-12 h-[260px] flex items-end justify-between gap-3">
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
                    <div className="absolute -top-7 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.val}
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-xl flex items-end justify-center h-32 relative overflow-hidden group-hover:bg-zinc-200 transition-colors">
                      <div
                        className="w-full bg-primary/60 rounded-xl transition-all duration-700 group-hover:bg-primary shadow-sm"
                        style={{ height: `${Math.round((d.val / maxVal) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">{d.day}</span>
                  </div>
                ));
              })()}
            </div>
          </section>

          {/* Status Breakdown */}
          <section className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <header className="border-b border-zinc-100 dark:border-zinc-800/50 px-8 py-6 bg-zinc-50/30">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Status Analysis</h2>
              </div>
            </header>
            <div className="p-8 space-y-8">
              <div className="flex h-3 w-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <div className="bg-success transition-all duration-1000" style={{ width: `${completedPerc}%` }} />
                <div className="bg-info transition-all duration-1000" style={{ width: `${inProgressPerc}%` }} />
                <div className="bg-primary/20 transition-all duration-1000" style={{ width: `${pendingPerc}%` }} />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-success shadow-lg shadow-success/30"></div>
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">Completed</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">{completedPerc}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-info shadow-lg shadow-info/30"></div>
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">In Progress</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">{inProgressPerc}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary/20 shadow-lg shadow-primary/10"></div>
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">Pending</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">{pendingPerc}%</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
