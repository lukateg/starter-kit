/**
 * UNIFIED PRICING CONFIGURATION
 *
 * This is the single source of truth for all pricing in the app.
 * Any file that needs pricing data should import from here.
 *
 * IMPORTANT: When updating prices, only update THIS file.
 * All other files import from here.
 *
 * NOTE: Convex backend (convex/users.ts) cannot import from src/ due to
 * runtime isolation. The CREDIT_COSTS and FREE_TIER constants are duplicated
 * there and MUST be kept in sync manually. When updating prices:
 * 1. Update this file (src/lib/pricing/index.ts)
 * 2. Update convex/users.ts to match
 *
 * TODO: Consider using a build step to auto-sync these constants.
 */

// =============================================================================
// CREDIT COSTS - How many credits each action costs
// =============================================================================

export const CREDIT_COSTS = {
  // Primary action (customize per your product)
  PRIMARY_ACTION: 20,

  // Secondary action (customize per your product)
  SECONDARY_ACTION: 30,

  // Alias for backward compatibility
  ARTICLE_GENERATION: 20,
  KEYWORD_RESEARCH_NEW: 30,
  KEYWORD_GENERATION_COST: 30,
} as const;

// =============================================================================
// FREE TIER LIMITS
// =============================================================================

export const FREE_TIER = {
  // Credits given to new users
  INITIAL_FREE_CREDITS: 60,

  // Free actions per month before charging
  FREE_ACTIONS_PER_MONTH: 10,

  // Alias for backward compatibility
  FREE_KEYWORD_GENERATIONS_PER_MONTH: 10,
} as const;

// =============================================================================
// CREDIT WARNING THRESHOLDS
// =============================================================================

export const CREDIT_THRESHOLDS = {
  // Show warning banner when credits fall below this
  LOW_CREDITS_WARNING: 50,

  // Show critical/danger state when credits fall below this
  CRITICAL_CREDITS: 20,
} as const;

// =============================================================================
// CREDIT PACKAGES - Available for purchase
// =============================================================================

// Define the package type explicitly to allow optional fields
export interface CreditPackageConfig {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular: boolean;
  description: string;
  perCreditCost: number;
  variantEnvKey: string;
  bgColor: string;
  savings?: string;
  monthsOfContent?: string;
}

export const CREDIT_PACKAGES: CreditPackageConfig[] = [
  {
    id: "standard",
    name: "Starter",
    credits: 630,
    price: 69, // USD
    popular: true,
    description: "Perfect for getting started with your project",
    perCreditCost: 0.109,
    variantEnvKey: "NEXT_PUBLIC_LEMONSQUEEZY_STANDARD_VARIANT_ID",
    bgColor: "bg-success/10",
  },
  {
    id: "premium",
    name: "Growth",
    credits: 1800,
    price: 169, // USD
    popular: false,
    description: "Everything you need to scale your product",
    perCreditCost: 0.094,
    savings: "$38 discount",
    monthsOfContent: "Best value for growing teams",
    variantEnvKey: "NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_VARIANT_ID",
    bgColor: "bg-warning/10",
  },
];

// =============================================================================
// CREDIT COSTS DISPLAY - For UI display purposes
// =============================================================================

export const CREDIT_COSTS_DISPLAY = [
  {
    action: "Primary Action",
    cost: CREDIT_COSTS.PRIMARY_ACTION,
    description: "Perform the primary action in your app",
  },
  {
    action: "Secondary Action",
    cost: CREDIT_COSTS.SECONDARY_ACTION,
    description: "Perform the secondary action in your app",
  },
] as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a credit package by ID
 */
export function getCreditPackage(id: string) {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id);
}

/**
 * Get credit package by price (for webhook/checkout matching)
 */
export function getCreditPackageByPrice(price: number) {
  return CREDIT_PACKAGES.find((pkg) => pkg.price === price);
}

/**
 * Get credit package by credits amount
 */
export function getCreditPackageByCredits(credits: number) {
  return CREDIT_PACKAGES.find((pkg) => pkg.credits === credits);
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  return `${credits.toLocaleString()} ${credits === 1 ? "credit" : "credits"}`;
}

/**
 * Get color classes based on credit amount
 */
export function getCreditColorClass(credits: number): {
  text: string;
  bg: string;
  border: string;
} {
  if (credits < CREDIT_THRESHOLDS.CRITICAL_CREDITS) {
    return {
      text: "text-danger",
      bg: "bg-danger/10",
      border: "border-danger/30",
    };
  }
  if (credits < CREDIT_THRESHOLDS.LOW_CREDITS_WARNING) {
    return {
      text: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/30",
    };
  }
  return {
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  };
}

/**
 * Check if user has enough credits for an action
 */
export function canAfford(
  userCredits: number,
  action: keyof typeof CREDIT_COSTS
): boolean {
  return userCredits >= CREDIT_COSTS[action];
}

/**
 * Calculate how many times a user can perform an action
 */
export function calculateAffordableCount(
  userCredits: number,
  action: keyof typeof CREDIT_COSTS
): number {
  const cost = CREDIT_COSTS[action];
  return Math.floor(userCredits / cost);
}

/**
 * Get a user-friendly insufficient credits message
 */
export function getInsufficientCreditsMessage(
  userCredits: number,
  action: keyof typeof CREDIT_COSTS
): string {
  const cost = CREDIT_COSTS[action];
  const needed = cost - userCredits;

  const actionDescriptions: Record<keyof typeof CREDIT_COSTS, string> = {
    PRIMARY_ACTION: "perform this action",
    SECONDARY_ACTION: "perform this action",
    ARTICLE_GENERATION: "generate an article",
    KEYWORD_RESEARCH_NEW: "generate new keywords",
    KEYWORD_GENERATION_COST: "generate new keywords",
  };

  return `You need ${formatCredits(cost)} to ${actionDescriptions[action]}, but you only have ${formatCredits(userCredits)}. Please purchase ${formatCredits(needed)} more to continue.`;
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type CreditPackage = CreditPackageConfig;
export type CreditCostAction = keyof typeof CREDIT_COSTS;
