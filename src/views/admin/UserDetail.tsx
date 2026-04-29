import { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogsTable } from "@/components/LogsTable";
import { EmptyState, StatCard } from "@/components/StatCard";
import { formatDate } from "@/lib/mock-data";
import { ArrowLeft, CheckCircle2, Clock, FileText, ShieldCheck, UserMinus, UserCheck, ChevronLeft, ChevronRight, FilterX, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { admin } from "@/lib/api";
import { toast } from "sonner";

export default function UserDetail() {
  const { id } = useParams();
  const [u, setU] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const completed = userLogs.filter((l) => l.status === "completed").length;
  const inProgress = userLogs.filter((l) => l.status === "in_progress").length;

  const [status, setStatus] = useState<"all" | string>("all");
  const [date, setDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const [userRes, logsRes] = await Promise.all([
          admin.getUserDetail(id),
          admin.getAllLogs(100, 0, id)
        ]);
        if (userRes.success) setU(userRes.data);
        if (logsRes.success && logsRes.data) {
          const transformedLogs = logsRes.data.map((l: any) => ({
            ...l,
            // userId is populated as an object from the backend
            user: l.userId?.name || l.user?.name || "Unknown",
          }));
          setUserLogs(transformedLogs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // Only re-run when id changes – not u?.name (that caused infinite loop)
  }, [id]);

  const filteredLogs = useMemo(() => {
    return userLogs.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (date && !l.date.startsWith(date)) return false;
      return true;
    });
  }, [userLogs, status, date]);

  const pages = Math.max(1, Math.ceil(filteredLogs.length / perPage));
  const pageLogs = filteredLogs.slice((page - 1) * perPage, page * perPage);

  const clearFilters = () => {
    setStatus("all");
    setDate("");
    setPage(1);
  };

  const hasActiveFilters = status !== "all" || date !== "";

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

  return (
    <AppShell role="admin">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link to="/admin/users"><ArrowLeft className="mr-1 h-4 w-4" /> Back to users</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !u ? (
        <div className="text-center py-12 text-muted-foreground">User not found</div>
      ) : (
        <>
          <header className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-card">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-accent text-accent-foreground text-lg font-semibold">
                {u.name.split(" ").map((p: string) => p[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight">{u.name}</h1>
                {u.isActive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-success"></span> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive"></span> Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                {u.team} · {u.role} <span className="normal-case text-muted-foreground/70 mx-1">•</span> Joined {u.joinedAt ? formatDate(u.joinedAt) : 'Unknown'}
                {!u.isActive && u.leftAt && (
                  <>
                    <span className="normal-case text-muted-foreground/70 mx-1">•</span> Left {formatDate(u.leftAt)}
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {u.isActive ? (
                <Button variant="destructive" className="shadow-xs bg-destructive/90 hover:bg-destructive" onClick={toggleStatus}>
                  <UserMinus className="mr-2 h-4 w-4" /> Revoke Access
                </Button>
              ) : (
                <Button variant="outline" className="shadow-xs" onClick={toggleStatus}>
                  <UserCheck className="mr-2 h-4 w-4" /> Restore Access
                </Button>
              )}
            </div>
          </header>

      {u.role === "admin" ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-border bg-secondary/20 px-6 py-16 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mt-5 text-base font-semibold tracking-tight text-foreground">Workspace Administrator</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {u.name} has full administrative access to manage users, view all workspace logs, and oversee system settings. Administrators do not maintain individual work logs.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <StatCard label="Total logs" value={userLogs.length} icon={FileText} />
            <StatCard label="Completed" value={completed} icon={CheckCircle2} tone="success" />
            <StatCard label="In progress" value={inProgress} icon={Clock} tone="info" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-tight">Work Logs</h2>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-muted-foreground hover:text-foreground">
                <FilterX className="mr-1.5 h-3.5 w-3.5" /> Clear filters
              </Button>
            )}
          </div>

          <div className="mb-6 flex flex-col md:flex-row flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1.5 shadow-xs">
            <div className="flex-1 min-w-[150px] px-1">
              <Select value={status} onValueChange={(v) => { setStatus(v as never); setPage(1); }}>
                <SelectTrigger className="h-9 w-full border-none bg-transparent hover:bg-secondary/50 focus:ring-0 px-3 font-medium">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-semibold">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-6 w-px bg-border hidden md:block" />
            <div className="flex-1 min-w-[150px] px-1">
              <Input 
                type="date" 
                value={date}
                onChange={(e) => { setDate(e.target.value); setPage(1); }}
                onClick={(e) => {
                  try { (e.target as HTMLInputElement).showPicker(); } catch (err) {}
                }}
                className="h-9 w-full border-none bg-transparent hover:bg-secondary/50 focus-visible:ring-0 px-3 cursor-pointer text-sm font-medium text-muted-foreground" 
              />
            </div>
          </div>

          {pageLogs.length ? (
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <LogsTable logs={pageLogs} basePath="/admin/logs" />
              <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-6 py-3 text-xs text-muted-foreground font-medium">
                <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filteredLogs.length)} of {filteredLogs.length} logs</span>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="icon" className="h-7 w-7 bg-background shadow-xs" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2">Page {page} of {pages}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7 bg-background shadow-xs" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState icon={FilterX} title="No logs found" description="No work logs match your current filters." />
          )}
        </>
      )}
        </>
      )}
    </AppShell>
  );
}