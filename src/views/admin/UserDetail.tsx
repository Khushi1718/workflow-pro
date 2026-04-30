import { useState, useEffect } from "react";
import { Link, useParams } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, FileText, UserMinus, UserCheck, Loader2, Layers, Calendar, Users } from "lucide-react";
import { admin, tasks, auth } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function UserDetail() {
  const { id } = useParams();
  const [u, setU] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userAssignments, setUserAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const [userRes, profileRes, assignmentsRes] = await Promise.all([
          admin.getUserDetail(id),
          auth.getProfile(),
          tasks.getAll("all")
        ]);

        if (userRes.success) setU(userRes.data);
        if (profileRes.success) setCurrentUser(profileRes.data);
        
        if (assignmentsRes.success && assignmentsRes.data) {
          const filtered = assignmentsRes.data.filter((a: any) => 
            (a.assignedTo?._id || a.assignedTo?.id || a.assignedTo) === id
          );
          setUserAssignments(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleStatus = async () => {
    if (!u) return;
    try {
      const res = await admin.updateUserStatus(u._id || u.id, !u.isActive);
      if (res.success) {
        setU({ ...u, isActive: !u.isActive });
        toast.success(`User access ${!u.isActive ? "restored" : "revoked"}`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update user status");
    }
  };

  const completed = userAssignments.filter(a => a.progress === 100).length;
  const inProgress = userAssignments.filter(a => a.progress > 0 && a.progress < 100).length;

  const basePath = currentUser?.role === "master_admin" ? "/master-admin" : "/admin";

  return (
    <AppShell role={currentUser?.role || "admin"}>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors">
          <Link to={`${basePath}/users`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Team Directory</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : !u ? (
        <div className="text-center py-20 text-muted-foreground bg-accent/5 rounded-3xl border-2 border-dashed border-border/50 font-bold uppercase tracking-widest">
           User intelligence not found
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <header className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-background/50 backdrop-blur-xl p-8 shadow-premium">
            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-20 translate-x-20 rounded-full bg-primary/5 blur-3xl" />
            
            <div className="relative flex flex-wrap items-center gap-8">
              <Avatar className="h-24 w-24 border-4 border-background shadow-2xl ring-4 ring-primary/5">
                <AvatarFallback className="bg-primary text-white text-3xl font-black">
                  {u.name.split(" ").map((p: string) => p[0]).join("")}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-black tracking-tighter">{u.name}</h1>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm",
                    u.isActive ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", u.isActive ? "bg-success" : "bg-destructive")} />
                    {u.isActive ? "Active Deployment" : "Restricted Access"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> {u.team}</span>
                  <span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> {u.role}</span>
                  <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Joined {new Date(u.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant={u.isActive ? "destructive" : "outline"} 
                  className={cn("h-11 px-6 rounded-2xl font-bold uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02]", u.isActive ? "shadow-destructive/20" : "")}
                  onClick={toggleStatus}
                >
                  {u.isActive ? <UserMinus className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                  {u.isActive ? "Revoke Access" : "Restore Access"}
                </Button>
              </div>
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            <StatCard label="Total Assignments" value={userAssignments.length} icon={FileText} />
            <StatCard label="Bundles Completed" value={completed} icon={CheckCircle2} tone="success" />
            <StatCard label="Active Progress" value={inProgress} icon={Clock} tone="info" />
          </div>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Historical Deployments
              </h2>
            </div>

            {userAssignments.length > 0 ? (
              <div className="grid gap-4">
                {userAssignments.map((a: any) => (
                  <Card key={a._id} className="group overflow-hidden border-none shadow-premium bg-background/50 backdrop-blur-md transition-all hover:shadow-xl hover:translate-x-1">
                    <CardContent className="p-0">
                       <Link to={`${basePath}/tasks`} className="flex items-center gap-6 px-8 py-6">
                          <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                             <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-black uppercase tracking-wide truncate group-hover:text-primary transition-colors">{a.title}</h4>
                                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{Math.round(a.progress)}%</span>
                             </div>
                             <Progress value={a.progress} className="h-1.5 bg-accent/30" />
                             <div className="flex items-center justify-between mt-3">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">By {a.assignedBy?.name || "System"}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(a.createdAt).toLocaleDateString()}</span>
                             </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                       </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2rem] border-2 border-dashed border-border/50 bg-accent/5">
                <Layers className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No historical logs detected</p>
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}