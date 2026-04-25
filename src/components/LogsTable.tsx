import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";
import type { WorkLog } from "@/lib/mock-data";
import { formatDate, formatTime } from "@/lib/mock-data";
import { ChevronRight, Paperclip } from "lucide-react";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function LogsTable({
  logs,
  basePath,
  showUser = false,
}: {
  logs: WorkLog[];
  basePath: string;
  showUser?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      {/* Header */}
      <div className="hidden grid-cols-12 gap-4 border-b border-border bg-secondary/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
        <div className="col-span-5">Title</div>
        {showUser && <div className="col-span-2">User</div>}
        <div className={showUser ? "col-span-2" : "col-span-3"}>Status</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-1 text-right">—</div>
      </div>
      <ul className="divide-y divide-border">
        {logs.map((log) => (
          <li key={log.id}>
            <Link
              to={`${basePath}/${log.id}`}
              className="grid grid-cols-1 items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/50 md:grid-cols-12"
            >
              <div className="md:col-span-5">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{log.title}</p>
                  {log.proofUrl && <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{log.description}</p>
              </div>
              {showUser && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-accent text-accent-foreground text-[10px] font-semibold">
                      {initials(log.user)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{log.user}</span>
                </div>
              )}
              <div className={showUser ? "md:col-span-2" : "md:col-span-3"}>
                <StatusBadge status={log.status} />
              </div>
              <div className="text-sm text-muted-foreground md:col-span-2">
                <div>{formatDate(log.date)}</div>
                <div className="text-xs">{formatTime(log.date)}</div>
              </div>
              <div className="hidden justify-end text-muted-foreground md:col-span-1 md:flex">
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}