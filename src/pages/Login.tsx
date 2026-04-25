import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const navigate = useNavigate();
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Tracely workspace.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate("/employee/dashboard");
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="h-10">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Google
          </Button>
          <Button type="button" variant="outline" className="h-10">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.42 2.21-1.18 2.97-.78.81-2.05 1.43-3.13 1.34-.13-1.12.39-2.27 1.13-3.04.83-.86 2.21-1.5 3.18-1.27zM20.84 17.05c-.55 1.27-.81 1.84-1.52 2.97-.99 1.57-2.39 3.52-4.13 3.54-1.55.02-1.95-1.01-4.05-1-2.1.01-2.54 1.02-4.09 1-1.74-.02-3.07-1.79-4.06-3.36-2.78-4.4-3.07-9.56-1.36-12.3 1.21-1.94 3.13-3.07 4.93-3.07 1.83 0 2.98 1 4.49 1 1.47 0 2.36-1 4.48-1 1.6 0 3.3.87 4.51 2.38-3.97 2.18-3.32 7.85.8 9.84z"/></svg>
            Apple
          </Button>
        </div>
        <div className="relative my-1">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            or continue with email
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" required className="h-10" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="#" className="text-xs font-medium text-primary hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" required className="h-10" />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Keep me signed in</Label>
        </div>
        <Button type="submit" className="h-10 w-full">Sign in</Button>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Demo: continue as{" "}
          <Link to="/employee/dashboard" className="text-primary hover:underline">Employee</Link>{" "}
          or{" "}
          <Link to="/admin/dashboard" className="text-primary hover:underline">Admin</Link>
        </p>
      </form>
    </AuthLayout>
  );
}