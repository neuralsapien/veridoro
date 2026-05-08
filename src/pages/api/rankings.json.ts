import type { APIRoute } from 'astro';
import { getRankedTools } from '../../data/tools';

export const GET: APIRoute = () => {
  const ranked = getRankedTools().map((tool, i) => ({
    rank: i + 1,
    slug: tool.slug,
    name: tool.name,
    vendor: tool.vendor,
    composite: tool.composite,
    category: tool.category,
    url: `https://veridoro.com/tools/${tool.slug}/`,
  }));

  return new Response(JSON.stringify({ generated_at: '2026-05-07', rankings: ranked }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
