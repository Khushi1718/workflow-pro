import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signup() {
  const navigate = useNavigate();
  return (
    <AuthLayout title="Create your account" subtitle="Start tracking your team's work in minutes.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate("/employee/dashboard");
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="first">First name</Label>
            <Input id="first" placeholder="Ava" required className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last">Last name</Label>
            <Input id="last" placeholder="Mitchell" required className="h-10" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="you@company.com" required className="h-10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" required className="h-10" />
          <p className="text-xs text-muted-foreground">Use 8+ characters with letters and numbers.</p>
        </div>
        <Button type="submit" className="h-10 w-full">Create account</Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to our <Link to="#" className="underline">Terms</Link> and{" "}
          <Link to="#" className="underline">Privacy Policy</Link>.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}