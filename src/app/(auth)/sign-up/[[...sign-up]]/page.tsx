"use client";

import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  // Use redirect_url from query params if provided, otherwise default to /app
  const redirectUrl = searchParams.get("redirect_url") || "/app";

  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "shadow-lg",
        },
      }}
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      forceRedirectUrl={redirectUrl}
      fallbackRedirectUrl="/app"
      unsafeMetadata={
        referralCode ? { referredBy: referralCode } : undefined
      }
    />
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        }
      >
        <SignUpContent />
      </Suspense>
    </div>
  );
}
