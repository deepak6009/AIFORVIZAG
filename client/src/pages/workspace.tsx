import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRoute, useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/auth-utils";
import type { Workspace, Folder, FileRecord, WorkspaceMember } from "@shared/schema";
import type { User } from "@shared/models/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import {
  Layers, ArrowLeft, Plus, FolderOpen, FolderPlus, Upload, Users,
  Image as ImageIcon, Video, FileIcon, MoreVertical, Trash2,
  ChevronRight, Home, X
} from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";

type MemberWithUser = WorkspaceMember & { user: User };

export default function WorkspacePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/workspace/:id");
  const workspaceId = params?.id || "";

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<string>("member");
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: workspace, isLoading: wsLoading } = useQuery<Workspace>({
    queryKey: ["/api/workspaces", workspaceId],
    enabled: !!workspaceId,
  });

  const { data: allFolders, isLoading: foldersLoading } = useQuery<Folder[]>({
    queryKey: ["/api/workspaces", workspaceId, "folders"],
    enabled: !!workspaceId,
  });

  const currentFolders = allFolders?.filter((f) =>
    currentFolderId ? f.parentId === currentFolderId : !f.parentId
  ) || [];

  const { data: files, isLoading: filesLoading } = useQuery<FileRecord[]>({
    queryKey: ["/api/workspaces", workspaceId, "folders", currentFolderId || "root", "files"],
    enabled: !!workspaceId && !!currentFolderId,
  });

  const { data: members } = useQuery<MemberWithUser[]>({
    queryKey: ["/api/workspaces", workspaceId, "members"],
    enabled: !!workspaceId,
  });

  const breadcrumbs = useCallback(() => {
    if (!allFolders || !currentFolderId) return [];
    const crumbs: Folder[] = [];
    let current = allFolders.find((f) => f.id === currentFolderId);
    while (current) {
      crumbs.unshift(current);
      current = current.parentId ? allFolders.find((f) => f.id === current!.parentId) : undefined;
    }
    return crumbs;
  }, [allFolders, currentFolderId]);

  const createFolderMutation = useMutation({
    mutationFn: async (data: { name: string; parentId?: string }) => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/folders`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "folders"] });
      setCreateFolderOpen(false);
      setFolderName("");
      toast({ title: "Folder created" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/workspaces/${workspaceId}/folders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "folders"] });
      toast({ title: "Folder deleted" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/members`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "members"] });
      setAddMemberOpen(false);
      setMemberEmail("");
      setMemberRole("member");
      toast({ title: "Member added" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await apiRequest("DELETE", `/api/workspaces/${workspaceId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "members"] });
      toast({ title: "Member removed" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await apiRequest("DELETE", `/api/workspaces/${workspaceId}/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "folders", currentFolderId || "root", "files"] });
      toast({ title: "File deleted" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || !currentFolderId) return;

    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const urlRes = await fetch("/api/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
        });
        if (!urlRes.ok) throw new Error("Failed to get upload URL");
        const { uploadURL, objectPath } = await urlRes.json();

        await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        await apiRequest("POST", `/api/workspaces/${workspaceId}/files`, {
          name: file.name,
          type: file.type.startsWith("video/") ? "video" : "image",
          objectPath,
          size: file.size,
          folderId: currentFolderId,
          workspaceId,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "folders", currentFolderId || "root", "files"] });
      toast({ title: "Upload complete", description: `${fileList.length} file(s) uploaded.` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    createFolderMutation.mutate({
      name: folderName.trim(),
      parentId: currentFolderId || undefined,
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    addMemberMutation.mutate({ email: memberEmail.trim(), role: memberRole });
  };

  const isImage = (type: string) => type === "image" || type.startsWith("image/");
  const isVideo = (type: string) => type === "video" || type.startsWith("video/");

  const getFileIcon = (type: string) => {
    if (isImage(type)) return <ImageIcon className="w-5 h-5 text-chart-2" />;
    if (isVideo(type)) return <Video className="w-5 h-5 text-chart-5" />;
    return <FileIcon className="w-5 h-5 text-muted-foreground" />;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (wsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Workspace not found</h2>
          <Button onClick={() => setLocation("/")} variant="outline">Go back</Button>
        </div>
      </div>
    );
  }

  const crumbs = breadcrumbs();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold truncate" data-testid="text-workspace-name">{workspace.name}</h1>
              {workspace.description && (
                <p className="text-xs text-muted-foreground truncate">{workspace.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAddMemberOpen(true)} data-testid="button-add-member">
              <Users className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Members</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <Tabs defaultValue="files" className="space-y-6">
          <TabsList>
            <TabsTrigger value="files" data-testid="tab-files">Files</TabsTrigger>
            <TabsTrigger value="members" data-testid="tab-members">Members ({members?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <button
                onClick={() => setCurrentFolderId(null)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="breadcrumb-root"
              >
                <Home className="w-3.5 h-3.5" />
                Root
              </button>
              {crumbs.map((crumb) => (
                <span key={crumb.id} className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <button
                    onClick={() => setCurrentFolderId(crumb.id)}
                    className="hover:text-foreground text-muted-foreground transition-colors"
                    data-testid={`breadcrumb-folder-${crumb.id}`}
                  >
                    {crumb.name}
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">
                {currentFolderId ? crumbs[crumbs.length - 1]?.name || "Folder" : "Root"}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCreateFolderOpen(true)} data-testid="button-create-folder">
                  <FolderPlus className="w-4 h-4 mr-1.5" />
                  New Folder
                </Button>
                {currentFolderId && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      data-testid="input-file-upload"
                    />
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} data-testid="button-upload-files">
                      <Upload className="w-4 h-4 mr-1.5" />
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {foldersLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : (
              <>
                {currentFolders.length > 0 && (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currentFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className="flex items-center gap-3 p-3 rounded-md border bg-card cursor-pointer group hover-elevate"
                        onClick={() => setCurrentFolderId(folder.id)}
                        data-testid={`folder-${folder.id}`}
                      >
                        <FolderOpen className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate flex-1">{folder.name}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); deleteFolderMutation.mutate(folder.id); }}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}

                {currentFolderId && (
                  <>
                    {filesLoading ? (
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
                      </div>
                    ) : files && files.length > 0 ? (
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                        {files.map((file) => (
                          <Card
                            key={file.id}
                            className="border-card-border group cursor-pointer hover-elevate"
                            onClick={() => setPreviewFile(file)}
                            data-testid={`file-${file.id}`}
                          >
                            <CardContent className="p-3">
                              <div className="aspect-square rounded-md bg-muted flex items-center justify-center mb-2 relative">
                                {isImage(file.type) ? (
                                  <img
                                    src={file.objectPath}
                                    alt={file.name}
                                    className="w-full h-full object-cover rounded-md"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                                    }}
                                  />
                                ) : null}
                                <div className={`flex items-center justify-center ${isImage(file.type) ? "hidden" : ""}`}>
                                  {getFileIcon(file.type)}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      variant="secondary"
                                      size="icon"
                                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                                    >
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => { e.stopPropagation(); deleteFileMutation.mutate(file.id); }}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {getFileIcon(file.type)}
                                  <span>{formatSize(file.size)}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border rounded-md bg-card/50 mt-4">
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-3">No files in this folder yet</p>
                        <Button size="sm" onClick={() => fileInputRef.current?.click()} data-testid="button-upload-empty">
                          <Upload className="w-4 h-4 mr-1.5" />
                          Upload Files
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {!currentFolderId && currentFolders.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">No folders yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create a folder to start organizing your files.</p>
                    <Button size="sm" onClick={() => setCreateFolderOpen(true)} data-testid="button-create-first-folder">
                      <FolderPlus className="w-4 h-4 mr-1.5" />
                      Create Folder
                    </Button>
                  </div>
                )}

                {!currentFolderId && currentFolders.length > 0 && (
                  <div className="text-center py-8 border rounded-md bg-muted/30 mt-2">
                    <p className="text-sm text-muted-foreground">Select a folder to view and upload files</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">Team Members</h2>
              <Button size="sm" onClick={() => setAddMemberOpen(true)} data-testid="button-add-member-tab">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Member
              </Button>
            </div>
            <div className="space-y-2">
              {members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-md border bg-card"
                  data-testid={`member-${member.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={member.user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {`${member.user?.firstName?.[0] || ""}${member.user?.lastName?.[0] || ""}`.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.user?.firstName} {member.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{member.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                      {member.role}
                    </Badge>
                    {member.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        data-testid={`button-remove-member-${member.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {(!members || members.length === 0) && (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No members yet. Add someone to collaborate.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="e.g. Product Photos"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                data-testid="input-folder-name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createFolderMutation.isPending || !folderName.trim()} data-testid="button-submit-folder">
                {createFolderMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email Address</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="team@example.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                data-testid="input-member-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger data-testid="select-member-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addMemberMutation.isPending || !memberEmail.trim()} data-testid="button-submit-member">
                {addMemberMutation.isPending ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewFile && getFileIcon(previewFile.type)}
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="space-y-4">
              <div className="rounded-md bg-muted flex items-center justify-center overflow-hidden max-h-[60vh]">
                {isImage(previewFile.type) ? (
                  <img
                    src={previewFile.objectPath}
                    alt={previewFile.name}
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : isVideo(previewFile.type) ? (
                  <video
                    src={previewFile.objectPath}
                    controls
                    className="max-w-full max-h-[60vh]"
                  />
                ) : (
                  <div className="py-16">
                    <FileIcon className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Preview not available</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatSize(previewFile.size)}</span>
                <span>{previewFile.createdAt ? new Date(previewFile.createdAt).toLocaleDateString() : ""}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
