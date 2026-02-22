import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCheck, Clock, ChevronDown, ChevronUp, FileText, AlertCircle, Sparkles, ArrowRight, ListTodo, Loader2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Interrogation } from "@shared/schema";

export default function FinalAgendaTab({ workspaceId, onNavigate }: { workspaceId: string; onNavigate?: (tab: string) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const generateTasksMut = useMutation({
    mutationFn: async (interrogationId: string) => {
      setGeneratingFor(interrogationId);
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/tasks/generate`, { interrogationId });
      return res.json();
    },
    onSuccess: (data: any) => {
      setGeneratingFor(null);
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "tasks"] });
      const count = Array.isArray(data) ? data.length : 0;
      if (count === 0) {
        toast({ title: "No new tasks needed", description: "All tasks from this brief already exist in your board." });
      } else {
        toast({ title: `Generated ${count} new tasks from this brief` });
        if (onNavigate) onNavigate("tasks");
      }
    },
    onError: (e: Error) => {
      setGeneratingFor(null);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const { data: interrogations, isLoading, error } = useQuery<Interrogation[]>({
    queryKey: [`/api/workspaces/${workspaceId}/interrogations`],
  });

  const completedDocs = (interrogations || []).filter(i => i.finalDocument && i.status === "completed");

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const getPreviewText = (markdown: string) => {
    const plain = markdown.replace(/[#*_`~\[\]()>|-]/g, "").replace(/\n+/g, " ").trim();
    return plain.length > 140 ? plain.slice(0, 140) + "..." : plain;
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-destructive/30">
            <CardContent className="flex items-center gap-3 py-6">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive" data-testid="text-agenda-error">Failed to load briefs. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6" data-testid="final-agenda-tab">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileCheck className="w-5.5 h-5.5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight" data-testid="text-final-agenda-title">Briefs</h2>
                {completedDocs.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 bg-primary/10 text-primary border-0 font-bold">
                    {completedDocs.length}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your saved production briefs from AI briefing sessions
              </p>
            </div>
          </div>
          {completedDocs.length > 0 && onNavigate && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => onNavigate("interrogator")} data-testid="button-new-brief">
              <Sparkles className="w-3.5 h-3.5" />
              New Brief
            </Button>
          )}
        </div>

        {completedDocs.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2" data-testid="text-no-agendas">No production briefs yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Start an AI Brief session to upload your materials, answer creative questions, and generate a production brief for your editors.
              </p>
              {onNavigate && (
                <Button onClick={() => onNavigate("interrogator")} className="gap-2" data-testid="button-go-to-ai-brief">
                  <Sparkles className="w-4 h-4" />
                  Create your first brief
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {completedDocs.map((doc, index) => {
              const isExpanded = expandedId === doc.id;
              return (
                <Card key={doc.id} className={`overflow-hidden transition-shadow ${isExpanded ? "shadow-md ring-1 ring-primary/10" : "hover:shadow-sm"}`} data-testid={`card-agenda-${doc.id}`}>
                  <div
                    className="px-5 py-4 flex items-start justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedId(isExpanded ? null : doc.id); } }}
                    data-testid={`button-toggle-agenda-${doc.id}`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <FileCheck className="w-4.5 h-4.5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">
                            Production Brief #{completedDocs.length - index}
                          </p>
                          <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-700 dark:text-green-400 border-0 px-1.5 py-0">
                            Completed
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(doc.updatedAt)}</span>
                        </div>
                        {!isExpanded && doc.finalDocument && (
                          <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 leading-relaxed">
                            {getPreviewText(doc.finalDocument)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3 mt-0.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-xs"
                        disabled={generatingFor === doc.id}
                        onClick={(e) => { e.stopPropagation(); generateTasksMut.mutate(doc.id); }}
                        data-testid={`button-generate-tasks-row-${doc.id}`}
                      >
                        {generatingFor === doc.id ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating...</>
                        ) : (
                          <><ListTodo className="w-3.5 h-3.5" />Generate Tasks</>
                        )}
                      </Button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <CardContent className="pt-0 pb-5 px-5 border-t">
                      <div className="prose prose-sm dark:prose-invert max-w-none mt-4 prose-headings:text-foreground prose-headings:font-semibold prose-h2:text-base prose-h2:mt-5 prose-h2:mb-2 prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-2 prose-strong:text-foreground prose-li:text-muted-foreground prose-li:my-0.5 prose-ul:my-1.5 prose-ol:my-1.5" data-testid={`content-agenda-${doc.id}`}>
                        <ReactMarkdown>{doc.finalDocument || ""}</ReactMarkdown>
                      </div>
                      <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button
                          size="sm"
                          className="gap-2"
                          disabled={generatingFor === doc.id}
                          onClick={(e) => { e.stopPropagation(); generateTasksMut.mutate(doc.id); }}
                          data-testid={`button-generate-tasks-${doc.id}`}
                        >
                          {generatingFor === doc.id ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating tasks...</>
                          ) : (
                            <><ListTodo className="w-3.5 h-3.5" />Generate Tasks</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
