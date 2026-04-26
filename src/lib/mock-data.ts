export type LogStatus = "completed" | "in_progress" | "pending";

export type AttachmentType = "image" | "link" | "document" | "spreadsheet" | "presentation";

export interface WorkLogAttachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
}

export interface WorkLog {
  id: string;
  title: string;
  accomplishments: string;
  meetingsAttended: number;
  focusForTomorrow?: string;
  status: LogStatus;
  date: string;
  user: string;
  userAvatar?: string;
  meetingNotes?: string;
  attachments?: WorkLogAttachment[];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  team: string;
  joinedAt: string;
  isActive: boolean;
  leftAt?: string;
  totalLogs: number;
}

export const currentEmployee: AppUser = {
  id: "u1",
  name: "Ms. Khushi",
  email: "khushi@google.com",
  role: "employee",
  team: "Development",
  joinedAt: "2024-03-12",
  isActive: true,
  totalLogs: 142,
};

export const currentAdmin: AppUser = {
  id: "a1",
  name: "Mr. Guru",
  email: "guru@google.com",
  role: "admin",
  team: "Administration",
  joinedAt: "2023-09-01",
  isActive: true,
  totalLogs: 320,
};

export const users: AppUser[] = [
  currentEmployee,
  { id: "u2", name: "Mr. Adarsh", email: "adarsh@google.com", role: "employee", team: "SEO", joinedAt: "2024-01-08", isActive: true, totalLogs: 211 },
  { id: "u3", name: "Ms. Preeti", email: "preeti@google.com", role: "employee", team: "Content Writing", joinedAt: "2023-11-22", isActive: true, totalLogs: 178 },
  { id: "u4", name: "Mr. Rahul", email: "rahul@google.com", role: "employee", team: "Design", joinedAt: "2024-05-30", isActive: true, totalLogs: 96 },
  { id: "u5", name: "Mr. Padam", email: "padam@google.com", role: "employee", team: "Development", joinedAt: "2024-02-14", isActive: false, leftAt: "2025-10-01", totalLogs: 134 },
  { id: "u6", name: "Mr. Yash", email: "yash@google.com", role: "employee", team: "SEO", joinedAt: "2023-08-19", isActive: true, totalLogs: 245 },
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
    accomplishments:
      "Worked through the planned scope, captured requirements, and synced with stakeholders. Outcomes documented and follow-ups assigned.",
    meetingsAttended: Math.floor(i % 4),
    focusForTomorrow: i % 2 === 0 ? "Finalize the documentation and prepare for the sprint review." : "Begin working on the next epic.",
    status: statuses[i % 3],
    date: iso(d),
    user: u.name,
    meetingNotes:
      i % 2 === 0
        ? "Sync with PM to confirm scope. Decisions: ship behind a feature flag, gather metrics for 2 weeks."
        : undefined,
    attachments: i % 3 === 0 ? [
      { id: `att_${i}_1`, name: "Final Design Specs", url: "https://images.unsplash.com/photo-1529119513315-c7c361862fc7?w=800", type: "image" },
      { id: `att_${i}_2`, name: "Q3 Planning Metrics", url: "#", type: "spreadsheet" },
      { id: `att_${i}_3`, name: "API Architecture Overview", url: "#", type: "document" }
    ] : i % 5 === 0 ? [
      { id: `att_${i}_4`, name: "Figma Prototype Link", url: "#", type: "link" },
      { id: `att_${i}_5`, name: "Stakeholder Presentation", url: "#", type: "presentation" }
    ] : [],
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
  { id: "e1", actor: "Vikram Sharma", action: "completed log", target: "Migrated analytics to v2 schema", at: iso(new Date(Date.now() - 1000 * 60 * 12)) },
  { id: "e2", actor: "Priya Shah", action: "uploaded proof to", target: "Designed onboarding illustrations", at: iso(new Date(Date.now() - 1000 * 60 * 47)) },
  { id: "e3", actor: "Ananya Desai", action: "started", target: "Refactored authentication module", at: iso(new Date(Date.now() - 1000 * 60 * 90)) },
  { id: "e4", actor: "Rohan Verma", action: "invited", target: "arjun@google.com", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 3)) },
  { id: "e5", actor: "Sneha Iyer", action: "edited log", target: "Drafted launch announcement copy", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 5)) },
  { id: "e6", actor: "Karan Malhotra", action: "commented on", target: "Investigated production latency", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 7)) },
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