import { Button } from "@/components/ui/button";
import { FileText, Plus, Link2, Bookmark } from "lucide-react";

export default function ResourcesTab({ workspaceId }: { workspaceId: string }) {
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2" data-testid="text-resources-title">
              <Bookmark className="w-5 h-5 text-primary" />
              Resources
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Shared links, references, and assets for the team
            </p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1" data-testid="text-no-resources">Coming soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            This is where you'll save reference links, brand guides, music tracks, and other shared assets for your team.
          </p>
        </div>
      </div>
    </div>
  );
}
