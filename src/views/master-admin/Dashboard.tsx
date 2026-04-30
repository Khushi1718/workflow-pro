import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { auth, masterAdmin, tasks } from "@/lib/api";
import { getGreeting, cn } from "@/lib/utils";
import { 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Loader2,
  PlusCircle,
  Zap,
  Activity,
  Globe,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Layers,
  PieChart as PieIcon,
  BarChart3,
  Search,
  MessageSquare,
  FileText
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router";

export default function MasterAdminDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [assignmentStats, setAssignmentStats] = useState({
    total: 0,
    completed: 0,
    completionRate: 0,
    activeTeams: 0,
    enterpriseROI: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, statsRes, tasksRes] = await Promise.all([
          auth.getProfile(),
          masterAdmin.getStats(),
          tasks.getAll("all")
        ]);

        if (profileRes.success) setCurrentUser(profileRes.data);
        if (statsRes.success) setStats(statsRes.data);

        const allTasks = tasksRes.data || [];
        const total = allTasks.length;
        const completed = allTasks.filter((a: any) => a.progress === 100).length;
        
        // Extract unique teams
        const teams = new Set(allTasks.map((a: any) => a.assignedTo?.team).filter(Boolean));

        setAssignmentStats({
          total,
          completed,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          activeTeams: teams.size,
          enterpriseROI: Math.floor(Math.random() * 15) + 85 // Mock ROI
        });

      } catch (error) {
        console.error("Master dashboard sync error:", error);
        toast.error("Global synchronization failed");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <AppShell role="master_admin" title="Global Command Center" subtitle="Aggregating enterprise metrics...">
        <div className="flex h-[60vh] flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
            <Globe className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Enterprise Architecture...</p>
        </div>
      </AppShell>
    );
  }

  const pieData = [
    { name: "Optimal", value: assignmentStats.completionRate, color: "hsl(var(--primary))" },
    { name: "Critical", value: 100 - assignmentStats.completionRate, color: "rgba(255,255,255,0.1)" },
  ];

  const deptData = [
    { name: 'SEO', val: 85, color: 'text-emerald-500' },
    { name: 'Tech', val: 92, color: 'text-blue-500' },
    { name: 'Sales', val: 78, color: 'text-amber-500' },
    { name: 'Admin', val: 95, color: 'text-primary' },
  ];

  return (
    <AppShell 
      role="master_admin" 
      title={`${getGreeting()}, Super Admin`} 
      subtitle="Comprehensive global intelligence and system-wide operational velocity."
      actions={
        <div className="flex items-center gap-4">
           <Button asChild variant="outline" className="h-11 rounded-2xl bg-background/50 border-border/50 backdrop-blur-xl hover:bg-accent/50 transition-all">
              <Link to="/admin/today">Today's Pulse</Link>
           </Button>
           <Button asChild className="h-11 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-95">
              <Link to="/master-admin/tasks"><PlusCircle className="mr-2 h-5 w-5" /> Global Assignment</Link>
           </Button>
        </div>
      }
    >
      <div className="space-y-10 pb-16 animate-in fade-in duration-1000">
        {/* GLOBAL TIER METRICS */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Workforce", value: stats?.users?.total || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Global Deployments", value: assignmentStats.total, icon: Layers, color: "text-primary", bg: "bg-primary/10" },
            { label: "System ROI", value: `${assignmentStats.enterpriseROI}%`, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Stability Index", value: `${assignmentStats.completionRate}%`, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="group relative overflow-hidden border-none shadow-premium bg-background/50 backdrop-blur-md hover:shadow-2xl transition-all">
              <div className={cn("absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full opacity-5 blur-3xl transition-all group-hover:scale-150 group-hover:opacity-10", stat.bg)} />
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-2">{stat.label}</p>
                    <h3 className="text-4xl font-black tracking-tighter">{stat.value}</h3>
                  </div>
                  <div className={cn("rounded-3xl p-5 transition-all group-hover:rotate-12", stat.bg)}>
                    <stat.icon className={cn("h-8 w-8", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* ENTERPRISE VELOCITY CHART */}
          <Card className="lg:col-span-8 border-none shadow-premium overflow-hidden bg-background/50 backdrop-blur-xl">
            <header className="flex items-center justify-between px-10 py-8 border-b border-border/40">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary animate-pulse" /> Enterprise Intel
                </h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase mt-1.5 opacity-60">System-wide productivity architecture</p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                       <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-accent ring-2 ring-background flex items-center justify-center text-[10px] font-black">
                          {String.fromCharCode(64 + i)}
                       </div>
                    ))}
                 </div>
                 <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">Live Nodes</span>
              </div>
            </header>
            <CardContent className="p-10">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={[
                     { name: 'W1', val: 140, completed: 110 }, { name: 'W2', val: 185, completed: 160 }, 
                     { name: 'W3', val: 155, completed: 145 }, { name: 'W4', val: 210, completed: 195 },
                     { name: 'W5', val: 245, completed: 230 }, { name: 'W6', val: 280, completed: 270 }
                   ]}>
                      <defs>
                         <linearGradient id="globalGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="hsl(var(--border))" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900 }} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }}
                      />
                      <Area type="monotone" dataKey="val" name="Deployed" stroke="hsl(var(--primary))" strokeWidth={6} fill="url(#globalGradient)" />
                      <Area type="monotone" dataKey="completed" name="Optimal" stroke="hsl(var(--success))" strokeWidth={4} fill="transparent" strokeDasharray="10 5" />
                   </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* SYSTEM INTEGRITY */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-premium bg-zinc-950 text-white group overflow-hidden">
              <header className="px-10 py-8 border-b border-white/5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> System Core
                </h3>
              </header>
              <CardContent className="p-10">
                <div className="h-[240px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={80}
                        outerRadius={105}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                    <span className="text-4xl font-black">{assignmentStats.completionRate}%</span>
                    <span className="text-[10px] font-black uppercase text-white/40 mt-1">Health</span>
                  </div>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-6">
                  {deptData.map((d, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <p className="text-[9px] font-black uppercase text-white/30 mb-1">{d.name} Rank</p>
                      <h4 className={cn("text-lg font-black", d.color)}>{d.val}%</h4>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Link to="/master-admin/users" className="group block p-10 rounded-[2.5rem] bg-primary text-white shadow-2xl shadow-primary/30 transition-all hover:shadow-primary/50 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 rounded-full bg-white/10 blur-3xl transition-transform group-hover:scale-150" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="h-16 w-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-8 w-8" />
                   </div>
                   <div>
                      <h4 className="text-lg font-black uppercase tracking-widest">Team Intel</h4>
                      <p className="text-[11px] font-bold text-white/70 uppercase mt-1">Enterprise Access Control</p>
                   </div>
                </div>
                <ArrowUpRight className="h-8 w-8 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2" />
              </div>
            </Link>
          </div>
        </div>

        {/* STRATEGIC CONTROL CENTER */}
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { title: "Task Engine", desc: "Corporate goal mapping", icon: Layers, link: "/master-admin/tasks", accent: "bg-blue-500" },
            { title: "SEO Strategy", desc: "Global digital reports", icon: BarChart3, link: "/master-admin/seo-reports", accent: "bg-emerald-500" },
            { title: "Team Pulse", desc: "Real-time activity logs", icon: Activity, link: "/master-admin/today", accent: "bg-amber-500" },
          ].map((tool, i) => (
            <Link key={i} to={tool.link} className="group relative p-10 rounded-[3rem] border border-border/40 bg-white shadow-premium transition-all hover:border-primary/40 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
               <div className={cn("absolute left-0 top-0 h-1.5 w-0 transition-all group-hover:w-full", tool.accent)} />
               <div className="relative z-10 flex items-center gap-8">
                  <div className="h-20 w-20 rounded-[1.75rem] bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                     <tool.icon className="h-9 w-9 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-base font-black uppercase tracking-[0.15em] group-hover:text-primary transition-colors">{tool.title}</h4>
                     <p className="text-[11px] text-muted-foreground font-black uppercase mt-2 opacity-60 tracking-wider">{tool.desc}</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-0 transition-all" />
               </div>
            </Link>
          ))}
        </div>

        {/* QUICK ACCESS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {[
             { label: "Global History", icon: BarChart3, link: "/master-admin/logs" },
             { label: "Direct Messages", icon: MessageSquare, link: "/master-admin/messages" },
             { label: "Enterprise Board", icon: ClipboardList, link: "/master-admin/tasks" },
             { label: "Admin Profile", icon: Globe, link: "/master-admin/profile" },
           ].map((item, i) => (
             <Link key={i} to={item.link} className="flex flex-col items-center justify-center p-8 rounded-3xl bg-background/50 border border-border/40 hover:bg-white hover:shadow-xl transition-all group">
                <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                   <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{item.label}</span>
             </Link>
           ))}
        </div>
      </div>
    </AppShell>
  );
}
