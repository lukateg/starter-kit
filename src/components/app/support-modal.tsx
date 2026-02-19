"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  const createTicket = useMutation(api.supportTickets.create);

  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<string>("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !description) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createTicket({
        subject,
        description,
        priority,
      });

      toast.success("Feedback Sent!", {
        description:
          "Thank you for your feedback! We'll review it and get back to you soon.",
      });

      // Reset form
      setSubject("");
      setDescription("");
      setPriority("normal");

      // Close modal
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Submission Failed", {
        description: "Failed to submit your feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            We&apos;d love to hear from you! Share your thoughts, report issues,
            or suggest improvements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Type</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="What kind of feedback?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="improvement">
                  Improvement Suggestion
                </SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Your Feedback</Label>
            <Textarea
              id="description"
              placeholder="Tell us what you think, what could be better, or any issues you've encountered..."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - General feedback</SelectItem>
                <SelectItem value="normal">Normal - Standard issue</SelectItem>
                <SelectItem value="urgent">Urgent - Blocking my work</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Feedback
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
