import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Folder, FileRecord } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  FolderOpen, FolderPlus, Upload, Plus, Home, ChevronRight,
  Image as ImageIcon, Video, FileIcon, MoreVertical, Trash2, X
} from "lucide-react";
import { useState, useCallback, useRef } from "react";

export default function FoldersTab({ workspaceId }: { workspaceId: string }) {
  const { toast } = useToast();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: allFolders, isLoading: foldersLoading } = useQuery<Folder[]>({
    queryKey: ["/api/workspaces", workspaceId, "folders"],
    enabled: !!workspaceId,
  });

  const currentFolders = allFolders?.filter(f =>
    currentFolderId ? f.parentId === currentFolderId : !f.parentId
  ) || [];

  const { data: files, isLoading: filesLoading } = useQuery<FileRecord[]>({
    queryKey: ["/api/workspaces", workspaceId, "folders", currentFolderId || "root", "files"],
    enabled: !!workspaceId && !!currentFolderId,
  });

  const breadcrumbs = useCallback(() => {
    if (!allFolders || !currentFolderId) return [];
    const crumbs: Folder[] = [];
    let current = allFolders.find(f => f.id === currentFolderId);
    while (current) {
      crumbs.unshift(current);
      current = current.parentId ? allFolders.find(f => f.id === current!.parentId) : undefined;
    }
    return crumbs;
  }, [allFolders, currentFolderId]);

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; parentId?: string }) => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/folders`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "folders"] });
      setCreateOpen(false);
      setFolderName("");
      toast({ title: "Folder created" });
    },
    onError: (error: Error) => {
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

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
        await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        await apiRequest("POST", `/api/workspaces/${workspaceId}/files`, {
          name: file.name,
          type: file.type.startsWith("video/") ? "video" : "image",
          objectPath, size: file.size, folderId: currentFolderId, workspaceId,
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
    createMutation.mutate({ name: folderName.trim(), parentId: currentFolderId || undefined });
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

  const crumbs = breadcrumbs();

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-2 text-sm flex-wrap mb-4">
          <button
            onClick={() => setCurrentFolderId(null)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="breadcrumb-root"
          >
            <Home className="w-3.5 h-3.5" />
            Root
          </button>
          {crumbs.map(crumb => (
            <span key={crumb.id} className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <button
                onClick={() => setCurrentFolderId(crumb.id)}
                className="hover:text-foreground text-muted-foreground transition-colors"
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            {currentFolderId ? crumbs[crumbs.length - 1]?.name || "Folder" : "All Folders"}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)} data-testid="button-create-folder">
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
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : (
          <>
            {currentFolders.length > 0 && (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {currentFolders.map(folder => (
                  <div
                    key={folder.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer group hover:bg-accent/50 transition-colors"
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
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
                  </div>
                ) : files && files.length > 0 ? (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                    {files.map(file => (
                      <Card
                        key={file.id}
                        className="border group cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() => setPreviewFile(file)}
                        data-testid={`file-${file.id}`}
                      >
                        <CardContent className="p-3">
                          <div className="aspect-square rounded-md bg-muted flex items-center justify-center mb-2 relative overflow-hidden">
                            {isImage(file.type) ? (
                              <img src={file.objectPath} alt={file.name} className="w-full h-full object-cover rounded-md" />
                            ) : (
                              getFileIcon(file.type)
                            )}
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
                  <div className="text-center py-12 border rounded-lg bg-card/50 mt-4">
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
                <p className="text-sm text-muted-foreground mb-4">Create a folder to start organizing your files</p>
                <Button size="sm" onClick={() => setCreateOpen(true)} data-testid="button-create-first-folder">
                  <FolderPlus className="w-4 h-4 mr-1.5" />
                  Create Folder
                </Button>
              </div>
            )}

            {!currentFolderId && currentFolders.length > 0 && (
              <div className="text-center py-8 border rounded-lg bg-muted/30 mt-3">
                <p className="text-sm text-muted-foreground">Select a folder to view and upload files</p>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Folder Name</Label>
              <Input
                placeholder="e.g. Raw Footage"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                data-testid="input-folder-name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || !folderName.trim()} data-testid="button-submit-folder">
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getFileIcon(previewFile.type)}
                {previewFile.name}
              </DialogTitle>
            </DialogHeader>
            <div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center min-h-[300px]">
              {isImage(previewFile.type) ? (
                <img src={previewFile.objectPath} alt={previewFile.name} className="max-w-full max-h-[60vh] object-contain" />
              ) : isVideo(previewFile.type) ? (
                <video src={previewFile.objectPath} controls className="max-w-full max-h-[60vh]" />
              ) : (
                <div className="text-center p-8">
                  {getFileIcon(previewFile.type)}
                  <p className="text-sm text-muted-foreground mt-2">Preview not available</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
