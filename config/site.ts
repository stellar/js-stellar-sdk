/**
 * Single source of truth for the docs site's deploy identity and AI-agent
 * policy. Anything that needs to know the site URL, the base path, or how
 * AI agents are permitted to use this content (astro.config.mjs,
 * scripts/build-robots.ts, scripts/build-llms.ts) imports from here.
 *
 * To change the deploy target or AI policy: edit this file and rebuild.
 */

export const SITE_URL = "https://stellar.github.io";
export const BASE_PATH = "/js-stellar-sdk";
export const SITE_BASE_URL = `${SITE_URL}${BASE_PATH}` as const;

/**
 * Cloudflare Content Signals — declares preferences for how AI agents may
 * use this site's content. Lives in robots.txt at build time.
 *
 *   search   — building search indexes / providing search results
 *   aiInput  — real-time AI use (RAG, agents reading per-query)
 *   aiTrain  — training or fine-tuning AI models
 *
 * Each: "yes" (allow), "no" (disallow), or omit (no signal).
 *
 * Spec: https://blog.cloudflare.com/content-signals-policy/
 */
export const AI_POLICY = {
  search: "yes",
  aiInput: "yes",
  aiTrain: "yes",
} as const;

/**
 * Major AI crawlers given explicit allow rules in robots.txt. The wildcard
 * `User-agent: *` policy already permits them; per-bot entries make intent
 * auditable and visible to scanners that grade per-bot.
 */
export const ALLOWED_AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "FacebookBot",
] as const;
