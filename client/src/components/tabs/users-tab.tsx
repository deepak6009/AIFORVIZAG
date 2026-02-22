import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { WorkspaceMember } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, Trash2, Shield, Eye, UserCheck } from "lucide-react";
import { useState } from "react";

type MemberWithUser = WorkspaceMember & { user: User };

const roleConfig = {
  admin: { label: "Admin", icon: Shield, color: "bg-primary/10 text-primary" },
  member: { label: "Member", icon: UserCheck, color: "bg-chart-2/10 text-chart-2" },
  viewer: { label: "Viewer", icon: Eye, color: "bg-chart-4/10 text-chart-4" },
};

export default function UsersTab({ workspaceId }: { workspaceId: string }) {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const { data: members, isLoading } = useQuery<MemberWithUser[]>({
    queryKey: ["/api/workspaces", workspaceId, "members"],
    enabled: !!workspaceId,
  });

  const addMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await apiRequest("POST", `/api/workspaces/${workspaceId}/members`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "members"] });
      setAddOpen(false);
      setEmail("");
      setRole("member");
      toast({ title: "Member added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await apiRequest("DELETE", `/api/workspaces/${workspaceId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId, "members"] });
      toast({ title: "Member removed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    addMutation.mutate({ email: email.trim(), role });
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage who has access to this workspace</p>
          </div>
          <Button size="sm" className="h-10 sm:h-9 w-full sm:w-auto" onClick={() => setAddOpen(true)} data-testid="button-add-member">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Member
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : members && members.length > 0 ? (
          <div className="space-y-2">
            {members.map(member => {
              const config = roleConfig[member.role as keyof typeof roleConfig] || roleConfig.member;
              const RoleIcon = config.icon;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-lg border bg-card"
                  data-testid={`member-${member.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {member.user.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{member.user.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className={`${config.color} gap-1 text-[10px] sm:text-xs`}>
                          <RoleIcon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                        <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                          Joined {member.addedAt ? new Date(member.addedAt).toLocaleDateString() : "recently"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {member.role !== "admin" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeMutation.mutate(member.id)}
                      data-testid={`button-remove-member-${member.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 sm:p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Invite your team</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">Add your editors and collaborators so they can access files, briefs, and tasks in this workspace.</p>
            <Button size="sm" onClick={() => setAddOpen(true)} data-testid="button-add-first-member">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Member
            </Button>
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                placeholder="member@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="h-11"
                data-testid="input-member-email"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11" data-testid="select-member-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending || !email.trim()} data-testid="button-submit-member">
                {addMutation.isPending ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
