import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router";
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
import { ChevronLeft, ChevronRight, FileText, Filter, PlusCircle, Search, Loader2 } from "lucide-react";
import { workLogs } from "@/lib/api";
import { toast } from "sonner";

interface WorkLog {
  id: string;
  title: string;
  tasks?: Array<{
    id: string;
    text: string;
    status: "completed" | "in_progress" | "pending";
    priority: "high" | "medium" | "low";
    notes?: string;
  }>;
  meetingsAttended: number;
  focusForTomorrow?: string;
  status: "completed" | "in_progress" | "pending";
  date: string;
  user?: string;
  userAvatar?: string;
  meetingNotes?: string;
  attachments?: any[];
}

export default function MyLogs() {
  const [status, setStatus] = useState<"all" | "completed" | "in_progress" | "pending">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalLogs, setTotalLogs] = useState(0);
  const perPage = 8;

  // Fetch logs from backend
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const skip = (page - 1) * perPage;
        const response = await workLogs.getMyLogs(
          perPage,
          skip,
          status === "all" ? undefined : status
        );

        if (response.success && response.data) {
          // Transform backend data to match UI expectations
          const transformedLogs = response.data.map((log: any) => ({
            ...log,
            user: log.user?.name || "Unknown",
            userAvatar: log.user?.avatar,
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
        toast.error("Failed to load your logs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [page, status]);

  const pages = Math.max(1, Math.ceil(totalLogs / perPage));

  return (
    <AppShell
      role="employee"
      title="My logs"
      subtitle="Browse and filter all of your work entries."
      actions={
        <Button asChild>
          <Link to="/employee/add-log"><PlusCircle className="mr-2 h-4 w-4" /> New log</Link>
        </Button>
      }
    >
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search logs..." className="h-10 pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => {
            setStatus(v as never);
            setPage(1); // Reset to first page when filter changes
          }}>
            <SelectTrigger className="h-10 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-10 w-10"><Filter className="h-4 w-4" /></Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading your logs...</span>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No logs found"
          description="Try adjusting your filters or create a new work log."
          action={<Button asChild><Link to="/employee/add-log"><PlusCircle className="mr-2 h-4 w-4" /> Add your first log</Link></Button>}
        />
      ) : (
        <>
          <LogsTable logs={logs} basePath="/employee/logs" />
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalLogs)} of {totalLogs}</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}