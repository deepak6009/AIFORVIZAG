import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search, Link2, Image, Video, Music, ExternalLink } from "lucide-react";

const sampleResources = [
  {
    id: "1",
    title: "Brand Style Guide",
    type: "document",
    description: "Colors, fonts, and logo usage guidelines",
    icon: FileText,
    iconColor: "text-primary",
  },
  {
    id: "2",
    title: "Viral Reel Reference",
    type: "link",
    description: "https://instagram.com/reel/example",
    icon: Link2,
    iconColor: "text-chart-5",
  },
  {
    id: "3",
    title: "Intro Music Track",
    type: "audio",
    description: "Upbeat background music for intros",
    icon: Music,
    iconColor: "text-chart-4",
  },
  {
    id: "4",
    title: "Logo Pack",
    type: "image",
    description: "All logo variations in PNG and SVG",
    icon: Image,
    iconColor: "text-chart-2",
  },
  {
    id: "5",
    title: "B-Roll Collection",
    type: "video",
    description: "Stock footage for transitions",
    icon: Video,
    iconColor: "text-chart-3",
  },
];

export default function ResourcesTab({ workspaceId }: { workspaceId: string }) {
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Resources
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Shared links, references, and assets for the team
            </p>
          </div>
          <Button size="sm" disabled data-testid="button-add-resource">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Resource
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search resources..." className="pl-9" disabled data-testid="input-search-resources" />
          </div>
        </div>

        <div className="space-y-2">
          {sampleResources.map(resource => {
            const Icon = resource.icon;
            return (
              <Card key={resource.id} className="border hover:bg-accent/30 transition-colors cursor-pointer" data-testid={`resource-${resource.id}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${resource.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{resource.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{resource.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize shrink-0">
                    {resource.type}
                  </Badge>
                  {resource.type === "link" && (
                    <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="border-t mt-8 pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Resources section is a placeholder. Add links, references, and shared assets here.
          </p>
        </div>
      </div>
    </div>
  );
}
