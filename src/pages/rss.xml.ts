import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getRankedTools } from '../data/tools';

export const GET: APIRoute = (context) => {
  const ranked = getRankedTools();
  return rss({
    title: 'Veridoro — MCP Server Rankings',
    description: 'Benchmark-driven rankings of MCP servers and AI integrations. Score changes, new reviews, and methodology updates.',
    site: context.site!,
    items: ranked.map((tool) => ({
      title: `${tool.name} — Score: ${tool.composite}/10`,
      description: tool.description,
      link: `/tools/${tool.slug}/`,
      pubDate: new Date(tool.last_reviewed_at),
    })),
    customData: '<language>en-us</language>',
  });
};
