import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LogsTable } from "@/components/LogsTable";
import { EmptyState } from "@/components/StatCard";
import { CalendarClock, Loader2 } from "lucide-react";
import { admin } from "@/lib/api";

export default function TodayLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayLogs = async () => {
      try {
        const res = await admin.getTodayLogs(50, 0);
        if (res.success && res.data) {
          const transformed = res.data.map((l: any) => ({
            ...l,
            user: l.userId?.name || l.user?.name || "Unknown",
          }));
          setLogs(transformed);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayLogs();
  }, []);

  return (
    <AppShell role="admin" title="Today's logs" subtitle="Everything logged across the team today.">
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length ? (
        <LogsTable logs={logs} basePath="/admin/logs" showUser />
      ) : (
        <EmptyState icon={CalendarClock} title="Nothing yet today" description="Logs will appear here as your team adds them." />
      )}
    </AppShell>
  );
}