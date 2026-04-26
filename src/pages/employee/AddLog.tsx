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
import { workLogs } from "@/lib/api";

export default function AddLog() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    accomplishments: "",
    meetingsAttended: "0",
    focusForTomorrow: "",
    meetingNotes: "",
    status: "in_progress",
    date: new Date().toISOString().slice(0, 10),
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a log title");
      return;
    }

    if (!formData.accomplishments.trim()) {
      toast.error("Please describe your accomplishments");
      return;
    }

    try {
      setIsLoading(true);
      
      // Merge selected date with current time
      const [year, month, day] = formData.date.split("-").map(Number);
      const dateObj = new Date();
      dateObj.setFullYear(year, month - 1, day);

      const logPayload = {
        title: formData.title,
        accomplishments: formData.accomplishments,
        meetingsAttended: parseInt(formData.meetingsAttended) || 0,
        focusForTomorrow: formData.focusForTomorrow,
        meetingNotes: formData.meetingNotes,
        status: formData.status,
        date: dateObj.toISOString(),
      };

      const response = await workLogs.create(logPayload);

      if (response.success) {
        toast.success("Work log created successfully!");
        // Wait a moment for the data to sync, then navigate
        setTimeout(() => {
          navigate("/employee/logs");
        }, 500);
      } else {
        toast.error(response.message || "Failed to create work log");
      }
    } catch (error: any) {
      console.error("Error creating log:", error);
      toast.error(error.message || "Failed to create work log");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell role="employee" title="Add work log" subtitle="Capture what you worked on today.">
      <form
        className="grid gap-6 lg:grid-cols-3"
        onSubmit={handleSubmit}
      >
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold">Details</h2>
            <p className="text-xs text-muted-foreground">A clear title and short summary helps your team scan quickly.</p>
            <div className="mt-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Log Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Refactored authentication module" 
                  required 
                  className="h-10 bg-secondary/20 shadow-xs"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accomplishments">Key Accomplishments</Label>
                <Textarea 
                  id="accomplishments" 
                  placeholder="What exactly did you accomplish today? Detail your main tasks and outcomes." 
                  rows={4} 
                  className="bg-secondary/20 shadow-xs resize-none"
                  value={formData.accomplishments}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingsAttended">Meetings Attended</Label>
                  <Input 
                    id="meetingsAttended" 
                    type="number" 
                    min="0" 
                    className="h-10 bg-secondary/20 shadow-xs"
                    value={formData.meetingsAttended}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="focusForTomorrow">Focus for Tomorrow</Label>
                  <Input 
                    id="focusForTomorrow" 
                    placeholder="What is your top priority for next shift?" 
                    className="h-10 bg-secondary/20 shadow-xs"
                    value={formData.focusForTomorrow}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingNotes">Meeting Outcomes & Action Items (optional)</Label>
                <Textarea 
                  id="meetingNotes" 
                  placeholder="List any decisions made, next steps, and follow-ups from your meetings..." 
                  rows={3} 
                  className="bg-secondary/20 shadow-xs resize-none"
                  value={formData.meetingNotes}
                  onChange={handleInputChange}
                />
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
                <Select 
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
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
                <Input 
                  id="date" 
                  type="date" 
                  className="h-10 shadow-xs bg-secondary/20"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>
          <div className="flex flex-col gap-2">
            <Button type="submit" className="h-10 w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save log"}
            </Button>
            <Button type="button" variant="ghost" className="h-10 w-full" onClick={() => navigate(-1)} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </aside>
      </form>
    </AppShell>
  );
}