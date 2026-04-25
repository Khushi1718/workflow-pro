import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  { icon: Zap, title: "Fast work logs", desc: "Capture progress in seconds with a streamlined editor and proof attachments." },
  { icon: BarChart3, title: "Real-time insight", desc: "Dashboards that refresh as your team logs work — no more status meetings." },
  { icon: ShieldCheck, title: "Built for teams", desc: "Roles, audit trails, and granular permissions designed for modern orgs." },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">Tracely</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#about" className="hover:text-foreground">About</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
            <Button asChild size="sm"><Link to="/signup">Get started</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--accent))_0%,transparent_70%)]" />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> New: AI summaries for your team's week
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            The work tracker your team will <span className="text-primary">actually use</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            Tracely helps modern teams capture progress, share proof, and stay aligned — without status meetings or scattered docs.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-6">
              <Link to="/signup">Start free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6">
              <Link to="/employee/dashboard">View employee demo</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Or jump into the <Link to="/admin/dashboard" className="font-medium text-primary hover:underline">admin demo</Link>.
          </p>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Everything your team needs to ship</h2>
          <p className="mt-2 text-sm text-muted-foreground">Designed for clarity. Built for speed.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-pop">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Learn more <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-4 rounded-2xl border border-border bg-card p-8 shadow-card md:grid-cols-3">
          {[
            { k: "10k+", v: "Logs created daily" },
            { k: "99.99%", v: "Uptime last year" },
            { k: "4.9/5", v: "Average team rating" },
          ].map((s) => (
            <div key={s.v} className="flex flex-col items-center text-center">
              <span className="text-3xl font-semibold tracking-tight">{s.k}</span>
              <span className="mt-1 text-sm text-muted-foreground">{s.v}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">Ready when you are.</h2>
          <p className="mt-2 text-sm text-muted-foreground">Free for teams up to 5. No credit card required.</p>
          <Button asChild size="lg" className="mt-6 h-11 px-6">
            <Link to="/signup">Create your workspace</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Tracely Inc.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
