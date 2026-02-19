/**
 * Meta Pixel stub
 *
 * This is a minimal stub for the Meta Pixel SDK.
 * Replace with real implementation when you configure Meta Pixel tracking.
 * Set NEXT_PUBLIC_META_PIXEL_ID in your environment to enable.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

export const metaPixel = {
  init(pixelId: string, options?: { autoConfig?: boolean; debug?: boolean }) {
    // No-op: implement when Meta Pixel is configured
  },
  pageView() {
    // No-op
  },
  track(eventName: string, data?: Record<string, unknown>) {
    // No-op
  },
  trackCustom(eventName: string, data?: Record<string, unknown>) {
    // No-op
  },
  grantConsent() {
    // No-op
  },
  revokeConsent() {
    // No-op
  },
};
