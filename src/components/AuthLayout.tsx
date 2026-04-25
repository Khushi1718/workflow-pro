import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-hover p-10 text-primary-foreground lg:flex">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Tracely</span>
        </Link>

        <div className="relative z-10 max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              The work tracker your team will actually use.
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/80">
              Capture progress, share proof, and stay aligned — without status meetings.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              { icon: Zap, t: "Lightning-fast logs", d: "Add an update in seconds." },
              { icon: BarChart3, t: "Real-time visibility", d: "Dashboards refresh as work happens." },
              { icon: ShieldCheck, t: "Built for teams", d: "Roles, audit trails, and granular controls." },
            ].map((f) => (
              <div key={f.t} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{f.t}</p>
                  <p className="text-xs text-primary-foreground/70">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/60">© {new Date().getFullYear()} Tracely Inc.</p>
      </div>

      {/* Right panel */}
      <div className="relative flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">Tracely</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="absolute right-4 top-4 hidden lg:block">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-8 md:px-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}