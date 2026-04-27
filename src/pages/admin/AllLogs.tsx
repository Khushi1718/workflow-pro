import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { LogsTable } from "@/components/LogsTable";
import { EmptyState } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { admin } from "@/lib/api";
import { ChevronLeft, ChevronRight, Download, FileText, FilterX, Building2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WorkLog {
  id: string;
  title: string;
  accomplishments: string;
  meetingsAttended: number;
  focusForTomorrow?: string;
  status: "completed" | "in_progress" | "pending";
  date: string;
  user?: string;
  userAvatar?: string;
  meetingNotes?: string;
  attachments?: any[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  team: string;
  joinedAt: string;
  isActive: boolean;
  totalLogs: number;
}

export default function AllLogs() {
  const location = useLocation();
  const [status, setStatus] = useState<"all" | "completed" | "in_progress" | "pending">("all");
  const [team, setTeam] = useState<string>("all");
  const [user, setUser] = useState<string>(location.state?.user || "all");
  const [date, setDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalLogs, setTotalLogs] = useState(0);
  const perPage = 10;

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await admin.getAllUsers(100, 0);
        if (response.success && response.data) {
          const employees = response.data.filter((u: any) => u.role === "employee");
          setUsers(employees);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch logs based on filters
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const skip = (page - 1) * perPage;
        
        const response = await admin.getAllLogs(
          perPage,
          skip,
          user === "all" ? undefined : user,
          status === "all" ? undefined : status,
          date ? date : undefined,
          date ? `${date}T23:59:59.999Z` : undefined
        );

        if (response.success && response.data) {
          const transformedLogs = response.data.map((log: any) => ({
            ...log,
            user: log.userId?.name || log.user?.name || "Unknown",
            userAvatar: log.userId?.avatar || log.user?.avatar,
          }));
          setLogs(transformedLogs);
          if (response.pagination) {
            setTotalLogs(response.pagination.total);
          }
        } else {
          toast.error("Failed to fetch logs");
        }
      } catch (error: any) {
        console.error("Error fetching logs:", error);
        toast.error("Failed to load logs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [page, status, user, date]);

  const teams = useMemo(() => Array.from(new Set(users.map(u => u.team))), [users]);

  const availableUsers = useMemo(() => {
    return users.filter(u => team === "all" || u.team === team);
  }, [users, team]);

  const pages = Math.max(1, Math.ceil(totalLogs / perPage));

  const clearFilters = () => {
    setStatus("all");
    setTeam("all");
    setUser("all");
    setDate("");
    setPage(1);
  };

  const hasActiveFilters = status !== "all" || team !== "all" || user !== "all" || date !== "";

  return (
    <AppShell
      role="admin"
      title="All logs"
      subtitle="Filter, review, and export workspace logs."
      actions={
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
              <FilterX className="mr-1.5 h-4 w-4" /> Clear filters
            </Button>
          )}
          <Button variant="outline" className="shadow-xs"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>
      }
    >
      <div className="mb-6 flex flex-col md:flex-row flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1.5 shadow-xs">
        
        <div className="flex flex-1 min-w-[200px] items-center px-2">
          <Building2 className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Select 
            value={team} 
            onValueChange={(v) => { 
              setTeam(v); 
              if (v !== "all" && user !== "all") {
                const selectedUser = users.find(u => u.name === user);
                if (selectedUser?.team !== v) setUser("all");
              }
              setPage(1); 
            }}
          >
            <SelectTrigger className="h-9 w-full border-none bg-transparent hover:bg-secondary/50 focus:ring-0 px-2 font-medium">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-semibold">All Departments</SelectItem>
              {teams.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="h-6 w-px bg-border hidden md:block" />

        <div className="flex flex-1 min-w-[200px] items-center px-2">
          <Users className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Select value={user} onValueChange={(v) => { setUser(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-full border-none bg-transparent hover:bg-secondary/50 focus:ring-0 px-2 font-medium">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-semibold">All Employees</SelectItem>
              {availableUsers.map((u: any) => <SelectItem key={u._id || u.id} value={u._id || u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="h-6 w-px bg-border hidden md:block" />

        <div className="flex-1 min-w-[150px] px-1">
          <Select value={status} onValueChange={(v) => { setStatus(v as never); setPage(1); }}>
            <SelectTrigger className="h-9 w-full border-none bg-transparent hover:bg-secondary/50 focus:ring-0 px-3 font-medium">
              <SelectValue />
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading logs...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={FilterX} title="No matches found" description="Try clearing your filters or selecting a different date." />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <LogsTable logs={logs} basePath="/admin/logs" showUser />
          <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-6 py-3 text-xs text-muted-foreground font-medium">
            <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalLogs)} of {totalLogs} logs</span>
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
      )}
    </AppShell>
  );
}