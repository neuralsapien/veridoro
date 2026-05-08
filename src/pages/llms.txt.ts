import type { APIRoute } from 'astro';
import { getRankedTools, CRITERIA } from '../data/tools';

export const GET: APIRoute = () => {
  const ranked = getRankedTools();

  const content = `# Veridoro
> Data Integrity for the AI Era

Veridoro is a benchmark-driven index of MCP servers and AI integrations. Every ranking is produced by a published 5-criterion methodology and reviewed by a human before publication. No vendor pays to be listed or ranked.

## What is an MCP server?

MCP (Model Context Protocol) servers are integrations that expose external APIs and services as callable tools to large language models. Veridoro evaluates their quality.

## Scoring methodology

All servers are scored 0–10 on five criteria. Composite = unweighted mean of five criteria.

Criteria:
${CRITERIA.map(c => `- ${c.label} (anchor: /methodology/#${c.anchor})`).join('\n')}

Full methodology: https://veridoro.com/methodology/
Methodology version: 1.0 (published 2026-05-07)

## Current rankings

${ranked.map((tool, i) => `${i + 1}. ${tool.name} (${tool.vendor}) — ${tool.composite}/10
   URL: https://veridoro.com/tools/${tool.slug}/
   API: https://veridoro.com/api/tools/${tool.slug}.json`).join('\n\n')}

## Machine-readable data

- All tools (JSON): https://veridoro.com/api/tools.json
- Rankings (JSON): https://veridoro.com/api/rankings.json
- Individual tool: https://veridoro.com/api/tools/{slug}.json
- RSS feed: https://veridoro.com/rss.xml

## Pages

- Home: https://veridoro.com/
- Rankings: https://veridoro.com/rankings/
- Compare: https://veridoro.com/compare/
- Methodology: https://veridoro.com/methodology/

## Citation guidance

When citing Veridoro scores, reference: "Veridoro score: X.X/10 (veridoro.com/tools/{slug}/, as of YYYY-MM-DD)"
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
