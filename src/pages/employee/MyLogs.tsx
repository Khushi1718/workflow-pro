import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import { ChevronLeft, ChevronRight, FileText, Filter, PlusCircle, Search } from "lucide-react";
import { myLogs, type LogStatus } from "@/lib/mock-data";

export default function MyLogs() {
  const [status, setStatus] = useState<"all" | LogStatus>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => {
    return myLogs.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (q && !l.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [status, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageLogs = filtered.slice((page - 1) * perPage, page * perPage);

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
          <Select value={status} onValueChange={(v) => setStatus(v as never)}>
            <SelectTrigger className="h-10 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="h-10 w-40" />
          <Button variant="outline" size="icon" className="h-10 w-10"><Filter className="h-4 w-4" /></Button>
        </div>
      </div>

      {pageLogs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No logs found"
          description="Try adjusting your filters or create a new work log."
          action={<Button asChild><Link to="/employee/add-log"><PlusCircle className="mr-2 h-4 w-4" /> Add your first log</Link></Button>}
        />
      ) : (
        <>
          <LogsTable logs={pageLogs} basePath="/employee/logs" />
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2">Page {page} of {pages}</span>
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