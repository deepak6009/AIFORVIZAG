import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRoute, useLocation } from "wouter";
import type { Workspace } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Layers, Plus, Users, FolderOpen, MessageSquare, LayoutGrid,
  FileText, LogOut, ChevronDown, Settings, ChevronsUpDown
} from "lucide-react";
import { useState, useEffect } from "react";
import { isUnauthorizedError } from "@/lib/auth-utils";

import UsersTab from "@/components/tabs/users-tab";
import FoldersTab from "@/components/tabs/folders-tab";
import InterrogatorTab from "@/components/tabs/interrogator-tab";
import TasksTab from "@/components/tabs/tasks-tab";
import ResourcesTab from "@/components/tabs/resources-tab";

const tabs = [
  { id: "users", label: "Users", icon: Users },
  { id: "folders", label: "Folders", icon: FolderOpen },
  { id: "interrogator", label: "Interrogator", icon: MessageSquare },
  { id: "tasks", label: "Tasks", icon: LayoutGrid },
  { id: "resources", label: "Resources", icon: FileText },
] as const;

type TabId = typeof tabs[number]["id"];

export default function WorkspaceLayout() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, wsParams] = useRoute("/workspace/:id/:tab");
  const [, wsParamsSimple] = useRoute("/workspace/:id");

  const workspaceId = wsParams?.id || wsParamsSimple?.id || "";
  const urlTab = wsParams?.tab as TabId | undefined;
  const [activeTab, setActiveTab] = useState<TabId>(urlTab || "folders");
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (urlTab && tabs.some(t => t.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const { data: workspaces, isLoading: wsListLoading } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
  });

  const { data: workspace, isLoading: wsLoading } = useQuery<Workspace>({
    queryKey: ["/api/workspaces", workspaceId],
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await apiRequest("POST", "/api/workspaces", data);
      return res.json();
    },
    onSuccess: (newWs: Workspace) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      setCreateOpen(false);
      setName("");
      setDescription("");
      toast({ title: "Workspace created" });
      setLocation(`/workspace/${newWs.id}/folders`);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", variant: "destructive" });
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

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (workspaceId) {
      setLocation(`/workspace/${workspaceId}/${tab}`);
    }
  };

  const handleSelectWorkspace = (id: string) => {
    setLocation(`/workspace/${id}/${activeTab}`);
  };

  const initials = user?.email?.[0]?.toUpperCase() || "U";

  if (!workspaceId) {
    return (
      <div className="min-h-screen bg-background">
        <header className="h-12 border-b bg-background flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm" data-testid="text-app-name">WorkVault</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => logout()} data-testid="button-logout">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Welcome to WorkVault</h1>
            <p className="text-muted-foreground">Select a workspace or create a new one to get started</p>
          </div>

          {wsListLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : workspaces && workspaces.length > 0 ? (
            <div className="space-y-3 mb-8">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => handleSelectWorkspace(ws.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left group"
                  data-testid={`card-workspace-${ws.id}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm">{ws.name}</h3>
                    {ws.description && <p className="text-xs text-muted-foreground truncate">{ws.description}</p>}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-card/50 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Layers className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No workspaces yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first workspace to start collaborating</p>
            </div>
          )}

          <div className="flex justify-center">
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
                      placeholder="e.g. Reel Project - March"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-testid="input-workspace-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ws-desc">Description (optional)</Label>
                    <Textarea
                      id="ws-desc"
                      placeholder="Brief description of this project"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="resize-none"
                      data-testid="input-workspace-description"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending || !name.trim()} data-testid="button-submit-workspace">
                      {createMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-12 border-b bg-background shrink-0 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm hidden md:inline" data-testid="text-app-name">WorkVault</span>
          </div>

          <div className="h-5 w-px bg-border mx-1" />

          {wsLoading ? (
            <Skeleton className="h-7 w-40" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 gap-2 px-3 font-semibold text-sm max-w-[200px]" data-testid="button-workspace-switcher">
                  <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <Layers className="w-3 h-3 text-primary" />
                  </div>
                  <span className="truncate" data-testid="text-workspace-name">{workspace?.name || "Select workspace"}</span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
                {workspaces?.map(ws => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => handleSelectWorkspace(ws.id)}
                    className={ws.id === workspaceId ? "bg-accent" : ""}
                    data-testid={`switch-workspace-${ws.id}`}
                  >
                    <Layers className="w-4 h-4 mr-2 text-primary" />
                    <span className="truncate">{ws.name}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Workspace
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/")}>
                  <Settings className="w-4 h-4 mr-2" />
                  All Workspaces
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground hidden lg:inline">{user?.email}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => logout()} data-testid="button-logout">
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      <nav className="h-10 border-b bg-background/95 backdrop-blur-sm shrink-0 flex items-center px-4 gap-1 overflow-x-auto" data-testid="nav-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-colors relative whitespace-nowrap
                ${isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 overflow-hidden">
        {activeTab === "users" && <UsersTab workspaceId={workspaceId} />}
        {activeTab === "folders" && <FoldersTab workspaceId={workspaceId} />}
        {activeTab === "interrogator" && <InterrogatorTab workspaceId={workspaceId} />}
        {activeTab === "tasks" && <TasksTab workspaceId={workspaceId} />}
        {activeTab === "resources" && <ResourcesTab workspaceId={workspaceId} />}
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Name</Label>
              <Input
                id="ws-name"
                placeholder="e.g. Reel Project - March"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-workspace-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-desc">Description (optional)</Label>
              <Textarea
                id="ws-desc"
                placeholder="Brief description of this project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                data-testid="input-workspace-description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || !name.trim()} data-testid="button-submit-workspace">
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
