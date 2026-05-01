import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { auth, tasks } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  ClipboardList, 
  Zap, 
  Calendar,
  Layers,
  ChevronRight,
  FileText,
  Target,
  UserCheck,
  Star,
  Activity,
  ArrowUpRight,
  Sparkles,
  Briefcase,
  History,
  Layout,
  MessageSquare,
  User,
  ArrowRight
 } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { toast } from "sonner";
import { motion, animate } from "framer-motion";

// CountUp Component for premium animations
function CountUp({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.3,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.floor(latest))
    });
    return () => controls.stop();
  }, [value]);

  return <span>{displayValue}</span>;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export default function EmployeeDashboard() {
  const { user: storeUser } = useAuthStore();
  const [user, setUser] = useState<any>(storeUser);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [graphRange, setGraphRange] = useState<"this" | "last">("this");

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    todayTotal: 0,
    todayCompleted: 0,
    todayPending: 0
  });

  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Parallelize data fetching but skip profile if we have it
        const tasksPromise = tasks.getAll("assigned_to_me");
        const profilePromise = !storeUser ? auth.getProfile() : Promise.resolve({ success: true, data: storeUser });
        
        const [profileRes, tasksRes] = await Promise.all([
          profilePromise,
          tasksPromise
        ]);

        if (profileRes.success) setUser(profileRes.data);
        const myProfile = profileRes.data;
        const tasksData = tasksRes.data || [];
        const myId = String(myProfile?._id || myProfile?.id || "");


        const now = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Filter work actually assigned to me
        const myWork = tasksData.filter((a: any) => 
          String(a.assignedTo?._id || a.assignedTo || "") === myId
        );
        setMyTasks(myWork);

        let tTotal = 0, tDone = 0, tPending = 0;
        let todayT = 0, todayD = 0, todayP = 0;

        myWork.forEach((a: any) => {
          const bundleTotal = a.totalTasks || (a.tasks?.length || 0);
          const bundleDone = a.completedTasks || (a.tasks?.filter((t: any) => t.status === 'completed').length || 0);
          
          tTotal += bundleTotal;
          tDone += bundleDone;
          tPending += (bundleTotal - bundleDone);

          if (a.tasks && Array.isArray(a.tasks)) {
            a.tasks.forEach((t: any) => {
              const taskCreatedAt = new Date(a.createdAt);
              const taskDoneAt = t.completedAt ? new Date(t.completedAt) : null;

              if (taskCreatedAt >= startOfToday) todayT++;
              if (t.status === "completed" && taskDoneAt && taskDoneAt >= startOfToday) todayD++;
              if (t.status !== "completed" && taskCreatedAt >= startOfToday) todayP++;
            });
          }
        });

        setStats({
          total: tTotal,
          completed: tDone,
          pending: tPending,
          todayTotal: todayT,
          todayCompleted: todayD,
          todayPending: todayP
        });

        // Flatten tasks for activity feed
        const logs: any[] = [];
        myWork.forEach((a: any) => {
          if (a.tasks) {
            a.tasks.forEach((t: any) => {
              logs.push({
                ...t,
                bundleTitle: a.title,
                adminName: a.assignedBy?.name,
                updatedAt: t.updatedAt || a.updatedAt || a.createdAt
              });
            });
          }
        });
        setRecentLogs(logs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5));

      } catch (error) {
        console.error("Dashboard Load Error:", error);
        toast.error("Failed to load personal intelligence");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (myTasks.length === 0) return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const data = days.map((day, index) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + index + (graphRange === "last" ? -7 : 0));
      const dateStr = targetDate.toISOString().split('T')[0];

      let assigned = 0;
      let completed = 0;

      myTasks.forEach((a: any) => {
        const aDate = typeof a.createdAt === 'string' ? a.createdAt : new Date(a.createdAt).toISOString();
        if (aDate.startsWith(dateStr)) {
          assigned += (a.totalTasks || (a.tasks?.length || 0));
        }
        if (a.tasks) {
          a.tasks.forEach((t: any) => {
            if (t.completedAt) {
              const cDate = typeof t.completedAt === 'string' ? t.completedAt : new Date(t.completedAt).toISOString();
              if (cDate.startsWith(dateStr)) completed += 1;
            }
          });
        }
      });

      return { name: day, assigned, completed };
    });
    setWeeklyData(data);
  }, [myTasks, graphRange]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fafafa] dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Syncing Personal Node...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell role="employee" title="Personal Intelligence">
      <div className="max-w-[1600px] mx-auto px-10 py-12 space-y-12 pb-24">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-4">
              {getGreeting()}, {user?.name} <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] mt-3">Fueling your daily impact • Commit to excellence in every task</p>
          </div>
          <div className="flex items-center gap-4">
             <Button asChild variant="outline" className="h-12 px-6 rounded-2xl border-zinc-200 bg-white shadow-sm text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                <Link to="/employee/logs">Daily Logs</Link>
             </Button>
             <Button asChild className="h-12 px-8 rounded-2xl bg-zinc-950 text-white shadow-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                <Link to="/employee/tasks">Open Task Board <ArrowRight className="ml-2 h-4 w-4" /></Link>
             </Button>
          </div>
        </header>

        {/* METRICS GRID */}
        <div className="grid lg:grid-cols-2 gap-10">
          
          <section className="space-y-6">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
              <Layers className="h-4 w-4 text-zinc-900" /> Lifetime Task Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {[
                 { label: "Global Assigned", value: stats.total, icon: ClipboardList, bg: "bg-zinc-50" },
                 { label: "Global Completed", value: stats.completed, icon: CheckCircle2, bg: "bg-emerald-50/30" },
                 { label: "Global Pending", value: stats.pending, icon: Clock, bg: "bg-amber-50/30" }
               ].map((s, i) => (
                 <div key={i} className={cn("p-7 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all", s.bg)}>
                    <div className="flex items-center justify-between mb-3">
                       <s.icon className="h-4 w-4 text-zinc-400" />
                       <span className="text-2xl font-black tracking-tighter"><CountUp value={s.value} /></span>
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{s.label}</p>
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
              <Zap className="h-4 w-4 text-blue-500" /> Daily Execution Velocity
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {[
                 { label: "Incoming Today", value: stats.todayTotal, icon: Sparkles, bg: "bg-zinc-50" },
                 { label: "Completed Today", value: stats.todayCompleted, icon: CheckCircle2, bg: "bg-emerald-50/30" },
                 { label: "Pending Today", value: stats.todayPending, icon: Clock, bg: "bg-amber-50/30" }
               ].map((s, i) => (
                 <div key={i} className={cn("p-7 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all", s.bg)}>
                    <div className="flex items-center justify-between mb-3">
                       <s.icon className="h-4 w-4 text-zinc-400" />
                       <span className="text-2xl font-black tracking-tighter"><CountUp value={s.value} /></span>
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{s.label}</p>
                 </div>
               ))}
            </div>
          </section>
        </div>

        {/* WEEKLY TREND */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[48px] p-10 shadow-sm">
           <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="text-[13px] font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-[0.4em]">Personal Efficiency Trend</h2>
                <p className="text-[11px] text-zinc-400 mt-2 uppercase font-bold tracking-widest">Workflow Execution velocity over time</p>
              </div>
              <div className="flex bg-zinc-50 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-100">
                <button 
                  onClick={() => setGraphRange("this")}
                  className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", graphRange === "this" ? "bg-white text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-600")}
                >
                  Current
                </button>
                <button 
                  onClick={() => setGraphRange("last")}
                  className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", graphRange === "last" ? "bg-white text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-600")}
                >
                  Previous
                </button>
              </div>
           </header>
           <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#a1a1aa' }} dy={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#a1a1aa' }} />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 900 }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingBottom: '30px', letterSpacing: '0.1em' }} />
                  <Line type="monotone" dataKey="assigned" name="Assigned" stroke="#18181b" strokeWidth={4} dot={{ r: 5, fill: '#18181b', strokeWidth: 3, stroke: '#fff' }} />
                  <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* RECENT ACTIVITY LOGS */}
        <div className="grid lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[48px] p-12 shadow-sm">
              <header className="flex items-center justify-between mb-12">
                <h2 className="text-[13px] font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-[0.4em] flex items-center gap-3">
                  <History className="h-5 w-5 text-zinc-400" /> Recent Task Updates
                </h2>
                <Button asChild variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-950">
                  <Link to="/employee/tasks">View Full Board <ChevronRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </header>
              <div className="grid gap-6">
                {recentLogs.length > 0 ? recentLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 group hover:border-zinc-200 transition-all">
                    <div className="flex items-center gap-6">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm", 
                          log.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 
                          log.status === 'in_progress' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
                        )}>
                          {log.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-zinc-900 dark:text-zinc-50">{log.title}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-wider">
                            {log.bundleTitle} • Admin: {log.adminName || 'System'}
                          </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">
                          {new Date(log.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-[32px]">
                    <ClipboardList className="h-10 w-10 text-zinc-100 mx-auto mb-4" />
                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">No recent task activity</p>
                  </div>
                )}
              </div>
           </div>

           <div className="lg:col-span-4 space-y-10">
              <div className="bg-zinc-950 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden group h-full">
                 <Activity className="absolute -bottom-8 -right-8 h-48 w-48 text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                 <div className="relative z-10">
                   <h4 className="text-lg font-black tracking-tight mb-3">Daily Focus</h4>
                   <p className="text-[11px] text-white/40 font-medium leading-relaxed mb-10">Maintain execution velocity and accuracy across all assigned operational nodes.</p>
                   
                   <div className="space-y-6">
                      {[
                        { label: "Personnel Support", icon: MessageSquare, link: "/employee/messages" },
                        { label: "Profile Settings", icon: User, link: "/employee/profile" },
                        { label: "Work Logs", icon: FileText, link: "/employee/logs" }
                      ].map((item, i) => (
                        <Link key={i} to={item.link} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group">
                           <div className="flex items-center gap-4">
                              <item.icon className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                           </div>
                           <ChevronRight className="h-3 w-3 text-white/20 group-hover:text-white transition-colors" />
                        </Link>
                      ))}
                   </div>

                   <div className="mt-12 p-8 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="h-4 w-4 text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Target Efficiency</span>
                      </div>
                      <h3 className="text-2xl font-black tabular-nums">{Math.min(100, Math.round((stats.completed / (stats.total || 1)) * 100))}%</h3>
                   </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </AppShell>
  );
}
