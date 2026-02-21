import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Search, Sparkles, Trash2, GripVertical, MessageSquare, Clock, Send, Bot, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import type { Task, TaskComment, TaskStatus, TaskPriority } from "@shared/schema";
import ReactMarkdown from "react-markdown";

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-blue-500" },
  { id: "in_progress", title: "In Progress", color: "bg-yellow-500" },
  { id: "review", title: "Review", color: "bg-purple-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
];

const priorityColors: Record<TaskPriority, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export default function TasksTab({ workspaceId }: { workspaceId: string }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [revisionChecklist, setRevisionChecklist] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newStatus, setNewStatus] = useState<TaskStatus>("todo");

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/workspaces", workspaceId, "tasks"],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load tasks");
      return res.json();
    },
  });

  const createTaskMut = useMutation({
    mutationFn: async (data: { title: string; description: string; priority: string; status: string }) => {
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
      toast({ title: `Generated ${Array.isArray(data) ? data.length : 0} tasks from AI brief` });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const revisionChecklistMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/tasks/revision-checklist`, {});
      return res.json();
    },
    onSuccess: (data: any) => {
      setRevisionChecklist(data.checklist);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filteredTasks = tasks.filter(t =>
    !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColumnTasks = (status: TaskStatus) => filteredTasks.filter(t => t.status === status);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
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

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b bg-background px-6 py-3 shrink-0">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 p-6 flex gap-4">
          {COLUMNS.map(c => (
            <div key={c.id} className="w-72">
              <Skeleton className="h-6 w-24 mb-3" />
              <Skeleton className="h-24 w-full mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8 h-8 w-48 text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              data-testid="input-search-tasks"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => revisionChecklistMut.mutate()}
            disabled={revisionChecklistMut.isPending || tasks.length === 0}
            data-testid="button-revision-checklist"
          >
            {revisionChecklistMut.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Bot className="w-3.5 h-3.5 mr-1.5" />}
            AI Revision Checklist
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => generateTasksMut.mutate()}
            disabled={generateTasksMut.isPending}
            data-testid="button-generate-tasks"
          >
            {generateTasksMut.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
            Generate from Brief
          </Button>
          <Button size="sm" className="h-8" onClick={() => setCreateOpen(true)} data-testid="button-create-task">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Task
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 min-w-max h-full">
          {COLUMNS.map(col => {
            const colTasks = getColumnTasks(col.id);
            return (
              <div
                key={col.id}
                className={`w-72 flex flex-col rounded-lg transition-colors ${dragOverCol === col.id ? "bg-accent/30" : ""}`}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => handleDrop(e, col.id)}
                data-testid={`column-${col.id}`}
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <h3 className="text-sm font-semibold">{col.title}</h3>
                  <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">
                    {colTasks.length}
                  </Badge>
                </div>
                <div className="flex-1 space-y-2">
                  {colTasks.map(task => (
                    <Card
                      key={task.id}
                      className={`border cursor-pointer hover:bg-accent/30 transition-colors ${draggingTaskId === task.id ? "opacity-50" : ""}`}
                      draggable
                      onDragStart={e => handleDragStart(e, task.id)}
                      onDragEnd={() => { setDraggingTaskId(null); setDragOverCol(null); }}
                      onClick={() => setSelectedTask(task)}
                      data-testid={`task-card-${task.id}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 mt-0.5 text-muted-foreground/40 shrink-0 cursor-grab" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-2 line-clamp-2">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </Badge>
                              {task.sourceInterrogationId && (
                                <span title="Generated from AI brief"><Sparkles className="w-3 h-3 text-amber-500" /></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <button
                    className="w-full flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                    onClick={() => { setNewStatus(col.id); setCreateOpen(true); }}
                    data-testid={`button-create-in-${col.id}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Task title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              data-testid="input-task-title"
            />
            <Textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              rows={3}
              data-testid="input-task-description"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                <Select value={newPriority} onValueChange={(v: TaskPriority) => setNewPriority(v)}>
                  <SelectTrigger data-testid="select-task-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                <Select value={newStatus} onValueChange={(v: TaskStatus) => setNewStatus(v)}>
                  <SelectTrigger data-testid="select-task-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createTaskMut.mutate({ title: newTitle, description: newDescription, priority: newPriority, status: newStatus })}
              disabled={!newTitle.trim() || createTaskMut.isPending}
              data-testid="button-submit-task"
            >
              {createTaskMut.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          workspaceId={workspaceId}
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
              <Bot className="w-5 h-5" />
              AI Revision Checklist
            </DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{revisionChecklist || ""}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskDetailDrawer({
  task,
  workspaceId,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task;
  workspaceId: string;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [commentText, setCommentText] = useState("");
  const [timestampSec, setTimestampSec] = useState<string>("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

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

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    const tsVal = parseTimestamp(timestampSec);
    addCommentMut.mutate({ text: commentText.trim(), timestampSec: tsVal ?? undefined });
  };

  const parseTimestamp = (val: string): number | null => {
    if (!val.trim()) return null;
    const parts = val.split(":").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 1 && !isNaN(parts[0])) return parts[0];
    return null;
  };

  const formatTs = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  return (
    <Sheet open onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent className="w-[480px] sm:max-w-[480px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Task Details</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive" data-testid="button-delete-task">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
            <Input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={() => { if (editTitle !== task.title && editTitle.trim()) onUpdate({ title: editTitle.trim() }); }}
              data-testid="input-edit-task-title"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <Textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              onBlur={() => { if (editDescription !== (task.description || "")) onUpdate({ description: editDescription }); }}
              rows={4}
              data-testid="input-edit-task-description"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <Select value={task.status} onValueChange={(v: TaskStatus) => onUpdate({ status: v })}>
                <SelectTrigger data-testid="select-edit-task-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
              <Select value={task.priority} onValueChange={(v: TaskPriority) => onUpdate({ priority: v })}>
                <SelectTrigger data-testid="select-edit-task-priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {task.sourceInterrogationId && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-500/5 px-3 py-2 rounded-lg border border-amber-500/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Generated from AI production brief
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Comments & Feedback</h4>
              <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">{comments.length}</Badge>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {loadingComments && <Skeleton className="h-16 w-full" />}
              {comments.map((c) => (
                <div key={c.id} className="bg-muted/40 rounded-lg p-3 text-sm" data-testid={`comment-${c.id}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-xs">{c.authorEmail || "Unknown"}</span>
                    {c.timestampSec != null && (
                      <Badge variant="outline" className="text-xs h-5 px-1.5 font-mono gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTs(c.timestampSec)}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm">{c.text}</p>
                </div>
              ))}
              {comments.length === 0 && !loadingComments && (
                <p className="text-xs text-muted-foreground text-center py-3">No comments yet. Add feedback below.</p>
              )}
              <div ref={commentsEndRef} />
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Textarea
                    placeholder="Add a comment or revision note..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    rows={2}
                    className="pr-2 text-sm resize-none"
                    onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmitComment(); }}
                    data-testid="input-comment-text"
                  />
                </div>
              </div>
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
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || addCommentMut.isPending}
                  data-testid="button-submit-comment"
                >
                  {addCommentMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
