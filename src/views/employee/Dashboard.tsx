import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { auth, tasks } from "@/lib/api";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  ClipboardList, 
  TrendingUp, 
  Zap, 
  Calendar,
  Layers,
  ChevronRight,
  PlayCircle,
  FileText,
  Target,
  UserCheck,
  Star,
  Activity,
  ArrowUpRight,
  User,
  MessageSquare,
  Layout
 } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [graphRange, setGraphRange] = useState<"this" | "last">("this");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    rate: 0
  });

  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, tasksRes] = await Promise.all([
          auth.getProfile(),
          tasks.getAll("assigned_to_me")
        ]);

        if (profileRes.success) setUser(profileRes.data);
        
        const tasksData = tasksRes.data || [];
        setMyTasks(tasksData);

        const now = new Date();
        const completed = tasksData.filter((t: any) => t.status === "completed").length;
        
        setStats({
          total: tasksData.length,
          active: tasksData.filter((t: any) => t.status === "in_progress").length,
          completed: completed,
          pending: tasksData.filter((t: any) => t.status === "pending").length,
          overdue: tasksData.filter((t: any) => t.status !== "completed" && new Date(t.deadline) < now).length,
          rate: tasksData.length > 0 ? Math.round((completed / tasksData.length) * 100) : 0
        });

      } catch (error) {
        toast.error("Failed to load personal metrics");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (myTasks.length === 0) return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map((day, index) => {
      const d = new Date();
      const currentDay = d.getDay();
      const diff = index + 1 - (currentDay === 0 ? 7 : currentDay);
      
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + diff + (graphRange === "last" ? -7 : 0));
      const dateStr = targetDate.toISOString().split('T')[0];

      return {
        name: day,
        assigned: myTasks.filter((t: any) => t.createdAt.startsWith(dateStr)).length,
        completed: myTasks.filter((t: any) => t.completedAt && t.completedAt.startsWith(dateStr)).length
      };
    });
    setWeeklyData(data);
  }, [myTasks, graphRange]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AppShell role="employee" title="Personal Roadmap">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1400px] mx-auto px-8 py-10 space-y-8 pb-20"
      >
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-10">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Personal Roadmap
            </h1>
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em]">Personnel: {user?.name} • Node: {user?.team || "Executive Execution"}</p>
          </div>
          <div className="flex items-center gap-3">
             <Button asChild className="h-10 rounded-xl bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-widest px-8 shadow-xl hover:bg-zinc-800 transition-all">
                <Link to="/employee/tasks">Open Task Board <ArrowRight className="ml-2 h-4 w-4" /></Link>
             </Button>
          </div>
        </header>

        {/* PERSONAL KPI GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: "My Total Tasks", value: stats.total, icon: ClipboardList, color: "text-zinc-900" },
             { label: "Currently Active", value: stats.active, icon: Zap, color: "text-blue-500" },
             { label: "Total Finalized", value: stats.completed, icon: CheckCircle2, color: "text-emerald-500" },
             { label: "Success Rate", value: `${stats.rate}%`, icon: Star, color: "text-amber-500" }
           ].map((s, i) => (
             <motion.div key={i} variants={itemVariants} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{s.label}</p>
                   <s.icon className={cn("h-4 w-4", s.color)} />
                </div>
                <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{s.value}</h3>
             </motion.div>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           
           <div className="lg:col-span-8 space-y-8">
              {/* PRODUCTIVITY GRAPH */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-[11px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.3em]">Personal Efficiency Trend</h2>
                      <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">Workflow Execution History</p>
                    </div>
                    <div className="flex bg-zinc-50 dark:bg-zinc-800 p-1 rounded-xl">
                      <button 
                        onClick={() => setGraphRange("this")}
                        className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", graphRange === "this" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
                      >
                        Week
                      </button>
                      <button 
                        onClick={() => setGraphRange("last")}
                        className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", graphRange === "last" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
                      >
                        Prev
                      </button>
                    </div>
                 </div>
                 <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 800 }} />
                        <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* ACTIVE ASSIGNMENTS LIST */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
                 <div className="px-8 py-6 border-b border-zinc-50 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/20">
                    <h2 className="text-[11px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.3em]">Active Assignments</h2>
                    <Link to="/employee/tasks" className="text-[9px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">Full Board <ArrowRight className="inline ml-1 h-3 w-3" /></Link>
                 </div>
                 <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
                    {myTasks.filter(t => t.status !== 'completed').slice(0, 5).map((t, i) => (
                      <Link key={i} to="/employee/tasks" className="flex items-center justify-between p-6 hover:bg-zinc-50/50 transition-all group">
                        <div className="flex items-center gap-6">
                           <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all shadow-inner">
                              <FileText className="h-5 w-5" />
                           </div>
                           <div className="min-w-0">
                              <p className="text-[14px] font-black text-zinc-900 dark:text-zinc-50 truncate mb-1">{t.title}</p>
                              <div className="flex items-center gap-4">
                                <span className={cn("text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest", 
                                  t.priority === 'high' ? "text-rose-500 border-rose-100 bg-rose-50" : "text-zinc-400 border-zinc-100 bg-zinc-50"
                                )}>{t.priority}</span>
                                <span className="text-[9px] font-bold text-zinc-400 uppercase">Due: {new Date(t.deadline).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-black tabular-nums mb-1.5">{Math.round(t.progress)}%</p>
                           <div className="h-1 w-12 bg-zinc-100 rounded-full overflow-hidden">
                              <div className="h-full bg-zinc-900" style={{ width: `${t.progress}%` }} />
                           </div>
                        </div>
                      </Link>
                    ))}
                    {myTasks.filter(t => t.status !== 'completed').length === 0 && (
                      <div className="py-20 text-center text-zinc-400 italic text-[10px] uppercase font-black tracking-widest opacity-40">
                         All tasks completed. No active assignments.
                      </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-8">
              {/* QUICK NAV CARDS */}
              <div className="grid grid-cols-1 gap-6">
                 {[
                   { label: "Task Board", sub: "Execution Workspace", icon: Layout, link: "/employee/tasks", bg: "bg-zinc-950 text-white", iconBg: "bg-white/10" },
                   { label: "Messages", sub: "Team Coordination", icon: MessageSquare, link: "/employee/messages", bg: "bg-white", iconBg: "bg-zinc-50" },
                   { label: "Profile", sub: "Personal Settings", icon: User, link: "/employee/profile", bg: "bg-white", iconBg: "bg-zinc-50" }
                 ].map((nav, i) => (
                   <Link key={i} to={nav.link} className={cn("p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl group", nav.bg)}>
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-10 transition-colors shadow-inner", nav.iconBg)}>
                         <nav.icon className="h-7 w-7" />
                      </div>
                      <h4 className="text-base font-black tracking-tight">{nav.label}</h4>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2">{nav.sub}</p>
                   </Link>
                 ))}
              </div>

              {/* MOTIVATION CARD */}
              <div className="bg-emerald-500 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
                 <Zap className="absolute -bottom-10 -right-10 h-64 w-64 text-white/10 opacity-50" />
                 <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-4 tracking-tight">Focus & Velocity</h3>
                    <p className="text-[12px] text-white/60 font-medium leading-relaxed mb-10">
                       Maintain high execution standards. Every finalized task contributes to the collective enterprise goal.
                    </p>
                    <div className="flex items-center gap-4 text-white/80 font-black text-[10px] uppercase tracking-widest">
                       <CheckCircle2 className="h-4 w-4" /> Finalize daily tasks early
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </motion.div>
    </AppShell>
  );
}
