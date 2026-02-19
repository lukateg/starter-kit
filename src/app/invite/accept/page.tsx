"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  LogIn,
} from "lucide-react";

type InviteStatus =
  | "loading"
  | "not-found"
  | "expired"
  | "revoked"
  | "already-member"
  | "project-full"
  | "email-mismatch"
  | "valid"
  | "accepting"
  | "accepted"
  | "error";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user } = useUser();

  const [status, setStatus] = useState<InviteStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [acceptedProjectName, setAcceptedProjectName] = useState<string>("");

  // Query invitation details
  const inviteQuery = useQueryWithStatus(
    api.teamInvitations.getInviteByToken,
    token ? { token } : "skip"
  );
  const inviteData = inviteQuery.data;

  // Accept invite mutation
  const acceptInvite = useMutation(api.teamInvitations.acceptInvite);

  // Determine status based on invite data
  useEffect(() => {
    if (!token) {
      setStatus("not-found");
      return;
    }

    if (inviteData === undefined) {
      setStatus("loading");
      return;
    }

    if (inviteData === null) {
      setStatus("not-found");
      return;
    }

    if (inviteData.status === "revoked") {
      setStatus("revoked");
      return;
    }

    if (inviteData.status === "expired" || inviteData.isExpired) {
      setStatus("expired");
      return;
    }

    if (inviteData.status !== "pending") {
      setStatus("not-found");
      return;
    }

    setStatus("valid");
  }, [token, inviteData]);

  // Handle accept invitation
  const handleAccept = async () => {
    if (!token) return;

    setStatus("accepting");
    try {
      const result = await acceptInvite({ token });
      setAcceptedProjectName(result.projectName);
      setStatus("accepted");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/app");
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      if (message.includes("already a member")) {
        setStatus("already-member");
      } else if (message.includes("maximum")) {
        setStatus("project-full");
      } else if (message.includes("different email")) {
        setStatus("email-mismatch");
      } else if (message.includes("revoked")) {
        setStatus("revoked");
      } else if (message.includes("expired")) {
        setStatus("expired");
      } else {
        setStatus("error");
        setErrorMessage(message);
      }
    }
  };

  // Not loaded yet
  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No invitation token was provided. Please check your invitation
              link and try again.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not signed in - show sign in prompt
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>Team Invitation</CardTitle>
            </div>
            {status === "valid" && inviteData && (
              <CardDescription>
                You&apos;ve been invited to join{" "}
                <strong>{inviteData.projectName}</strong>
                {inviteData.inviterName && (
                  <> by {inviteData.inviterName}</>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Alert>
              <LogIn className="h-4 w-4" />
              <AlertTitle>Sign in required</AlertTitle>
              <AlertDescription>
                Please sign in or create an account to accept this invitation.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <SignInButton
              mode="modal"
              fallbackRedirectUrl={`/invite/accept?token=${token}`}
            >
              <Button className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Sign in to continue
              </Button>
            </SignInButton>
            <p className="text-xs text-muted-foreground text-center">
              Don&apos;t have an account? You can create one during sign-in.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Error states
  if (status === "not-found") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Invitation Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation link is invalid or has already been used. Please
              request a new invitation from the project owner.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/app")} className="w-full">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <CardTitle>Invitation Expired</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation has expired. Email invitations are valid for 7
              days. Please request a new invitation from the project owner.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/app")} className="w-full">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "revoked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Invitation Revoked</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation has been revoked by the project owner. Please
              contact them for a new invitation if needed.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/app")} className="w-full">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "already-member") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle>Already a Member</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You&apos;re already a member of this project. You can access it from
              your dashboard.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/app")} className="w-full">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "project-full") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <CardTitle>Project Full</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This project has reached its maximum number of team members.
              Please contact the project owner to make space.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/app")} className="w-full">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "email-mismatch") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <CardTitle>Email Mismatch</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation was sent to a different email address. Please
              sign in with the email address that received the invitation
              {inviteData?.email && (
                <>
                  {" "}
                  (<strong>{inviteData.email}</strong>)
                </>
              )}
              .
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={() => router.push("/app")} className="w-full" variant="outline">
              Go to Dashboard
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Signed in as {user?.primaryEmailAddress?.emailAddress}
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Something Went Wrong</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {errorMessage ||
                "An unexpected error occurred. Please try again or contact support."}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/app")} className="w-full">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Accepting state
  if (status === "accepting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Joining project...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Accepted state
  if (status === "accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle>You&apos;re In!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You&apos;ve successfully joined{" "}
              <strong>{acceptedProjectName}</strong>. Redirecting to your
              dashboard...
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/app")} className="w-full">
              Go to Dashboard Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Valid invitation - show accept UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Team Invitation</CardTitle>
          </div>
          <CardDescription>
            You&apos;ve been invited to collaborate on a project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {inviteData && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-medium">{inviteData.projectName}</p>
              </div>
              {inviteData.inviterName && (
                <div>
                  <p className="text-sm text-muted-foreground">Invited by</p>
                  <p className="font-medium">{inviteData.inviterName}</p>
                </div>
              )}
              {inviteData.type === "email" && inviteData.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Sent to</p>
                  <p className="font-medium">{inviteData.email}</p>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            By joining this project, you&apos;ll be able to view and edit content,
            connect your Google Search Console, and collaborate with other team
            members.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleAccept} className="w-full">
            Accept Invitation
          </Button>
          <Button
            onClick={() => router.push("/app")}
            variant="ghost"
            className="w-full"
          >
            Decline
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Signed in as {user?.primaryEmailAddress?.emailAddress}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
