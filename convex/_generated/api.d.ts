/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as articleGeneration from "../articleGeneration.js";
import type * as articleGenerationTrigger from "../articleGenerationTrigger.js";
import type * as articleHistory from "../articleHistory.js";
import type * as articleRegeneration from "../articleRegeneration.js";
import type * as articles from "../articles.js";
import type * as autopilot from "../autopilot.js";
import type * as beehiiv from "../beehiiv.js";
import type * as blogArticles from "../blogArticles.js";
import type * as brandVoice from "../brandVoice.js";
import type * as competitorIntelligence from "../competitorIntelligence.js";
import type * as crons from "../crons.js";
import type * as crossMarketValidation from "../crossMarketValidation.js";
import type * as emailAutomation_config from "../emailAutomation/config.js";
import type * as emailAutomation_index from "../emailAutomation/index.js";
import type * as emailAutomation_queries from "../emailAutomation/queries.js";
import type * as emailAutomation_sequences from "../emailAutomation/sequences.js";
import type * as emailAutomation_templates from "../emailAutomation/templates.js";
import type * as emailAutomation_triggers from "../emailAutomation/triggers.js";
import type * as emailEvents from "../emailEvents.js";
import type * as emailPreferences from "../emailPreferences.js";
import type * as emails from "../emails.js";
import type * as files from "../files.js";
import type * as freeTools from "../freeTools.js";
import type * as glossary from "../glossary.js";
import type * as growthBundleLeads from "../growthBundleLeads.js";
import type * as gscFetch from "../gscFetch.js";
import type * as guideDownloads from "../guideDownloads.js";
import type * as guidePurchases from "../guidePurchases.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as integrations from "../integrations.js";
import type * as keywordGeneration from "../keywordGeneration.js";
import type * as keywordGenerationTrigger from "../keywordGenerationTrigger.js";
import type * as keywords from "../keywords.js";
import type * as leads from "../leads.js";
import type * as lib_angles_generateAngles from "../lib/angles/generateAngles.js";
import type * as lib_angles_types from "../lib/angles/types.js";
import type * as lib_article_generation_htmlUtils from "../lib/article_generation/htmlUtils.js";
import type * as lib_article_generation_internalLinking from "../lib/article_generation/internalLinking.js";
import type * as lib_article_generation_rotation from "../lib/article_generation/rotation.js";
import type * as lib_citations_researchFirst from "../lib/citations/researchFirst.js";
import type * as lib_citations_youtubeSearch from "../lib/citations/youtubeSearch.js";
import type * as lib_competitors_discovery from "../lib/competitors/discovery.js";
import type * as lib_competitors_playbook from "../lib/competitors/playbook.js";
import type * as lib_cta_generateCta from "../lib/cta/generateCta.js";
import type * as lib_draft_generateMarkdownDraft from "../lib/draft/generateMarkdownDraft.js";
import type * as lib_draft_markdownPromptBuilder from "../lib/draft/markdownPromptBuilder.js";
import type * as lib_draft_retryGeneration from "../lib/draft/retryGeneration.js";
import type * as lib_draft_types from "../lib/draft/types.js";
import type * as lib_emailFooter from "../lib/emailFooter.js";
import type * as lib_encryption from "../lib/encryption.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_localization_locales from "../lib/localization/locales.js";
import type * as lib_markdown from "../lib/markdown.js";
import type * as lib_metaParamBuilder from "../lib/metaParamBuilder.js";
import type * as lib_paragraph_buildParagraphPrompt from "../lib/paragraph/buildParagraphPrompt.js";
import type * as lib_persona_generation from "../lib/persona/generation.js";
import type * as lib_r2Storage from "../lib/r2Storage.js";
import type * as lib_regeneration_buildTweakPrompt from "../lib/regeneration/buildTweakPrompt.js";
import type * as lib_regeneration_types from "../lib/regeneration/types.js";
import type * as lib_seo from "../lib/seo.js";
import type * as lib_serp_fetchSerpIntelligence from "../lib/serp/fetchSerpIntelligence.js";
import type * as lib_teamAuth from "../lib/teamAuth.js";
import type * as lib_templates_filterTemplate from "../lib/templates/filterTemplate.js";
import type * as lib_templates_index from "../lib/templates/index.js";
import type * as lib_templates_templates_beginnersGuide from "../lib/templates/templates/beginnersGuide.js";
import type * as lib_templates_templates_caseStudy from "../lib/templates/templates/caseStudy.js";
import type * as lib_templates_templates_comparison from "../lib/templates/templates/comparison.js";
import type * as lib_templates_templates_costBenefit from "../lib/templates/templates/costBenefit.js";
import type * as lib_templates_templates_deepDive from "../lib/templates/templates/deepDive.js";
import type * as lib_templates_templates_howToGuide from "../lib/templates/templates/howToGuide.js";
import type * as lib_templates_templates_listicle from "../lib/templates/templates/listicle.js";
import type * as lib_templates_templates_mythBusting from "../lib/templates/templates/mythBusting.js";
import type * as lib_templates_templates_problemSolution from "../lib/templates/templates/problemSolution.js";
import type * as lib_templates_templates_trendAnalysis from "../lib/templates/templates/trendAnalysis.js";
import type * as lib_templates_templates_versus from "../lib/templates/templates/versus.js";
import type * as lib_templates_types from "../lib/templates/types.js";
import type * as lib_toc_generateTableOfContents from "../lib/toc/generateTableOfContents.js";
import type * as lib_utils_markdownHeading from "../lib/utils/markdownHeading.js";
import type * as lib_utils_retry from "../lib/utils/retry.js";
import type * as lib_utils_wordCount from "../lib/utils/wordCount.js";
import type * as lib_validation_markdownValidators from "../lib/validation/markdownValidators.js";
import type * as lib_validation_readability from "../lib/validation/readability.js";
import type * as lib_validation_types from "../lib/validation/types.js";
import type * as magicCheckout from "../magicCheckout.js";
import type * as migrations_cleanupDeprecatedFields from "../migrations/cleanupDeprecatedFields.js";
import type * as migrations_migrateKeywordMarketMetrics from "../migrations/migrateKeywordMarketMetrics.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as onboardingEnhancements from "../onboardingEnhancements.js";
import type * as outrankArticles from "../outrankArticles.js";
import type * as paragraphGeneration from "../paragraphGeneration.js";
import type * as postIndex from "../postIndex.js";
import type * as projects from "../projects.js";
import type * as publishingLogs from "../publishingLogs.js";
import type * as quizSubmissions from "../quizSubmissions.js";
import type * as referrals from "../referrals.js";
import type * as shopifyPublishing from "../shopifyPublishing.js";
import type * as supportTickets from "../supportTickets.js";
import type * as teamInvitations from "../teamInvitations.js";
import type * as uploads from "../uploads.js";
import type * as userEngagement from "../userEngagement.js";
import type * as users from "../users.js";
import type * as utils_inlineStyles from "../utils/inlineStyles.js";
import type * as webhookActions from "../webhookActions.js";
import type * as webhooks from "../webhooks.js";
import type * as wordpressPublishing from "../wordpressPublishing.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  articleGeneration: typeof articleGeneration;
  articleGenerationTrigger: typeof articleGenerationTrigger;
  articleHistory: typeof articleHistory;
  articleRegeneration: typeof articleRegeneration;
  articles: typeof articles;
  autopilot: typeof autopilot;
  beehiiv: typeof beehiiv;
  blogArticles: typeof blogArticles;
  brandVoice: typeof brandVoice;
  competitorIntelligence: typeof competitorIntelligence;
  crons: typeof crons;
  crossMarketValidation: typeof crossMarketValidation;
  "emailAutomation/config": typeof emailAutomation_config;
  "emailAutomation/index": typeof emailAutomation_index;
  "emailAutomation/queries": typeof emailAutomation_queries;
  "emailAutomation/sequences": typeof emailAutomation_sequences;
  "emailAutomation/templates": typeof emailAutomation_templates;
  "emailAutomation/triggers": typeof emailAutomation_triggers;
  emailEvents: typeof emailEvents;
  emailPreferences: typeof emailPreferences;
  emails: typeof emails;
  files: typeof files;
  freeTools: typeof freeTools;
  glossary: typeof glossary;
  growthBundleLeads: typeof growthBundleLeads;
  gscFetch: typeof gscFetch;
  guideDownloads: typeof guideDownloads;
  guidePurchases: typeof guidePurchases;
  http: typeof http;
  images: typeof images;
  integrations: typeof integrations;
  keywordGeneration: typeof keywordGeneration;
  keywordGenerationTrigger: typeof keywordGenerationTrigger;
  keywords: typeof keywords;
  leads: typeof leads;
  "lib/angles/generateAngles": typeof lib_angles_generateAngles;
  "lib/angles/types": typeof lib_angles_types;
  "lib/article_generation/htmlUtils": typeof lib_article_generation_htmlUtils;
  "lib/article_generation/internalLinking": typeof lib_article_generation_internalLinking;
  "lib/article_generation/rotation": typeof lib_article_generation_rotation;
  "lib/citations/researchFirst": typeof lib_citations_researchFirst;
  "lib/citations/youtubeSearch": typeof lib_citations_youtubeSearch;
  "lib/competitors/discovery": typeof lib_competitors_discovery;
  "lib/competitors/playbook": typeof lib_competitors_playbook;
  "lib/cta/generateCta": typeof lib_cta_generateCta;
  "lib/draft/generateMarkdownDraft": typeof lib_draft_generateMarkdownDraft;
  "lib/draft/markdownPromptBuilder": typeof lib_draft_markdownPromptBuilder;
  "lib/draft/retryGeneration": typeof lib_draft_retryGeneration;
  "lib/draft/types": typeof lib_draft_types;
  "lib/emailFooter": typeof lib_emailFooter;
  "lib/encryption": typeof lib_encryption;
  "lib/errors": typeof lib_errors;
  "lib/localization/locales": typeof lib_localization_locales;
  "lib/markdown": typeof lib_markdown;
  "lib/metaParamBuilder": typeof lib_metaParamBuilder;
  "lib/paragraph/buildParagraphPrompt": typeof lib_paragraph_buildParagraphPrompt;
  "lib/persona/generation": typeof lib_persona_generation;
  "lib/r2Storage": typeof lib_r2Storage;
  "lib/regeneration/buildTweakPrompt": typeof lib_regeneration_buildTweakPrompt;
  "lib/regeneration/types": typeof lib_regeneration_types;
  "lib/seo": typeof lib_seo;
  "lib/serp/fetchSerpIntelligence": typeof lib_serp_fetchSerpIntelligence;
  "lib/teamAuth": typeof lib_teamAuth;
  "lib/templates/filterTemplate": typeof lib_templates_filterTemplate;
  "lib/templates/index": typeof lib_templates_index;
  "lib/templates/templates/beginnersGuide": typeof lib_templates_templates_beginnersGuide;
  "lib/templates/templates/caseStudy": typeof lib_templates_templates_caseStudy;
  "lib/templates/templates/comparison": typeof lib_templates_templates_comparison;
  "lib/templates/templates/costBenefit": typeof lib_templates_templates_costBenefit;
  "lib/templates/templates/deepDive": typeof lib_templates_templates_deepDive;
  "lib/templates/templates/howToGuide": typeof lib_templates_templates_howToGuide;
  "lib/templates/templates/listicle": typeof lib_templates_templates_listicle;
  "lib/templates/templates/mythBusting": typeof lib_templates_templates_mythBusting;
  "lib/templates/templates/problemSolution": typeof lib_templates_templates_problemSolution;
  "lib/templates/templates/trendAnalysis": typeof lib_templates_templates_trendAnalysis;
  "lib/templates/templates/versus": typeof lib_templates_templates_versus;
  "lib/templates/types": typeof lib_templates_types;
  "lib/toc/generateTableOfContents": typeof lib_toc_generateTableOfContents;
  "lib/utils/markdownHeading": typeof lib_utils_markdownHeading;
  "lib/utils/retry": typeof lib_utils_retry;
  "lib/utils/wordCount": typeof lib_utils_wordCount;
  "lib/validation/markdownValidators": typeof lib_validation_markdownValidators;
  "lib/validation/readability": typeof lib_validation_readability;
  "lib/validation/types": typeof lib_validation_types;
  magicCheckout: typeof magicCheckout;
  "migrations/cleanupDeprecatedFields": typeof migrations_cleanupDeprecatedFields;
  "migrations/migrateKeywordMarketMetrics": typeof migrations_migrateKeywordMarketMetrics;
  migrations: typeof migrations;
  notifications: typeof notifications;
  onboardingEnhancements: typeof onboardingEnhancements;
  outrankArticles: typeof outrankArticles;
  paragraphGeneration: typeof paragraphGeneration;
  postIndex: typeof postIndex;
  projects: typeof projects;
  publishingLogs: typeof publishingLogs;
  quizSubmissions: typeof quizSubmissions;
  referrals: typeof referrals;
  shopifyPublishing: typeof shopifyPublishing;
  supportTickets: typeof supportTickets;
  teamInvitations: typeof teamInvitations;
  uploads: typeof uploads;
  userEngagement: typeof userEngagement;
  users: typeof users;
  "utils/inlineStyles": typeof utils_inlineStyles;
  webhookActions: typeof webhookActions;
  webhooks: typeof webhooks;
  wordpressPublishing: typeof wordpressPublishing;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
