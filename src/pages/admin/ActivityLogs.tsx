import { AppShell } from "@/components/AppShell";
import { activity, formatRelative } from "@/lib/mock-data";
import { Activity as ActivityIcon } from "lucide-react";

export default function ActivityLogs() {
  return (
    <AppShell role="admin" title="Activity logs" subtitle="A complete audit trail of every action.">
      <div className="rounded-xl border border-border bg-card shadow-card">
        <ol className="relative">
          {activity.concat(activity).map((e, i) => (
            <li key={`${e.id}-${i}`} className="relative flex gap-4 border-b border-border px-6 py-4 last:border-b-0">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <ActivityIcon className="h-4 w-4" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{e.actor}</span>{" "}
                  <span className="text-muted-foreground">{e.action}</span>{" "}
                  <span className="font-medium">{e.target}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatRelative(e.at)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </AppShell>
  );
}