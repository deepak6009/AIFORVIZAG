import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Paperclip, Bot, Sparkles } from "lucide-react";

const sampleQuestions = [
  "What's the hook or opening you want for this video?",
  "What tone or vibe are you going for? (funny, serious, educational, etc.)",
  "Any specific caption style? (bold, minimal, colorful, etc.)",
  "What's the ideal duration? (15s, 30s, 60s)",
  "Any reference videos you'd like to share?",
];

export default function InterrogatorTab({ workspaceId }: { workspaceId: string }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold mb-1">AI Interrogator</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              I'll ask you detailed questions about your video project to create a structured brief for your editor. Let's get started!
            </p>
          </div>

          <div className="flex gap-2.5 sm:gap-3">
            <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 mt-0.5">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-card border rounded-lg rounded-tl-none p-3.5 sm:p-4 max-w-lg">
              <p className="text-sm leading-relaxed">
                Hey! I'm here to help you create a clear editing brief. I'll ask you a series of questions about your video — just answer naturally, and I'll turn it into structured instructions for your editor.
              </p>
              <p className="text-sm leading-relaxed mt-3">
                Let's start: <strong>What kind of video are you making?</strong> (e.g., talking head, product review, tutorial, vlog)
              </p>
            </div>
          </div>

          <div className="pl-9 sm:pl-11 space-y-2.5 sm:space-y-3">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Upcoming questions:</p>
            {sampleQuestions.map((q, i) => (
              <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] sm:text-xs shrink-0 mt-0.5">{i + 1}</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t bg-background p-3 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="shrink-0 h-10 w-10" disabled data-testid="button-attach-file">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Type your answer here..."
              className="flex-1 h-10"
              disabled
              data-testid="input-chat-message"
            />
            <Button size="icon" className="shrink-0 h-10 w-10" disabled data-testid="button-send-message">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 text-center">
            You can attach files from your workspace folders or upload from your device
          </p>
        </div>
      </div>
    </div>
  );
}
