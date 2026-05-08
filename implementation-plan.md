# Veridoro — Implementation Plan (v2)

**Derived from:** BRD v2 (2026-05-08) — `llms/brd.md`
**Supersedes:** Implementation Plan v1 (2026-05-07)

Each milestone is decomposed into concrete engineering tasks with exit criteria. The plan is sequenced so each month's work unblocks the next; nothing in a later month assumes a non-deterministic outcome from an earlier one.

**Scope discipline:** This plan implements only what BRD v2 calls for. No vendor dashboard, no second niche, no pay-for-placement infrastructure, no buyer/vendor monetization until validation hits.

**Operating model:** Discovery → Rating → Display, per BRD §2.

---

## Milestone 0 — Repo & infra (DONE)

| # | Task | Status |
|---|---|---|
| 0.1 | GitHub repo `neuralsapien/veridoro` provisioned | ✅ |
| 0.2 | GitHub Pages enabled, source = GitHub Actions | ✅ |
| 0.3 | DNS configured at GoDaddy, apex + www → Pages | ✅ |
| 0.4 | Astro skeleton scaffolded (Astro 5, MDX, sitemap, RSS) | ✅ |
| 0.5 | CI/CD: GitHub Actions builds on PR, deploys on `main` push | ✅ |
| 0.6 | CNAME at `public/CNAME` survives Astro build | ✅ |
| 0.7 | Branch protection on `main` | ⚠️ to confirm in repo settings |
| 0.8 | Custom domain HTTPS cert | ⏳ provisioning (Let's Encrypt) |

---

## Milestone 1 — Niche lock + Discovery v0 (Month 1)

**BRD goal:** Sales/RevOps committed; Discovery infrastructure running; methodology v1.0 shaped from real public-discussion mining (not from priors).

### 1A. Site refactor: tier system + niche namespace

The current site (deployed v0) is laid out for "MCP servers in general." It needs to become "Sales/RevOps AI tools" with a tier-aware display and niche-namespaced URLs that scale to future niches.

- [ ] Extend `Tool` type in `src/data/tools.ts`:
  - `niche: 'sales' | string`
  - `tier: 'top_3' | 'evaluated' | 'indexed'`
  - `discovered_at: string` (ISO date)
  - `benchmark_results?: BenchmarkResult[]` (forward-compatible)
- [ ] Restructure pages under `/sales/...` namespace:
  - `/sales/` — niche home (becomes the new index for Sales/RevOps)
  - `/sales/methodology/v1.0/` — niche-specific methodology
  - `/sales/rankings/` — three-tier display
  - `/sales/discovery/` — newly indexed feed (recency signal)
  - `/sales/tools/<slug>/` — per-tool pages, branched by tier
- [ ] Three branches in `[slug].astro` based on `tier`:
  - `top_3` — full strength review (current template, slightly polished — strengths-only framing)
  - `evaluated` — composite + methodology link + evidence URLs + Loss Report CTA
  - `indexed` — name, vendor, discovered_at, "evaluation pending"
- [ ] Add `/vendors/` page — Loss Report explainer + tool submission form stub (Cloudflare Worker comes later)
- [ ] Update site-wide nav: Sales rankings, Discovery, Methodology, Vendors
- [ ] Update home page (`/`) to lead with "Verified AI for Sales / RevOps. More niches coming." — link to `/sales/`
- [ ] Redirects from legacy v1 URLs (`/methodology/`, `/rankings/`, `/tools/<slug>/`) → niche-namespaced equivalents

**Why now:** moving the schema and routing before content is cheap; doing it after we've published 30 tool pages would be expensive and break inbound links.

**Exit:** Site builds, all redirects pass, three new tools (one per tier) render correctly under `/sales/...`.

### 1B. Discovery v0 — automated tool ingestion

- [ ] `automation/routines/tool-discovery/` directory created
- [ ] `automation/sources/sales-revops.json` — seed list of source URLs (ProductHunt categories, GitHub topics, awesome-list URLs, YC batch pages)
- [ ] **Tool Discovery routine** (daily 04:00 via Cowork):
  - Fetches each source
  - Diffs against `src/data/tools/*.json` and `automation/discovery/queue.json`
  - Adds new candidates to queue with `tier: 'indexed'` and `discovered_at`
  - Opens PR titled `Discovery: YYYY-MM-DD — N new candidates`
- [ ] Founder reviews PR weekly; promotes from `indexed` → `evaluated` queue manually
- [ ] CI check: every promotion to `evaluated` requires a populated tool record (vendor, url, repo, description, category)

**Exit:** Three consecutive successful daily Discovery PRs; founder merges within 7 days each.

### 1C. Discovery v0 — practitioner & sentiment mining

This is the part that does the practitioner research without warm-network access.

- [ ] **Practitioner Discovery routine** (daily 06:00):
  - Pulls top posts from r/sales, r/RevOps, Sales Hacker forum
  - Pulls recent episodes (RSS) from 5 seeded podcasts (Pavilion Podcast, 30 Minutes to President's Club, Sales Logic, Modern Sales Pros, GTM Live)
  - LinkedIn manual for now (no clean API) — founder tags 2–3 notable posts/week into `automation/discovery/practitioner-notes/YYYY-WW.md`
  - Outputs PR with raw findings (caveman register, per CLAUDE.md §5)
- [ ] **Weekly Editorial routine** (Friday):
  - Aggregates the week's findings
  - Translates caveman → polished prose for any content destined for the site
  - Drafts `/sales/research/YYYY-WW.mdx` with sourced quotes and trends
  - Opens PR for founder review

**Exit:** Two consecutive weekly editorial PRs published; corpus of mined criteria reaches ≥10 distinct themes practitioners care about.

### 1D. Methodology v1.0 (Sales/RevOps shape)

**Sequencing rule:** methodology is drafted **after** ≥2 weeks of mining, not before. The criteria reflect what mining surfaces, not our priors.

- [ ] Aggregate mining output into criterion candidates
- [ ] Draft 5 criteria + 0–10 scale + scoring rubric per criterion
- [ ] Each criterion has: definition, what we look for at 0 / 5 / 10, public-evidence requirement
- [ ] Publish at `/sales/methodology/v1.0/` with frozen URL, JSON-LD `Article`
- [ ] Reference back to the mining sources that informed each criterion (transparency about how methodology was built)

**Exit:** Methodology page live, indexable, every criterion has a stable anchor (`#auth-data-handling`, `#task-accuracy`, etc.), JSON-LD validates.

### 1E. Tool corpus v1 (8 tools)

- [ ] From mining output, identify 8 tools to score in M2
- [ ] One `src/data/tools/<slug>.json` per tool, populated with metadata (no scores yet)
- [ ] Tier assignment deferred until M2 (after scoring)

**Exit:** 8 tool records committed, all building, all rendering as `tier: 'indexed'` until scored.

---

## Milestone 2 — First benchmark published (Month 2)

**BRD goal:** Public top-3 leaderboard with strength reviews; full "Also evaluated" tier for the rest of the corpus.

### 2A. Score the corpus
- [ ] Score all 8 tools against methodology v1.0
- [ ] Every score has `evidence_url` (CI rejects empty evidence)
- [ ] Composite computed (mean of 5 criteria, 1 decimal)
- [ ] Tier assigned: top 3 by composite → `top_3`; remaining 5 → `evaluated`
- [ ] Founder signs off on every score (PR review checkbox)

### 2B. Top 3 strength reviews
- [ ] Per-tool MDX page for top 3 with:
  - Strength writeup per criterion (50–150 words, self-contained, polished prose)
  - Composite score and per-criterion breakdown
  - Evidence URLs visible per score
  - "Best for" one-liner identifying the buyer use case where this tool is strongest
  - JSON-LD: `SoftwareApplication` + `Review` + `AggregateRating`
- [ ] No public weakness call-outs anywhere on these pages

### 2C. "Also evaluated" rendering
- [ ] Composite + last reviewed date + methodology link only
- [ ] Per-criterion scores hidden from public view (data exists in JSON file but not rendered)
- [ ] Inline CTA: "Vendors: how is this score calculated? → Loss Report"

### 2D. Distribution sprint (light, niche-targeted)
- [ ] Submit to 5 Sales/RevOps newsletters with a one-paragraph note + link
- [ ] Post in 3 niche communities (r/RevOps, r/sales, RevGenius community where allowed)
- [ ] Reach out to 3 niche publications (Sales Hacker, Modern Sales Pros, GTM Partners) with the leaderboard
- [ ] Email all 8 evaluated vendors with right-of-reply offer

**Exit:** Leaderboard live; all 8 tools have published pages; first distribution wave dispatched; tracking spreadsheet started.

---

## Milestone 3 — Validation distribution (Month 3)

**BRD goal:** Read meaningful signal. Diagnose whether the premise is right.

### 3A. Tracking infra
- [ ] `analytics/backlinks.csv` — weekly snapshot of inbound links
- [ ] `analytics/ai-citations.md` — weekly manual checks on 20 standard niche queries across ChatGPT / Claude / Perplexity
- [ ] `analytics/practitioner-engagement.md` — log of any DM, comment, share, mention with author + date + signal type
- [ ] `analytics/vendor-responses.md` — log of any vendor outreach (incoming or outgoing), with tone and ask
- [ ] Server log parser for AI bot crawler hits (`ChatGPT-User`, `Claude-Web`, `PerplexityBot`, `GPTBot`, `ClaudeBot`)

### 3B. Validation signal targets (by end of Month 3)
- [ ] ≥1 unsolicited practitioner DM with specific feedback
- [ ] ≥1 vendor response (any tone)
- [ ] ≥1 industry publication mention or backlink
- [ ] AI citation tracking baseline: cited on at least 1 of the 20 standard queries on at least 1 engine
- [ ] ≥3 inbound tool submissions

### 3C. Decision gate at end of Month 3
- **2+ targets hit** → proceed to M4 (methodology iteration + corpus expansion)
- **0–1 targets hit** → pause. Diagnose: wrong niche, wrong methodology, wrong audience framing, wrong distribution? Document in `decisions/2026-08-validation-gate.md`. Decide whether to iterate, pivot niche, or pivot model.

---

## Milestone 4 — Methodology iteration & corpus expansion (Month 4)

Conditional on Month 3 validation hitting ≥2 targets.

### 4A. Methodology v1.1 (if warranted)
- [ ] Read mining + feedback signal accumulated since v1.0
- [ ] If material change → publish v1.1 at `/sales/methodology/v1.1/`, freeze v1.0 at its existing URL
- [ ] Re-score all 8 tools against v1.1; new composite scores; tier may shift
- [ ] Methodology v1.1 page must explicitly diff against v1.0 and explain why

### 4B. Corpus expansion
- [ ] Promote 5–7 more tools from `indexed` → `evaluated` queue
- [ ] Score against v1.0 (or v1.1 if bumped)
- [ ] Total corpus now 12–15 tools across `top_3` and `evaluated` tiers

### 4C. First trends piece
- [ ] `/sales/research/trends-2026-q3/` (or analogous slug)
- [ ] Original analysis from accumulated discovery data
- [ ] Quoted practitioner posts (with link + permission where applicable)
- [ ] Citation-bait: question-shaped headers, structured data, link-rich
- [ ] Distribution to same channels as M2

---

## Milestone 5 — First productization (Month 5, conditional)

Conditional on Month 3 validation + Month 4 traction. Only pursued if there is real organic demand signal (vendor reaches out asking why they didn't make top 3, or buyer asks for a custom shortlist).

### 5A. Loss Report (if vendor demand)
- [ ] `/vendors/loss-report/` page — explainer, deliverable contents, pricing, sample anonymized excerpt
- [ ] Stripe checkout (one-time payment)
- [ ] Pilot delivery to one paying vendor
- [ ] Template: `automation/templates/loss-report.md` — structured factual diagnostic, no coaching, no improvement promises

### 5B. Verification Report (if buyer demand)
- [ ] `/buyers/verification/` page — explainer for self-serve and custom tiers
- [ ] Stripe checkout (self-serve tier)
- [ ] Custom tier handled via founder email + scoping call
- [ ] Pilot delivery to one paying buyer

### 5C. Cost & ops
- [ ] If we run benchmark API calls per report: spend dashboard, daily cap, monthly hard limit
- [ ] Per-report cost target documented per product

**Exit:** ≥1 paying customer of either product; pilot delivered end-to-end; cost-per-report measured.

---

## Milestone 6 — Decide the next bet (Month 6)

Decision gate, not implementation work.

### 6A. Data assembly
- [ ] One-page summary: niche-page traffic, AI-referral split, crawler hits per engine, validation signals hit, paid pilots delivered, qualitative practitioner feedback themes
- [ ] Generated from `analytics/` artifacts

### 6B. Decision rule (from BRD §4)
Three options:
1. **Deepen Sales/RevOps** — methodology v2, deeper benchmarks, larger corpus, possibly part-time researcher
2. **Expand to second niche** — only if Sales/RevOps cited in top 3 on ≥2 LLMs for niche queries
3. **Pivot** — wrong niche, wrong audience, or wrong model

Decision recorded as `decisions/2026-11-vertical-strategy.md` — dated, founder-signed.

### 6C. Either-path prep
- If deepen: scope methodology v2.0; consider task-based benchmarking (job-performance criterion); draft hiring brief for part-time researcher
- If expand: shortlist of next niche candidates using the same criteria as the original Sales/RevOps pick; identify warm connections that have developed in the interim
- If pivot: read signal honestly; rewrite BRD v3

---

## Cross-cutting workstreams (always-on from M1)

### Quality gates
- Every PR: schema validation, build succeeds, structured-data validation, Lighthouse ≥ 90 perf/SEO
- No PR may merge with failing checks
- Methodology page version bumps require explicit changelog entry
- Display rules (BRD §6) enforced: no public weakness call-outs for non-top-3; composite-only display for evaluated-tier

### Security & ops
- Per CLAUDE.md §2: no secrets in repo; .env* gitignored; least-privilege CI; pinned action SHAs
- Cloudflare Worker secrets (when added) in CF dashboard; rotation calendar
- Backup: nightly `git bundle` once we have automation routines writing to repo

### Documentation
- `README.md` — public, what Veridoro is, current niche, methodology link
- `CONTRIBUTING.md` — how vendors request a re-score (PR with evidence) or submit a tool
- `automation/README.md` — what each routine does, schedule, ownership
- `CLAUDE.md` — internal LLM working rules (gitignored)

### Working style (per CLAUDE.md §5)
- Research/mining/notes → caveman register (`/caveman` skill at session start)
- Public-facing output → polished prose
- Translation step is explicit: caveman notes → prose before they enter `src/`

---

## Critical-path summary

```
M0 infra (DONE) ──► M1 niche lock + Discovery v0
                              │
                              ▼
                    M2 first benchmark (8 tools, top 3 + 5)
                              │
                              ▼
                    M3 validation distribution
                              │
                       ┌──────┴──────┐
                       ▼             ▼
              (2+ signals?)      0–1 signals
                       │              │
                       ▼              ▼
               M4 iterate +     pause + diagnose
               expand corpus    (decisions/...md)
                       │
                       ▼
              M5 first paid pilot
              (vendor or buyer)
                       │
                       ▼
              M6 deepen / expand / pivot
```

The two hardest gates are real: M1's methodology shape (must come from mining, not priors) and M3's validation signal (must be honest about what counts). Both are explicit in the plan.

---

*This plan tracks BRD v2. If a BRD section is revised, find and update the corresponding milestone in the same PR.*
