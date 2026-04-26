import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/mock-data";
import { workLogs } from "@/lib/api";
import { 
  ArrowLeft, Calendar, User, Pencil, 
  FileText, FileSpreadsheet, Presentation, 
  Link as LinkIcon, Image as ImageIcon, 
  ExternalLink, Paperclip 
} from "lucide-react";

export default function LogDetail() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = pathname.startsWith("/admin");
  const role = isAdmin ? "admin" : "employee";
  const basePath = isAdmin ? "/admin/logs" : "/employee/logs";

  useEffect(() => {
    const fetchLog = async () => {
      try {
        if (!id) return;
        const res = await workLogs.getDetail(id);
        if (res.success && res.data) {
          setLog({
            ...res.data,
            // userId is populated as an object; normalise to a display string
            user: res.data.userId?.name || res.data.user?.name || "Unknown",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id]);

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case "image": return <ImageIcon className="h-5 w-5 text-primary" />;
      case "spreadsheet": return <FileSpreadsheet className="h-5 w-5 text-success" />;
      case "presentation": return <Presentation className="h-5 w-5 text-warning" />;
      case "document": return <FileText className="h-5 w-5 text-info" />;
      case "link": return <LinkIcon className="h-5 w-5 text-foreground" />;
      default: return <Paperclip className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <AppShell role={role}>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Link to={basePath}><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to logs</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !log ? (
        <div className="text-center py-12 text-muted-foreground">Log not found</div>
      ) : (

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2 space-y-6">
          <header className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-mono text-muted-foreground">#{log._id || log.id}</p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">{log.title}</h1>
              </div>
              <div className="flex items-center gap-2.5">
                <StatusBadge status={log.status} />
                <Button variant="outline" size="sm" className="shadow-xs"><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
              </div>
            </div>
          </header>

          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold tracking-tight">Key Accomplishments</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">{log.accomplishments}</p>
          </section>

          {(log.meetingsAttended > 0 || log.focusForTomorrow) && (
            <div className="grid gap-6 sm:grid-cols-2">
              {log.meetingsAttended > 0 && (
                <section className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                    Meetings Attended
                  </h2>
                  <p className="mt-3 text-2xl font-bold text-primary">{log.meetingsAttended}</p>
                </section>
              )}
              {log.focusForTomorrow && (
                <section className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                    Focus for Tomorrow
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">{log.focusForTomorrow}</p>
                </section>
              )}
            </div>
          )}

          {log.meetingNotes && (
            <section className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-sm font-semibold tracking-tight">Meeting notes</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{log.meetingNotes}</p>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-tight">Proof of work</h2>
            </div>
            
            {log.attachments && log.attachments.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {log.attachments.map((att) => (
                  <li key={att.id}>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3.5 rounded-lg border border-border bg-secondary/20 p-3 transition-all hover:bg-secondary/60 hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background shadow-xs border border-border/50">
                        {getAttachmentIcon(att.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {att.name}
                        </p>
                        <p className="text-[11px] font-medium text-muted-foreground capitalize mt-0.5">{att.type}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 mr-1" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-secondary/10 p-8 text-center">
                <Paperclip className="mx-auto h-6 w-6 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-foreground">No attachments</p>
                <p className="text-xs text-muted-foreground mt-1">Links, documents, or images haven't been attached.</p>
              </div>
            )}
          </section>
        </article>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold tracking-tight">Details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center gap-3.5">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Author</dt>
                  <dd className="flex items-center gap-2 font-medium text-foreground">
                    <Avatar className="h-5 w-5 border border-border">
                      <AvatarFallback className="bg-accent text-accent-foreground text-[9px] font-semibold">
                        {log.user.split(" ").map((p) => p[0]).slice(0,2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {log.user}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Date</dt>
                  <dd className="font-medium text-foreground">{formatDate(log.date)}</dd>
                </div>
              </div>
            </dl>
          </section>
        </aside>
      </div>
      )}
    </AppShell>
  );
}