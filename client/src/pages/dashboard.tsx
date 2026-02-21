import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Workspace } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Layers, FolderOpen, Users, LogOut, ChevronRight, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/auth-utils";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: workspaces, isLoading } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await apiRequest("POST", "/api/workspaces", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      setCreateOpen(false);
      setName("");
      setDescription("");
      toast({ title: "Workspace created", description: "Your new workspace is ready." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please sign in again.", variant: "destructive" });
        window.location.reload();
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/workspaces/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      toast({ title: "Workspace deleted" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please sign in again.", variant: "destructive" });
        window.location.reload();
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), description: description.trim() || undefined });
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2">
            <img src="/images/crew-mark.png" alt="thecrew" className="w-8 h-8" />
            <span className="font-extrabold text-lg tracking-[0.08em] uppercase" data-testid="text-app-name"><span className="text-muted-foreground font-semibold text-[0.7em] tracking-[0.12em] mr-0.5">the</span>crew</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline" data-testid="text-username">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Workspaces</h1>
            <p className="text-sm text-muted-foreground mt-1">Create and manage your team workspaces</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-workspace">
                <Plus className="w-4 h-4 mr-2" />
                New Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Workspace</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="ws-name">Name</Label>
                  <Input
                    id="ws-name"
                    placeholder="e.g. Marketing Team"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-workspace-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ws-desc">Description (optional)</Label>
                  <Textarea
                    id="ws-desc"
                    placeholder="What is this workspace for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none"
                    data-testid="input-workspace-description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || !name.trim()} data-testid="button-submit-workspace">
                    {createMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-card-border">
                <CardContent className="pt-6">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <Card
                key={ws.id}
                className="border-card-border cursor-pointer group hover-elevate"
                onClick={() => setLocation(`/workspace/${ws.id}`)}
                data-testid={`card-workspace-${ws.id}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-semibold truncate">{ws.name}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(ws.id);
                          }}
                          className="text-destructive"
                          data-testid={`button-delete-workspace-${ws.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {ws.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ws.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5" /> Folders
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Members
                    </span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No workspaces yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first workspace to get started.</p>
            <Button onClick={() => setCreateOpen(true)} data-testid="button-create-first-workspace">
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
