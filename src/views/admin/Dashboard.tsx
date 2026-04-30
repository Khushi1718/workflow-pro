import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { admin, auth, tasks } from "@/lib/api";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Users, 
  Loader2, 
  ClipboardList, 
  Activity,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Target,
  FileText,
  TrendingUp,
  Zap,
  BarChart3,
  Monitor,
  Layout,
  Briefcase
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [graphRange, setGraphRange] = useState<"this" | "last">("this");

  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    todayCompleted: 0,
    todayPending: 0,
    overdueTasks: 0,
    teamSize: 0,
    teamActive: 0
  });

  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [memberPerformance, setMemberPerformance] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, tasksRes, usersRes] = await Promise.all([
          auth.getProfile(),
          tasks.getAll("all"),
          admin.getAllUsers()
        ]);

        if (profileRes.success) setUser(profileRes.data);
        
        const myProfile = profileRes.data;
        const tasksData = tasksRes.data || [];
        const usersData = usersRes.data || [];

        // Filter tasks: assigned to me OR assigned by me
        const filteredTasks = tasksData.filter((t: any) => 
          (t.assignedTo?._id === myProfile._id || t.assignedTo === myProfile._id) ||
          (t.assignedBy?._id === myProfile._id || t.assignedBy === myProfile._id)
        );
        
        setAllTasks(filteredTasks);

        // Filter users: part of my team? 
        // For simplicity in this layout, we show all employees if team is not strictly defined, 
        // but here we filter by the admin's team if available.
        const myTeamMembers = usersData.filter((u: any) => 
          u.role === "employee" && (myProfile.team ? u.team === myProfile.team : true)
        );
        setTeamMembers(myTeamMembers);

        const now = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        setStats({
          totalTasks: filteredTasks.length,
          activeTasks: filteredTasks.filter((t: any) => t.status === "in_progress").length,
          completedTasks: filteredTasks.filter((t: any) => t.status === "completed").length,
          todayCompleted: filteredTasks.filter((t: any) => t.status === "completed" && t.completedAt && new Date(t.completedAt) >= startOfToday).length,
          todayPending: filteredTasks.filter((t: any) => t.status !== "completed" && new Date(t.createdAt) >= startOfToday).length,
          overdueTasks: filteredTasks.filter((t: any) => t.status !== "completed" && new Date(t.deadline) < now).length,
          teamSize: myTeamMembers.length,
          teamActive: myTeamMembers.filter((u: any) => u.isActive).length
        });

        // Member Performance (Top 5)
        const perf = myTeamMembers.map((mem: any) => {
          const memTasks = tasksData.filter((t: any) => t.assignedTo?._id === mem._id || t.assignedTo === mem._id);
          const completed = memTasks.filter((t: any) => t.status === "completed").length;
          return {
            id: mem._id,
            name: mem.name,
            team: mem.team,
            assigned: memTasks.length,
            completed: completed,
            progress: memTasks.length > 0 ? Math.round((completed / memTasks.length) * 100) : 0
          };
        }).sort((a, b) => b.assigned - a.assigned).slice(0, 5);
        setMemberPerformance(perf);

      } catch (error) {
        toast.error("Dashboard sync failed");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (allTasks.length === 0) return;

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
        assigned: allTasks.filter((t: any) => t.createdAt.startsWith(dateStr)).length,
        completed: allTasks.filter((t: any) => t.completedAt && t.completedAt.startsWith(dateStr)).length
      };
    });
    setWeeklyData(data);
  }, [allTasks, graphRange]);

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
    <AppShell role="admin" title="Operations Control">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1500px] mx-auto px-8 py-10 space-y-8 pb-20"
      >
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-10">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Operations Control
            </h1>
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em]">Administrator: {user?.name} • Team: {user?.team || "Global Operations"}</p>
          </div>
          <div className="flex items-center gap-3">
             <Button asChild variant="outline" className="h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest border-zinc-200 shadow-sm hover:bg-zinc-50 transition-all">
                <Link to="/admin/today">Live Activity</Link>
             </Button>
             <Button asChild className="h-10 rounded-xl bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-widest px-6 shadow-xl hover:bg-zinc-800 transition-all">
                <Link to="/admin/tasks"><Plus className="mr-2 h-4 w-4" /> Delegate Task</Link>
             </Button>
          </div>
        </header>

        {/* KPI OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: "My Pipeline", value: stats.totalTasks, sub: "Assigned & Managed", icon: Briefcase, color: "text-zinc-900" },
             { label: "Execution Today", value: stats.todayCompleted, sub: "Tasks Finalized", icon: CheckCircle2, color: "text-emerald-500" },
             { label: "Resource Node", value: stats.teamActive, sub: "Active Team Members", icon: UserCheck, color: "text-blue-500" },
             { label: "Priority Alerts", value: stats.overdueTasks, sub: "Overdue Items", icon: AlertTriangle, color: "text-rose-500" }
           ].map((s, i) => (
             <motion.div key={i} variants={itemVariants} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{s.label}</p>
                   <s.icon className={cn("h-4 w-4", s.color)} />
                </div>
                <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{s.value}</h3>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">{s.sub}</p>
             </motion.div>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           
           <div className="lg:col-span-8 space-y-8">
              {/* WEEKLY TREND */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-[11px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.3em]">Operational Weekly Trend</h2>
                      <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">Delegated vs Completed</p>
                    </div>
                    <div className="flex bg-zinc-50 dark:bg-zinc-800 p-1 rounded-xl">
                      <button 
                        onClick={() => setGraphRange("this")}
                        className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", graphRange === "this" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
                      >
                        Current
                      </button>
                      <button 
                        onClick={() => setGraphRange("last")}
                        className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", graphRange === "last" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
                      >
                        Previous
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
                        <Line type="monotone" dataKey="assigned" name="Assigned" stroke="#18181b" strokeWidth={3} dot={{ r: 4, fill: '#18181b', strokeWidth: 2, stroke: '#fff' }} />
                        <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* TEAM DIRECTORY QUICK NAV */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
                 <h2 className="text-[11px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.3em] mb-6">Team Resource Nodes</h2>
                 <div className="flex flex-wrap gap-3">
                    {user?.team && (
                      <Link 
                        to={`/admin/tasks?department=${user.team}`}
                        className="flex items-center gap-4 bg-zinc-950 text-white transition-all px-6 py-4 rounded-2xl shadow-xl group"
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{user.team} Command</span>
                          <span className="text-[9px] font-bold opacity-60">View all team tasks</span>
                        </div>
                        <ArrowUpRight className="h-5 w-5" />
                      </Link>
                    )}
                    <Link 
                      to="/admin/users"
                      className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 transition-all px-6 py-4 rounded-2xl border border-zinc-100 dark:border-zinc-700 group"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-50">Manage Team</span>
                        <span className="text-[9px] font-bold text-zinc-400">Directory Oversight</span>
                      </div>
                      <Users className="h-4 w-4 text-zinc-400" />
                    </Link>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-8">
              {/* MEMBER PERFORMANCE */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
                 <h2 className="text-[11px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.3em] mb-8">Personnel Efficiency</h2>
                 <div className="space-y-8">
                    {memberPerformance.map((mem, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 border-2 border-zinc-50 shadow-sm">
                                 <AvatarFallback className="bg-zinc-50 text-[10px] font-black text-zinc-400 uppercase">
                                   {mem.name.split(" ").map((n:any)=>n[0]).join("")}
                                 </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                 <p className="text-[13px] font-black text-zinc-900 truncate leading-none">{mem.name}</p>
                                 <p className="text-[9px] font-bold text-zinc-400 uppercase mt-1.5">{mem.assigned} Assignments</p>
                              </div>
                           </div>
                           <span className="text-xs font-black tabular-nums">{mem.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-50 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-100/50">
                           <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${mem.progress}%` }} />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* RECENT ACTIONS */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[40px] relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Target className="h-32 w-32" />
                 </div>
                 <h2 className="text-[11px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.3em] mb-8 relative z-10">Recent Operations</h2>
                 <div className="space-y-6 relative z-10">
                    {allTasks.slice(0, 4).map((t, i) => (
                      <div key={i} className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:border-zinc-900 transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[12px] font-black text-zinc-900 dark:text-zinc-50 truncate pr-4">{t.title}</p>
                          <span className={cn("h-2 w-2 rounded-full", t.status === 'completed' ? "bg-emerald-500" : "bg-blue-500")} />
                        </div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Assigned To: {t.assignedTo?.name}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

        </div>
      </motion.div>
    </AppShell>
  );
}