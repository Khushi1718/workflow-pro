import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { auth, tasks } from "@/lib/api";
import { getGreeting, cn } from "@/lib/utils";
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
  Target
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function EmployeeDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    personalVelocity: 0
  });
  const [assignedAssignments, setAssignedAssignments] = useState<any[]>([]);
  const [velocityData, setVelocityData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, tasksRes] = await Promise.all([
          auth.getProfile(),
          tasks.getAll("assigned_to_me")
        ]);

        if (profileRes.success) setCurrentUser(profileRes.data);

        const allTasks = tasksRes.data || [];
        const total = allTasks.length;
        const completed = allTasks.filter((a: any) => a.progress === 100).length;
        const pending = allTasks.filter((a: any) => a.progress < 100).length;
        
        setTaskStats({
          total,
          completed,
          pending,
          personalVelocity: total > 0 ? Math.round((completed / total) * 100) : 0
        });

        setAssignedAssignments(allTasks.slice(0, 5));

        // Mock velocity data for chart
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const weekData = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const dateStr = d.toDateString();
          const dayTasks = allTasks.filter((a: any) => new Date(a.createdAt).toDateString() === dateStr);
          return {
            name: dayNames[d.getDay()],
            val: dayTasks.length
          };
        });
        setVelocityData(weekData);

      } catch (error) {
        console.error("Employee dashboard error:", error);
        toast.error("Failed to sync personal workspace");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <AppShell role="employee" title="Dashboard" subtitle="Synchronizing your personal workspace...">
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Target className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Personalizing your insights...</p>
        </div>
      </AppShell>
    );
  }

  const firstName = currentUser?.name?.split(" ").pop() || "Member";

  return (
    <AppShell 
      role="employee" 
      title={`${getGreeting()}, ${firstName}`} 
      subtitle="Your personal mission control for active tasks and project velocity."
      actions={
        <Button asChild className="h-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02]">
          <Link to="/employee/tasks"><PlayCircle className="mr-2 h-4 w-4" /> Go to Task Board</Link>
        </Button>
      }
    >
      <div className="space-y-8 pb-10">
        {/* PERSONAL METRICS */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "My Total Tasks", value: taskStats.total, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
            { label: "Pending Now", value: taskStats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Successfully Done", value: taskStats.completed, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
            { label: "My Velocity", value: `${taskStats.personalVelocity}%`, icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="group overflow-hidden border-none shadow-premium transition-all hover:shadow-2xl hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={cn("rounded-2xl p-4 transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* ACTIVE ASSIGNMENTS LIST */}
          <Card className="lg:col-span-7 overflow-hidden border-none shadow-premium bg-background/50 backdrop-blur-xl">
             <header className="flex items-center justify-between border-b border-border/50 px-8 py-6">
                <div>
                   <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" /> Active Deployments
                   </h3>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">High priority assignments for you</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase text-primary">
                   <Link to="/employee/tasks">View Task Board</Link>
                </Button>
             </header>
             <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                   {assignedAssignments.length > 0 ? (
                      assignedAssignments.map((a: any) => (
                        <Link key={a._id} to="/employee/tasks" className="group flex items-center gap-6 px-8 py-6 transition-all hover:bg-accent/5">
                           <div className="h-14 w-14 shrink-0 rounded-2xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <FileText className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                 <h4 className="text-sm font-black uppercase tracking-wide truncate group-hover:text-primary transition-colors">{a.title}</h4>
                                 <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{Math.round(a.progress)}%</span>
                              </div>
                              <Progress value={a.progress} className="h-1.5 bg-accent/30" />
                              <div className="flex items-center justify-between mt-3">
                                 <span className="text-[10px] font-bold text-muted-foreground uppercase">From {a.assignedBy.name}</span>
                                 <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(a.createdAt).toLocaleDateString()}</span>
                              </div>
                           </div>
                           <ChevronRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1" />
                        </Link>
                      ))
                   ) : (
                      <div className="py-20 text-center">
                         <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                            <Layers className="h-8 w-8 text-muted-foreground opacity-20" />
                         </div>
                         <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No active assignments</p>
                      </div>
                   )}
                </div>
             </CardContent>
          </Card>

          {/* VELOCITY CHART */}
          <div className="lg:col-span-5 space-y-8">
             <Card className="border-none shadow-premium bg-gradient-to-br from-primary/5 to-transparent">
                <header className="px-8 py-6 border-b border-border/50">
                   <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> My Output Velocity
                   </h3>
                </header>
                <CardContent className="p-8">
                   <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={velocityData}>
                            <defs>
                               <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                               </linearGradient>
                            </defs>
                            <XAxis dataKey="name" hide />
                            <YAxis hide />
                            <Tooltip 
                              contentStyle={{ 
                                 borderRadius: '12px', 
                                 border: 'none', 
                                 backgroundColor: 'hsl(var(--card))',
                                 boxShadow: 'var(--shadow-xl)'
                              }} 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="val" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={4} 
                              fill="url(#velocityGradient)" 
                            />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="mt-6 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/50 shadow-inner text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Personal Performance Rating</p>
                      <p className="text-xl font-black mt-1">Excellent Architecture</p>
                   </div>
                </CardContent>
             </Card>

             <div className="grid grid-cols-2 gap-4">
                <Link to="/employee/profile" className="group p-5 rounded-3xl bg-background shadow-premium border-none transition-all hover:bg-primary hover:-translate-y-1">
                   <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center mb-3 transition-colors group-hover:bg-white/20">
                      <Layers className="h-5 w-5 text-muted-foreground group-hover:text-white" />
                   </div>
                   <h4 className="text-xs font-black uppercase tracking-wider group-hover:text-white">Profile</h4>
                   <p className="text-[10px] text-muted-foreground font-bold mt-1 group-hover:text-white/70">Personal settings</p>
                </Link>
                <Link to="/employee/messages" className="group p-5 rounded-3xl bg-background shadow-premium border-none transition-all hover:bg-success hover:-translate-y-1">
                   <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center mb-3 transition-colors group-hover:bg-white/20">
                      <Zap className="h-5 w-5 text-muted-foreground group-hover:text-white" />
                   </div>
                   <h4 className="text-xs font-black uppercase tracking-wider group-hover:text-white">Messages</h4>
                   <p className="text-[10px] text-muted-foreground font-bold mt-1 group-hover:text-white/70">Team interaction</p>
                </Link>
             </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
