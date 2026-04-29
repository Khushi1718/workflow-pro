import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
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
import { ChevronLeft, ChevronRight, FilterX, Loader2, Search, Users } from "lucide-react";
import { toast } from "sonner";

export default function SEOReports() {
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [user, setUser] = useState("all");
  const [department, setDepartment] = useState("SEO");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const perPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await admin.getAllUsers(100, 0);
        if (response.success && response.data) {
          setUsers(response.data.filter((u: any) => u.role === "employee"));
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const skip = (page - 1) * perPage;
        const response = await admin.getSeoReports(
          perPage,
          skip,
          user === "all" ? undefined : user,
          date || undefined,
          department
        );

        if (response.success && response.data) {
          setLogs(response.data);
          setTotalLogs(response.pagination?.total || 0);
        } else {
          toast.error("Failed to fetch SEO reports");
        }
      } catch (error) {
        console.error("Error fetching SEO reports:", error);
        toast.error("Failed to load SEO reports");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [page, user, date, department]);

  const departments = useMemo(() => {
    const values = users.map((u) => u.team).filter(Boolean);
    return Array.from(new Set(["SEO", ...values]));
  }, [users]);

  const availableUsers = useMemo(() => {
    return users.filter((u) => u.team?.toLowerCase() === department.toLowerCase());
  }, [users, department]);

  const pages = Math.max(1, Math.ceil(totalLogs / perPage));
  const hasActiveFilters = user !== "all" || date !== "" || department !== "SEO";

  const clearFilters = () => {
    setUser("all");
    setDepartment("SEO");
    setDate("");
    setPage(1);
  };

  return (
    <AppShell
      role="admin"
      title="SEO Reports"
      subtitle="Review SEO activity captured inside daily logs."
      actions={
        hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
            <FilterX className="mr-1.5 h-4 w-4" /> Clear filters
          </Button>
        )
      }
    >
      <div className="mb-6 flex flex-col md:flex-row flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1.5 shadow-xs">
        <div className="flex flex-1 min-w-[200px] items-center px-2">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Select
            value={department}
            onValueChange={(v) => {
              setDepartment(v);
              setUser("all");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-full border-none bg-transparent hover:bg-secondary/50 focus:ring-0 px-2 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((team) => <SelectItem key={team} value={team}>{team}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="h-6 w-px bg-border hidden md:block" />

        <div className="flex flex-1 min-w-[200px] items-center px-2">
          <Users className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Select value={user} onValueChange={(v) => { setUser(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-full border-none bg-transparent hover:bg-secondary/50 focus:ring-0 px-2 font-medium">
              <SelectValue placeholder="All SEO Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-semibold">All SEO Employees</SelectItem>
              {availableUsers.map((u) => <SelectItem key={u._id || u.id} value={u._id || u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="h-6 w-px bg-border hidden md:block" />

        <div className="flex-1 min-w-[150px] px-1">
          <Input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="h-9 w-full border-none bg-transparent hover:bg-secondary/50 focus-visible:ring-0 px-3 cursor-pointer text-sm font-medium text-muted-foreground"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading SEO reports...</span>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={Search} title="No SEO reports found" description="Try another date or employee filter." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="hidden grid-cols-12 gap-4 border-b border-border bg-secondary/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
            <div className="col-span-3">Employee Name</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Questions Answered</div>
            <div className="col-span-2">Backlinks Created</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">View</div>
          </div>
          <ul className="divide-y divide-border">
            {logs.map((log) => {
              const logId = log._id || log.id;
              const seoData = log.seoData || {};
              return (
                <li key={logId}>
                  <Link to={`/admin/seo-reports/${logId}`} className="grid grid-cols-1 items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/50 md:grid-cols-12">
                    <div className="font-medium md:col-span-3">{log.userId?.name || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground md:col-span-2">{new Date(log.date).toLocaleDateString()}</div>
                    <div className="text-sm font-semibold md:col-span-2">{seoData.questionsAnswered || 0}</div>
                    <div className="text-sm font-semibold md:col-span-2">{seoData.backlinksCreated || 0}</div>
                    <div className="md:col-span-2"><StatusBadge status={log.status} /></div>
                    <div className="text-right text-xs font-bold text-primary md:col-span-1">Open</div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-6 py-3 text-xs text-muted-foreground font-medium">
            <span>Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, totalLogs)} of {totalLogs} reports</span>
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
