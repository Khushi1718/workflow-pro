import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { currentAdmin } from "@/lib/mock-data";

export default function AdminProfile() {
  const u = currentAdmin;
  return (
    <AppShell role="admin" title="Profile" subtitle="Your admin account.">
      <section className="max-w-3xl rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-accent text-accent-foreground text-lg font-semibold">
              {u.name.split(" ").map((p) => p[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{u.name}</h2>
            <p className="text-sm text-muted-foreground">{u.email} · Admin</p>
          </div>
        </div>
        <form className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Full name</Label><Input defaultValue={u.name} className="h-10" /></div>
          <div className="space-y-2"><Label>Email</Label><Input defaultValue={u.email} className="h-10" /></div>
          <div className="space-y-2"><Label>Team</Label><Input defaultValue={u.team} className="h-10" /></div>
          <div className="space-y-2"><Label>Role</Label><Input defaultValue="Admin" disabled className="h-10" /></div>
          <div className="md:col-span-2 mt-2 flex justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button>Save changes</Button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}