import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { tasks, auth as authApi, admin, apiRequest } from "@/lib/api";
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Calendar,
  User,
  ArrowRight,
  Loader2,
  Upload,
  FileText,
  X,
  Globe,
  PlayCircle,
  StopCircle,
  PlusCircle,
  Link,
  ExternalLink,
  File,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function TaskBoard({ 
  role, 
  initialDate, 
  title: propTitle, 
  subtitle: propSubtitle, 
  hideTabs = false 
}: { 
  role: "master_admin" | "admin" | "employee",
  initialDate?: string,
  title?: string,
  subtitle?: string,
  hideTabs?: boolean
}) {
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [type, setType] = useState<"assigned_to_me" | "assigned_by_me" | "all">(
    initialDate 
      ? (role === "employee" ? "assigned_to_me" : "all") 
      : (role === "employee" ? "assigned_to_me" : "assigned_by_me")
  );
  const [filterDate, setFilterDate] = useState<string>(initialDate || "");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // New Assignment Form State
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    assignedTo: "",
    tasks: [{ title: "", description: "", deadline: "", priority: "medium" }]
  });
  
  // View State
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [assignmentTasks, setAssignmentTasks] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [evidenceData, setEvidenceData] = useState({
    completionRemarks: "",
    evidence: "",
    evidenceFiles: [] as any[]
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await tasks.getAll(
        type, 
        undefined, 
        debouncedSearch, 
        filterDate, 
        filterDepartment === "all" ? undefined : filterDepartment
      );
      if (res.success) {
        setActiveTasks(res.data || []);
      }
    } catch (error) {
      console.error("GET /tasks error:", error);
      toast.error("Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignmentTasks = async (assignmentId: string) => {
    try {
      const res = await tasks.getAssignmentTasks(assignmentId);
      if (res.success) {
        setAssignmentTasks(res.data || []);
      }
    } catch (error) {
      toast.error("Failed to load tasks");
    }
  };

  const fetchUsers = async () => {
    try {
      const [usersRes, profileRes] = await Promise.all([
        role !== "employee" ? admin.getAllUsers(100, 0) : Promise.resolve({ success: true, data: [] }),
        authApi.getProfile()
      ]);
      
      if (profileRes.success) {
        setCurrentUser(profileRes.data);
      }
      
      if (role !== "employee" && usersRes.success && profileRes.success) {
        const profile = profileRes.data;
        let allUsers = usersRes.data || [];
        
        // Filter out the current user themselves
        let filtered = allUsers.filter((u: any) => (u.id || u._id) !== (profile.id || profile._id));
        
        if (role === "admin") {
          // Admins can only assign to Employees
          filtered = filtered.filter((u: any) => u.role === "employee");
        } else if (role === "master_admin") {
          // Superadmins can assign to Admins and Employees
          filtered = filtered.filter((u: any) => u.role === "admin" || u.role === "employee");
        }
        
        setUsers(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch users or profile", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [type, debouncedSearch, filterDate, filterDepartment]);

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.assignedTo) {
      toast.error("Assignment title and assignee are required");
      return;
    }

    const validTasks = assignmentForm.tasks.filter(t => t.title.trim() && t.description.trim() && t.deadline);
    if (validTasks.length === 0) {
      toast.error("Please add at least one task with a title, description, and deadline");
      return;
    }

    try {
      const payload = {
        ...assignmentForm,
        tasks: validTasks
      };
      console.log("Sending payload:", payload);
      const res = await tasks.create(payload);
      if (res.success) {
        toast.success("Assignment created successfully");
        setIsCreateModalOpen(false);
        fetchTasks();
        setAssignmentForm({
          title: "",
          assignedTo: "",
          tasks: [{ title: "", description: "", deadline: "", priority: "medium" }]
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create assignment");
    }
  };

  const handleAddTaskRow = () => {
    setAssignmentForm({
      ...assignmentForm,
      tasks: [...assignmentForm.tasks, { title: "", description: "", deadline: "", priority: "medium" }]
    });
  };

  const handleUpdateTaskRow = (index: number, field: string, value: string) => {
    const newTasks = [...assignmentForm.tasks];
    (newTasks[index] as any)[field] = value;
    setAssignmentForm({ ...assignmentForm, tasks: newTasks });
  };

  const handleToggleTimer = async (taskId: string, currentAction: "start" | "stop") => {
    try {
      const res = await tasks.toggleTimer(taskId, currentAction);
      if (res.success) {
        fetchAssignmentTasks(selectedAssignment._id);
        toast.success(`Timer ${currentAction}ed`);
      }
    } catch (error: any) {
      toast.error(error.message || "Timer action failed");
    }
  };

  const handleSubmitEvidence = async () => {
    // All fields are optional now as per user request
    if (!evidenceData.completionRemarks && !evidenceData.evidence && evidenceData.evidenceFiles.length === 0) {
      toast.error("Please provide at least one form of evidence (remarks, link, or file)");
      return;
    }

    try {
      const res = await tasks.update(selectedTask._id, {
        status: "completed",
        ...evidenceData
      });
      if (res.success) {
        toast.success("Task completed successfully");
        setIsEvidenceModalOpen(false);
        setEvidenceData({ completionRemarks: "", evidence: "", evidenceFiles: [] });
        fetchAssignmentTasks(selectedAssignment._id);
        fetchTasks(); // Refresh assignment progress
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit evidence");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newFiles = [...evidenceData.evidenceFiles];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Mock upload call
        const res = await apiRequest("/upload", {
          method: "POST",
          body: JSON.stringify({ name: file.name, type: file.type })
        });

        if (res.success) {
          newFiles.push(res.data);
        }
      }
      
      setEvidenceData({ ...evidenceData, evidenceFiles: newFiles });
      toast.success("Files uploaded successfully");
    } catch (error) {
      toast.error("File upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive border-destructive/20 bg-destructive/5";
      case "medium": return "text-amber-500 border-amber-500/20 bg-amber-500/5";
      case "low": return "text-blue-500 border-blue-500/20 bg-blue-500/5";
      default: return "";
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AppShell 
      role={role}
      title={propTitle || "Task Board"}
      subtitle={propSubtitle || `${activeTasks.length} active assignment bundles in this view.`}
      actions={(role === "master_admin" || role === "admin") && (
        <Button onClick={() => setIsCreateModalOpen(true)} className="h-9 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
          <PlusCircle className="h-4 w-4" /> Create Assignment
        </Button>
      )}
    >
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Create Assignment Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">New Assignment Bundle</DialogTitle>
                  <DialogDescription>Group multiple related tasks into one assignment</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assignment Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Website Content Revamp" 
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                    className="h-11 shadow-sm border-border/50 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignee" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign To</Label>
                  <Select value={assignmentForm.assignedTo} onValueChange={(v) => setAssignmentForm({...assignmentForm, assignedTo: v})}>
                    <SelectTrigger id="assignee" className="h-11 shadow-sm border-border/50">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u._id} value={u._id}>
                          <div className="flex flex-col items-start py-0.5">
                            <span className="font-bold text-sm">{u.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{u.role} • {u.team}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task List</Label>
                  <Button variant="ghost" size="sm" onClick={handleAddTaskRow} className="h-8 text-primary hover:text-primary hover:bg-primary/10 gap-2 font-bold text-[10px] uppercase">
                    <Plus className="h-3.5 w-3.5" /> Add Task Row
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {assignmentForm.tasks.map((task, index) => (
                    <div key={index} className="p-4 rounded-xl border border-border/50 bg-accent/5 hover:bg-accent/10 transition-all group">
                      <div className="grid gap-3 sm:grid-cols-5">
                        <div className="sm:col-span-2">
                          <Input 
                            placeholder="Task Title" 
                            value={task.title}
                            onChange={(e) => handleUpdateTaskRow(index, 'title', e.target.value)}
                            className="h-9 text-xs border-none bg-background shadow-sm focus:ring-1"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <Input 
                            type="date"
                            value={task.deadline}
                            onChange={(e) => handleUpdateTaskRow(index, 'deadline', e.target.value)}
                            className="h-9 text-xs border-none bg-background shadow-sm focus:ring-1"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <Select value={task.priority} onValueChange={(v) => handleUpdateTaskRow(index, 'priority', v)}>
                            <SelectTrigger className="h-9 text-xs border-none bg-background shadow-sm focus:ring-1">
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setAssignmentForm({...assignmentForm, tasks: assignmentForm.tasks.filter((_, i) => i !== index)})}
                            disabled={assignmentForm.tasks.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="sm:col-span-5">
                          <textarea 
                            placeholder="Task Description"
                            value={task.description}
                            onChange={(e) => handleUpdateTaskRow(index, 'description', e.target.value)}
                            className="w-full min-h-[60px] p-2.5 rounded-lg text-xs bg-background border-none shadow-sm focus:ring-1 outline-none resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter className="p-6 bg-accent/5 border-t border-border/50">
              <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAssignment} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                Create Assignment Bundle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assignment Tasks Modal */}
        <Dialog open={isTasksModalOpen} onOpenChange={setIsTasksModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold">{selectedAssignment?.title}</DialogTitle>
                    <DialogDescription>
                      Assigned to {selectedAssignment?.assignedTo?.name} • {assignmentTasks.length} Tasks
                    </DialogDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Overall Progress</div>
                  <div className="flex items-center gap-3">
                    <Progress value={selectedAssignment?.progress} className="h-2 w-32 bg-accent/50" />
                    <span className="text-sm font-bold">{Math.round(selectedAssignment?.progress || 0)}%</span>
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-accent/5">
              {assignmentTasks.map((task) => (
                <div key={task._id} className={cn(
                  "p-5 rounded-2xl bg-background border border-border/50 shadow-sm transition-all hover:shadow-md",
                  task.status === 'completed' && "opacity-75"
                )}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base">{task.title}</h4>
                        <Badge variant="outline" className={cn("text-[9px] uppercase font-bold", getPriorityColor(task.priority))}>
                          {task.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px] uppercase font-bold">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
                      
                      {task.status === 'completed' && (task.completionRemarks || task.evidence || (task.evidenceFiles && task.evidenceFiles.length > 0)) && (
                        <div className="mt-3 p-3 rounded-xl bg-accent/5 border border-border/50 space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completion Evidence</p>
                          {task.completionRemarks && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground/70 uppercase">Remarks</p>
                              <p className="text-xs italic text-foreground/80">"{task.completionRemarks}"</p>
                            </div>
                          )}
                          {task.evidence && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground/70 uppercase">Link</p>
                              <a href={task.evidence} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                                <Link className="h-3 w-3" /> View Evidence Link <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          )}
                          {task.evidenceFiles && task.evidenceFiles.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground/70 uppercase">Attachments</p>
                              <div className="flex flex-wrap gap-2">
                                {task.evidenceFiles.map((file: any, i: number) => (
                                  <a 
                                    key={i} 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[10px] bg-background hover:bg-accent/10 px-2 py-1 rounded-md border border-border/50 text-muted-foreground transition-colors"
                                  >
                                    <FileText className="h-3 w-3" /> {file.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          {task.completedAt && (
                            <div className="pt-1 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                              <Clock className="h-2.5 w-2.5" /> Submitted on {new Date(task.completedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 text-muted-foreground bg-accent px-2 py-1 rounded-md text-[10px] font-bold">
                        <Clock className="h-3 w-3" />
                        {formatTime(task.timeSpent || 0)}
                      </div>
                      {task.status === 'completed' ? (
                        <div className="flex items-center gap-1 text-success font-bold text-[10px] uppercase bg-success/10 px-2 py-1 rounded-md">
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </div>
                      ) : (
                        (() => {
                          const currentUserId = currentUser?.id || currentUser?._id;
                          const assigneeId = selectedAssignment?.assignedTo?._id || selectedAssignment?.assignedTo;
                          const isAssignee = currentUserId && assigneeId && (currentUserId === assigneeId);
                          
                          return isAssignee && (
                            <div className="flex items-center gap-2">
                              {task.timerStartedAt ? (
                                <Button size="sm" variant="outline" className="h-8 text-[10px] gap-1 border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => handleToggleTimer(task._id, 'stop')}>
                                  <StopCircle className="h-3.5 w-3.5" /> Stop Timer
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="h-8 text-[10px] gap-1 border-primary/20 text-primary hover:bg-primary/10" onClick={() => handleToggleTimer(task._id, 'start')}>
                                  <PlayCircle className="h-3.5 w-3.5" /> Start Timer
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                className="h-8 text-[10px] gap-1 bg-success hover:bg-success/90 text-white"
                                onClick={() => { setSelectedTask(task); setIsEvidenceModalOpen(true); }}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                              </Button>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Evidence Submission Modal */}
        <Dialog open={isEvidenceModalOpen} onOpenChange={setIsEvidenceModalOpen}>
          <DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Submit Evidence</DialogTitle>
              <DialogDescription>Attach proof of completion for: <span className="font-bold text-foreground">{selectedTask?.title}</span></DialogDescription>
            </DialogHeader>
            
            <div className="space-y-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="remarks" className="text-xs font-bold uppercase text-muted-foreground">Completion Remarks (Optional)</Label>
                <textarea 
                  id="remarks" 
                  placeholder="What did you achieve? Any notes for the admin?" 
                  value={evidenceData.completionRemarks}
                  onChange={(e) => setEvidenceData({...evidenceData, completionRemarks: e.target.value})}
                  className="w-full min-h-[100px] p-3 rounded-xl bg-accent/5 border border-border/50 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all resize-none"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="evidence" className="text-xs font-bold uppercase text-muted-foreground">Evidence Link (Optional)</Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    id="evidence" 
                    placeholder="https://github.com/..." 
                    value={evidenceData.evidence}
                    onChange={(e) => setEvidenceData({...evidenceData, evidence: e.target.value})}
                    className="pl-9 bg-accent/5 border-border/50 h-10 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Attachments (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {evidenceData.evidenceFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-primary/20">
                      <File className="h-3 w-3" />
                      <span className="max-w-[100px] truncate">{file.name}</span>
                      <button onClick={() => setEvidenceData({...evidenceData, evidenceFiles: evidenceData.evidenceFiles.filter((_, i) => i !== idx)})} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-muted-foreground cursor-pointer text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-border/50 transition-all">
                    {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                    <span>{isUploading ? "Uploading..." : "Add Files"}</span>
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsEvidenceModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitEvidence} className="bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20">
                Submit Completion Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
          {!hideTabs && (
            <>
              {role === "admin" && (
                <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50 shadow-sm">
                  <Button 
                    variant={type === "assigned_to_me" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 rounded-md text-xs px-4 font-bold uppercase tracking-wider"
                    onClick={() => setType("assigned_to_me")}
                  >
                    My Assignments
                  </Button>
                  <Button 
                    variant={type === "assigned_by_me" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 rounded-md text-xs px-4 font-bold uppercase tracking-wider"
                    onClick={() => setType("assigned_by_me")}
                  >
                    Assigned By Me
                  </Button>
                  <Button 
                    variant={type === "all" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 rounded-md text-xs px-4 font-bold uppercase tracking-wider"
                    onClick={() => setType("all")}
                  >
                    Global View
                  </Button>
                </div>
              )}

              {role === "master_admin" && (
                <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50 shadow-sm">
                  <Button 
                    variant={type === "assigned_by_me" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 rounded-md text-xs px-4 font-bold uppercase tracking-wider"
                    onClick={() => setType("assigned_by_me")}
                  >
                    Assigned By Me
                  </Button>
                  <Button 
                    variant={type === "all" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 rounded-md text-xs px-4 font-bold uppercase tracking-wider"
                    onClick={() => setType("all")}
                  >
                    Global View
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center gap-3 ml-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                className="pl-9 h-10 w-64 bg-background/50 border-border/50 shadow-sm focus:ring-1 focus:w-80 transition-all duration-300" 
                placeholder="Search assignments..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-background/50 p-1 rounded-lg border border-border/50 shadow-sm">
              <div className={cn("flex items-center gap-2 px-2", role !== "employee" && "border-r border-border/50")}>
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-bold uppercase outline-none focus:ring-0 w-24"
                />
                {filterDate && (
                  <button onClick={() => setFilterDate("")} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              
              {role !== "employee" && (
                <div className="flex items-center gap-2 px-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="h-8 w-28 border-none bg-transparent text-[11px] font-bold uppercase shadow-none focus:ring-0">
                      <SelectValue placeholder="DEPT" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Depts</SelectItem>
                      <SelectItem value="SEO">SEO</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Tech">Tech</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeTasks.length === 0 ? (
          <div className="flex flex-col h-[40vh] items-center justify-center text-center p-8 bg-accent/5 rounded-3xl border-2 border-dashed border-border/50">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No assignments found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1">
              {searchTerm ? "No results match your search" : "New assignments will appear here once created."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeTasks.map((assignment: any) => (
              <Card key={assignment._id} className="group overflow-hidden border-none shadow-premium bg-background hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className={cn("h-1.5 w-full", 
                  assignment.priority === 'high' ? 'bg-destructive' : 
                  assignment.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                )} />
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className={cn("text-[9px] uppercase font-bold tracking-widest px-2", getPriorityColor(assignment.priority))}>
                      {assignment.priority}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">{assignment.title}</CardTitle>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 pb-2 border-b border-border/30">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assigned By</p>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold">
                          {assignment.assignedBy.name[0]}
                        </div>
                        <span className="text-xs font-semibold truncate">{assignment.assignedBy.name}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assigned To</p>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          {assignment.assignedTo.name[0]}
                        </div>
                        <span className="text-xs font-semibold truncate">{assignment.assignedTo.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Progress</span>
                      <span>{Math.round(assignment.progress)}%</span>
                    </div>
                    <Progress value={assignment.progress} className="h-2 bg-accent/50" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-accent/5 border border-border/50 text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total</p>
                      <p className="text-sm font-bold">{assignment.totalTasks}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-center">
                      <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Done</p>
                      <p className="text-sm font-bold text-green-600">{assignment.completedTasks}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
                      <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Pending</p>
                      <p className="text-sm font-bold text-amber-600">{assignment.pendingTasks}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-4 rounded-xl gap-2 font-bold text-[11px] uppercase tracking-wider hover:bg-primary hover:text-white transition-all border border-transparent hover:border-primary"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        fetchAssignmentTasks(assignment._id);
                        setIsTasksModalOpen(true);
                      }}
                    >
                      View Bundle <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
