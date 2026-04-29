import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { admin, auth } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function InviteUserDialog({ onUserAdded }: { onUserAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "employee">("employee");
  const [team, setTeam] = useState("Engineering");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await auth.register(name, email, password, role, team);
      if (response.success) {
        toast.success("User added successfully!");
        setOpen(false);
        onUserAdded();
        setName("");
        setEmail("");
        setPassword("");
        setRole("employee");
        setTeam("Engineering");
      } else {
        toast.error(response.message || "Failed to add user");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-xs hover:shadow-sm transition-shadow">
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-border bg-card">
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl tracking-tight">Add new user</DialogTitle>
          <DialogDescription className="mt-1.5 text-sm">
            Add a new member to your workspace to collaborate on logs.
          </DialogDescription>
        </div>
        <form onSubmit={handleInvite} className="px-6 py-4 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</Label>
            <Input id="name" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email address</Label>
            <Input id="email" type="email" placeholder="name@yourcompany.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</Label>
              <Select value={role} onValueChange={(v: "admin"|"employee") => setRole(v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</Label>
              <Input id="team" type="text" value={team} onChange={e => setTeam(e.target.value)} required className="h-10" placeholder="Engineering" />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="px-6" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AllUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const fetchUsers = async () => {
    try {
      const response = await admin.getAllUsers(100, 0);
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell
      role="admin"
      title="All users"
      subtitle={`${users.length} members in your workspace`}
      actions={<InviteUserDialog onUserAdded={fetchUsers} />}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="relative md:w-[350px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-10 rounded-lg shadow-xs" 
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-secondary/40 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <div className="col-span-5">User</div>
          <div className="col-span-2">Team</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Logs</div>
          <div className="col-span-1 text-right">—</div>
        </div>
        <ul className="divide-y divide-border">
          {filteredUsers.map((u) => {
            const count = u.totalLogs || 0;
            return (
              <li key={u.id || u._id}>
                <Link
                  to={`/admin/users/${u.id || u._id}`}
                  className="grid grid-cols-1 items-center gap-4 px-6 py-4 transition-all hover:bg-secondary/60 md:grid-cols-12"
                >
                  <div className="flex items-center gap-3.5 md:col-span-5">
                    <Avatar className="h-10 w-10 border border-border shadow-xs">
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                        {u.name?.split(" ").map((p: string) => p[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground tracking-tight">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground mt-0.5">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground md:col-span-2">{u.team}</div>
                  <div className="md:col-span-2">
                    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium capitalize shadow-xs">
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