import type { APIRoute, GetStaticPaths } from 'astro';
import { tools, getToolBySlug } from '../../../data/tools';

export const getStaticPaths = (() => {
  return tools.map((tool) => ({ params: { slug: tool.slug } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const tool = getToolBySlug(params.slug as string);
  if (!tool) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }
  return new Response(JSON.stringify(tool, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
