import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutGrid, Plus, Search, Sparkles, Trash2, GripVertical, MessageSquare, Clock, Send, Bot, Loader2,
  Upload, Video, FileText, Play, Users, X, Check, AlertTriangle, FileCheck, ArrowRight, Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useRef, useCallback, useEffect } from "react";
import type { Task, TaskComment, TaskStatus, TaskPriority, WorkspaceMember } from "@shared/schema";
import type { User } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type MemberWithUser = WorkspaceMember & { user: User };

const COLUMNS: { id: TaskStatus; title: string; color: string; dotColor: string; bgAccent: string }[] = [
  { id: "todo", title: "To Do", color: "bg-blue-500", dotColor: "bg-blue-400", bgAccent: "border-blue-500/20" },
  { id: "in_progress", title: "In Progress", color: "bg-amber-500", dotColor: "bg-amber-400", bgAccent: "border-amber-500/20" },
  { id: "review", title: "Review", color: "bg-purple-500", dotColor: "bg-purple-400", bgAccent: "border-purple-500/20" },
  { id: "done", title: "Done", color: "bg-emerald-500", dotColor: "bg-emerald-400", bgAccent: "border-emerald-500/20" },
];

const priorityConfig: Record<TaskPriority, { label: string; dot: string; badge: string }> = {
  high: { label: "High", dot: "bg-red-500", badge: "bg-red-500/10 text-red-600 border-red-500/20" },
  medium: { label: "Medium", dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  low: { label: "Low", dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
};

export default function TasksTab({ workspaceId }: { workspaceId: string }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [revisionChecklist, setRevisionChecklist] = useState<string | null>(null);
  const [showNoBriefHint, setShowNoBriefHint] = useState(false);
  const [showNoCommentsHint, setShowNoCommentsHint] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newStatus, setNewStatus] = useState<TaskStatus>("todo");
  const [newAssignees, setNewAssignees] = useState<string[]>([]);

  const { data: members = [] } = useQuery<MemberWithUser[]>({
    queryKey: ["/api/workspaces", workspaceId, "members"],
    enabled: !!workspaceId,
  });

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/workspaces", workspaceId, "tasks"],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load tasks");
      return res.json();
    },
  });

  const { data: interrogations = [] } = useQuery<any[]>({
    queryKey: [`/api/workspaces/${workspaceId}/interrogations`],
    enabled: !!workspaceId,
  });

  const hasBriefs = interrogations.some((i: any) => i.status === "completed" || i.finalDocument);

  const createTaskMut = useMutation({
    mutationFn: async (data: { title: string; description: string; priority: string; status: string; assignees: string[] }) => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/tasks`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "tasks"] });
      setCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
      setNewStatus("todo");
      setNewAssignees([]);
      toast({ title: "Task created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateTaskMut = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      await apiRequest("PATCH", `/api/workspaces/${workspaceId}/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "tasks"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteTaskMut = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("DELETE", `/api/workspaces/${workspaceId}/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "tasks"] });
      setSelectedTask(null);
      toast({ title: "Task deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const generateTasksMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/tasks/generate`, {});
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "tasks"] });
      toast({ title: `Generated ${Array.isArray(data) ? data.length : 0} tasks from your brief` });
    },
    onError: (e: Error) => {
      if (e.message?.includes("No final") || e.message?.includes("No interrogation") || e.message?.includes("brief")) {
        setShowNoBriefHint(true);
      } else {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    },
  });

  const revisionChecklistMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/tasks/revision-checklist`, {});
      return res.json();
    },
    onSuccess: (data: any) => setRevisionChecklist(data.checklist),
    onError: (e: Error) => {
      if (e.message?.includes("No comments") || e.message?.includes("comments")) {
        setShowNoCommentsHint(true);
      } else {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    },
  });

  const filteredTasks = tasks.filter(t =>
    !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColumnTasks = (status: TaskStatus) => filteredTasks.filter(t => t.status === status);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingTaskId(null);
    setDragOverCol(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (draggingTaskId) {
      const task = tasks.find(t => t.id === draggingTaskId);
      if (task && task.status !== newStatus) {
        updateTaskMut.mutate({ taskId: draggingTaskId, updates: { status: newStatus } });
      }
    }
    setDraggingTaskId(null);
    setDragOverCol(null);
  };

  const totalTasks = tasks.length;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b bg-card px-6 py-4 shrink-0">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 p-6 flex gap-5">
          {COLUMNS.map(c => (
            <div key={c.id} className="flex-1 min-w-[260px]">
              <Skeleton className="h-8 w-full rounded-lg mb-3" />
              <div className="space-y-2.5">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-card px-4 sm:px-6 py-3.5 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight" data-testid="text-tasks-title">Tasks</h2>
                {totalTasks > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 bg-primary/10 text-primary border-0 font-bold">
                    {totalTasks}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Drag tasks between columns to update status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-8 w-40 text-xs"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                data-testid="input-search-tasks"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                if (tasks.length === 0) {
                  setShowNoCommentsHint(true);
                  return;
                }
                revisionChecklistMut.mutate();
              }}
              disabled={revisionChecklistMut.isPending}
              data-testid="button-revision-checklist"
            >
              {revisionChecklistMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">AI Checklist</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                if (!hasBriefs) {
                  setShowNoBriefHint(true);
                  return;
                }
                generateTasksMut.mutate();
              }}
              disabled={generateTasksMut.isPending}
              data-testid="button-generate-tasks"
            >
              {generateTasksMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">From Brief</span>
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setCreateOpen(true)} data-testid="button-create-task">
              <Plus className="w-3.5 h-3.5" />
              Create
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4 sm:p-5">
        <div className="flex gap-4 min-w-max h-full">
          {COLUMNS.map(col => {
            const colTasks = getColumnTasks(col.id);
            const isDragOver = dragOverCol === col.id && draggingTaskId !== null;
            return (
              <div
                key={col.id}
                className={`
                  w-[280px] flex flex-col rounded-xl transition-all duration-200
                  ${isDragOver
                    ? "bg-primary/5 ring-2 ring-primary/20 ring-inset"
                    : "bg-muted/30"
                  }
                `}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => handleDrop(e, col.id)}
                data-testid={`column-${col.id}`}
              >
                <div className="flex items-center gap-2.5 px-3.5 py-3">
                  <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <h3 className="text-[13px] font-semibold text-foreground tracking-tight">{col.title}</h3>
                  <span className="text-[11px] text-muted-foreground font-medium ml-auto">{colTasks.length}</span>
                </div>

                <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
                  {colTasks.map(task => {
                    const isDragging = draggingTaskId === task.id;
                    const prio = priorityConfig[task.priority];
                    return (
                      <div
                        key={task.id}
                        className={`
                          group rounded-xl border bg-card shadow-sm cursor-pointer
                          transition-all duration-200
                          ${isDragging
                            ? "opacity-40 scale-95 rotate-1"
                            : "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20"
                          }
                        `}
                        draggable
                        onDragStart={e => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedTask(task)}
                        data-testid={`task-card-${task.id}`}
                      >
                        <div className="p-3.5">
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-3.5 h-3.5 mt-0.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0 cursor-grab transition-colors" />
                            <div className="flex-1 min-w-0 space-y-2.5">
                              <p className="text-[13px] font-medium leading-snug line-clamp-2 text-foreground">{task.title}</p>

                              {task.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>
                              )}

                              {task.videoUrl && (
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10">
                                    <Video className="w-3 h-3 text-blue-500" />
                                    <span className="text-[10px] font-medium text-blue-600">Video</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
                                  <span className={`text-[10px] font-medium ${prio.badge.split(" ")[1]}`}>{prio.label}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {task.sourceInterrogationId && (
                                    <span title="Generated from AI brief" className="flex items-center">
                                      <Sparkles className="w-3 h-3 text-amber-500" />
                                    </span>
                                  )}
                                  {task.assignees && task.assignees.length > 0 && (
                                    <div className="flex -space-x-1.5">
                                      {task.assignees.slice(0, 3).map((uid) => {
                                        const m = members.find(m => m.userId === uid);
                                        const name = m?.user?.firstName
                                          ? `${m.user.firstName[0]}${m.user.lastName?.[0] || ""}`.toUpperCase()
                                          : (m?.user?.email || "?").substring(0, 2).toUpperCase();
                                        return (
                                          <Avatar key={uid} className="w-5 h-5 border-2 border-card" title={m?.user?.email || ""}>
                                            <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-semibold">{name}</AvatarFallback>
                                          </Avatar>
                                        );
                                      })}
                                      {task.assignees.length > 3 && (
                                        <span className="text-[9px] text-muted-foreground font-medium ml-1">+{task.assignees.length - 3}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isDragOver && (
                    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 h-20 flex items-center justify-center">
                      <p className="text-xs text-primary/60 font-medium">Drop here</p>
                    </div>
                  )}

                  <button
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs text-muted-foreground/70 hover:text-foreground hover:bg-card/80 rounded-xl border border-dashed border-transparent hover:border-border transition-all"
                    onClick={() => { setNewStatus(col.id); setCreateOpen(true); }}
                    data-testid={`button-create-in-${col.id}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Create Task
            </DialogTitle>
            <DialogDescription>
              Add a new task for your team to work on
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input placeholder="What needs to be done?" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus data-testid="input-task-title" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description <span className="font-normal text-muted-foreground/60">(optional)</span></label>
              <Textarea placeholder="Add details, context, or instructions..." value={newDescription} onChange={e => setNewDescription(e.target.value)} rows={3} className="resize-none" data-testid="input-task-description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <Select value={newPriority} onValueChange={(v: TaskPriority) => setNewPriority(v)}>
                  <SelectTrigger data-testid="select-task-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> High</span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium</span>
                    </SelectItem>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={newStatus} onValueChange={(v: TaskStatus) => setNewStatus(v)}>
                  <SelectTrigger data-testid="select-task-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${c.dotColor}`} /> {c.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Assign to</label>
              <MemberPicker members={members} selected={newAssignees} onChange={setNewAssignees} />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createTaskMut.mutate({ title: newTitle, description: newDescription, priority: newPriority, status: newStatus, assignees: newAssignees })} disabled={!newTitle.trim() || createTaskMut.isPending} data-testid="button-submit-task">
              {createTaskMut.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          workspaceId={workspaceId}
          members={members}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => {
            updateTaskMut.mutate({ taskId: selectedTask.id, updates });
            setSelectedTask({ ...selectedTask, ...updates } as Task);
          }}
          onDelete={() => deleteTaskMut.mutate(selectedTask.id)}
        />
      )}

      <Dialog open={!!revisionChecklist} onOpenChange={v => { if (!v) setRevisionChecklist(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              AI Revision Checklist
            </DialogTitle>
            <DialogDescription>
              Generated from all task feedback comments across your board
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{revisionChecklist || ""}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoBriefHint} onOpenChange={setShowNoBriefHint}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
              <FileCheck className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Create a brief first</h3>
            <p className="text-sm text-muted-foreground mb-1">
              To auto-generate tasks, you need a completed production brief.
            </p>
            <p className="text-xs text-muted-foreground/70 mb-5">
              Go to the <strong>AI Brief</strong> tab to create one, then come back here to generate tasks from it.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNoBriefHint(false)}>Got it</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoCommentsHint} onOpenChange={setShowNoCommentsHint}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Add feedback comments first</h3>
            <p className="text-sm text-muted-foreground mb-1">
              The AI checklist is built from your team's feedback.
            </p>
            <p className="text-xs text-muted-foreground/70 mb-5">
              Open a task, upload a video, and leave timestamped comments. Then come back to generate a revision checklist.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNoCommentsHint(false)}>Got it</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskDetailDrawer({
  task,
  workspaceId,
  members,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task;
  workspaceId: string;
  members: MemberWithUser[];
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [commentText, setCommentText] = useState("");
  const [timestampSec, setTimestampSec] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setAiSummary(null);
    setChatMessages([]);
    setChatInput("");
  }, [task.id]);

  const { data: comments = [], isLoading: loadingComments } = useQuery<TaskComment[]>({
    queryKey: ["/api/workspaces", workspaceId, "tasks", task.id, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${task.id}/comments`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load comments");
      return res.json();
    },
  });

  const addCommentMut = useMutation({
    mutationFn: async (data: { text: string; timestampSec?: number }) => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/tasks/${task.id}/comments`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "tasks", task.id, "comments"] });
      setCommentText("");
      setTimestampSec("");
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const summarizeMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/tasks/${task.id}/summarize`, {});
      return res.json();
    },
    onSuccess: (data: any) => setAiSummary(data.summary),
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const chatMut = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/tasks/${task.id}/chat`, {
        message,
        history: chatMessages,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    const tsVal = parseTimestamp(timestampSec);
    addCommentMut.mutate({ text: commentText.trim(), timestampSec: tsVal ?? undefined });
  };

  const handleChatSend = () => {
    if (!chatInput.trim() || chatMut.isPending) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", content: msg }]);
    setChatInput("");
    chatMut.mutate(msg);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({ title: "Please upload a video file", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const urlRes = await apiRequest("POST", "/api/aws/upload-url", {
        fileName: file.name,
        fileType: file.type,
      });
      const { uploadUrl, cloudfrontUrl } = await urlRes.json();

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      onUpdate({ videoUrl: cloudfrontUrl });
      toast({ title: "Video uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const seekToTimestamp = useCallback((sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      videoRef.current.play();
      setActiveTab("details");
    }
  }, []);

  const getCurrentVideoTime = (): string => {
    if (!videoRef.current) return "";
    const sec = Math.floor(videoRef.current.currentTime);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  };

  const handleSetTimestampFromVideo = () => {
    setTimestampSec(getCurrentVideoTime());
  };

  const parseTimestamp = (val: string): number | null => {
    if (!val.trim()) return null;
    const parts = val.split(":").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts[0] * 60 + parts[1];
    if (parts.length === 1 && !isNaN(parts[0])) return parts[0];
    return null;
  };

  const formatTs = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  const statusCol = COLUMNS.find(c => c.id === task.status);

  return (
    <Sheet open onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent className="w-[560px] sm:max-w-[560px] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {statusCol && (
                  <Badge variant="secondary" className="text-[10px] gap-1 px-2 py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCol.dotColor}`} />
                    {statusCol.title}
                  </Badge>
                )}
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${priorityConfig[task.priority].badge}`}>
                  {priorityConfig[task.priority].label}
                </Badge>
              </div>
              <SheetTitle className="text-lg font-bold leading-snug">{task.title}</SheetTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0" data-testid="button-delete-task">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        {task.videoUrl && (
          <div className="px-5 pt-4 shrink-0">
            <video
              ref={videoRef}
              src={task.videoUrl}
              controls
              className="w-full rounded-xl bg-black max-h-48 object-contain"
              data-testid="video-player"
            />
          </div>
        )}

        {!task.videoUrl && (
          <div className="px-5 pt-4 shrink-0">
            <div
              className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
              onClick={() => fileInputRef.current?.click()}
              data-testid="video-upload-area"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2 py-1">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Uploading video...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">Upload a video for review</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">MP4, MOV, WebM supported</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} data-testid="input-video-file" />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 mt-3">
          <TabsList className="mx-5 shrink-0 h-9">
            <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
            <TabsTrigger value="comments" className="text-xs gap-1">
              Feedback
              {comments.length > 0 && <Badge variant="secondary" className="text-[10px] h-4 px-1 border-0">{comments.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="ai-summary" className="text-xs">AI Summary</TabsTrigger>
            <TabsTrigger value="ai-chat" className="text-xs gap-1">
              <Bot className="w-3 h-3" />
              Ask AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto px-5 pb-5 mt-3 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onBlur={() => { if (editTitle !== task.title && editTitle.trim()) onUpdate({ title: editTitle.trim() }); }}
                data-testid="input-edit-task-title"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                onBlur={() => { if (editDescription !== (task.description || "")) onUpdate({ description: editDescription }); }}
                rows={3}
                className="resize-none"
                placeholder="Add details..."
                data-testid="input-edit-task-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={task.status} onValueChange={(v: TaskStatus) => onUpdate({ status: v })}>
                  <SelectTrigger data-testid="select-edit-task-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${c.dotColor}`} /> {c.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <Select value={task.priority} onValueChange={(v: TaskPriority) => onUpdate({ priority: v })}>
                  <SelectTrigger data-testid="select-edit-task-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> High</span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium</span>
                    </SelectItem>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Assigned to</label>
              <MemberPicker
                members={members}
                selected={task.assignees || []}
                onChange={(assignees) => onUpdate({ assignees })}
              />
            </div>
            {task.sourceInterrogationId && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/5 px-3.5 py-2.5 rounded-xl border border-amber-500/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>This task was auto-generated from your AI production brief</span>
              </div>
            )}
            {task.videoUrl && (
              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Upload className="w-3 h-3 mr-1.5" />
                  Replace Video
                </Button>
                <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="flex-1 flex flex-col min-h-0 px-5 pb-5 mt-3">
            <ScrollArea className="flex-1 mb-3">
              <div className="space-y-2.5 pr-2">
                {loadingComments && <Skeleton className="h-16 w-full rounded-xl" />}
                {comments.map((c) => (
                  <div key={c.id} className="bg-muted/40 rounded-xl p-3 text-sm" data-testid={`comment-${c.id}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-medium text-xs">{c.authorEmail || "Unknown"}</span>
                      {c.timestampSec != null && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 px-1.5 font-mono gap-1 cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => seekToTimestamp(c.timestampSec!)}
                          data-testid={`timestamp-badge-${c.id}`}
                        >
                          <Play className="w-2 h-2" />
                          {formatTs(c.timestampSec)}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground/60 ml-auto">
                        {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed">{c.text}</p>
                  </div>
                ))}
                {comments.length === 0 && !loadingComments && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2.5 text-muted-foreground/20" />
                    <p className="text-sm font-medium text-muted-foreground/70 mb-1">No feedback yet</p>
                    <p className="text-xs text-muted-foreground/50">Watch the video and add timestamped comments below</p>
                  </div>
                )}
                <div ref={commentsEndRef} />
              </div>
            </ScrollArea>

            <div className="space-y-2.5 shrink-0 border-t pt-3">
              <Textarea
                placeholder="Add a comment or revision note..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={2}
                className="text-sm resize-none"
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmitComment(); }}
                data-testid="input-comment-text"
              />
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Timestamp (e.g. 1:30)"
                    value={timestampSec}
                    onChange={e => setTimestampSec(e.target.value)}
                    className="pl-8 h-8 text-sm font-mono"
                    data-testid="input-comment-timestamp"
                  />
                </div>
                {task.videoUrl && (
                  <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={handleSetTimestampFromVideo} data-testid="button-grab-timestamp">
                    <Clock className="w-3 h-3 mr-1" />
                    Now
                  </Button>
                )}
                <Button size="sm" className="h-8" onClick={handleSubmitComment} disabled={!commentText.trim() || addCommentMut.isPending} data-testid="button-submit-comment">
                  {addCommentMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-summary" className="flex-1 overflow-y-auto px-5 pb-5 mt-3">
            {!aiSummary && (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-primary/60" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">AI Revision Summary</p>
                <p className="text-xs text-muted-foreground/70 mb-5 max-w-xs mx-auto leading-relaxed">
                  Summarizes all timestamped comments into a detailed, prioritized revision plan for the editor
                </p>
                {comments.length > 0 ? (
                  <Button
                    onClick={() => summarizeMut.mutate()}
                    disabled={summarizeMut.isPending}
                    className="gap-1.5"
                    data-testid="button-generate-summary"
                  >
                    {summarizeMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate Summary
                  </Button>
                ) : (
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground/60 bg-muted/50 px-3 py-2 rounded-lg">
                    <Info className="w-3.5 h-3.5" />
                    Add feedback comments first to generate a summary
                  </div>
                )}
              </div>
            )}
            {aiSummary && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    AI Revision Summary
                  </h4>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => summarizeMut.mutate()} disabled={summarizeMut.isPending}>
                    {summarizeMut.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                    Regenerate
                  </Button>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm" data-testid="ai-summary-content">
                  <ReactMarkdown>{aiSummary}</ReactMarkdown>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-chat" className="flex-1 flex flex-col min-h-0 px-5 pb-5 mt-3">
            <div className="bg-primary/5 rounded-xl p-3 mb-3 shrink-0 border border-primary/10">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
                AI assistant with full context of this task and all feedback. Ask anything!
              </p>
            </div>

            <ScrollArea className="flex-1 mb-3">
              <div className="space-y-3 pr-2">
                {chatMessages.length === 0 && (
                  <div className="text-center py-6">
                    <Bot className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground mb-3">Ask about this task, revision feedback, or get editing tips</p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {["What are the key revisions?", "Summarize the feedback", "How should I edit this?"].map((q, i) => (
                        <button
                          key={i}
                          className="text-[11px] px-2.5 py-1.5 rounded-full border hover:bg-accent/50 hover:border-primary/20 transition-all text-muted-foreground"
                          onClick={() => { setChatInput(q); }}
                          data-testid={`chat-suggestion-${i}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl p-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60"}`} data-testid={`chat-message-${i}`}>
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {chatMut.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-muted/60 rounded-xl p-3 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 shrink-0 border-t pt-3">
              <Input
                placeholder="Ask about this task..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                className="text-sm"
                data-testid="input-chat-message"
              />
              <Button size="sm" onClick={handleChatSend} disabled={!chatInput.trim() || chatMut.isPending} data-testid="button-send-chat">
                {chatMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function MemberPicker({
  members,
  selected,
  onChange,
}: {
  members: MemberWithUser[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (userId: string) => {
    if (selected.includes(userId)) {
      onChange(selected.filter(id => id !== userId));
    } else {
      onChange([...selected, userId]);
    }
  };

  const selectedMembers = members.filter(m => selected.includes(m.userId));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start h-auto min-h-[36px] py-1.5 px-3 font-normal"
          data-testid="button-assign-members"
        >
          {selectedMembers.length === 0 ? (
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Select team members...
            </span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedMembers.map(m => {
                const name = m.user?.firstName
                  ? `${m.user.firstName} ${m.user.lastName || ""}`.trim()
                  : m.user?.email || "Unknown";
                return (
                  <Badge
                    key={m.userId}
                    variant="secondary"
                    className="text-xs gap-1 pr-1"
                  >
                    {name}
                    <button
                      className="ml-0.5 hover:text-destructive transition-colors"
                      onClick={(e) => { e.stopPropagation(); toggle(m.userId); }}
                      data-testid={`button-remove-assignee-${m.userId}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1.5" align="start">
        {members.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No team members yet. Add members in the Team tab.</p>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {members.map(m => {
              const isSelected = selected.includes(m.userId);
              const email = m.user?.email || "Unknown";
              const name = m.user?.firstName
                ? `${m.user.firstName} ${m.user.lastName || ""}`.trim()
                : email;
              const initials = m.user?.firstName
                ? `${m.user.firstName[0]}${m.user.lastName?.[0] || ""}`.toUpperCase()
                : email.substring(0, 2).toUpperCase();
              return (
                <button
                  key={m.userId}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-accent transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                  onClick={() => toggle(m.userId)}
                  data-testid={`button-toggle-member-${m.userId}`}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm truncate">{name}</p>
                    {m.user?.firstName && <p className="text-[10px] text-muted-foreground truncate">{email}</p>}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
