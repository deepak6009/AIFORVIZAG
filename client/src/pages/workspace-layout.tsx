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
  Layers, Plus, Users, FolderOpen, MessageSquare, FileCheck, LayoutGrid,
  FileText, LogOut, ChevronDown, Settings, ChevronsUpDown, Sparkles, Video
} from "lucide-react";
import { useState, useEffect } from "react";
import { isUnauthorizedError } from "@/lib/auth-utils";

import UsersTab from "@/components/tabs/users-tab";
import FoldersTab from "@/components/tabs/folders-tab";
import InterrogatorTab from "@/components/tabs/interrogator-tab";
import FinalAgendaTab from "@/components/tabs/final-agenda-tab";
import TasksTab from "@/components/tabs/tasks-tab";
import ResourcesTab from "@/components/tabs/resources-tab";

const tabs = [
  { id: "folders", label: "Files", icon: FolderOpen, accent: false },
  { id: "users", label: "Team", icon: Users, accent: false },
  { id: "interrogator", label: "AI Brief", icon: Sparkles, accent: true },
  { id: "final-agenda", label: "Briefs", icon: FileCheck, accent: true },
  { id: "tasks", label: "Tasks", icon: LayoutGrid, accent: false },
  { id: "resources", label: "References", icon: Video, accent: false },
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

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  if (!workspaceId) {
    return (
      <div className="min-h-screen bg-background">
        <header className="h-14 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
          <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="text-lg tracking-[0.02em] lowercase cursor-pointer hover:opacity-70 transition-opacity" data-testid="text-app-name"><span className="font-light">the</span><span className="font-extrabold">crew</span></a>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="button-user-menu-home">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium truncate">{displayName || user?.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="menu-item-profile-home">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile & Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600" data-testid="menu-item-logout-home">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-8 sm:mb-10">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground" data-testid="text-welcome">
              {greeting}, {displayName || "there"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Pick a workspace to jump back in, or start a new project.</p>
          </div>

          {wsListLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-[72px] rounded-xl" />)}
            </div>
          ) : workspaces && workspaces.length > 0 ? (
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Your Workspaces</h2>
                <span className="text-xs text-muted-foreground">{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}</span>
              </div>
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => handleSelectWorkspace(ws.id)}
                  className="w-full flex items-center gap-3.5 p-4 rounded-xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
                  data-testid={`card-workspace-${ws.id}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-foreground">{ws.name}</h3>
                    {ws.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{ws.description}</p>}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 sm:p-10 text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Layers className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Create your first workspace</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                A workspace is a project space where you organize clips, collaborate with your editor, and manage your content pipeline.
              </p>
              <Button onClick={() => setCreateOpen(true)} data-testid="button-create-workspace-empty">
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </div>
          )}

          {workspaces && workspaces.length > 0 && (
            <Button variant="outline" className="w-full" onClick={() => setCreateOpen(true)} data-testid="button-create-workspace">
              <Plus className="w-4 h-4 mr-2" />
              New Workspace
            </Button>
          )}

          {(!workspaces || workspaces.length === 0) && (
            <div className="mt-10 pt-8 border-t border-gray-200/60">
              <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">How it works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: FolderOpen, title: "Upload & organize", desc: "Drop in raw clips and sort them into folders" },
                  { icon: Sparkles, title: "AI briefing", desc: "Let AI help you create a production brief" },
                  { icon: LayoutGrid, title: "Track tasks", desc: "Turn briefs into tasks and track progress" },
                ].map((step, i) => (
                  <div key={i} className="rounded-xl bg-card border p-4 text-center">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2.5">
                      <step.icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Project name</Label>
                <Input
                  id="ws-name"
                  placeholder="e.g. March Reels, Brand Campaign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  data-testid="input-workspace-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ws-desc">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea
                  id="ws-desc"
                  placeholder="What's this project about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none"
                  rows={3}
                  data-testid="input-workspace-description"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || !name.trim()} data-testid="button-submit-workspace">
                  {createMutation.isPending ? "Creating..." : "Create Workspace"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-13 border-b bg-card shrink-0 flex items-center justify-between px-3 sm:px-5 z-50">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="text-base sm:text-lg tracking-[0.02em] lowercase shrink-0 cursor-pointer hover:opacity-70 transition-opacity" data-testid="text-app-name"><span className="font-light">the</span><span className="font-extrabold">crew</span></a>

          <div className="h-5 w-px bg-border/60 mx-0.5" />

          {wsLoading ? (
            <Skeleton className="h-7 w-32 sm:w-40" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-accent transition-colors max-w-[160px] sm:max-w-[240px]" data-testid="button-workspace-switcher">
                  <span className="font-semibold text-sm text-foreground truncate" data-testid="text-workspace-name">{workspace?.name || "Select workspace"}</span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Switch workspace</DropdownMenuLabel>
                {workspaces?.map(ws => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => handleSelectWorkspace(ws.id)}
                    className={ws.id === workspaceId ? "bg-accent font-medium" : ""}
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
                  <Layers className="w-4 h-4 mr-2" />
                  All Workspaces
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent transition-colors" data-testid="button-user-menu">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium truncate">{displayName || user?.email}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="menu-item-profile">
                <Settings className="w-4 h-4 mr-2" />
                Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600" data-testid="menu-item-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <nav className="hidden sm:flex h-11 border-b bg-card shrink-0 items-center px-5 gap-0.5 overflow-x-auto" data-testid="nav-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-1.5 px-3.5 h-full text-[13px] font-medium transition-colors relative whitespace-nowrap
                ${isActive
                  ? "text-foreground"
                  : tab.accent
                    ? "text-primary/70 hover:text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : tab.accent ? "text-primary/70" : ""}`} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 overflow-hidden pb-16 sm:pb-0">
        {activeTab === "users" && <UsersTab workspaceId={workspaceId} />}
        {activeTab === "folders" && <FoldersTab workspaceId={workspaceId} />}
        {activeTab === "interrogator" && <InterrogatorTab workspaceId={workspaceId} />}
        {activeTab === "final-agenda" && <FinalAgendaTab workspaceId={workspaceId} onNavigate={handleTabChange} />}
        {activeTab === "tasks" && <TasksTab workspaceId={workspaceId} />}
        {activeTab === "resources" && <ResourcesTab workspaceId={workspaceId} />}
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-bottom" data-testid="nav-tabs-mobile">
        <div className="flex items-stretch h-14">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors min-w-0 relative
                  ${isActive
                    ? "text-primary"
                    : tab.accent
                      ? "text-primary/60 active:text-primary"
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
              <Label htmlFor="ws-name">Project name</Label>
              <Input
                id="ws-name"
                placeholder="e.g. March Reels, Brand Campaign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                data-testid="input-workspace-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-desc">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                id="ws-desc"
                placeholder="What's this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                rows={3}
                data-testid="input-workspace-description"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || !name.trim()} data-testid="button-submit-workspace">
                {createMutation.isPending ? "Creating..." : "Create Workspace"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
