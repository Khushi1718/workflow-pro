import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import logo from "@/assests/Experience_my_India.webp";
import { auth } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [email, setEmail] = useState("khushi@google.com");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await auth.login(email, password);

      if (response.success && response.data) {
        setIsSuccess(true);
        toast.success("Login successful!");

        // Determine user role and navigate accordingly
        const userRole = response.data.user?.role;
        setTimeout(() => {
          if (userRole === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/employee/dashboard");
          }
        }, 800);
      } else {
        toast.error(response.message || "Login failed");
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to connect to server. Make sure backend is running on http://localhost:5123");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc] font-sans selection:bg-primary/20 dark:bg-zinc-950">
      
      {/* LEFT SIDE: Ultra-Minimal Typography */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-[#0a0a0a] p-12 lg:flex">
        {/* Subtle, clean architectural grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px]"></div>

        <div className="relative z-10 flex flex-col h-full justify-between max-w-lg mx-auto w-full">
          {/* Top */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
              <div className="h-1.5 w-1.5 rounded-full bg-success"></div>
              Internal Workspace
            </div>
          </div>

          {/* Center: Minimalist Statement */}
          <div className="my-auto">
            <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.1] mb-6">
              Track your work.<br />
              <span className="text-zinc-500">Empower your team.</span>
            </h2>
            <p className="text-base text-zinc-400 max-w-sm leading-relaxed">
              A dedicated, distraction-free environment for Experience My India employees to log daily tasks and maintain clear alignment.
            </p>
          </div>

          {/* Bottom */}
          <div>
            <p className="text-xs text-zinc-600 font-medium">
              © {new Date().getFullYear()} Experience My India. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Premium Form */}
      <div className="relative flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24 xl:px-32 bg-white dark:bg-zinc-950">

        <div className="relative z-10 mx-auto w-full max-w-[400px]">
          
          {/* Logo */}
          <div className="mb-12">
            <Link to="/" className="inline-block transition-transform hover:scale-105">
              <img src={logo} alt="Experience My India" className="h-14 w-auto object-contain dark:invert" />
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back</h1>
            <p className="mt-2.5 text-sm text-zinc-500 dark:text-zinc-400">
              Please enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Work Email
              </label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@google.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                disabled={isSubmitting || isSuccess}
                className="h-12 rounded-xl border-zinc-200 bg-white/50 px-4 text-zinc-900 shadow-sm transition-all focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus-visible:border-primary dark:focus-visible:bg-black/50" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Password
                </label>
                <Link to="#" className="text-xs font-medium text-primary hover:underline hover:text-primary-hover transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                disabled={isSubmitting || isSuccess}
                className="h-12 rounded-xl border-zinc-200 bg-white/50 px-4 text-zinc-900 shadow-sm transition-all focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus-visible:border-primary dark:focus-visible:bg-black/50" 
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || isSuccess}
              className={`relative mt-2 h-12 w-full overflow-hidden rounded-xl text-sm font-semibold tracking-wide shadow-md transition-all duration-300 ${
                isSuccess ? 'bg-success hover:bg-success/90' : 'hover:scale-[1.02] hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  Authenticating...
                </div>
              ) : isSuccess ? (
                <div className="flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Success
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Dev Demo Links for debugging */}
          <div className="mt-12 rounded-xl border border-zinc-200/50 bg-zinc-50/50 p-4 text-center dark:border-white/5 dark:bg-white/5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Demo Credentials
            </p>
            <div className="flex justify-center gap-6">
              <Link to="/employee/dashboard" className="text-xs font-medium text-primary hover:text-primary-hover hover:underline">
                Employee Dashboard
              </Link>
              <Link to="/admin/dashboard" className="text-xs font-medium text-primary hover:text-primary-hover hover:underline">
                Admin Dashboard
              </Link>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}