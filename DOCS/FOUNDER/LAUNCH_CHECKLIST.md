# Launch Checklist

> **Purpose**: Step-by-step from "app works locally" to "app is live in production"

## Pre-Launch

### Domain & Hosting
- [ ] Register domain
- [ ] Deploy to Vercel (or your hosting provider)
- [ ] Set up custom domain in Vercel
- [ ] Configure DNS (CNAME or A record)
- [ ] Verify HTTPS is working

### Convex Production
- [ ] Run `npx convex deploy` to create production deployment
- [ ] Set all environment variables in Convex production dashboard
- [ ] Verify schema deployed correctly
- [ ] Test queries/mutations work in production

### Clerk Production
- [ ] Switch Clerk to production mode
- [ ] Update API keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- [ ] Set up production webhook pointing to production Convex URL
- [ ] Test sign-up → webhook → user creation flow

### Payments (Lemon Squeezy)
- [ ] Switch from test mode to live mode
- [ ] Create production products/plans
- [ ] Update variant IDs in env vars
- [ ] Set up production webhook
- [ ] Test a real purchase (use a $1 test product)
- [ ] Verify webhook delivery and credit/subscription creation

### Email (Resend)
- [ ] Add and verify your custom domain in Resend
- [ ] Update sender email if needed
- [ ] Test welcome email sends correctly
- [ ] Check emails don't land in spam

### Analytics
- [ ] Verify PostHog events are flowing
- [ ] Set up key dashboards (sign-ups, activation, retention)
- [ ] Configure Meta Pixel events if using paid acquisition

## SEO & Marketing
- [ ] Update `robots.ts` with production domain
- [ ] Update `sitemap.ts` with production domain
- [ ] Update JSON-LD Organization schema with real company name and URL
- [ ] Update Open Graph images
- [ ] Submit sitemap to Google Search Console
- [ ] Verify rich results with Google's testing tool

## Legal & Compliance
- [ ] Update privacy policy with real company name, contact, data practices
- [ ] Update terms of service
- [ ] Review cookie consent banner configuration
- [ ] Ensure GDPR/CCPA compliance if applicable

## Content
- [ ] Landing page has real copy (not placeholder text)
- [ ] Blog has at least 2-3 seed posts
- [ ] FAQ reflects actual product questions
- [ ] All placeholder text replaced

## Error Monitoring
- [ ] Set up error monitoring (Sentry, PostHog error tracking, or similar)
- [ ] Test that errors are captured and reported
- [ ] Set up alerts for critical errors

## Final Checks
- [ ] Test the full user journey: visit landing → sign up → onboarding → use app → purchase
- [ ] Test on mobile (responsive layouts)
- [ ] Test in different browsers (Chrome, Safari, Firefox)
- [ ] Check page load speed (Lighthouse audit)
- [ ] Verify no console errors in production

## Post-Launch

- [ ] Monitor error rates for first 24-48 hours
- [ ] Check analytics data is being captured
- [ ] Verify webhook deliveries are working
- [ ] Set up regular backup strategy for Convex data
- [ ] Read `DOCS/FOUNDER/GROWTH_BASICS.md` for next steps
