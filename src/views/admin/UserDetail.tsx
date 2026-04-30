import { useState, useEffect } from "react";
import { Link, useParams } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  UserMinus, 
  UserCheck, 
  Loader2, 
  Layers, 
  Calendar, 
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldAlert,
  Lock,
  Unlock,
  ClipboardList,
  Briefcase,
  X
} from "lucide-react";
import { admin, tasks, auth } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AssignmentDetails } from "@/components/AssignmentDetails";

export default function UserDetail() {
  const { id } = useParams();
  const [u, setU] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userAssignments, setUserAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const itemsPerPage = 5;

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

  const fetchAssignmentTasks = async (assignmentId: string) => {
    try {
      const res = await tasks.getAssignmentTasks(assignmentId);
      if (res.success) {
        setSelectedAssignment((prev: any) => ({
          ...prev,
          tasks: res.data
        }));
      }
    } catch (error) {
      console.error("GET /assignments/:id/tasks error:", error);
    }
  };

  const toggleStatus = async () => {
    if (!u) return;
    try {
      const res = await admin.updateUserStatus(u._id || u.id, !u.isActive);
      if (res.success) {
        setU({ ...u, isActive: !u.isActive });
        toast.success(`User access ${!u.isActive ? "restored" : "revoked"}`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update status.");
    }
  };

  // Filtering Logic
  const filteredTasks = userAssignments.filter(a => {
    const taskDate = new Date(a.createdAt);
    const now = new Date();

    if (customDate) {
       return taskDate.toDateString() === new Date(customDate).toDateString();
    }

    if (dateFilter === "all") return true;
    if (dateFilter === "today") {
      return taskDate.toDateString() === now.toDateString();
    }
    if (dateFilter === "7days") {
       const weekAgo = new Date();
       weekAgo.setDate(now.getDate() - 7);
       return taskDate >= weekAgo;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: userAssignments.length,
    completed: userAssignments.filter(a => a.progress === 100).length,
    pending: userAssignments.filter(a => a.progress < 100).length
  };

  const basePath = currentUser?.role === "master_admin" ? "/master-admin" : "/admin";

  return (
    <AppShell role={currentUser?.role || "admin"} title="User Details">
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-100 dark:border-zinc-900 pb-10">
           <div className="flex items-center gap-6">
              <Avatar className="h-16 w-16 border border-zinc-200 shadow-sm">
                 <AvatarFallback className="bg-zinc-50 dark:bg-zinc-900 text-zinc-400 text-xl font-bold uppercase">
                    {u?.name?.split(" ").map((n:any)=>n[0]).join("")}
                 </AvatarFallback>
              </Avatar>
              <div>
                 <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{u?.name}</h1>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                      u?.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200/50" : "bg-rose-50 text-rose-600 border-rose-200/50"
                    )}>
                       {u?.isActive ? "Active User" : "Access Revoked"}
                    </Badge>
                 </div>
                 <div className="flex items-center gap-4 mt-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-tighter">
                    <span className="flex items-center gap-1.5"><Briefcase className="h-3 w-3" /> {u?.team}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-200" />
                    <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Joined {u && new Date(u.joinedAt || u.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <Button asChild variant="outline" className="h-9 px-4 rounded-md border-zinc-200 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50">
                 <Link to={`${basePath}/users`}><ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back</Link>
              </Button>
              <Button 
                variant={u?.isActive ? "destructive" : "outline"}
                className="h-9 px-4 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-md"
                onClick={toggleStatus}
              >
                 {u?.isActive ? <Lock className="mr-2 h-3.5 w-3.5" /> : <Unlock className="mr-2 h-3.5 w-3.5" />}
                 {u?.isActive ? "Revoke Access" : "Restore Access"}
              </Button>
           </div>
        </header>

        {/* METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           {[
             { label: "Total Tasks", value: stats.total, icon: ClipboardList, color: "text-zinc-400" },
             { label: "Completed Tasks", value: stats.completed, icon: CheckCircle2, color: "text-emerald-500" },
             { label: "Pending Tasks", value: stats.pending, icon: Clock, color: "text-amber-500" },
           ].map((s, i) => (
             <div key={i} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.label}</p>
                   <s.icon className={cn("h-4 w-4", s.color)} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{s.value}</h3>
             </div>
           ))}
        </div>

        {/* TASK HISTORY SECTION */}
        <section className="space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-6">
              <h2 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.3em] flex items-center gap-2">
                 <Layers className="h-4 w-4 text-zinc-400" /> Task History
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                 <div className="flex items-center gap-2 px-3 h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <input 
                      type="date" 
                      value={customDate}
                      onChange={(e) => { setCustomDate(e.target.value); setCurrentPage(1); }}
                      className="bg-transparent border-none text-[10px] font-bold uppercase outline-none focus:ring-0 w-24"
                    />
                    {customDate && (
                      <button onClick={() => setCustomDate("")} className="text-zinc-400 hover:text-rose-500">
                         <X className="h-3 w-3" />
                      </button>
                    )}
                 </div>

                 <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <Filter className="h-3.5 w-3.5" />
                 </div>
                 <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v); setCustomDate(""); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 w-[140px] rounded-md bg-zinc-50 border-zinc-200 text-[10px] font-bold uppercase tracking-wider">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-zinc-200">
                       <SelectItem value="all" className="text-[10px] font-bold">All History</SelectItem>
                       <SelectItem value="today" className="text-[10px] font-bold">Today Only</SelectItem>
                       <SelectItem value="7days" className="text-[10px] font-bold">Last 7 Days</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
           </div>

           <div className="space-y-3">
              {paginatedTasks.length > 0 ? paginatedTasks.map((a: any) => (
                 <div key={a._id} className="group flex items-center justify-between p-5 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 transition-all shadow-sm">
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                       <div className="h-10 w-10 rounded-md bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                          <FileText className="h-5 w-5" />
                       </div>
                       <div className="min-w-0 flex-1">
                          <h4 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 truncate group-hover:text-zinc-600 transition-colors">{a.title}</h4>
                          <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-medium uppercase tracking-tighter mt-1">
                             <span className="flex items-center gap-1.5">Assigned by {a.assignedBy?.name || "System"}</span>
                             <span className="h-1 w-1 rounded-full bg-zinc-200" />
                             <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(a.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-8 ml-6">
                        <div className="flex items-center gap-6">
                           <div className="text-right hidden sm:block">
                              <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-50">{Math.round(a.progress)}%</p>
                              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Progress</p>
                           </div>
                           <div className="h-1.5 w-24 bg-zinc-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-1000" style={{ width: `${a.progress}%` }} />
                           </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-md text-[10px] font-bold uppercase tracking-widest px-3 border-zinc-200 hover:bg-zinc-900 hover:text-white transition-all group-hover:border-zinc-900"
                          onClick={() => { setSelectedAssignment(a); fetchAssignmentTasks(a._id); setIsModalOpen(true); }}
                        >
                           View Bundle
                        </Button>
                     </div>
                 </div>
              )) : (
                 <div className="py-20 text-center border border-dashed border-zinc-100 rounded-xl">
                    <ShieldAlert className="h-10 w-10 text-zinc-100 mx-auto mb-4" />
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">No tasks found for this date segment</p>
                 </div>
              )}
           </div>

           {/* PAGINATION CONTROLS */}
           {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6">
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
                 <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-md border-zinc-200 disabled:opacity-30" 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                       <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-md border-zinc-200 disabled:opacity-30" 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                       <ChevronRight className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
           )}
        </section>
      </div>

      <AssignmentDetails 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assignment={selectedAssignment}
        currentUser={currentUser}
      />
    </AppShell>
  );
}