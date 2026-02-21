import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCheck, Clock, ChevronDown, ChevronUp, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Interrogation } from "@shared/schema";

export default function FinalAgendaTab({ workspaceId }: { workspaceId: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: interrogations, isLoading, error } = useQuery<Interrogation[]>({
    queryKey: [`/api/workspaces/${workspaceId}/interrogations`],
  });

  const completedDocs = (interrogations || []).filter(i => i.finalDocument && i.status === "completed");

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
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
              <p className="text-sm text-destructive" data-testid="text-agenda-error">Failed to load final agendas. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6" data-testid="final-agenda-tab">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3 pb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" data-testid="text-final-agenda-title">Final Agendas</h2>
            <p className="text-sm text-muted-foreground">
              AI-generated production briefs from your Interrogator sessions
            </p>
          </div>
        </div>

        {completedDocs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-base mb-1" data-testid="text-no-agendas">No final agendas yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Complete the Interrogator workflow to generate your first production brief. It will appear here automatically.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {completedDocs.map((doc) => {
              const isExpanded = expandedId === doc.id;
              return (
                <Card key={doc.id} className="overflow-hidden" data-testid={`card-agenda-${doc.id}`}>
                  <button
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                    data-testid={`button-toggle-agenda-${doc.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <FileCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          Production Brief
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(doc.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 border-0">
                        Completed
                      </Badge>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <CardContent className="pt-0 pb-5 px-5 border-t">
                      <div className="prose prose-sm dark:prose-invert max-w-none mt-4" data-testid={`content-agenda-${doc.id}`}>
                        <ReactMarkdown>{doc.finalDocument || ""}</ReactMarkdown>
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
