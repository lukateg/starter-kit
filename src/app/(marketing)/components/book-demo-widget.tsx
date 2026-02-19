"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Phone, X, ChevronRight, Check, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import mihaImg from "../../../../public/miha-img.png";

const TIME_SLOTS = [
  "9:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

const LINKEDIN_URL = "https://www.linkedin.com/in/mihailo-ivkovi%C4%87-a90ab2241/";

type WidgetState = "hidden" | "sliding-in" | "card" | "sliding-out" | "form" | "success";

export function BookDemoWidget() {
  const [state, setState] = useState<WidgetState>("hidden");
  const cardRef = useRef<HTMLDivElement>(null);

  // Mount offscreen after 1 second, then slide in on next frame
  useEffect(() => {
    if (sessionStorage.getItem("demo-widget-dismissed") === "true") return;

    const timer = setTimeout(() => {
      setState("sliding-in");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // When sliding-in mounts, wait one frame then transition to card
  useEffect(() => {
    if (state !== "sliding-in") return;

    const frame = requestAnimationFrame(() => {
      setState("card");
    });

    return () => cancelAnimationFrame(frame);
  }, [state]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDemoRequest = useMutation(api.supportTickets.createDemoRequest);

  const handleDismiss = useCallback(() => {
    setState("sliding-out");
    sessionStorage.setItem("demo-widget-dismissed", "true");
  }, []);

  // After slide-out transition ends, fully hide
  const handleTransitionEnd = useCallback(() => {
    if (state === "sliding-out") {
      setState("hidden");
    }
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      await createDemoRequest({
        name,
        email,
        preferredDate: selectedDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        preferredTime: selectedTime,
        message: message || undefined,
      });
      setState("success");
      setTimeout(() => {
        setState("sliding-out");
        sessionStorage.setItem("demo-widget-dismissed", "true");
      }, 4000);
    } catch {
      // Silently handle - the ticket notification will still alert the admin
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state === "hidden") return null;

  const isFormValid = name && email && selectedDate && selectedTime;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Card is visible for: sliding-in, card, sliding-out, success
  const showCard = state === "sliding-in" || state === "card" || state === "sliding-out" || state === "success";

  return (
    <>
      {/* Sliding card container */}
      {showCard && (
        <div
          ref={cardRef}
          onTransitionEnd={handleTransitionEnd}
          className="fixed bottom-6 z-50 max-w-sm"
          style={{
            left: 0,
            transition: state === "sliding-in" ? "none" : "transform 400ms ease-in-out",
            transform:
              state === "sliding-in" || state === "sliding-out"
                ? "translateX(calc(-100% - 24px))"
                : "translateX(24px)",
          }}
        >
          {/* Dismiss button - only on card state */}
          {state === "card" && (
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-accent transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}

          {/* Success content */}
          {state === "success" && (
            <div className="rounded-xl bg-background border border-border shadow-xl p-6 w-[340px] text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 mx-auto mb-3">
                <Check className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Demo requested!
              </p>
              <p className="text-xs text-muted-foreground">
                We&apos;ll reach out to confirm your time slot.
              </p>
            </div>
          )}

          {/* Card content - shown in sliding-in, card, and sliding-out states */}
          {(state === "sliding-in" || state === "card" || state === "sliding-out") && (
            <button
              onClick={state === "card" ? () => setState("form") : undefined}
              disabled={state === "sliding-out"}
              className="flex overflow-hidden flex-col rounded-xl bg-background border border-primary shadow-lg hover:shadow-xl transition-shadow cursor-pointer disabled:cursor-default disabled:hover:shadow-lg"
            >
              <div className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-2.5 w-full">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="text-sm font-semibold">
                  Book a 30-Minute Demo
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 ml-auto" />
              </div>

              {/* Person info */}
              <div className="flex p-4 items-center gap-3">
                <Image
                  src={mihaImg}
                  alt="Mihailo Ivkovic"
                  width={40}
                  height={40}
                  className="rounded-full object-cover h-10 w-10 overflow-hidden"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    Have a call with Mihailo
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      Support Lead
                    </span>
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#0A66C2] hover:opacity-80 transition-opacity"
                      aria-label="LinkedIn profile"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Form modal with backdrop */}
      {state === "form" && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            onClick={() => setState("card")}
          />

          {/* Modal */}
          <div className="absolute bottom-6 left-6 animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-xl bg-background border border-border shadow-xl w-[340px] max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Image
                  src={mihaImg}
                  alt="Mihailo Ivkovic"
                  width={32}
                  height={32}
                  className="rounded-full object-cover h-10 w-10 overflow-hidden"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Mihailo Ivkovic
                  </p>
                  <p className="text-xs text-muted-foreground">Support Lead</p>
                </div>
              </div>
              <button
                onClick={() => setState("card")}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="demo-name"
                    className="block text-xs font-medium text-foreground mb-1.5"
                  >
                    Name *
                  </label>
                  <Input
                    id="demo-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="demo-email"
                    className="block text-xs font-medium text-foreground mb-1.5"
                  >
                    Email *
                  </label>
                  <Input
                    id="demo-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              {/* Date picker */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Preferred date *
                </p>
                <div className="flex justify-center border border-border rounded-lg p-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={{ before: tomorrow }}
                    className="!p-2"
                  />
                </div>
              </div>

              {/* Time slots */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Preferred time (CET) *
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedTime === time
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-accent"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional message */}
              <div>
                <label
                  htmlFor="demo-message"
                  className="block text-xs font-medium text-foreground mb-1.5"
                >
                  Message{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Input
                  id="demo-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Anything you'd like to discuss?"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Book Demo"
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
