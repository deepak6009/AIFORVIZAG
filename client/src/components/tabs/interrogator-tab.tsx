import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Upload, FileText, Mic, FileIcon, X, Sparkles, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { useState, useRef, useCallback } from "react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  cloudfrontUrl: string;
  status: "uploading" | "done" | "error";
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "text/plain",
  "application/rtf",
];

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.txt,.rtf,.mp3,.wav,.ogg,.webm,.m4a";

function getFileTypeLabel(type: string, name: string): string {
  if (type.startsWith("audio/") || name.match(/\.(mp3|wav|ogg|webm|m4a)$/i)) return "Audio";
  if (type === "application/pdf" || name.endsWith(".pdf")) return "PDF";
  if (type.includes("word") || name.match(/\.(doc|docx)$/i)) return "Word";
  if (type === "text/plain" || name.endsWith(".txt")) return "Text";
  return "File";
}

function getFileIcon(type: string, name: string) {
  if (type.startsWith("audio/") || name.match(/\.(mp3|wav|ogg|webm|m4a)$/i))
    return <Mic className="w-4 h-4 text-purple-500" />;
  if (type === "application/pdf" || name.endsWith(".pdf"))
    return <FileText className="w-4 h-4 text-red-500" />;
  if (type.includes("word") || name.match(/\.(doc|docx)$/i))
    return <FileText className="w-4 h-4 text-blue-500" />;
  return <FileIcon className="w-4 h-4 text-muted-foreground" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function InterrogatorTab({ workspaceId }: { workspaceId: string }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [textBrief, setTextBrief] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFileToS3 = useCallback(async (file: File): Promise<string> => {
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

    return objectPath;
  }, []);

  const handleFilesSelected = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const entry: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        cloudfrontUrl: "",
        status: "uploading",
      };
      setUploadedFiles(prev => [...prev, entry]);

      try {
        const cloudfrontUrl = await uploadFileToS3(file);
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileId ? { ...f, cloudfrontUrl, status: "done" as const } : f)
        );
      } catch (err: any) {
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileId ? { ...f, status: "error" as const } : f)
        );
        toast({ title: "Upload failed", description: `${file.name}: ${err.message}`, variant: "destructive" });
      }
    }
  }, [uploadFileToS3, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  }, [handleFilesSelected]);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = async () => {
    const fileUrls: { url: string }[] = [];

    const successFiles = uploadedFiles.filter(f => f.status === "done");
    for (const f of successFiles) {
      fileUrls.push({ url: f.cloudfrontUrl });
    }

    if (textBrief.trim()) {
      try {
        const res = await apiRequest("POST", "/api/interrogator/upload-text", { text: textBrief.trim() });
        const data = await res.json();
        fileUrls.push({ url: data.cloudfrontUrl });
      } catch (err: any) {
        toast({ title: "Error", description: "Failed to upload text brief", variant: "destructive" });
        return;
      }
    }

    if (fileUrls.length === 0) {
      toast({ title: "Nothing to submit", description: "Please upload files or enter text first", variant: "destructive" });
      return;
    }

    setSummarizing(true);
    setSummaryResult(null);
    setSummaryError(null);

    try {
      const res = await apiRequest("POST", "/api/interrogator/summarize", { files: fileUrls });
      const data = await res.json();
      setSummaryResult(data);
    } catch (err: any) {
      setSummaryError(err.message || "Failed to get summary");
      toast({ title: "Summary failed", description: err.message, variant: "destructive" });
    } finally {
      setSummarizing(false);
    }
  };

  const hasContent = uploadedFiles.some(f => f.status === "done") || textBrief.trim().length > 0;
  const isUploading = uploadedFiles.some(f => f.status === "uploading");

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-1" data-testid="text-interrogator-title">AI Interrogator</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Upload your briefing materials — documents, voice notes, or typed notes — and I'll create a structured summary for your editing team.
          </p>
        </div>

        {!summaryResult && (
          <>
            <div>
              <h3 className="text-sm font-medium mb-2">Upload Briefing Files</h3>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                data-testid="dropzone-briefing"
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">Drag & drop files here, or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, Word (.doc, .docx), Text (.txt), Audio (.mp3, .wav, .ogg, .webm, .m4a)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_EXTENSIONS}
                  className="hidden"
                  onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
                  data-testid="input-briefing-files"
                />
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Uploaded Files ({uploadedFiles.filter(f => f.status === "done").length}/{uploadedFiles.length})</h3>
                {uploadedFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    data-testid={`briefing-file-${file.id}`}
                  >
                    {getFileIcon(file.type, file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getFileTypeLabel(file.type, file.name)} · {formatSize(file.size)}
                      </p>
                    </div>
                    {file.status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {file.status === "done" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {file.status === "error" && <AlertCircle className="w-4 h-4 text-destructive" />}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => removeFile(file.id)}
                      data-testid={`remove-file-${file.id}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium mb-2">Or Type Your Brief</h3>
              <Textarea
                placeholder="Type your briefing notes here... This will be converted to a text file and included with your other materials."
                value={textBrief}
                onChange={(e) => setTextBrief(e.target.value)}
                rows={5}
                className="resize-none"
                data-testid="input-text-brief"
              />
              {textBrief.trim() && (
                <p className="text-xs text-muted-foreground mt-1">
                  This text will be saved as a .txt file and included in the summary
                </p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!hasContent || isUploading || summarizing}
              className="w-full"
              size="lg"
              data-testid="button-submit-interrogator"
            >
              {summarizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Summary...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading files...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </>
        )}

        {summaryError && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Summary Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{summaryError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => { setSummaryError(null); handleSubmit(); }}
                    data-testid="button-retry-summary"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {summaryResult && (
          <div className="space-y-4" data-testid="summary-result">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">AI Summary</h3>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {typeof summaryResult === "string" ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{summaryResult}</p>
                  ) : summaryResult.summary ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{summaryResult.summary}</p>
                  ) : summaryResult.result ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{summaryResult.result}</p>
                  ) : summaryResult.message ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{summaryResult.message}</p>
                  ) : (
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                      {JSON.stringify(summaryResult, null, 2)}
                    </pre>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              onClick={() => {
                setSummaryResult(null);
                setSummaryError(null);
                setUploadedFiles([]);
                setTextBrief("");
              }}
              className="w-full"
              data-testid="button-new-interrogation"
            >
              Start New Interrogation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
