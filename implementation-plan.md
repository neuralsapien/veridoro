# Veridoro — Implementation Plan

Derived from the BRD's six-month roadmap. Each milestone is decomposed into concrete engineering tasks, owners, dependencies, and exit criteria. The plan is sequenced so each month's work unblocks the next; nothing in a later month assumes a non-deterministic outcome from an earlier one.

**Scope discipline:** This plan implements only what the BRD calls for. No vendor dashboard, no second vertical, no pay-for-placement infrastructure.

---

## Milestone 0 — Repo & infra bootstrap (week 0, before Month 1 starts)

Foundation work that has to exist before any content lands.

| # | Task | Output | Exit criteria |
|---|---|---|---|
| 0.1 | Provision GitHub repo `neuralsapien/veridoro` (already remoted locally) | Empty `main` branch on remote | `git push -u origin main` succeeds |
| 0.2 | Configure GitHub Pages (deploy from `main` / `docs` or via Actions) | Live `https://veridoro.com` placeholder | DNS resolves, HTTPS cert issued |
| 0.3 | Point `veridoro.com` apex + `www` at GitHub Pages | A/AAAA + CNAME records | `dig veridoro.com` returns Pages IPs |
| 0.4 | Astro skeleton scaffolded with MDX, sitemap, RSS plugins | `package.json`, `astro.config.mjs` | `npm run build` produces clean `/dist` |
| 0.5 | CI: GitHub Action that builds Astro on PR and on `main` push | `.github/workflows/deploy.yml` | PR check is green; main deploys |
| 0.6 | Branch protection on `main` — require PR, no direct pushes | Settings applied | Direct push to `main` is rejected |

**Why first:** Hard rule from the BRD is "no automation commits to `main`." That has to be enforceable on day one, not retrofitted later.

---

## Milestone 1 — Foundation & seed corpus (Month 1)

**BRD goal:** Live site with credible methodology and 25–40 manually scored tools.

### 1A. Methodology v1.0
- [ ] Draft `/methodology/index.mdx` — 4–6 criteria, 0–10 scale, definitions, dated `v1.0`
- [ ] Each criterion gets a stable anchor (`#auth-quality`, `#error-rate`, etc.)
- [ ] Page includes JSON-LD `Article` + `datePublished` + `author`
- [ ] Methodology versions live in `/methodology/v1.0/` (immutable); `/methodology/` redirects to latest

**Exit:** Methodology page is live, indexable, and every score on the site can cite back to a numbered criterion on it.

### 1B. Data layer
- [ ] `data/tools/<slug>.json` — one file per tool, schema: `{slug, name, vendor, url, repo, scores: {criterion: {value, evidence_url, scored_at}}, last_reviewed_by, last_reviewed_at}`
- [ ] `data/seed-corpus.json` — list of 40 candidate MCP servers to score
- [ ] JSON Schema for tool files in `data/schema/tool.schema.json`; CI validates on PR
- [ ] Astro content collection wired to `data/tools/`

**Exit:** Adding a tool = adding one validated JSON file + one MDX page. Schema violations fail CI.

### 1C. Tool pages & comparison
- [ ] `/tools/<slug>/` — one MDX page per scored tool
  - Per-criterion 50–150 word self-contained chunks
  - Pros / cons / verdict sections with stable anchors
  - JSON-LD: `SoftwareApplication`, `Review`, `AggregateRating`
- [ ] `/compare/` — table page sortable by criterion, server-rendered (no client JS dependency)
- [ ] `/rankings/` — top-N by composite score, dated, with "as of" stamp

**Exit:** 25 tools scored and published. Each page passes Google Rich Results Test for `Review` + `SoftwareApplication`.

### 1D. AEO / RAG surface
- [ ] `/llms.txt` at root — index of canonical resources
- [ ] `/api/tools.json`, `/api/rankings.json`, `/api/tools/<slug>.json` generated at build from data layer
- [ ] `sitemap.xml`, `robots.txt` (allow GPTBot, ClaudeBot, PerplexityBot explicitly)
- [ ] RSS feed at `/feed.xml` for ranking changes
- [ ] Submit to Google Search Console, Bing Webmaster, IndexNow

**Exit:** All four AI-bot user agents can crawl; static API endpoints return valid JSON; site appears in GSC.

### 1E. Manual scoring sprint
- [ ] Score 25 tools by end of week 2; 40 by end of month
- [ ] Each score has an `evidence_url` field — no scores without sourced evidence
- [ ] Founder reviews & signs off every score (BRD: "founder decides every score")

**Risk gate:** If scoring velocity is below 2 tools/day by week 2, cut seed corpus to 25 and document why.

---

## Milestone 2 — Automation layer (Month 2)

**BRD goal:** Site updates itself daily with a human in the loop. Every routine opens a PR.

### 2A. Routine harness (shared infra)
- [ ] `scripts/lib/` — shared modules: `repo.ts` (branch/PR helpers), `diff.ts`, `report.ts`
- [ ] Each routine: creates branch `auto/<routine>-<date>`, commits, opens PR via `gh pr create`, labels `automated`
- [ ] `.github/CODEOWNERS` — founder is required reviewer on `automated`-labeled PRs
- [ ] Cowork scheduled task config stored in `automation/routines/<name>.md` (the prompt) + `automation/routines/<name>.schedule` (cadence)

### 2B. Routine 1 — Daily Audit (04:00 daily)
- [ ] Fetch each tool's homepage / changelog / repo
- [ ] Diff against `data/tools/<slug>.json` snapshot fields (version, last-updated, doc-hash)
- [ ] Run automated checks: HTTP status, doc URL freshness, repo last-commit date
- [ ] Output: `audits/YYYY-MM-DD.md` summary + per-tool JSON delta files
- [ ] Open PR titled `Daily audit: YYYY-MM-DD`

**Exit:** Three consecutive successful daily PRs; founder merges within 24h on each.

### 2C. Routine 2 — Weekly Ranking Refresh (Sun 06:00)
- [ ] Re-run scoring on top 10 tools using fresh data
- [ ] Flag `needs_human_review: true` for any tool where automated re-score deviates from stored score by ≥ 1.5 points
- [ ] BRD non-negotiable: negative score changes require founder sign-off — automation can *propose*, never apply, downgrades
- [ ] Output PR with proposed changes + flagged review queue

### 2D. Routine 3 — Weekly Changelog Post (Fri)
- [ ] Aggregate week's audits into `/changelog/this-week-in-mcp-YYYY-WW.mdx`
- [ ] Auto-generated draft; founder edits before merge
- [ ] Front-matter ensures RSS pickup

### 2E. Sanity-check routine
- [ ] If no successful run from any routine in 36h, send email + open issue tagged `routine-down`
- [ ] Runs hourly from a separate scheduler so it survives a Cowork-side breakage

### 2F. Build pipeline
- [ ] Static API endpoints regenerated at every build
- [ ] Build fails if `data/tools/` schema check fails
- [ ] Lighthouse + structured-data validation runs on PR; fails on regression

**Exit:** Four routines running for two consecutive weeks without manual intervention; staleness alarm verified by simulated outage.

---

## Milestone 3 — Authority & distribution (Month 3)

**BRD goal:** 10+ inbound links from authoritative domains; first measurable AI citations.

This is judgment-and-outreach work; engineering supports it but doesn't lead it.

### 3A. State of MCP 2026 report
- [ ] `/reports/state-of-mcp-2026/` — long-form, original aggregate data from the benchmark
- [ ] Charts rendered statically (SVG, no client JS), data-source linked to `/api/`
- [ ] Distinct JSON-LD `Report` schema; OG image; press kit at `/press/`

### 3B. Distribution
- [ ] Pitch list: 5+ newsletters (Latent Space, TLDR AI, Ben's Bites, Import AI, The Rundown)
- [ ] Show HN draft + posting checklist (BRD anti-goal: don't be spammy)
- [ ] 3 Reddit threads — drafts written, posted by founder, not from new accounts
- [ ] Submit listing to 3+ `awesome-mcp` GitHub lists
- [ ] Vendor outreach: 10 high-scorers — request quote / feedback (template in `/automation/templates/vendor-outreach.md`)

### 3C. Tracking infra
- [ ] `analytics/backlinks.csv` — weekly snapshot of `link:veridoro.com`
- [ ] `analytics/ai-citations.md` — manual checks on 20 standard prompts across ChatGPT / Claude / Perplexity, weekly
- [ ] Server log parser: count hits from `ChatGPT-User`, `Claude-Web`, `PerplexityBot`, `GPTBot`, `ClaudeBot` — weekly summary committed to `analytics/crawler-hits/`

**Exit:** ≥10 inbound links from non-spammy domains; ≥1 AI-engine citation on a target query; weekly tracking artifact in repo.

**Risk gate:** If by end of Month 3 we have <3 inbound links, pause Month 4 and re-evaluate distribution before building the audit hook — a hook with no traffic is wasted spend.

---

## Milestone 4 — Audit hook / lead magnet (Month 4)

**BRD goal:** Free vendor audit tool that converts vendors into a sales pipeline.

### 4A. Intake
- [ ] `/audit/` — form: vendor name, URL, contact email, consent checkbox
- [ ] Cloudflare Worker receives POST, validates, queues job, returns "we'll email you in ~10 min"
- [ ] Per-day cap (default 20); over-cap requests get next-day promise
- [ ] Anti-abuse: rate-limit by IP + email domain; CAPTCHA on form

### 4B. Audit engine
- [ ] `audit/runner` — runs 30 standardized prompts against ChatGPT, Claude, Perplexity APIs
- [ ] Standard prompt set lives in `automation/audit/prompts.json` (versioned)
- [ ] Per-engine scoring: citation rate, sentiment (classifier), factual accuracy (claim-check against vendor's own docs)
- [ ] Suggested fixes generated by Claude using audit output; founder-reviewable templates

### 4C. Report delivery
- [ ] PDF generator (e.g. Playwright + HTML template at `audit/templates/report.html`)
- [ ] Email via transactional provider (Resend / Postmark)
- [ ] `/audited/` — public list of recently audited vendors (opt-in via consent checkbox); social proof + AEO surface

### 4D. Cost & ops
- [ ] Spend dashboard: daily API spend per engine logged to `analytics/audit-spend.csv`
- [ ] Hard cap: monthly spend > $500 → audits pause, founder notified
- [ ] Per-vendor audit cost target: < $3

**Exit:** 10 audits delivered end-to-end with no manual intervention; cost per audit measured and within target.

---

## Milestone 5 — First monetization (Month 5)

**BRD goal:** 5 paying customers on Veridoro Monitor at $149–$299/month.

**BRD anti-goal honored:** No vendor dashboard. Emailed PDFs only.

### 5A. Product surface
- [ ] `/monitor/` — pricing, what's included, sample report PDF
- [ ] Stripe checkout (subscription) — no in-app account creation; license keyed to vendor email
- [ ] On purchase: webhook adds vendor to `data/monitored/<slug>.json`

### 5B. Monitor pipeline
- [ ] Weekly job per monitored vendor: re-runs audit prompt set
- [ ] Diff vs. previous week; alert email if citation share drops > X%
- [ ] Weekly PDF report emailed; suggested fixes drafted by Claude, reviewed by founder before send
- [ ] Founder review queue lives in repo as PRs (consistent with the rest of the system)

### 5C. Conversion funnel instrumentation
- [ ] UTM convention for audit → monitor email CTAs
- [ ] `analytics/funnel.csv` — audit_requested → audit_delivered → call_booked → paid
- [ ] 30-min sales-call calendar link in audit report

### 5D. Light social proof
- [ ] `/customers/` — opt-in list of monitored vendors (logo wall, no quotes unless explicitly granted)

**Exit:** 5 paid customers; churn data tracked from week 1 of each subscription.

---

## Milestone 6 — Decide the next bet (Month 6)

Not implementation work — a decision gate.

### 6A. Data assembly
- [ ] One-page summary: visitors (AI-referral split), crawler hits per engine, audit→paid conversion, monitor churn, top-cited content
- [ ] Generated by a one-shot script reading `analytics/` + Stripe export

### 6B. Decision rule (from BRD)
- **Win condition for "deepen":** Top 3 cited source for our target queries on ≥ 2 major LLMs
- **Else:** Don't generalize. Reinvest in deepening.
- Decision recorded as `decisions/2026-11-vertical-strategy.md` — dated, founder-signed

### 6C. Either-path prep
- [ ] If deepen: draft researcher JD, scope benchmark v2.0
- [ ] If generalize: candidate-vertical shortlist with the same evaluation criteria used to pick MCP

---

## Cross-cutting workstreams

These run in parallel with the milestones above.

### Quality gates (always-on from M1)
- Every PR: schema validation, build succeeds, structured-data validation, Lighthouse ≥ 90 on perf/SEO
- No PR may merge with failing checks
- Methodology page version bumps require explicit changelog entry

### Security & ops
- Secrets in GitHub Actions secrets only; never in repo
- Cloudflare Worker secrets in CF dashboard; rotation calendar in `ops/secrets-rotation.md`
- Backup: nightly `git bundle` of repo + `data/` to a separate location

### Documentation
- `README.md` — public, what Veridoro is, how to read scores
- `CONTRIBUTING.md` — how vendors request a re-score (PR with evidence, not email)
- `automation/README.md` — what each routine does, how to disable, who to call

---

## Critical-path summary

```
M0 infra ──► M1 methodology ──► M1 seed corpus (25–40 tools)
                                       │
                                       ▼
                            M2 routines (PR-gated)
                                       │
                                       ▼
                          M3 distribution + tracking
                                       │
                                ┌──────┴──────┐
                                ▼             ▼
                       (gate: ≥3 links?)  pause & re-eval
                                ▼
                           M4 audit hook
                                ▼
                          M5 Monitor (paid)
                                ▼
                        M6 deepen vs generalize
```

The two hardest gates are real: M1's manual scoring throughput, and M3's distribution outcomes. Both are explicitly built into the plan so we don't sleepwalk past them.

---

*This plan tracks the BRD. If a BRD section is revised, find and update the corresponding milestone here in the same PR.*
