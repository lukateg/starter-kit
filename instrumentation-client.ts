import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/retrack0_data",
  ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: "2025-05-24",
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
  debug: process.env.NODE_ENV === "development",
});
