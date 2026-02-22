import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Upload, FileText, Mic, FileIcon, X, Sparkles, Loader2, CheckCircle2, AlertCircle,
  Square, MessageSquare, FileCheck, ChevronRight, ArrowLeft, Send, Bot, User,
  Paperclip, Folder, FolderOpen, Image, Video, File, Plus, Monitor, HardDrive,
  Pencil, Save, Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
  { id: 1, label: "Upload", icon: Upload, description: "Add files & context" },
  { id: 2, label: "Briefing", icon: Sparkles, description: "AI-guided brief" },
  { id: 3, label: "Brief", icon: FileCheck, description: "Production brief" },
];

function StepIndicator({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) {
  return (
    <div className="flex items-center justify-between mb-8 max-w-lg mx-auto" data-testid="step-indicator">
      {STEPS.map((step, idx) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const isClickable = step.id <= currentStep;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex flex-col items-center gap-2 transition-all w-full ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}`}
              data-testid={`step-${step.id}`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                  : isCompleted
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="text-center">
                <p className={`text-xs font-bold leading-tight ${isActive ? "text-foreground" : isCompleted ? "text-primary" : "text-muted-foreground"}`}>{step.label}</p>
                <p className={`text-[10px] leading-tight mt-0.5 hidden sm:block ${isActive ? "text-muted-foreground" : "text-muted-foreground/60"}`}>{step.description}</p>
              </div>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-3 mt-[-22px] rounded-full transition-all ${currentStep > step.id ? "bg-primary/40" : "bg-border"}`} />
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
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
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
  const [liveTranscript, setLiveTranscript] = useState("");

  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const chatMessagesRef = useRef<{ role: "user" | "ai"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatMicActive, setChatMicActive] = useState(false);
  const chatRecognitionRef = useRef<any>(null);
  const [interrogationId, setInterrogationId] = useState<string | null>(null);
  const [briefingAnswers, setBriefingAnswers] = useState<Record<string, any>>({});
  const briefingAnswersRef = useRef<Record<string, any>>({});
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; url: string; folderId?: string; folderName?: string }[]>([]);
  const [fileAttachments, setFileAttachments] = useState<Record<string, { name: string; url: string; folderName?: string }[]>>({});
  const fileAttachmentsRef = useRef<Record<string, { name: string; url: string; folderName?: string }[]>>({});
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<"workspace" | "upload">("workspace");
  const [wsFolders, setWsFolders] = useState<any[]>([]);
  const [wsFolderFiles, setWsFolderFiles] = useState<Record<string, any[]>>({});
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const filePickerRef = useRef<HTMLDivElement>(null);
  const deviceFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetFolder, setUploadTargetFolder] = useState<string | null>(null);
  const [deviceUploading, setDeviceUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [currentAiResponse, setCurrentAiResponse] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(1);
  const [briefingComplete, setBriefingComplete] = useState(false);
  const [finalDocument, setFinalDocument] = useState<string | null>(null);
  const [generatingFinal, setGeneratingFinal] = useState(false);
  const [editingFinal, setEditingFinal] = useState(false);
  const [editableFinalText, setEditableFinalText] = useState("");
  const [savingFinal, setSavingFinal] = useState(false);
  const [finalSaved, setFinalSaved] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
      if (chatRecognitionRef.current) { try { chatRecognitionRef.current.stop(); } catch {} }
    };
  }, []);

  useEffect(() => {
    chatMessagesRef.current = chatMessages;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    briefingAnswersRef.current = briefingAnswers;
  }, [briefingAnswers]);

  useEffect(() => {
    fileAttachmentsRef.current = fileAttachments;
  }, [fileAttachments]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filePickerRef.current && !filePickerRef.current.contains(e.target as Node)) {
        setShowFilePicker(false);
      }
    };
    if (showFilePicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilePicker]);

  const fetchWorkspaceFolders = async (force?: boolean) => {
    if (wsFolders.length > 0 && !force) return;
    setLoadingFolders(true);
    try {
      const res = await apiRequest("GET", `/api/workspaces/${workspaceId}/folders`);
      const data = await res.json();
      setWsFolders(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Could not load folders", variant: "destructive" });
    } finally {
      setLoadingFolders(false);
    }
  };

  const fetchFolderFiles = async (folderId: string, force?: boolean) => {
    if (wsFolderFiles[folderId] && !force) return;
    try {
      const res = await apiRequest("GET", `/api/workspaces/${workspaceId}/folders/${folderId}/files`);
      const data = await res.json();
      setWsFolderFiles(prev => ({ ...prev, [folderId]: Array.isArray(data) ? data : [] }));
    } catch {
      toast({ title: "Could not load files", variant: "destructive" });
    }
  };

  const toggleFolderExpand = async (folderId: string) => {
    if (expandedFolder === folderId) {
      setExpandedFolder(null);
    } else {
      setExpandedFolder(folderId);
      await fetchFolderFiles(folderId);
    }
  };

  const attachFile = (file: { name: string; url: string; folderName?: string }) => {
    if (!file.url) {
      toast({ title: "Cannot attach", description: "This file has no URL", variant: "destructive" });
      return;
    }
    setAttachedFiles(prev => {
      if (prev.some(f => f.url === file.url)) return prev;
      return [...prev, file];
    });
    setShowFilePicker(false);
  };

  const removeAttachment = (url: string) => {
    setAttachedFiles(prev => prev.filter(f => f.url !== url));
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return <Image className="w-3.5 h-3.5 text-blue-500" />;
    if (["mp4","mov","avi","webm","mkv"].includes(ext)) return <Video className="w-3.5 h-3.5 text-purple-500" />;
    if (["pdf"].includes(ext)) return <FileText className="w-3.5 h-3.5 text-red-500" />;
    return <File className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const handleCreateNewFolder = async () => {
    if (!newFolderName.trim() || creatingFolder) return;
    setCreatingFolder(true);
    try {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/folders`, { name: newFolderName.trim() });
      const folder = await res.json();
      setWsFolders(prev => [...prev, folder]);
      setUploadTargetFolder(folder.id);
      setNewFolderName("");
      setShowNewFolderInput(false);
      toast({ title: "Folder created", description: `"${folder.name}" is ready for uploads` });
    } catch (err: any) {
      toast({ title: "Failed to create folder", description: err.message, variant: "destructive" });
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeviceFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !uploadTargetFolder) return;
    setDeviceUploading(true);
    const targetFolder = wsFolders.find(f => f.id === uploadTargetFolder);
    const folderName = targetFolder?.name || "Uploads";

    try {
      for (const file of Array.from(files)) {
        const urlRes = await apiRequest("POST", "/api/uploads/request-url", {
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        });
        const { uploadURL, objectPath, s3Key } = await urlRes.json();

        const putRes = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });
        if (!putRes.ok) throw new Error(`Upload failed for ${file.name} (${putRes.status})`);

        await apiRequest("POST", `/api/workspaces/${workspaceId}/files`, {
          name: file.name,
          type: file.type || "application/octet-stream",
          objectPath,
          size: file.size,
          folderId: uploadTargetFolder,
        });

        attachFile({ name: file.name, url: objectPath, folderName });

        if (wsFolderFiles[uploadTargetFolder]) {
          await fetchFolderFiles(uploadTargetFolder, true);
        }
      }
      toast({ title: "File uploaded", description: `Saved to "${folderName}" and attached` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setDeviceUploading(false);
      if (deviceFileInputRef.current) deviceFileInputRef.current.value = "";
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Speech recognition not supported", description: "Please use Chrome or Edge for voice input.", variant: "destructive" });
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast({ title: "Microphone access denied", description: "Please allow microphone access in your browser.", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    transcriptRef.current = "";
    setLiveTranscript("");

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text + " ";
        } else {
          interim = text;
        }
      }
      transcriptRef.current = finalTranscript;
      setLiveTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        toast({ title: "Speech recognition error", description: `Error: ${event.error}. Try again.`, variant: "destructive" });
      }
      stopRecording();
    };

    recognition.onend = () => {
      if (isRecording) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsRecording(false);
    setRecordingTime(0);

    const transcript = transcriptRef.current.trim();
    if (transcript.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const txtBlob = new Blob([transcript], { type: "text/plain" });
      const file = new File([txtBlob], `voice-note-${timestamp}.txt`, { type: "text/plain" });
      handleFilesSelected([file]);
      toast({ title: "Voice transcribed", description: `${transcript.split(/\s+/).length} words captured and saved as text file.` });
    } else {
      toast({ title: "No speech detected", description: "We couldn't pick up any words. Try speaking closer to your microphone.", variant: "destructive" });
    }
    setLiveTranscript("");
    transcriptRef.current = "";
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
      const res = await apiRequest("POST", "/api/interrogator/summarize", { files: fileUrls, workspaceId });
      const data = await res.json();
      setSummaryResult(data);
      if (data.interrogationId) setInterrogationId(data.interrogationId);
      setCurrentStep(2);
      startBriefingChat(data);
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

    if (summaryResult.body) {
      try {
        const parsed = typeof summaryResult.body === "string" ? JSON.parse(summaryResult.body) : summaryResult.body;
        const text = parsed?.summary || JSON.stringify(parsed, null, 2);
        return text.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"');
      } catch {
        return String(summaryResult.body);
      }
    }

    const raw = summaryResult.brief || summaryResult.summary || summaryResult.result || summaryResult.message || "";
    if (!raw && typeof summaryResult === "object") return JSON.stringify(summaryResult, null, 2);
    return raw
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"');
  };

  const callGeminiChat = async (history: { role: "user" | "ai"; text: string }[], summary: string) => {
    setAiLoading(true);
    try {
      const res = await apiRequest("POST", "/api/interrogator/chat", {
        summary,
        chatHistory: history,
        workspaceId,
        interrogationId,
        briefingAnswers: briefingAnswersRef.current,
      });
      const data = await res.json();
      setCurrentAiResponse(data);
      setCurrentLayer(data.currentLayer || currentLayer);
      if (data.isComplete) setBriefingComplete(true);
      const aiMsg = data.message || "I couldn't process that. Could you try again?";
      setChatMessages(prev => [...prev, { role: "ai", text: aiMsg }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "ai", text: "Sorry, I had trouble processing that. Could you try again?" }]);
    } finally {
      setAiLoading(false);
    }
  };

  const startBriefingChat = (summaryData: any) => {
    setChatMessages([]);
    setBriefingAnswers({});
    briefingAnswersRef.current = {};
    setCurrentAiResponse(null);
    setBriefingComplete(false);
    setCurrentLayer(1);
    setFileAttachments({});
    fileAttachmentsRef.current = {};
    setAttachedFiles([]);
    setUploadTargetFolder(null);
    setShowNewFolderInput(false);
    setNewFolderName("");
    setFinalDocument(null);

    let summaryText = "";
    if (summaryData?.body) {
      try {
        const parsed = typeof summaryData.body === "string" ? JSON.parse(summaryData.body) : summaryData.body;
        summaryText = parsed?.summary || JSON.stringify(parsed);
      } catch {
        summaryText = String(summaryData.body);
      }
    }

    callGeminiChat([{ role: "user", text: "Start the briefing" }], summaryText);
  };

  const saveCurrentAttachments = () => {
    if (attachedFiles.length === 0) return "";
    const fieldKey = currentAiResponse?.fieldKey || "general";
    const newAttachments = { ...fileAttachmentsRef.current };
    const existing = newAttachments[fieldKey] || [];
    const merged = [...existing];
    for (const f of attachedFiles) {
      if (!merged.some(e => e.url === f.url)) merged.push({ name: f.name, url: f.url, folderName: f.folderName });
    }
    newAttachments[fieldKey] = merged;
    setFileAttachments(newAttachments);
    fileAttachmentsRef.current = newAttachments;
    const attachText = attachedFiles.map(f => `[Attached: ${f.folderName ? f.folderName + "/" : ""}${f.name}]`).join(" ");
    setAttachedFiles([]);
    return attachText;
  };

  const handleSendChat = () => {
    if ((!chatInput.trim() && attachedFiles.length === 0) || aiLoading) return;
    if (chatMicActive) {
      if (chatRecognitionRef.current) { try { chatRecognitionRef.current.stop(); } catch {} chatRecognitionRef.current = null; }
      setChatMicActive(false);
    }
    const attachText = saveCurrentAttachments();
    const userMsg = [chatInput.trim(), attachText].filter(Boolean).join(" ");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");

    const updatedHistory = [...chatMessagesRef.current, { role: "user" as const, text: userMsg }];
    callGeminiChat(updatedHistory, getSummaryText());
  };

  const handleChipSelect = (option: { id: string; label: string; value: string }) => {
    if (aiLoading) return;
    const fieldKey = currentAiResponse?.fieldKey || "unknown";
    const isMulti = currentAiResponse?.multiSelect;

    const newAnswers = { ...briefingAnswersRef.current };
    if (isMulti) {
      const existing = Array.isArray(newAnswers[fieldKey]) ? newAnswers[fieldKey] : [];
      const idx = existing.indexOf(option.value);
      if (idx >= 0) {
        newAnswers[fieldKey] = existing.filter((_: any, i: number) => i !== idx);
      } else {
        newAnswers[fieldKey] = [...existing, option.value];
      }
    } else {
      newAnswers[fieldKey] = option.value;
    }
    setBriefingAnswers(newAnswers);
    briefingAnswersRef.current = newAnswers;

    if (!isMulti) {
      const attachText = saveCurrentAttachments();
      const userMsg = [option.label, attachText].filter(Boolean).join(" ");
      setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
      const updatedHistory = [...chatMessagesRef.current, { role: "user" as const, text: userMsg }];
      callGeminiChat(updatedHistory, getSummaryText());
    }
  };

  const handleMultiSelectConfirm = () => {
    if (aiLoading) return;
    const fieldKey = currentAiResponse?.fieldKey || "unknown";
    const selected = briefingAnswersRef.current[fieldKey];
    if (!selected || (Array.isArray(selected) && selected.length === 0)) return;
    const attachText = saveCurrentAttachments();
    const label = Array.isArray(selected) ? selected.join(", ") : String(selected);
    const userMsg = [label, attachText].filter(Boolean).join(" ");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    const updatedHistory = [...chatMessagesRef.current, { role: "user" as const, text: userMsg }];
    callGeminiChat(updatedHistory, getSummaryText());
  };

  const toggleChatMic = async () => {
    if (chatMicActive) {
      if (chatRecognitionRef.current) {
        try { chatRecognitionRef.current.stop(); } catch {}
        chatRecognitionRef.current = null;
      }
      setChatMicActive(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Speech recognition not supported", description: "Please use Chrome or Edge for voice input.", variant: "destructive" });
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast({ title: "Microphone access denied", description: "Please allow microphone access in your browser.", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += text;
        } else {
          interim = text;
        }
      }
      if (finalText) {
        setChatInput(prev => (prev ? prev + " " : "") + finalText.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      toast({ title: "Speech recognition error", description: `Error: ${event.error}`, variant: "destructive" });
      setChatMicActive(false);
      chatRecognitionRef.current = null;
    };

    recognition.onend = () => {
      if (chatRecognitionRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    chatRecognitionRef.current = recognition;
    recognition.start();
    setChatMicActive(true);
  };

  const handleGenerateFinalDoc = async () => {
    setGeneratingFinal(true);
    setFinalDocument(null);
    setEditingFinal(false);
    setFinalSaved(false);
    setCurrentStep(3);
    try {
      const res = await apiRequest("POST", "/api/interrogator/generate-final", {
        summary: getSummaryText(),
        briefingAnswers,
        fileAttachments: fileAttachmentsRef.current,
        chatHistory: chatMessages,
        interrogationId,
        workspaceId,
      });
      const data = await res.json();
      const doc = data.finalDocument || "No document generated.";
      setFinalDocument(doc);
      setEditableFinalText(doc);
    } catch (err: any) {
      toast({ title: "Failed to generate brief", description: err.message, variant: "destructive" });
      setFinalDocument("Error generating production brief. Please try again.");
    } finally {
      setGeneratingFinal(false);
    }
  };

  const handleSaveFinalDoc = async () => {
    if (!interrogationId || !workspaceId) {
      toast({ title: "Cannot save", description: "Missing session data. Please regenerate.", variant: "destructive" });
      return;
    }
    setSavingFinal(true);
    try {
      const docToSave = editingFinal ? editableFinalText : finalDocument;
      await apiRequest("POST", "/api/interrogator/save-final", {
        interrogationId,
        workspaceId,
        finalDocument: docToSave,
      });
      setFinalDocument(docToSave);
      setEditingFinal(false);
      setFinalSaved(true);
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}/interrogations`] });
      toast({ title: "Saved!", description: "Production brief saved successfully." });
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setSavingFinal(false);
    }
  };

  const hasContent = uploadedFiles.some(f => f.status === "done") || textBrief.trim().length > 0;
  const isUploading = uploadedFiles.some(f => f.status === "uploading");

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">AI Brief</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create your production brief</h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
            Upload your materials, answer a few creative questions, and get an AI-generated brief ready for your editors.
          </p>
        </div>

        <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />

        {currentStep === 1 && (
          <div className="space-y-5" data-testid="step-1-content">
            <div className="text-center pb-2">
              <h2 className="text-lg font-semibold" data-testid="text-interrogator-title">What are we working with?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload docs, record a voice note, or type your brief. AI will analyse everything automatically.
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
                <button
                  onClick={startRecording}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/20 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all group cursor-pointer"
                  data-testid="button-start-recording"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/60 transition-colors shrink-0">
                    <Mic className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Voice to Text</p>
                    <p className="text-xs text-purple-500/70 dark:text-purple-400/60 mt-0.5">Speak into your mic — your voice will be transcribed to a text file</p>
                  </div>
                </button>
              ) : (
                <div className="w-full rounded-lg border-2 border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-950/30 overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0 relative">
                      <Mic className="w-6 h-6 text-red-600 dark:text-red-400" />
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300" data-testid="text-recording-time">
                        Listening... {formatRecordingTime(recordingTime)}
                      </p>
                      <p className="text-xs text-red-500/70 dark:text-red-400/60 mt-0.5">Speak clearly — your words appear below in real time</p>
                    </div>
                    <Button variant="destructive" size="sm" className="gap-2 shrink-0" onClick={stopRecording} data-testid="button-stop-recording">
                      <Square className="w-3.5 h-3.5" />
                      Stop
                    </Button>
                  </div>
                  {liveTranscript && (
                    <div className="px-4 pb-4">
                      <div className="p-3 rounded-md bg-white/70 dark:bg-black/20 border border-red-200 dark:border-red-800 text-sm text-foreground max-h-32 overflow-auto" data-testid="text-live-transcript">
                        {liveTranscript}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Uploaded ({uploadedFiles.filter(f => f.status === "done").length}/{uploadedFiles.length})
                </h3>
                {uploadedFiles.map(file => (
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
                    </div>
                ))}
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
            <div className="mb-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">AI Briefing</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Shape your production brief with guided questions</p>
                  </div>
                </div>
                <div className={`text-[10px] font-semibold px-2 py-1 rounded-full ${briefingComplete ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"}`}>
                  {briefingComplete ? "Complete" : `Layer ${currentLayer} of 4`}
                </div>
              </div>
              <div className="flex gap-1.5">
                {["Goal & Audience","Style & Hook","Editing & Visuals","Audio & Format"].map((name, i) => {
                  const layer = i + 1;
                  return (
                    <div key={layer} className="flex-1" title={name}>
                      <div className={`h-1.5 rounded-full transition-all ${
                        layer < currentLayer ? "bg-primary" :
                        layer === currentLayer ? "bg-primary/50" :
                        "bg-muted"
                      }`} data-testid={`layer-indicator-${layer}`} />
                      <p className={`text-[9px] mt-1 text-center truncate ${
                        layer <= currentLayer ? "text-foreground/70" : "text-muted-foreground/50"
                      }`}>{name}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Card className="flex-1">
              <CardContent className="p-4 flex flex-col" style={{ height: "460px" }}>
                <div className="flex-1 overflow-auto space-y-3 mb-3 pr-1">
                  {chatMessages.length === 0 && !aiLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Bot className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm">Initializing briefing assistant...</p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "ai" && (
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`} data-testid={`chat-message-${i}`}>
                        {msg.text}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {currentAiResponse?.options && currentAiResponse.options.length > 0 && !aiLoading && (
                  <div className="mb-3 space-y-2">
                    <div className="flex flex-wrap gap-2" data-testid="chip-options">
                      {currentAiResponse.options.map((opt: any) => {
                        const fieldKey = currentAiResponse.fieldKey || "unknown";
                        const isMulti = currentAiResponse.multiSelect;
                        const isSelected = isMulti
                          ? Array.isArray(briefingAnswers[fieldKey]) && briefingAnswers[fieldKey].includes(opt.value)
                          : briefingAnswers[fieldKey] === opt.value;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleChipSelect(opt)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:border-primary/50 hover:bg-primary/5"
                            }`}
                            data-testid={`chip-${opt.id}`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {currentAiResponse.multiSelect && (
                      <Button size="sm" onClick={handleMultiSelectConfirm} className="w-full" data-testid="button-confirm-multi">
                        Confirm Selection
                      </Button>
                    )}
                  </div>
                )}

                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2" data-testid="attached-files-list">
                    {attachedFiles.map((f) => (
                      <div key={f.url} className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-md px-2 py-1 text-xs">
                        {getFileIcon(f.name)}
                        <span className="max-w-[120px] truncate">{f.folderName ? `${f.folderName}/` : ""}{f.name}</span>
                        <button onClick={() => removeAttachment(f.url)} className="hover:text-destructive ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Textarea
                    placeholder={chatMicActive ? "Listening... speak now" : briefingComplete ? "Briefing complete! Generate your production brief below." : "Type a custom answer or additional details..."}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    rows={1}
                    className="resize-none flex-1 min-h-[40px]"
                    disabled={aiLoading}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                    data-testid="input-chat"
                  />
                  <div className="relative" ref={filePickerRef}>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => { setShowFilePicker(!showFilePicker); if (!showFilePicker) { fetchWorkspaceFolders(); setPickerTab("workspace"); } }}
                      disabled={aiLoading}
                      className="shrink-0 h-10 w-10"
                      data-testid="button-attach-file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <input
                      ref={deviceFileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleDeviceFileUpload(e.target.files)}
                      data-testid="input-device-file"
                    />
                    {showFilePicker && (
                      <div className="absolute bottom-12 right-0 w-80 bg-popover border rounded-lg shadow-lg z-50" data-testid="file-picker-dropdown">
                        <div className="flex border-b">
                          <button
                            onClick={() => setPickerTab("workspace")}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${pickerTab === "workspace" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                            data-testid="tab-workspace-files"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            From Workspace
                          </button>
                          <button
                            onClick={() => { setPickerTab("upload"); fetchWorkspaceFolders(); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${pickerTab === "upload" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                            data-testid="tab-upload-device"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            Upload from Device
                          </button>
                        </div>

                        {pickerTab === "workspace" && (
                          <div className="max-h-[280px] overflow-auto">
                            {loadingFolders ? (
                              <div className="p-4 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                              </div>
                            ) : wsFolders.length === 0 ? (
                              <div className="p-4 text-xs text-muted-foreground text-center">
                                <Folder className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p>No folders yet</p>
                                <p className="mt-1">Switch to "Upload from Device" to create a folder and upload files</p>
                              </div>
                            ) : (
                              <div className="py-1">
                                {wsFolders.map((folder: any) => (
                                  <div key={folder.id}>
                                    <button
                                      onClick={() => toggleFolderExpand(folder.id)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors"
                                      data-testid={`folder-pick-${folder.id}`}
                                    >
                                      {expandedFolder === folder.id ? <FolderOpen className="w-3.5 h-3.5 text-amber-500" /> : <Folder className="w-3.5 h-3.5 text-amber-500" />}
                                      <span className="font-medium truncate flex-1 text-left">{folder.name}</span>
                                      <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${expandedFolder === folder.id ? "rotate-90" : ""}`} />
                                    </button>
                                    {expandedFolder === folder.id && (
                                      <div className="pl-4">
                                        {!wsFolderFiles[folder.id] ? (
                                          <div className="px-3 py-2"><Loader2 className="w-3 h-3 animate-spin text-muted-foreground" /></div>
                                        ) : wsFolderFiles[folder.id].length === 0 ? (
                                          <div className="px-3 py-1.5 text-[10px] text-muted-foreground">Empty folder</div>
                                        ) : (
                                          wsFolderFiles[folder.id].map((file: any) => (
                                            <button
                                              key={file.id}
                                              onClick={() => attachFile({ name: file.name, url: file.objectPath || file.cloudfrontUrl || file.url || "", folderName: folder.name })}
                                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-primary/5 transition-colors"
                                              data-testid={`file-pick-${file.id}`}
                                            >
                                              {getFileIcon(file.name)}
                                              <span className="truncate flex-1 text-left">{file.name}</span>
                                            </button>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {pickerTab === "upload" && (
                          <div className="p-3 space-y-3">
                            <div>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Save to folder</p>
                              <div className="space-y-1">
                                {wsFolders.map((folder: any) => (
                                  <button
                                    key={folder.id}
                                    onClick={() => setUploadTargetFolder(folder.id)}
                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors ${
                                      uploadTargetFolder === folder.id ? "bg-primary/10 text-primary border border-primary/30" : "hover:bg-muted/50 border border-transparent"
                                    }`}
                                    data-testid={`upload-folder-${folder.id}`}
                                  >
                                    <Folder className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="truncate flex-1 text-left">{folder.name}</span>
                                    {uploadTargetFolder === folder.id && <CheckCircle2 className="w-3 h-3 text-primary" />}
                                  </button>
                                ))}

                                {!showNewFolderInput ? (
                                  <button
                                    onClick={() => setShowNewFolderInput(true)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                                    data-testid="button-new-folder"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Create new folder</span>
                                  </button>
                                ) : (
                                  <div className="flex gap-1.5">
                                    <Input
                                      placeholder="Folder name..."
                                      value={newFolderName}
                                      onChange={(e) => setNewFolderName(e.target.value)}
                                      className="h-7 text-xs"
                                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateNewFolder(); }}
                                      data-testid="input-new-folder-name"
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      className="h-7 px-2 text-xs"
                                      onClick={handleCreateNewFolder}
                                      disabled={!newFolderName.trim() || creatingFolder}
                                      data-testid="button-create-folder"
                                    >
                                      {creatingFolder ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-1.5"
                                      onClick={() => { setShowNewFolderInput(false); setNewFolderName(""); }}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              onClick={() => deviceFileInputRef.current?.click()}
                              disabled={!uploadTargetFolder || deviceUploading}
                              className="w-full gap-2"
                              size="sm"
                              data-testid="button-browse-device"
                            >
                              {deviceUploading ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading...</>
                              ) : (
                                <><Monitor className="w-3.5 h-3.5" />Browse from Device</>
                              )}
                            </Button>
                            {!uploadTargetFolder && (
                              <p className="text-[10px] text-muted-foreground text-center">Select a folder above first</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant={chatMicActive ? "destructive" : "outline"}
                    onClick={toggleChatMic}
                    disabled={aiLoading}
                    className={`shrink-0 h-10 w-10 ${chatMicActive ? "animate-pulse" : ""}`}
                    data-testid="button-chat-mic"
                  >
                    {chatMicActive ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" onClick={handleSendChat} disabled={(!chatInput.trim() && attachedFiles.length === 0) || aiLoading} className="shrink-0 h-10 w-10" data-testid="button-send-chat">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1" data-testid="button-back-to-base">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Button>
              <Button onClick={handleGenerateFinalDoc} disabled={!briefingComplete} className="flex-1" data-testid="button-generate-final">
                Generate Brief
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4" data-testid="step-3-content">
            <div className="text-center pb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 mb-2">
                <FileCheck className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-semibold text-green-600">Ready</span>
              </div>
              <h2 className="text-xl font-bold">Production Brief</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your AI-generated brief combining uploaded materials, briefing answers, and creative direction.
              </p>
            </div>

            <Card>
              <CardContent className="p-5">
                {generatingFinal ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Generating your production brief...</p>
                    <p className="text-xs text-muted-foreground/60">Combining uploads, briefing answers, and creative direction</p>
                  </div>
                ) : finalDocument ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {finalSaved && (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium" data-testid="text-saved-badge">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs"
                          onClick={() => {
                            if (!editingFinal) {
                              setEditableFinalText(finalDocument);
                            }
                            setEditingFinal(!editingFinal);
                          }}
                          data-testid="button-toggle-edit"
                        >
                          {editingFinal ? (
                            <><Eye className="w-3.5 h-3.5 mr-1.5" /> Preview</>
                          ) : (
                            <><Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit</>
                          )}
                        </Button>
                      </div>
                    </div>
                    {editingFinal ? (
                      <Textarea
                        value={editableFinalText}
                        onChange={(e) => { setEditableFinalText(e.target.value); setFinalSaved(false); }}
                        className="min-h-[400px] font-mono text-sm leading-relaxed resize-y"
                        data-testid="textarea-edit-final"
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-headings:font-semibold prose-h2:text-base prose-h2:mt-5 prose-h2:mb-2 prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-2 prose-strong:text-foreground prose-li:text-muted-foreground prose-li:my-0.5 prose-ul:my-1.5 prose-ol:my-1.5" data-testid="text-final-document">
                        <ReactMarkdown>{finalDocument}</ReactMarkdown>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No document generated yet. Please complete the briefing first.</p>
                )}
              </CardContent>
            </Card>

            {finalDocument && !generatingFinal && (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1" data-testid="button-back-to-chat">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Briefing
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateFinalDoc}
                  disabled={generatingFinal}
                  data-testid="button-regenerate-final"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  onClick={handleSaveFinalDoc}
                  disabled={savingFinal || finalSaved}
                  className="flex-1"
                  data-testid="button-save-final"
                >
                  {savingFinal ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : finalSaved ? (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {finalSaved ? "Saved" : "Save Brief"}
                </Button>
              </div>
            )}

            {finalDocument && !generatingFinal && (
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentStep(1);
                  setSummaryResult(null);
                  setSummaryError(null);
                  setUploadedFiles([]);
                  setTextBrief("");
                  setChatMessages([]);
                  setChatInput("");
                  setInterrogationId(null);
                  setBriefingAnswers({});
                  setCurrentAiResponse(null);
                  setBriefingComplete(false);
                  setCurrentLayer(1);
                  setFileAttachments({});
                  fileAttachmentsRef.current = {};
                  setAttachedFiles([]);
                  setUploadTargetFolder(null);
                  setShowNewFolderInput(false);
                  setNewFolderName("");
                  setFinalDocument(null);
                  setEditingFinal(false);
                  setFinalSaved(false);
                }}
                className="w-full text-muted-foreground"
                data-testid="button-start-new"
              >
                Start New Brief
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
