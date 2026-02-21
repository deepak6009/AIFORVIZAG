import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Upload, FileText, Mic, FileIcon, X, Sparkles, Loader2, CheckCircle2, AlertCircle,
  Square, MessageSquare, FileCheck, ChevronRight, ArrowLeft, Send, Bot, User
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  cloudfrontUrl: string;
  localUrl?: string;
  status: "uploading" | "done" | "error";
}

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

const STEPS = [
  { id: 1, label: "Base", icon: Upload, description: "Upload & Analyse" },
  { id: 2, label: "AI Chat", icon: MessageSquare, description: "Refine with AI" },
  { id: 3, label: "Final Document", icon: FileCheck, description: "Final Agenda" },
];

function StepIndicator({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6" data-testid="step-indicator">
      {STEPS.map((step, idx) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const isClickable = step.id <= currentStep;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isCompleted
                    ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              data-testid={`step-${step.id}`}
            >
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                isActive ? "bg-primary-foreground text-primary" : isCompleted ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30 text-muted-foreground"
              }`}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold leading-tight">{step.label}</p>
                <p className={`text-[10px] leading-tight ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{step.description}</p>
              </div>
            </button>
            {idx < STEPS.length - 1 && (
              <ChevronRight className={`w-4 h-4 mx-1 shrink-0 ${currentStep > step.id ? "text-primary" : "text-muted-foreground/40"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function InterrogatorTab({ workspaceId }: { workspaceId: string }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [textBrief, setTextBrief] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    const audioContext = new AudioContext();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const numChannels = 1;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.getChannelData(0);
    const int16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    const wavBuffer = new ArrayBuffer(44 + int16.length * 2);
    const view = new DataView(wavBuffer);
    const writeStr = (off: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + int16.length * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, int16.length * 2, true);
    const output = new Int16Array(wavBuffer, 44);
    output.set(int16);

    await audioContext.close();
    return new Blob([wavBuffer], { type: "audio/wav" });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

        try {
          const wavBlob = await convertToWav(webmBlob);
          const localUrl = URL.createObjectURL(wavBlob);
          const file = new File([wavBlob], `voice-note-${timestamp}.wav`, { type: "audio/wav" });
          handleFilesSelected([file], localUrl);
        } catch {
          const localUrl = URL.createObjectURL(webmBlob);
          const file = new File([webmBlob], `voice-note-${timestamp}.webm`, { type: "audio/webm" });
          handleFilesSelected([file], localUrl);
        }
      };
      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      toast({ title: "Microphone access denied", description: "Please allow microphone access in your browser.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const uploadFileToS3 = useCallback(async (file: File): Promise<string> => {
    const urlRes = await fetch("/api/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
    });
    if (!urlRes.ok) throw new Error("Failed to get upload URL");
    const { uploadURL, objectPath } = await urlRes.json();
    await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    return objectPath;
  }, []);

  const handleFilesSelected = useCallback(async (files: FileList | File[], localUrl?: string) => {
    for (const file of Array.from(files)) {
      const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setUploadedFiles(prev => [...prev, { id: fileId, name: file.name, size: file.size, type: file.type, cloudfrontUrl: "", localUrl, status: "uploading" }]);
      try {
        const cloudfrontUrl = await uploadFileToS3(file);
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, cloudfrontUrl, status: "done" as const } : f));
      } catch (err: any) {
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "error" as const } : f));
        toast({ title: "Upload failed", description: `${file.name}: ${err.message}`, variant: "destructive" });
      }
    }
  }, [uploadFileToS3, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFilesSelected(e.dataTransfer.files);
  }, [handleFilesSelected]);

  const removeFile = (fileId: string) => setUploadedFiles(prev => prev.filter(f => f.id !== fileId));

  const handleAnalyse = async () => {
    const fileUrls: { url: string }[] = [];
    for (const f of uploadedFiles.filter(f => f.status === "done")) {
      fileUrls.push({ url: f.cloudfrontUrl });
    }
    if (textBrief.trim()) {
      try {
        const res = await apiRequest("POST", "/api/interrogator/upload-text", { text: textBrief.trim() });
        const data = await res.json();
        fileUrls.push({ url: data.cloudfrontUrl });
      } catch {
        toast({ title: "Error", description: "Failed to upload text brief", variant: "destructive" });
        return;
      }
    }
    if (fileUrls.length === 0) {
      toast({ title: "Nothing to analyse", description: "Please upload files or enter text first", variant: "destructive" });
      return;
    }

    setSummarizing(true);
    setSummaryResult(null);
    setSummaryError(null);

    try {
      const res = await apiRequest("POST", "/api/interrogator/summarize", { files: fileUrls });
      const data = await res.json();
      setSummaryResult(data);
      setCurrentStep(2);
    } catch (err: any) {
      setSummaryError(err.message || "Failed to get summary");
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setSummarizing(false);
    }
  };

  const getSummaryText = (): string => {
    if (!summaryResult) return "";
    if (typeof summaryResult === "string") return summaryResult;
    const raw = summaryResult.brief || summaryResult.summary || summaryResult.result || summaryResult.message || "";
    if (!raw && typeof summaryResult === "object") return JSON.stringify(summaryResult, null, 2);
    return raw
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"');
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { role: "user", text: chatInput.trim() },
      { role: "ai", text: "AI Chat integration coming soon. This step will allow you to refine the summary through conversation before generating the final agenda." },
    ]);
    setChatInput("");
  };

  const handleGenerateFinalDoc = () => {
    setCurrentStep(3);
  };

  const hasContent = uploadedFiles.some(f => f.status === "done") || textBrief.trim().length > 0;
  const isUploading = uploadedFiles.some(f => f.status === "uploading");

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />

        {currentStep === 1 && (
          <div className="space-y-5" data-testid="step-1-content">
            <div className="text-center pb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold" data-testid="text-interrogator-title">Upload Briefing Materials</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Drop your documents, voice notes, or type your brief below.
              </p>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              data-testid="dropzone-briefing"
            >
              <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-muted-foreground">PDF, Word, Text, Audio (.mp3, .wav, .ogg, .webm, .m4a)</p>
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

            <div>
              {!isRecording ? (
                <Button variant="outline" className="w-full h-12 gap-3" onClick={startRecording} data-testid="button-start-recording">
                  <Mic className="w-5 h-5 text-purple-500" />
                  <span>Record Voice Note</span>
                </Button>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400" data-testid="text-recording-time">
                    Recording {formatRecordingTime(recordingTime)}
                  </span>
                  <div className="flex-1" />
                  <Button variant="destructive" size="sm" className="gap-2" onClick={stopRecording} data-testid="button-stop-recording">
                    <Square className="w-3.5 h-3.5" />
                    Stop
                  </Button>
                </div>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Uploaded ({uploadedFiles.filter(f => f.status === "done").length}/{uploadedFiles.length})
                </h3>
                {uploadedFiles.map(file => {
                  const isAudio = file.type.startsWith("audio/") || file.name.match(/\.(mp3|wav|ogg|webm|m4a)$/i);
                  const audioSrc = file.localUrl || (file.status === "done" ? file.cloudfrontUrl : undefined);
                  return (
                    <div key={file.id} className="rounded-lg border bg-card overflow-hidden" data-testid={`briefing-file-${file.id}`}>
                      <div className="flex items-center gap-3 p-2.5">
                        {getFileIcon(file.type, file.name)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{getFileTypeLabel(file.type, file.name)} · {formatSize(file.size)}</p>
                        </div>
                        {file.status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                        {file.status === "done" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {file.status === "error" && <AlertCircle className="w-4 h-4 text-destructive" />}
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFile(file.id)} data-testid={`remove-file-${file.id}`}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      {isAudio && audioSrc && (
                        <div className="px-2.5 pb-2.5">
                          <audio controls className="w-full h-8" src={audioSrc} preload="metadata" data-testid={`audio-player-${file.id}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <Textarea
              placeholder="Type your briefing notes here..."
              value={textBrief}
              onChange={(e) => setTextBrief(e.target.value)}
              rows={4}
              className="resize-none"
              data-testid="input-text-brief"
            />

            {summaryError && (
              <div className="flex items-start gap-2 p-3 rounded-lg border border-destructive/50 bg-destructive/5 text-sm">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-destructive">{summaryError}</span>
              </div>
            )}

            <Button
              onClick={handleAnalyse}
              disabled={!hasContent || isUploading || isRecording || summarizing}
              className="w-full"
              size="lg"
              data-testid="button-analyse"
            >
              {summarizing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analysing...</>
              ) : isRecording ? (
                <><Mic className="w-4 h-4 mr-2 animate-pulse text-red-500" />Recording...</>
              ) : isUploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Analyse</>
              )}
            </Button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4" data-testid="step-2-content">
            {summaryResult && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Analysis Summary</h3>
                  </div>
                  <div className="text-sm max-h-60 overflow-auto prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-headings:font-semibold prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-1.5 prose-strong:text-foreground prose-li:text-muted-foreground prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1" data-testid="text-summary">
                    <ReactMarkdown>{getSummaryText()}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="flex-1">
              <CardContent className="p-4 flex flex-col" style={{ height: "360px" }}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">AI Chat</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">Coming Soon</span>
                </div>

                <div className="flex-1 overflow-auto space-y-3 mb-3 pr-1">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Bot className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm">Chat with AI to refine your brief</p>
                      <p className="text-xs mt-1">Ask questions, clarify details, or request changes to the summary.</p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "ai" && (
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`} data-testid={`chat-message-${i}`}>
                        {msg.text}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    rows={1}
                    className="resize-none flex-1 min-h-[40px]"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                    data-testid="input-chat"
                  />
                  <Button size="icon" onClick={handleSendChat} disabled={!chatInput.trim()} className="shrink-0 h-10 w-10" data-testid="button-send-chat">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1" data-testid="button-back-to-base">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Base
              </Button>
              <Button onClick={handleGenerateFinalDoc} className="flex-1" data-testid="button-generate-final">
                Generate Final Document
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4" data-testid="step-3-content">
            <div className="text-center pb-2">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold">Final Agenda</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your structured brief based on the analysis and AI conversation.
              </p>
            </div>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Structured Brief</h3>
                </div>

                {summaryResult ? (
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-headings:font-semibold prose-h2:text-base prose-h2:mt-5 prose-h2:mb-2 prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-2 prose-strong:text-foreground prose-li:text-muted-foreground prose-li:my-0.5 prose-ul:my-1.5 prose-ol:my-1.5" data-testid="text-final-document">
                      <ReactMarkdown>{getSummaryText()}</ReactMarkdown>
                    </div>
                    {chatMessages.filter(m => m.role === "user").length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Additional Notes from Chat</h4>
                        <ul className="space-y-1">
                          {chatMessages.filter(m => m.role === "user").map((msg, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {msg.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No analysis data available. Please complete Step 1 first.</p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1" data-testid="button-back-to-chat">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to AI Chat
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep(1);
                  setSummaryResult(null);
                  setSummaryError(null);
                  setUploadedFiles([]);
                  setTextBrief("");
                  setChatMessages([]);
                  setChatInput("");
                }}
                className="flex-1"
                data-testid="button-start-new"
              >
                Start New Interrogation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
