import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AddLog() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  return (
    <AppShell role="employee" title="Add work log" subtitle="Capture what you worked on today.">
      <form
        className="grid gap-6 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Work log created");
          navigate("/employee/logs");
        }}
      >
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold">Details</h2>
            <p className="text-xs text-muted-foreground">A clear title and short summary helps your team scan quickly.</p>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., Refactored authentication module" required className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" placeholder="What did you do? What was the outcome?" rows={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Meeting notes (optional)</Label>
                <Textarea id="notes" placeholder="Decisions, blockers, action items..." rows={4} />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold">Proof of work</h2>
            <p className="text-xs text-muted-foreground">Attach a screenshot, document, or link.</p>
            <label
              htmlFor="file"
              className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 px-6 py-10 text-center transition-colors hover:bg-secondary/60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
              <input
                id="file"
                type="file"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {file && (
              <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm">
                <span className="truncate">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold">Status</h2>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Current status</Label>
                <Select defaultValue="in_progress">
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Time spent (hours)</Label>
                <Input id="hours" type="number" min={0} step={0.5} placeholder="2.5" className="h-10" />
              </div>
            </div>
          </section>
          <div className="flex flex-col gap-2">
            <Button type="submit" className="h-10 w-full">Save log</Button>
            <Button type="button" variant="ghost" className="h-10 w-full" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </aside>
      </form>
    </AppShell>
  );
}