import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logs, formatDate, formatTime } from "@/lib/mock-data";
import { ArrowLeft, Calendar, Clock, Download, Pencil, User } from "lucide-react";

export default function LogDetail() {
  const { id } = useParams();
  const log = logs.find((l) => l.id === id) ?? logs[0];

  return (
    <AppShell role="employee">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link to="/employee/logs"><ArrowLeft className="mr-1 h-4 w-4" /> Back to logs</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2 space-y-6">
          <header className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-mono text-muted-foreground">#{log.id}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">{log.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={log.status} />
                <Button variant="outline" size="sm"><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
              </div>
            </div>
          </header>

          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold">Description</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">{log.description}</p>
          </section>

          {log.meetingNotes && (
            <section className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-sm font-semibold">Meeting notes</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{log.meetingNotes}</p>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Proof of work</h2>
              {log.proofUrl && (
                <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" /> Download</Button>
              )}
            </div>
            {log.proofUrl ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <img src={log.proofUrl} alt="Proof of work" className="aspect-video w-full object-cover" />
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No proof attached.</p>
            )}
          </section>
        </article>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Author</dt>
                  <dd className="flex items-center gap-2 font-medium">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-accent text-accent-foreground text-[9px] font-semibold">
                        {log.user.split(" ").map((p) => p[0]).slice(0,2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {log.user}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Date</dt>
                  <dd className="font-medium">{formatDate(log.date)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Logged at</dt>
                  <dd className="font-medium">{formatTime(log.date)}</dd>
                </div>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}