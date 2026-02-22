import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Video, Plus, Link2, Sparkles, Loader2, Upload, ExternalLink,
  ChevronDown, ChevronUp, Trash2, AlertCircle, Eye, Clock,
  Zap, Scissors, Type, Music, Target, Lightbulb, Tag, Play, X,
  Layers, Wand2
} from "lucide-react";
import { useState, useRef } from "react";
import type { ReferenceReel, ReferenceAnalysis, ReferenceAnalysisSection } from "@shared/schema";

function detectPlatform(url: string): "instagram" | "tiktok" | "youtube" | "other" {
  if (/instagram\.com|instagr\.am/i.test(url)) return "instagram";
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/youtube\.com|youtu\.be|youtube\.com\/shorts/i.test(url)) return "youtube";
  return "other";
}

function platformLabel(p?: string) {
  if (p === "instagram") return "Instagram";
  if (p === "tiktok") return "TikTok";
  if (p === "youtube") return "YouTube";
  return "Link";
}

function platformColor(p?: string) {
  if (p === "instagram") return "bg-pink-500/10 text-pink-600 dark:text-pink-400";
  if (p === "tiktok") return "bg-black/10 text-black dark:bg-white/10 dark:text-white";
  if (p === "youtube") return "bg-red-500/10 text-red-600 dark:text-red-400";
  return "bg-muted text-muted-foreground";
}

const sectionIcons: Record<string, any> = {
  hook: Zap,
  pacing: Play,
  transitions: Scissors,
  motionGraphics: Wand2,
  textStyle: Type,
  audio: Music,
  engagementTactics: Target,
  recommendations: Lightbulb,
};

const sectionColors: Record<string, string> = {
  hook: "text-amber-500",
  pacing: "text-blue-500",
  transitions: "text-purple-500",
  motionGraphics: "text-cyan-500",
  textStyle: "text-emerald-500",
  audio: "text-pink-500",
  engagementTactics: "text-orange-500",
  recommendations: "text-primary",
};

function AnalysisSection({ sectionKey, section }: { sectionKey: string; section: ReferenceAnalysisSection }) {
  const [open, setOpen] = useState(true);
  const Icon = sectionIcons[sectionKey] || Sparkles;
  const color = sectionColors[sectionKey] || "text-primary";

  return (
    <div className="border rounded-lg overflow-hidden" data-testid={`analysis-section-${sectionKey}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <Icon className={`w-4 h-4 ${color} shrink-0`} />
        <span className="text-sm font-semibold flex-1">{section.title}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2">
          <ul className="space-y-1.5">
            {section.observations.map((obs, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary/60 mt-0.5 shrink-0">-</span>
                <span>{obs}</span>
              </li>
            ))}
          </ul>
          {section.whyItWorks && section.whyItWorks !== "N/A" && (
            <div className="mt-2 px-3 py-2 rounded-md bg-primary/5 border border-primary/10">
              <p className="text-xs font-medium text-primary mb-0.5">Why it works</p>
              <p className="text-xs text-muted-foreground">{section.whyItWorks}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResourcesTab({ workspaceId, userRole }: { workspaceId: string; userRole?: string }) {
  const isAdmin = userRole === "admin";
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedRef, setExpandedRef] = useState<string | null>(null);
  const [viewAnalysis, setViewAnalysis] = useState<ReferenceReel | null>(null);

  const { data: references, isLoading } = useQuery<ReferenceReel[]>({
    queryKey: [`/api/workspaces/${workspaceId}/references`],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; sourceUrl?: string; sourcePlatform?: string; videoObjectPath?: string; videoUrl?: string }) => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/references`, data);
      return res.json();
    },
    onSuccess: (data: ReferenceReel) => {
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}/references`] });
      setAddOpen(false);
      setTitle("");
      setSourceUrl("");
      setVideoFile(null);
      if (data.videoObjectPath) {
        toast({ title: "Reference added — AI analysis starting..." });
        setTimeout(() => analyzeMutation.mutate(data.id), 500);
      } else {
        toast({ title: "Reference added" });
      }
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (refId: string) => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/references/${refId}/analyze`);
      return res.json();
    },
    onSuccess: (data: ReferenceReel) => {
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}/references`] });
      setViewAnalysis(data);
      toast({ title: "Analysis complete" });
    },
    onError: (err: Error) => {
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}/references`] });
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (refId: string) => {
      await apiRequest("DELETE", `/api/workspaces/${workspaceId}/references/${refId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}/references`] });
      toast({ title: "Reference removed" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let videoObjectPath: string | undefined;
    let videoUrl: string | undefined;

    if (videoFile) {
      setUploading(true);
      try {
        const uploadRes = await apiRequest("POST", "/api/uploads/request-url", {
          name: videoFile.name,
          contentType: videoFile.type,
        });
        const { uploadURL, objectPath } = await uploadRes.json();
        await fetch(uploadURL, {
          method: "PUT",
          body: videoFile,
          headers: { "Content-Type": videoFile.type },
        });
        videoObjectPath = objectPath;
        videoUrl = objectPath;
      } catch (err: any) {
        toast({ title: "Upload failed", description: err.message, variant: "destructive" });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const sourcePlatform = sourceUrl ? detectPlatform(sourceUrl) : undefined;
    createMutation.mutate({
      title: title.trim(),
      sourceUrl: sourceUrl.trim() || undefined,
      sourcePlatform,
      videoObjectPath,
      videoUrl,
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const refs = references || [];

  return (
    <div className="h-full overflow-auto p-4 sm:p-6" data-testid="resources-tab">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight" data-testid="text-resources-title">Reference Reels</h2>
                {refs.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 bg-primary/10 text-primary border-0 font-bold">
                    {refs.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Share viral reels with your editors — AI breaks down what makes them work
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-1.5 text-xs w-full sm:w-auto" onClick={() => setAddOpen(true)} data-testid="button-add-reference">
            <Plus className="w-3.5 h-3.5" />
            Add Reference
          </Button>
        </div>

        {refs.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2" data-testid="text-no-references">No reference reels yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Add a viral Reel, TikTok, or Short as a reference. Upload the video and AI will analyze pacing, transitions, audio, text style, and more — giving your editors a clear creative brief.
              </p>
              <Button onClick={() => setAddOpen(true)} className="gap-2" data-testid="button-add-first-reference">
                <Plus className="w-4 h-4" />
                Add your first reference
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {refs.map((ref) => {
              const isExpanded = expandedRef === ref.id;
              const isAnalyzing = analyzeMutation.isPending && analyzeMutation.variables === ref.id;
              return (
                <Card key={ref.id} className={`overflow-hidden transition-shadow ${isExpanded ? "shadow-md ring-1 ring-primary/10" : "hover:shadow-sm"}`} data-testid={`card-reference-${ref.id}`}>
                  <div className="px-4 sm:px-5 py-3.5 sm:py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Video className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold text-sm truncate">{ref.title}</p>
                          {ref.sourcePlatform && (
                            <Badge variant="secondary" className={`text-[10px] border-0 px-1.5 py-0 ${platformColor(ref.sourcePlatform)}`}>
                              {platformLabel(ref.sourcePlatform)}
                            </Badge>
                          )}
                          <Badge variant="secondary" className={`text-[10px] border-0 px-1.5 py-0 ${
                            ref.analysisStatus === "completed" ? "bg-green-500/10 text-green-600" :
                            ref.analysisStatus === "processing" ? "bg-amber-500/10 text-amber-600" :
                            ref.analysisStatus === "failed" ? "bg-red-500/10 text-red-600" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {ref.analysisStatus === "completed" ? "Analysed" :
                             ref.analysisStatus === "processing" ? "Analysing..." :
                             ref.analysisStatus === "failed" ? "Failed" :
                             "Pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(ref.createdAt)}
                          </span>
                          {ref.sourceUrl && (
                            <a
                              href={ref.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`link-source-${ref.id}`}
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Original</span>
                            </a>
                          )}
                        </div>
                        {ref.analysis?.summary && (
                          <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 leading-relaxed" data-testid={`text-analysis-preview-${ref.id}`}>
                            {ref.analysis.summary}
                          </p>
                        )}
                        {ref.analysis?.sections && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(ref.analysis.sections).slice(0, 5).map(([key, section]: [string, any]) => {
                              const Icon = sectionIcons[key] || Sparkles;
                              const color = sectionColors[key] || "text-primary";
                              return (
                                <span key={key} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground" data-testid={`chip-section-${ref.id}-${key}`}>
                                  <Icon className={`w-2.5 h-2.5 ${color}`} />
                                  {section.title}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 mt-2 sm:mt-0">
                        {ref.analysisStatus === "completed" && ref.analysis && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => setViewAnalysis(ref)}
                            data-testid={`button-view-analysis-${ref.id}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Button>
                        )}
                        {(ref.analysisStatus === "pending" || ref.analysisStatus === "failed") && ref.videoObjectPath && (
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            disabled={isAnalyzing}
                            onClick={() => analyzeMutation.mutate(ref.id)}
                            data-testid={`button-analyze-${ref.id}`}
                          >
                            {isAnalyzing ? (
                              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analysing...</>
                            ) : (
                              <><Sparkles className="w-3.5 h-3.5" />Analyse</>
                            )}
                          </Button>
                        )}
                        {ref.analysisStatus === "processing" && (
                          <Button size="sm" className="h-8 gap-1.5 text-xs" disabled>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />Analysing...
                          </Button>
                        )}
                        {!ref.videoObjectPath && (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 border-0">
                            No video
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteMutation.mutate(ref.id)}
                          data-testid={`button-delete-reference-${ref.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {ref.analysisStatus === "completed" && ref.analysis && (
                      <button
                        onClick={() => setExpandedRef(isExpanded ? null : ref.id)}
                        className="mt-3 w-full flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors"
                        data-testid={`button-expand-${ref.id}`}
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? "Hide summary" : "Show summary"}
                      </button>
                    )}
                  </div>

                  {isExpanded && ref.analysis && (
                    <div className="px-5 pb-4 border-t pt-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">{ref.analysis.summary}</p>
                      {ref.analysis.tags && ref.analysis.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {ref.analysis.tags.map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/5 text-primary/70">
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {ref.analysisStatus === "failed" && ref.errorMessage && (
                    <div className="px-5 pb-3">
                      <div className="flex items-center gap-2 text-xs text-destructive">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{ref.errorMessage}</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Add Reference Reel
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="ref-title">Title</Label>
              <Input
                id="ref-title"
                placeholder='e.g. "Viral hook transition reel"'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                data-testid="input-reference-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref-url">
                Source URL <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="ref-url"
                  placeholder="https://instagram.com/reel/..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="pl-9"
                  data-testid="input-reference-url"
                />
              </div>
              {sourceUrl && (
                <Badge variant="secondary" className={`text-[10px] ${platformColor(detectPlatform(sourceUrl))}`}>
                  {platformLabel(detectPlatform(sourceUrl))}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label>Video File <span className="text-muted-foreground font-normal">(for AI analysis)</span></Label>
              {!videoFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  data-testid="button-upload-video"
                >
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Upload the reel video</p>
                  <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM (max 100MB)</p>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <Video className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{videoFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setVideoFile(null)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/mov,.mp4,.mov,.webm"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setVideoFile(e.target.files[0])}
                data-testid="input-video-file"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                disabled={!title.trim() || uploading || createMutation.isPending}
                data-testid="button-submit-reference"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                ) : createMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  "Add Reference"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewAnalysis} onOpenChange={() => setViewAnalysis(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="truncate">{viewAnalysis?.title} — Analysis</span>
            </DialogTitle>
          </DialogHeader>
          {viewAnalysis?.analysis && (
            <div className="flex-1 overflow-auto space-y-4 pr-1">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm font-medium text-foreground mb-1">Summary</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{viewAnalysis.analysis.summary}</p>
              </div>

              {viewAnalysis.analysis.tags && viewAnalysis.analysis.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {viewAnalysis.analysis.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {viewAnalysis.analysis.sections && Object.entries(viewAnalysis.analysis.sections).map(([key, section]) => (
                  <AnalysisSection key={key} sectionKey={key} section={section as ReferenceAnalysisSection} />
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
