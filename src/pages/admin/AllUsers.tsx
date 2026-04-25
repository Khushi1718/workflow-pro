import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { users, logs } from "@/lib/mock-data";
import { ChevronRight, Search, UserPlus } from "lucide-react";

export default function AllUsers() {
  return (
    <AppShell
      role="admin"
      title="All users"
      subtitle={`${users.length} members in your workspace`}
      actions={<Button><UserPlus className="mr-2 h-4 w-4" /> Invite user</Button>}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." className="h-10 pl-9" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-secondary/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <div className="col-span-5">User</div>
          <div className="col-span-2">Team</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Logs</div>
          <div className="col-span-1 text-right">—</div>
        </div>
        <ul className="divide-y divide-border">
          {users.map((u) => {
            const count = logs.filter((l) => l.user === u.name).length;
            return (
              <li key={u.id}>
                <Link
                  to={`/admin/users/${u.id}`}
                  className="grid grid-cols-1 items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/50 md:grid-cols-12"
                >
                  <div className="flex items-center gap-3 md:col-span-5">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                        {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-sm md:col-span-2">{u.team}</div>
                  <div className="md:col-span-2">
                    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium capitalize">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-sm font-medium md:col-span-2">{count}</div>
                  <div className="hidden justify-end text-muted-foreground md:col-span-1 md:flex">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}