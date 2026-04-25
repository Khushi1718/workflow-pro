import { AppShell } from "@/components/AppShell";
import { LogsTable } from "@/components/LogsTable";
import { EmptyState } from "@/components/StatCard";
import { todayLogs } from "@/lib/mock-data";
import { CalendarClock } from "lucide-react";

export default function TodayLogs() {
  return (
    <AppShell role="admin" title="Today's logs" subtitle="Everything logged across the team today.">
      {todayLogs.length ? (
        <LogsTable logs={todayLogs} basePath="/admin/logs" showUser />
      ) : (
        <EmptyState icon={CalendarClock} title="Nothing yet today" description="Logs will appear here as your team adds them." />
      )}
    </AppShell>
  );
}