"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  UserPlus,
  Mail,
  MoreHorizontal,
  Trash2,
  Link2,
  Copy,
  RefreshCw,
  Crown,
  LogOut,
  Check,
  Clock,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// Loading component
function TeamLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground/60 mx-auto" />
        <p className="text-muted-foreground mt-4">Loading team members...</p>
      </div>
    </div>
  );
}

export default function TeamMembersPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Confirmation dialogs
  const [memberToRemove, setMemberToRemove] = useState<{
    userId: Id<"users">;
    name: string;
  } | null>(null);
  const [memberToTransfer, setMemberToTransfer] = useState<{
    userId: Id<"users">;
    name: string;
  } | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [inviteToRevoke, setInviteToRevoke] = useState<Id<"projectInvitations"> | null>(null);

  // Query project members and invitations
  const membersQuery = useQueryWithStatus(
    api.teamInvitations.getProjectMembers,
    { projectId: projectId as Id<"projects"> }
  );
  const membersData = membersQuery.data;

  const invitationsQuery = useQueryWithStatus(
    api.teamInvitations.getProjectInvitations,
    { projectId: projectId as Id<"projects"> }
  );
  const invitationsData = invitationsQuery.data;

  // Mutations
  const inviteByEmail = useMutation(api.teamInvitations.inviteByEmail);
  const generateInviteLink = useMutation(api.teamInvitations.generateInviteLink);
  const regenerateInviteLink = useMutation(api.teamInvitations.regenerateInviteLink);
  const revokeInvite = useMutation(api.teamInvitations.revokeInvite);
  const removeMember = useMutation(api.teamInvitations.removeMember);
  const transferOwnership = useMutation(api.teamInvitations.transferOwnership);
  const leaveProject = useMutation(api.teamInvitations.leaveProject);

  if (membersQuery.isPending) {
    return <TeamLoading />;
  }

  const members = membersData?.members ?? [];
  const totalMembers = membersData?.totalMembers ?? 0;
  const maxMembers = membersData?.maxMembers ?? 6;
  const remainingSlots = membersData?.remainingSlots ?? 0;
  const emailInvites = invitationsData?.emailInvites ?? [];
  const linkInvite = invitationsData?.linkInvite ?? null;

  // Check if current user is owner
  const currentUserMember = members.find((m) => m.isCurrentUser);
  const isOwner = currentUserMember?.role === "owner";

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsInviting(true);
    try {
      await inviteByEmail({
        projectId: projectId as Id<"projects">,
        email: inviteEmail.trim(),
      });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInviteDialog(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send invitation"
      );
    } finally {
      setIsInviting(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      const result = await generateInviteLink({
        projectId: projectId as Id<"projects">,
      });
      if (result.isNew) {
        toast.success("Invite link generated");
      }
    } catch {
      toast.error("Failed to generate invite link");
    }
  };

  const handleRegenerateLink = async () => {
    try {
      await regenerateInviteLink({
        projectId: projectId as Id<"projects">,
      });
      toast.success("New invite link generated. Old link is now invalid.");
    } catch {
      toast.error("Failed to regenerate link");
    }
  };

  const handleCopyLink = async () => {
    if (!linkInvite) return;
    const inviteUrl = `${window.location.origin}/invite/accept?token=${linkInvite.token}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRevokeInvite = async () => {
    if (!inviteToRevoke) return;
    try {
      await revokeInvite({ invitationId: inviteToRevoke });
      toast.success("Invitation revoked");
    } catch {
      toast.error("Failed to revoke invitation");
    } finally {
      setInviteToRevoke(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMember({
        projectId: projectId as Id<"projects">,
        userId: memberToRemove.userId,
      });
      toast.success(`${memberToRemove.name} has been removed from the project`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove member"
      );
    } finally {
      setMemberToRemove(null);
    }
  };

  const handleTransferOwnership = async () => {
    if (!memberToTransfer) return;
    try {
      await transferOwnership({
        projectId: projectId as Id<"projects">,
        newOwnerId: memberToTransfer.userId,
      });
      toast.success(`Ownership transferred to ${memberToTransfer.name}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to transfer ownership"
      );
    } finally {
      setMemberToTransfer(null);
    }
  };

  const handleLeaveProject = async () => {
    try {
      await leaveProject({
        projectId: projectId as Id<"projects">,
      });
      toast.success("You have left the project");
      // The project context will update and redirect
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to leave project"
      );
    } finally {
      setShowLeaveDialog(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatExpiryTime = (expiresAt: number) => {
    const now = Date.now();
    const diff = expiresAt - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Expired";
    if (days === 1) return "Expires tomorrow";
    return `Expires in ${days} days`;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6 max-w-4xl">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                Team Members
                <Badge variant="outline" className="ml-1 text-sm font-medium">
                  {totalMembers}/{maxMembers}
                </Badge>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {isOwner
                  ? "Invite and manage team members for this project"
                  : "View team members for this project"}
              </p>
            </div>
            {isOwner && remainingSlots > 0 && (
              <Button onClick={() => setShowInviteDialog(true)} className="gap-2 w-full sm:w-auto">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            )}
          </div>

          {/* Members Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Members</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.memberId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.imageUrl} />
                            <AvatarFallback>
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {member.name}
                              {member.isCurrentUser && (
                                <Badge variant="secondary" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={member.role === "owner" ? "default" : "outline"}
                          className="capitalize"
                        >
                          {member.role === "owner" && (
                            <Crown className="h-3 w-3 mr-1" />
                          )}
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(member.joinedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Owner can manage other members */}
                        {isOwner && !member.isCurrentUser && member.role !== "owner" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  setMemberToTransfer({
                                    userId: member.userId,
                                    name: member.name,
                                  })
                                }
                              >
                                <Crown className="h-4 w-4 mr-2" />
                                Transfer Ownership
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-danger"
                                onClick={() =>
                                  setMemberToRemove({
                                    userId: member.userId,
                                    name: member.name,
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove from Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {/* Non-owners can leave */}
                        {!isOwner && member.isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-danger"
                            onClick={() => setShowLeaveDialog(true)}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Leave
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pending Invitations (Owner only) */}
          {isOwner && emailInvites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pending Invitations</CardTitle>
                <CardDescription>
                  Email invitations waiting for response
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailInvites.map((invite) => (
                      <TableRow key={invite._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {invite.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {invite.inviterName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {invite.expiresAt
                              ? formatExpiryTime(invite.expiresAt)
                              : "No expiry"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-danger"
                            onClick={() => setInviteToRevoke(invite._id)}
                          >
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Sharable Link Section (Owner only) */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Sharable Invite Link
                </CardTitle>
                <CardDescription>
                  Anyone with this link can join the project
                  {remainingSlots > 0 && ` (${remainingSlots} spots remaining)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {linkInvite ? (
                  <div className="flex gap-2">
                    <Input
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/invite/accept?token=${linkInvite.token}`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" onClick={handleCopyLink}>
                      {copiedLink ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleRegenerateLink}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleGenerateLink} disabled={remainingSlots === 0}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Generate Invite Link
                  </Button>
                )}
                {remainingSlots === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Project is at maximum capacity. Remove a member to invite more.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Roles Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Roles & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium flex items-center gap-1">
                    <Crown className="h-3 w-3" /> Owner
                  </span>
                  <p className="text-muted-foreground">
                    Full access including project settings, team management, and
                    billing. Credits are charged to owner.
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">Member</span>
                  <p className="text-muted-foreground">
                    Can create and edit content. Cannot manage team or
                    project settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invite Dialog */}
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an email invitation to collaborate on this project. The
                  invitation will expire in 7 days.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendInvite();
                      }
                    }}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendInvite} disabled={isInviting}>
                  {isInviting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Remove Member Confirmation */}
          <AlertDialog
            open={!!memberToRemove}
            onOpenChange={() => setMemberToRemove(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                <AlertDialogDescription>
                  {memberToRemove?.name} will lose access to this project. Their
                  content will remain in the project.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemoveMember}
                  className="bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 hover:text-danger"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Transfer Ownership Confirmation */}
          <AlertDialog
            open={!!memberToTransfer}
            onOpenChange={() => setMemberToTransfer(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Transfer ownership?</AlertDialogTitle>
                <AlertDialogDescription>
                  {memberToTransfer?.name} will become the owner of this project.
                  You will become a regular member. Credits will be charged to the
                  new owner for future actions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleTransferOwnership}>
                  Transfer Ownership
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Leave Project Confirmation */}
          <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave project?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will lose access to this project. You&apos;ll need a new
                  invitation to rejoin.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLeaveProject}
                  className="bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 hover:text-danger"
                >
                  Leave Project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Revoke Invite Confirmation */}
          <AlertDialog
            open={!!inviteToRevoke}
            onOpenChange={() => setInviteToRevoke(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
                <AlertDialogDescription>
                  This invitation link will no longer work. You can send a new
                  invitation later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRevokeInvite}>
                  Revoke
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
