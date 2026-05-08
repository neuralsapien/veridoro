import type { APIRoute } from 'astro';
import { tools } from '../../data/tools';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(tools, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
