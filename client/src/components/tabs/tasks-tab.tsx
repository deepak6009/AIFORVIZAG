import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutGrid, Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

const columns = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-blue-500",
    items: [
      { id: "1", title: "Record talking head intro", assignee: "R", priority: "high" },
      { id: "2", title: "Script review for Episode 5", assignee: "A", priority: "medium" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "bg-yellow-500",
    items: [
      { id: "3", title: "Edit B-roll transitions", assignee: "A", priority: "high" },
    ],
  },
  {
    id: "review",
    title: "Review",
    color: "bg-purple-500",
    items: [
      { id: "4", title: "Final cut - Episode 4", assignee: "A", priority: "medium" },
      { id: "5", title: "Thumbnail designs", assignee: "A", priority: "low" },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-500",
    items: [
      { id: "6", title: "Intro animation template", assignee: "A", priority: "low" },
    ],
  },
];

const priorityColors = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-chart-4/10 text-chart-4",
  low: "bg-chart-2/10 text-chart-2",
};

export default function TasksTab({ workspaceId }: { workspaceId: string }) {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-8 h-8 w-48 text-sm" disabled data-testid="input-search-tasks" />
          </div>
          <Button variant="outline" size="sm" className="h-8" disabled>
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            Filter
          </Button>
        </div>
        <Button size="sm" className="h-8" disabled data-testid="button-create-task">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Create Task
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 min-w-max h-full">
          {columns.map(col => (
            <div key={col.id} className="w-72 flex flex-col" data-testid={`column-${col.id}`}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">
                  {col.items.length}
                </Badge>
              </div>

              <div className="flex-1 space-y-2">
                {col.items.map(item => (
                  <Card key={item.id} className="border cursor-pointer hover:bg-accent/30 transition-colors" data-testid={`task-${item.id}`}>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium mb-2">{item.title}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={`text-xs ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                          {item.priority}
                        </Badge>
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">{item.assignee}</AvatarFallback>
                        </Avatar>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <button className="w-full flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors" disabled>
                  <Plus className="w-3.5 h-3.5" />
                  Create
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t bg-muted/30 px-6 py-2 text-center shrink-0">
        <p className="text-xs text-muted-foreground">
          Task board is a placeholder. Tasks will be auto-generated from the AI brief agenda.
        </p>
      </div>
    </div>
  );
}
