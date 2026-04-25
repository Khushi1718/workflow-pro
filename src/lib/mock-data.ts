export type LogStatus = "completed" | "in_progress" | "pending";

export interface WorkLog {
  id: string;
  title: string;
  description: string;
  status: LogStatus;
  date: string;
  user: string;
  userAvatar?: string;
  meetingNotes?: string;
  proofUrl?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  team: string;
  joinedAt: string;
  totalLogs: number;
}

export const currentEmployee: AppUser = {
  id: "u1",
  name: "Ava Mitchell",
  email: "ava@tracely.app",
  role: "employee",
  team: "Product",
  joinedAt: "2024-03-12",
  totalLogs: 142,
};

export const currentAdmin: AppUser = {
  id: "a1",
  name: "Daniel Reyes",
  email: "daniel@tracely.app",
  role: "admin",
  team: "Operations",
  joinedAt: "2023-09-01",
  totalLogs: 320,
};

export const users: AppUser[] = [
  currentEmployee,
  { id: "u2", name: "Marcus Chen", email: "marcus@tracely.app", role: "employee", team: "Engineering", joinedAt: "2024-01-08", totalLogs: 211 },
  { id: "u3", name: "Priya Shah", email: "priya@tracely.app", role: "employee", team: "Design", joinedAt: "2023-11-22", totalLogs: 178 },
  { id: "u4", name: "Liam O'Connor", email: "liam@tracely.app", role: "employee", team: "Engineering", joinedAt: "2024-05-30", totalLogs: 96 },
  { id: "u5", name: "Sofia Rossi", email: "sofia@tracely.app", role: "employee", team: "Marketing", joinedAt: "2024-02-14", totalLogs: 134 },
  { id: "u6", name: "Noah Patel", email: "noah@tracely.app", role: "employee", team: "Sales", joinedAt: "2023-08-19", totalLogs: 245 },
  currentAdmin,
];

const titles = [
  "Refactored authentication module",
  "Designed onboarding illustrations",
  "Q3 roadmap planning meeting",
  "Reviewed PRs for billing service",
  "Customer interview synthesis",
  "Fixed navigation accessibility bugs",
  "Drafted launch announcement copy",
  "Migrated analytics to v2 schema",
  "Pair-programmed websocket layer",
  "Sprint retro & action items",
  "Updated design tokens library",
  "Investigated production latency",
];

const today = new Date();
const iso = (d: Date) => d.toISOString();

export const logs: WorkLog[] = Array.from({ length: 28 }).map((_, i) => {
  const u = users[i % (users.length - 1)];
  const d = new Date(today);
  d.setDate(today.getDate() - Math.floor(i / 3));
  d.setHours(9 + (i % 8), (i * 7) % 60);
  const statuses: LogStatus[] = ["completed", "in_progress", "pending"];
  return {
    id: `log_${1000 + i}`,
    title: titles[i % titles.length],
    description:
      "Worked through the planned scope, captured blockers, and synced with stakeholders. Outcomes documented and follow-ups assigned.",
    status: statuses[i % 3],
    date: iso(d),
    user: u.name,
    meetingNotes:
      i % 2 === 0
        ? "Sync with PM to confirm scope. Decisions: ship behind a feature flag, gather metrics for 2 weeks."
        : undefined,
    proofUrl: i % 4 === 0 ? "https://images.unsplash.com/photo-1529119513315-c7c361862fc7?w=800" : undefined,
  };
});

export const todayLogs = logs.filter((l) => {
  const d = new Date(l.date);
  return d.toDateString() === today.toDateString();
});

export const myLogs = logs.filter((l) => l.user === currentEmployee.name);

export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export const activity: ActivityEvent[] = [
  { id: "e1", actor: "Marcus Chen", action: "completed log", target: "Migrated analytics to v2 schema", at: iso(new Date(Date.now() - 1000 * 60 * 12)) },
  { id: "e2", actor: "Priya Shah", action: "uploaded proof to", target: "Designed onboarding illustrations", at: iso(new Date(Date.now() - 1000 * 60 * 47)) },
  { id: "e3", actor: "Ava Mitchell", action: "started", target: "Refactored authentication module", at: iso(new Date(Date.now() - 1000 * 60 * 90)) },
  { id: "e4", actor: "Daniel Reyes", action: "invited", target: "noah@tracely.app", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 3)) },
  { id: "e5", actor: "Sofia Rossi", action: "edited log", target: "Drafted launch announcement copy", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 5)) },
  { id: "e6", actor: "Liam O'Connor", action: "commented on", target: "Investigated production latency", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 7)) },
];

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}