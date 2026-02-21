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
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team Members
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Manage who has access to this workspace</p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)} data-testid="button-add-member">
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
                  className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card"
                  data-testid={`member-${member.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {member.user.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{member.user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {member.addedAt ? new Date(member.addedAt).toLocaleDateString() : "recently"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`${config.color} gap-1`}>
                      <RoleIcon className="w-3 h-3" />
                      {config.label}
                    </Badge>
                    {member.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMutation.mutate(member.id)}
                        data-testid={`button-remove-member-${member.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-lg bg-card/50">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No members yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add team members to start collaborating</p>
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
                data-testid="input-member-email"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger data-testid="select-member-role">
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
