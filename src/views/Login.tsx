import { useState, useEffect } from "react";
import { Link, useNavigate } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import logo from "@/assests/Experience_my_India.webp";
import { auth } from "@/lib/api";
import { Shield, Globe, Lock, Info, CheckCircle2, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("khushi.employee@gmail.com");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [systemStatus, setSystemStatus] = useState("operational");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await auth.login(email, password);

      if (response.success && response.data) {
        setIsSuccess(true);
        toast.success("Identity verified. Accessing secure workspace...");

        const userRole = response.data.user?.role;
        setTimeout(() => {
          if (userRole === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/employee/dashboard");
          }
        }, 800);
      } else {
        toast.error(response.message || "Authentication failed. Please check your credentials.");
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Network synchronization failed. Ensure secure tunnel is active.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc] font-sans selection:bg-primary/20 dark:bg-zinc-950 overflow-hidden">
      
      {/* LEFT SIDE: Enterprise Vision & Status */}
      <div className="relative hidden w-[45%] flex-col justify-between bg-[#050505] p-12 lg:flex overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        
        {/* Subtle architectural grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px]"></div>

        <div className="relative z-10 flex flex-col h-full justify-between max-w-xl mx-auto w-full">
          {/* Top: Branding & Status */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.1em] text-zinc-400 uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              Enterprise Node 01-IND
            </div>
            
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
                  <Globe className="h-3 w-3" />
                  <span>v2.4.0-stable</span>
               </div>
            </div>
          </div>

          {/* Center: Hero Narrative */}
          <div className="my-auto py-12">
            <div className="space-y-2 mb-8">
               <div className="h-1 w-12 bg-primary rounded-full"></div>
               <h2 className="text-5xl xl:text-6xl font-semibold tracking-tight text-white leading-[1.05]">
                 Secure<br />
                 <span className="text-zinc-600 italic font-normal">Intelligent</span><br />
                 Workspace.
               </h2>
            </div>
            
            <p className="text-lg text-zinc-400 max-w-md leading-relaxed mb-10 font-light">
              Access the Experience My India internal portal. Your unified platform for productivity tracking and resource management.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-6 mt-12 border-t border-white/5 pt-10">
              <div className="space-y-2">
                <Shield className="h-5 w-5 text-primary/80" />
                <h4 className="text-sm font-semibold text-white">Quantum Security</h4>
                <p className="text-xs text-zinc-500">End-to-end encrypted logs and secure data handling.</p>
              </div>
              <div className="space-y-2">
                <CheckCircle2 className="h-5 w-5 text-success/80" />
                <h4 className="text-sm font-semibold text-white">System Status</h4>
                <p className="text-xs text-zinc-500">All core services are operational and healthy.</p>
              </div>
            </div>
          </div>

          {/* Bottom: Legal & Support */}
          <div className="flex items-center justify-between border-t border-white/5 pt-8">
            <p className="text-[10px] text-zinc-600 font-medium tracking-wide uppercase">
              © {new Date().getFullYear()} EXPERIENCE MY INDIA CORPORATE
            </p>
            <div className="flex gap-4">
              <Link to="#" className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-tighter">Security Protocol</Link>
              <Link to="#" className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-tighter">Support</Link>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="relative flex w-full flex-col justify-center px-8 lg:w-[55%] lg:px-24 xl:px-40 bg-white dark:bg-zinc-950">
        
        {/* Mobile Logo Only */}
        <div className="lg:hidden absolute top-8 left-8">
          <img src={logo.src} alt="Experience My India" className="h-8 w-auto dark:invert" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[420px]">
          
          {/* Header */}
          <div className="mb-12">
            <img src={logo.src} alt="Experience My India" className="hidden lg:block h-16 w-auto object-contain mb-10 dark:invert" />
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">Sign in</h1>
            <p className="text-base text-zinc-500 dark:text-zinc-400">
              Authorized access only. Use your corporate credentials.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  Work Email
                </label>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <Lock className="h-3 w-3" />
                  <span>Protected</span>
                </div>
              </div>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@experiencemyindia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isSubmitting || isSuccess}
                className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-5 text-base text-zinc-900 shadow-none transition-all focus:border-primary focus:bg-white focus:ring-[4px] focus:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-primary dark:focus:bg-black/50" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  Password
                </label>
                <Link to="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  Reset Credentials?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isSubmitting || isSuccess}
                className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-5 text-base text-zinc-900 shadow-none transition-all focus:border-primary focus:bg-white focus:ring-[4px] focus:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-primary dark:focus:bg-black/50" 
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input type="checkbox" id="remember" className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary" />
              <label htmlFor="remember" className="text-sm text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">Remember this device for 30 days</label>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || isSuccess}
              className={`relative h-14 w-full overflow-hidden rounded-2xl text-base font-bold tracking-tight shadow-xl transition-all duration-500 ${
                isSuccess ? 'bg-success hover:bg-success' : 'bg-primary hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  <span>Verifying...</span>
                </div>
              ) : isSuccess ? (
                <div className="flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-500">
                  <CheckCircle2 className="h-6 w-6" />
                  <span>Access Granted</span>
                </div>
              ) : (
                "Authenticate Session"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100 dark:border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <span className="bg-white px-4 dark:bg-zinc-950">Enterprise Single Sign-On</span>
            </div>
          </div>

          {/* SSO Options */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 rounded-xl border-zinc-200 text-sm font-semibold dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors flex gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google Workspace
            </Button>
            <Button variant="outline" className="h-12 rounded-xl border-zinc-200 text-sm font-semibold dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors flex gap-2">
              <svg className="h-4 w-4 text-[#0078d4]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/></svg>
              Microsoft 365
            </Button>
          </div>

          {/* Security Footer */}
          <div className="mt-12 flex items-center justify-center gap-6 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
            <div className="flex flex-col items-center gap-1">
              <Shield className="h-4 w-4 text-zinc-400" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">SSL Secure</span>
            </div>
            <div className="w-px h-8 bg-zinc-200 dark:bg-white/10"></div>
            <div className="flex flex-col items-center gap-1">
              <Lock className="h-4 w-4 text-zinc-400" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">AES-256</span>
            </div>
            <div className="w-px h-8 bg-zinc-200 dark:bg-white/10"></div>
            <div className="flex flex-col items-center gap-1">
              <AlertCircle className="h-4 w-4 text-zinc-400" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">MFA Ready</span>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
