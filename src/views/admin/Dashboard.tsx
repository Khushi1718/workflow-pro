import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { admin, auth, tasks } from "@/lib/api";
import { getGreeting, cn } from "@/lib/utils";
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Users, 
  Loader2, 
  ClipboardList, 
  TrendingUp, 
  Zap, 
  Activity,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  AlertTriangle,
  Target,
  BarChart3
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function AdminDashboard() {
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    activeBundles: 0,
    completionRate: 0,
    overdue: 0
  });
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, assignedRes] = await Promise.all([
          auth.getProfile(),
          tasks.getAll("assigned_by_me")
        ]);

        if (profileRes.success) setCurrentAdmin(profileRes.data);

        const allAssigned = assignedRes.data || [];
        const total = allAssigned.length;
        const completed = allAssigned.filter((a: any) => a.progress === 100).length;
        const active = allAssigned.filter((a: any) => a.progress > 0 && a.progress < 100).length;
        
        // Mock overdue: assignments with < 100% progress and passed deadline
        const now = new Date();
        const overdue = allAssigned.filter((a: any) => a.progress < 100 && new Date(a.deadline || a.createdAt) < now).length;

        setTaskStats({
          total,
          completed,
          inProgress: active,
          activeBundles: allAssigned.filter((a: any) => a.progress < 100).length,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          overdue
        });

        setRecentAssignments(allAssigned.slice(0, 5));

        // Mock chart data
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        setChartData(dayNames.map(day => ({
          name: day,
          count: Math.floor(Math.random() * 20) + 10,
          completed: Math.floor(Math.random() * 15) + 5
        })));

        // Team Performance Breakdown
        const depts = ["SEO", "Tech", "Sales", "Mgmt"];
        setTeamPerformance(depts.map(d => ({
          name: d,
          value: Math.floor(Math.random() * 40) + 60,
          tasks: Math.floor(Math.random() * 15) + 5
        })));

      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        toast.error("Failed to synchronize dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <AppShell role="admin" title="Dashboard" subtitle="Synchronizing workspace data...">
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Layers className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">Initializing Core Insights...</p>
        </div>
      </AppShell>
    );
  }

  const firstName = currentAdmin?.name?.split(" ").pop() || "Admin";
  const basePath = currentAdmin?.role === "master_admin" ? "/master-admin" : "/admin";

  return (
    <AppShell 
      role={currentAdmin?.role || "admin"} 
      title={`${getGreeting()}, ${firstName}`} 
      subtitle="Operational command center for team-wide assignment velocity."
      actions={
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="h-10 rounded-xl border-border/50 bg-background/50 backdrop-blur-md hover:bg-accent/50 transition-all">
            <Link to={`${basePath}/tasks`}>View Board</Link>
          </Button>
          <Button asChild className="h-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-95">
            <Link to={`${basePath}/tasks`}><Plus className="mr-2 h-4 w-4" /> Create Assignment</Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-8 pb-12 animate-in fade-in duration-700">
        
        {/* STATS BENTO GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Deployments", value: taskStats.activeBundles, icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10", glow: "group-hover:shadow-blue-500/20" },
            { label: "Success Rate", value: `${taskStats.completionRate}%`, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", glow: "group-hover:shadow-amber-500/20" },
            { label: "Completed Milestones", value: taskStats.completed, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", glow: "group-hover:shadow-emerald-500/20" },
            { label: "Critical Items", value: taskStats.overdue, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10", glow: "group-hover:shadow-rose-500/20" },
          ].map((stat, i) => (
            <Card key={i} className={cn("group relative overflow-hidden border-none shadow-premium transition-all hover:shadow-2xl hover:-translate-y-1", stat.glow)}>
              <div className={cn("absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full opacity-10 blur-3xl transition-transform group-hover:scale-150", stat.bg)} />
              <CardContent className="p-7">
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-2xl p-3.5 transition-all group-hover:rotate-6", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                    <h3 className="text-3xl font-black tracking-tighter mt-1">{stat.value}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* VELOCITY ANALYSIS */}
          <Card className="lg:col-span-8 border-none shadow-premium bg-background/50 backdrop-blur-xl overflow-hidden group">
            <header className="flex items-center justify-between px-10 py-8 border-b border-border/40">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary animate-pulse" /> Operational Velocity
                </h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1.5">Assignment volume vs completion over time</p>
              </div>
              <div className="flex items-center gap-1 bg-accent/50 p-1.5 rounded-2xl border border-border/40 shadow-inner">
                <Button variant="ghost" size="sm" className="h-8 rounded-xl text-[10px] font-black uppercase tracking-wider px-4">Daily</Button>
                <Button variant="secondary" size="sm" className="h-8 rounded-xl text-[10px] font-black uppercase tracking-wider px-4 shadow-sm">Weekly</Button>
              </div>
            </header>
            <CardContent className="p-10">
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="velocityFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: 'hsl(var(--muted-foreground))' }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 900 }}
                    />
                    <Area type="monotone" dataKey="count" name="Deployed" stroke="hsl(var(--primary))" strokeWidth={5} fill="url(#velocityFill)" />
                    <Area type="monotone" dataKey="completed" name="Completed" stroke="hsl(var(--success))" strokeWidth={5} fill="transparent" strokeDasharray="10 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* TEAM BREAKDOWN */}
          <Card className="lg:col-span-4 border-none shadow-premium flex flex-col bg-zinc-900 text-white overflow-hidden">
            <header className="px-10 py-8 border-b border-white/10">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" /> Team Health
              </h3>
              <p className="text-[10px] text-white/40 font-bold uppercase mt-1.5">Efficiency rating per department</p>
            </header>
            <CardContent className="p-8 space-y-8 flex-1">
              {teamPerformance.map((team, i) => (
                <div key={i} className="space-y-3 group/team cursor-default">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black group-hover/team:bg-primary/20 transition-colors">
                        {team.name[0]}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">{team.name}</span>
                    </div>
                    <span className="text-xs font-black text-primary">{team.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 group-hover/team:brightness-125" 
                      style={{ width: `${team.value}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-black uppercase text-white/30 tracking-tighter">
                    <span>{team.tasks} Active Tasks</span>
                    <span>Peak Velocity</span>
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-white/5">
                 <Button asChild variant="ghost" className="w-full h-11 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/5">
                   <Link to={`${basePath}/logs`}>Full Operational Report <ChevronRight className="ml-2 h-4 w-4" /></Link>
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RECENT LIVE FEED */}
        <div className="grid gap-8 lg:grid-cols-2">
           <Card className="border-none shadow-premium overflow-hidden bg-background/50 backdrop-blur-xl">
             <header className="px-10 py-8 border-b border-border/40 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" /> Live Deployments
                </h3>
                <Link to={`${basePath}/tasks`} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Manage All</Link>
             </header>
             <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {recentAssignments.map((a: any) => (
                    <Link key={a._id} to={`${basePath}/tasks`} className="flex items-center gap-6 px-10 py-6 transition-all hover:bg-accent/5 group/row">
                      <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center group-hover/row:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-muted-foreground group-hover/row:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-sm font-black tracking-tight truncate group-hover/row:text-primary transition-colors">{a.title}</h4>
                          <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-tighter">{Math.round(a.progress)}%</span>
                        </div>
                        <Progress value={a.progress} className="h-1 bg-accent/40" />
                        <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span>{a.assignedTo.name}</span>
                          <span className="text-[8px] font-black bg-accent px-2 py-0.5 rounded opacity-50">{a.assignedTo.team}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
             </CardContent>
           </Card>

           <div className="grid grid-cols-2 gap-6">
              {[
                { title: "Team Intel", desc: "Manage workspace roles", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", link: `${basePath}/users` },
                { title: "Daily Pulse", desc: "Live activity tracking", icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10", link: `${basePath}/today` },
                { title: "SEO Matrix", desc: "Digital footprint analysis", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10", link: `${basePath}/seo-reports` },
                { title: "Messages", desc: "Team collaboration", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", link: `${basePath}/messages` },
              ].map((tool, i) => (
                <Link key={i} to={tool.link} className="group p-8 rounded-[2.5rem] bg-background shadow-premium border border-border/30 transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30">
                  <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-3", tool.bg)}>
                    <tool.icon className={cn("h-8 w-8", tool.color)} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-wider group-hover:text-primary transition-colors">{tool.title}</h4>
                  <p className="text-[10px] text-muted-foreground font-black uppercase mt-1.5 opacity-60">{tool.desc}</p>
                </Link>
              ))}
           </div>
        </div>
      </div>
    </AppShell>
  );
}