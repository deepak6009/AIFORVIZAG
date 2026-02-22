import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRoute, useLocation } from "wouter";

import type { Workspace, WorkspaceMember } from "@shared/schema";
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
  Layers, Plus, Users, FolderOpen, MessageSquare, FileCheck, LayoutGrid,
  FileText, LogOut, ChevronDown, Settings, ChevronsUpDown
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { isUnauthorizedError } from "@/lib/auth-utils";

import UsersTab from "@/components/tabs/users-tab";
import FoldersTab from "@/components/tabs/folders-tab";
import InterrogatorTab from "@/components/tabs/interrogator-tab";
import FinalAgendaTab from "@/components/tabs/final-agenda-tab";
import TasksTab from "@/components/tabs/tasks-tab";
import ResourcesTab from "@/components/tabs/resources-tab";

const allTabs = [
  { id: "users" as const, label: "Users", icon: Users, adminOnly: false },
  { id: "folders" as const, label: "Folders", icon: FolderOpen, adminOnly: false },
  { id: "interrogator" as const, label: "Interrogator", icon: MessageSquare, adminOnly: true },
  { id: "final-agenda" as const, label: "Final Agenda", icon: FileCheck, adminOnly: false },
  { id: "tasks" as const, label: "Tasks", icon: LayoutGrid, adminOnly: false },
  { id: "resources" as const, label: "Resources", icon: FileText, adminOnly: false },
];

type TabId = typeof allTabs[number]["id"];

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
    if (urlTab && allTabs.some(t => t.id === urlTab)) {
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

  type MemberWithUser = WorkspaceMember & { user: { id: string; email: string } };
  const { data: members } = useQuery<MemberWithUser[]>({
    queryKey: ["/api/workspaces", workspaceId, "members"],
    enabled: !!workspaceId,
  });
  const currentUserRole = members?.find(m => m.userId === user?.id)?.role;
  const isAdmin = currentUserRole === "admin";
  const tabs = useMemo(() => allTabs.filter(t => !t.adminOnly || isAdmin), [isAdmin]);

  useEffect(() => {
    if (members && !isAdmin && activeTab === "interrogator") {
      setActiveTab("folders");
    }
  }, [members, isAdmin, activeTab]);

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
        <header className="h-14 border-b bg-background flex items-center justify-between px-4">
          <span className="text-lg tracking-[0.02em] lowercase" data-testid="text-app-name"><span className="font-light">the</span><span className="font-extrabold">crew</span></span>
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => logout()} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl mb-2">Welcome to <span className="font-light">the</span><span className="font-bold">crew</span></h1>
            <p className="text-muted-foreground text-sm sm:text-base">Select a workspace or create a new one to get started</p>
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
                  className="w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left group active:bg-accent"
                  data-testid={`card-workspace-${ws.id}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm">{ws.name}</h3>
                    {ws.description && <p className="text-xs text-muted-foreground truncate">{ws.description}</p>}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12 border rounded-lg bg-card/50 mb-8">
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
                <Button className="h-11 px-6" data-testid="button-create-workspace">
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
                      className="h-11"
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
      <header className="h-12 sm:h-12 border-b bg-background shrink-0 flex items-center justify-between px-3 sm:px-4 z-50">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-base sm:text-lg tracking-[0.02em] lowercase shrink-0" data-testid="text-app-name"><span className="font-light">the</span><span className="font-extrabold">crew</span></span>

          <div className="h-5 w-px bg-border mx-0.5 sm:mx-1" />

          {wsLoading ? (
            <Skeleton className="h-7 w-32 sm:w-40" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 gap-1.5 sm:gap-2 px-2 sm:px-3 font-semibold text-sm max-w-[160px] sm:max-w-[200px]" data-testid="button-workspace-switcher">
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

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground hidden lg:inline">{user?.email}</span>
          <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8" onClick={() => logout()} data-testid="button-logout">
            <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </Button>
        </div>
      </header>

      <nav className="hidden sm:flex h-10 border-b bg-background/95 backdrop-blur-sm shrink-0 items-center px-4 gap-1 overflow-x-auto" data-testid="nav-tabs">
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

      <main className="flex-1 overflow-hidden pb-16 sm:pb-0">
        {activeTab === "users" && <UsersTab workspaceId={workspaceId} />}
        {activeTab === "folders" && <FoldersTab workspaceId={workspaceId} />}
        {activeTab === "interrogator" && isAdmin && <InterrogatorTab workspaceId={workspaceId} />}
        {activeTab === "final-agenda" && <FinalAgendaTab workspaceId={workspaceId} />}
        {activeTab === "tasks" && <TasksTab workspaceId={workspaceId} />}
        {activeTab === "resources" && <ResourcesTab workspaceId={workspaceId} />}
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-bottom" data-testid="nav-tabs-mobile">
        <div className="flex items-stretch h-14">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors min-w-0
                  ${isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                  }
                `}
                data-testid={`tab-mobile-${tab.id}`}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate max-w-full px-0.5">{tab.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

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
                className="h-11"
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
