import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Search, Users, ShieldCheck, Mail, Briefcase, Plus, X, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

function InviteUserDialog({ onUserAdded, currentUserRole }: { onUserAdded: () => void, currentUserRole: string }) {
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
        toast.success("Identity deployed successfully!");
        setOpen(false);
        onUserAdded();
        setName("");
        setEmail("");
        setPassword("");
        setRole("employee");
        setTeam("Engineering");
      } else {
        toast.error(response.message || "Deployment failed");
      }
    } catch (error: any) {
      toast.error(error.message || "System error during deployment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 px-6 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-95">
          <Plus className="mr-2 h-5 w-5" /> Add Intelligence Node
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-background shadow-2xl rounded-[2rem]">
        <div className="relative h-32 bg-primary flex items-center px-10 overflow-hidden">
           <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 rounded-full bg-white/10 blur-3xl" />
           <div className="relative z-10 text-white">
              <DialogTitle className="text-2xl font-black tracking-tight">Deploy New Identity</DialogTitle>
              <DialogDescription className="text-white/70 font-medium text-xs uppercase tracking-widest mt-1">
                 Workspace infrastructure management
              </DialogDescription>
           </div>
           <button onClick={() => setOpen(false)} className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <X className="h-4 w-4" />
           </button>
        </div>
        <form onSubmit={handleInvite} className="px-10 py-10 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
              <div className="relative">
                 <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                 <Input placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required className="h-12 pl-10 rounded-xl bg-accent/30 border-none focus:ring-2 ring-primary/20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Work Email</Label>
              <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                 <Input type="email" placeholder="john@company.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 pl-10 rounded-xl bg-accent/30 border-none focus:ring-2 ring-primary/20" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Password</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 rounded-xl bg-accent/30 border-none focus:ring-2 ring-primary/20" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Tier</Label>
              <Select value={role} onValueChange={(v: "admin"|"employee") => setRole(v)}>
                <SelectTrigger className="h-12 rounded-xl bg-accent/30 border-none focus:ring-2 ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  {currentUserRole === "master_admin" && (
                    <SelectItem value="admin">Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department</Label>
              <div className="relative">
                 <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                 <Input value={team} onChange={e => setTeam(e.target.value)} required className="h-12 pl-10 rounded-xl bg-accent/30 border-none focus:ring-2 ring-primary/20" placeholder="Engineering" />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? "Deploying..." : "Confirm Deployment"}
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, profileRes] = await Promise.all([
        admin.getAllUsers(100, 0),
        auth.getProfile()
      ]);
      
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (profileRes.success && profileRes.data) {
        setCurrentUser(profileRes.data);
      }
    } catch (error) {
      toast.error("Global directory sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell
      role={currentUser?.role || "admin"}
      title="Team Directory"
      subtitle={`Enterprise-wide mapping of ${users.length} active intelligence nodes.`}
      actions={currentUser && <InviteUserDialog onUserAdded={fetchData} currentUserRole={currentUser.role} />}
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Filter by identity or nexus..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 rounded-2xl bg-background border-border/40 shadow-premium group-focus-within:ring-2 ring-primary/20 transition-all" 
            />
          </div>
          <div className="hidden md:flex items-center gap-2 px-6 h-12 rounded-2xl bg-accent/30 border border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
             <ShieldCheck className="h-4 w-4 text-primary" /> Verified Environment
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((u) => {
              const basePath = currentUser?.role === "master_admin" ? "/master-admin" : "/admin";
              return (
              <Link
                key={u.id || u._id}
                to={`${basePath}/users/${u.id || u._id}`}
                className="group relative flex items-center gap-6 p-6 rounded-[2rem] bg-background border border-border/40 shadow-premium transition-all hover:shadow-2xl hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="relative">
                   <Avatar className="h-14 w-14 border-2 border-background shadow-lg transition-transform group-hover:scale-110">
                     <AvatarFallback className="bg-primary text-white text-sm font-black">
                       {u.name?.split(" ").map((p: string) => p[0]).slice(0, 2).join("")}
                     </AvatarFallback>
                   </Avatar>
                   {u.isActive !== false && (
                     <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-4 border-background" />
                   )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-black tracking-tight group-hover:text-primary transition-colors">{u.name}</h4>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                      u.role === "master_admin" ? "bg-primary/10 text-primary" : "bg-accent text-muted-foreground"
                    )}>
                      {u.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>{u.email}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span>{u.team || "Operations"}</span>
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-end gap-1 px-8 border-l border-border/40">
                   <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">System Output</span>
                   <span className="text-sm font-black">{u.totalLogs || 0} Logs</span>
                </div>

                <div className="h-12 w-12 rounded-2xl bg-accent/50 flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-white group-hover:translate-x-2">
                   <ChevronRight className="h-5 w-5" />
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}