"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id, Doc } from "../../../../../../../convex/_generated/dataModel";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import { useDebouncedCallback } from "@/hooks/use-debounce";

interface ProjectFormData {
  name: string;
  description: string;
}

// Extended project type with user role from Convex query
type ProjectWithRole = Doc<"projects"> & { _userRole?: "owner" | "admin" | "member" };

function ProjectSettingsForm({
  project,
}: {
  project: ProjectWithRole;
  projectId: string;
}) {
  const isOwner = project._userRole === "owner";
  const updateProject = useMutation(api.projects.update);
  const deleteProject = useMutation(api.projects.remove);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProjectDialog, setDeleteProjectDialog] = useState(false);

  // Ref to track toast ID for auto-save (to dismiss loading toast)
  const saveToastId = useRef<string | number | undefined>(undefined);

  const { register, watch } = useForm<ProjectFormData>({
    defaultValues: {
      name: project.name || "",
      description: project.description || "",
    },
  });

  const formData = watch();

  // Auto-save function
  const saveSettings = useCallback(
    async (data: ProjectFormData) => {
      // Dismiss any existing save toast
      if (saveToastId.current) {
        toast.dismiss(saveToastId.current);
      }

      // Show loading toast
      saveToastId.current = toast.loading("Saving...");

      try {
        await updateProject({
          projectId: project._id,
          name: data.name,
          description: data.description,
        });

        toast.success("Settings saved", { id: saveToastId.current });
        saveToastId.current = undefined;
      } catch (error) {
        console.error("Error saving settings:", error);
        toast.error("Failed to save settings", { id: saveToastId.current });
        saveToastId.current = undefined;
      }
    },
    [project._id, updateProject]
  );

  // Debounced save for text inputs (700ms delay)
  const debouncedSave = useDebouncedCallback(
    (data: ProjectFormData) => {
      saveSettings(data);
    },
    700
  );

  // Watch for text field changes and trigger debounced save
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (!name) return;
      debouncedSave(value as ProjectFormData);
    });

    return () => subscription.unsubscribe();
  }, [watch, debouncedSave]);

  const handleDelete = async () => {
    setDeleteProjectDialog(true);
  };

  const confirmDelete = async () => {
    setDeleteProjectDialog(false);
    setIsDeleting(true);

    try {
      await deleteProject({
        projectId: project._id,
      });

      toast.success("Project deleted successfully!");
      // Redirect to app resolver which will pick the next project or onboarding
      window.location.href = "/app";
    } catch (error) {
      toast.error(
        `Error deleting project: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            Project Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Configure your project settings and preferences
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="basics"
        className="space-y-6"
      >
        <TabsList
          className={`grid w-full ${isOwner ? "grid-cols-2" : "grid-cols-1"}`}
        >
          <TabsTrigger value="basics">Basics</TabsTrigger>
          {isOwner && (
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Danger Zone</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Project Basics Tab */}
        <TabsContent value="basics">
          <Card>
            <CardHeader>
              <CardTitle>Project Basics</CardTitle>
              <CardDescription>
                Basic information about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  {...register("name")}
                  placeholder="My Project"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your project..."
                  rows={4}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/2000 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab - Only shown to project owners */}
        {isOwner && (
          <TabsContent value="danger">
            <Card className="border-danger/30">
              <CardHeader>
                <CardTitle className="text-danger">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-danger/30 rounded-lg bg-danger/10">
                  <div>
                    <p className="font-medium text-danger">
                      Delete this project
                    </p>
                    <p className="text-sm text-danger mt-1">
                      Once you delete a project, there is no going back. All
                      associated data will be permanently removed.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete Project"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Delete Project Dialog */}
        <AlertDialog
          open={deleteProjectDialog}
          onOpenChange={setDeleteProjectDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this project? This action cannot
                be undone and all associated data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 hover:text-danger"
              >
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Tabs>
    </div>
  );
}

// Loading component
function ProjectSettingsLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground/60 mx-auto" />
        <p className="text-muted-foreground mt-4">
          Loading project settings...
        </p>
      </div>
    </div>
  );
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const projectQuery = useQueryWithStatus(api.projects.get, {
    projectId: projectId as Id<"projects">,
  });

  if (projectQuery.isPending) {
    return <ProjectSettingsLoading />;
  }

  if (!projectQuery.data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <ProjectSettingsForm
          project={projectQuery.data}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
