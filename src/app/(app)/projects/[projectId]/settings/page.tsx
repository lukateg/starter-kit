"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    router.push(`/projects/${projectId}/settings/project`);
  }, [router, projectId]);

  return null;
}
