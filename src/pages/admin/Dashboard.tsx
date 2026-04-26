import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { admin, auth } from "@/lib/api";
import { getGreeting } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Clock, FileText, Users, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";


export default function AdminDashboard() {
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [stats, setStats] = useState({
    activeUsers: 0,
    todayLogs: 0,
    completedCount: 0,
    inProgressCount: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [productivityData, setProductivityData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch admin profile and dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Get current admin profile
        const profileResponse = await auth.getProfile();
        if (profileResponse.success) {
          setCurrentAdmin(profileResponse.data);
        }

        // Get all users (to count active)
        const usersResponse = await admin.getAllUsers(100, 0);
        const activeUsers = usersResponse.data ? usersResponse.data.filter((u: any) => u.isActive).length : 0;

        // Get today's logs
        const todayResponse = await admin.getTodayLogs(100, 0);
        const todayLogs = todayResponse.data || [];

        // Get all logs to count by status
        const allLogsResponse = await admin.getAllLogs(100, 0);
        const allLogs = allLogsResponse.data || [];

        const completedCount = allLogs.filter((l: any) => l.status === "completed").length;
        const inProgressCount = allLogs.filter((l: any) => l.status === "in_progress").length;

        setStats({
          activeUsers,
          todayLogs: todayLogs.length,
          completedCount,
          inProgressCount,
        });

        // Build 7-day productivity chart from real logs
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const weekData = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const dayLabel = dayNames[d.getDay()];
          const dateStr = d.toDateString();
          const dayLogs = allLogs.filter((l: any) => new Date(l.date).toDateString() === dateStr);
          return {
            name: dayLabel,
            completed: dayLogs.filter((l: any) => l.status === "completed").length,
            inProgress: dayLogs.filter((l: any) => l.status === "in_progress").length,
          };
        });
        setProductivityData(weekData);

        // Get recent logs for the list
        const recentResponse = await admin.getAllLogs(5, 0);
        if (recentResponse.success) {
          setRecentLogs(recentResponse.data || []);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <AppShell role="admin" title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading dashboard...</span>
        </div>
      </AppShell>
    );
  }

  const firstName = currentAdmin?.name?.split(" ").pop() || "Admin";

  return (
    <AppShell role="admin" title={`${getGreeting()}, ${firstName}`} subtitle="Track team productivity and overall system health at a glance.">
      {/* Top Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active users" value={stats.activeUsers} icon={Users} />
        <StatCard label="Logs today" value={stats.todayLogs} icon={FileText} tone="info" />
        <StatCard label="Completed" value={stats.completedCount} icon={CheckCircle2} tone="success" />
        <StatCard label="In progress" value={stats.inProgressCount} icon={Clock} tone="warning" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Productivity Trends Chart */}
        <section className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <header className="border-b border-border px-6 py-5">
            <h2 className="text-sm font-semibold tracking-tight">Productivity Trends</h2>
            <p className="text-xs text-muted-foreground mt-1">Logs completed vs. in-progress over the last 7 days</p>
          </header>
          <div className="flex-1 p-6 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${val}`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))', 
                    borderRadius: '12px', 
                    boxShadow: 'var(--shadow-md)',
                    color: 'hsl(var(--card-foreground))' 
                  }}
                  itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                  labelStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginBottom: '6px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  name="Completed" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="inProgress" 
                  name="In Progress" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorInProgress)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Activity / Logs */}
        <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <header className="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Recent Logs</h2>
              <p className="text-xs text-muted-foreground mt-1">Latest team activity</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
              <Link to="/admin/logs">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </header>
          <ul className="flex-1 divide-y divide-border overflow-y-auto max-h-[350px]">
            {recentLogs.map((log) => (
              <li key={log._id || log.id}>
                <Link to={`/admin/logs/${log._id || log.id}`} className="flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-secondary/40">
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-1 text-sm font-medium leading-snug">{log.title}</p>
                    <StatusBadge status={log.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium">
                      {log.userId?.name || log.user?.name || "Unknown"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{new Date(log.date).toLocaleDateString()}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}