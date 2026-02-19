"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * User type for the auth context
 * Derived from Clerk user data for frontend display purposes
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const trackUserActivity = useMutation(api.users.trackUserActivity);
  // Use Convex's auth state to ensure auth token is ready
  const { isAuthenticated: convexAuthenticated, isLoading: convexLoading } =
    useConvexAuth();

  // Map Clerk user to our AuthUser type
  const user: AuthUser | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        name: clerkUser.fullName || clerkUser.firstName || "User",
        avatar:
          clerkUser.imageUrl ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=Default",
      }
    : null;

  const logout = async () => {
    await signOut();
  };

  // Track user activity when authenticated
  useEffect(() => {
    const isFullyAuthenticated = convexAuthenticated && clerkLoaded && !!clerkUser;

    if (isFullyAuthenticated) {
      // Track activity on mount and periodically (every 5 minutes)
      const trackActivity = async () => {
        try {
          await trackUserActivity();
        } catch (err) {
          // Silently fail - don't block user experience
          console.debug("Failed to track user activity:", err);
        }
      };

      // Track immediately on auth
      trackActivity();

      // Track every 5 minutes while user is active
      const interval = setInterval(trackActivity, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [convexAuthenticated, clerkLoaded, clerkUser, trackUserActivity]);

  // Use Convex's auth state for isAuthenticated and isLoading
  // This ensures we don't render authenticated content until Convex has the auth token
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: convexAuthenticated && clerkLoaded && !!clerkUser,
        logout,
        isLoading: convexLoading || !clerkLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
