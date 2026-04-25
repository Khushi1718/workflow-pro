import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { currentEmployee } from "@/lib/mock-data";

export default function EmployeeProfile() {
  const u = currentEmployee;
  return (
    <AppShell role="employee" title="Profile" subtitle="Manage your personal information and preferences.">
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-accent text-accent-foreground text-lg font-semibold">
                {u.name.split(" ").map((p) => p[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{u.name}</h2>
              <p className="text-sm text-muted-foreground">{u.email} · {u.team}</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">Change avatar</Button>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input defaultValue={u.name} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={u.email} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Team</Label>
              <Input defaultValue={u.team} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input defaultValue="Employee" disabled className="h-10" />
            </div>
            <div className="md:col-span-2 mt-2 flex justify-end gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold">Stats</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Total logs</dt><dd className="font-medium">{u.totalLogs}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Joined</dt><dd className="font-medium">{u.joinedAt}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Streak</dt><dd className="font-medium">12 days</dd></div>
            </dl>
          </section>
          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold">Security</h3>
            <p className="mt-1 text-xs text-muted-foreground">Manage your password and 2FA.</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" size="sm">Change password</Button>
              <Button variant="outline" size="sm">Enable 2FA</Button>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}