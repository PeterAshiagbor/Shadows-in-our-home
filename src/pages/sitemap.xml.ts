import type { APIRoute } from 'astro';

// One-page site, so a hand-rolled sitemap is simplest and stays in sync with
// `site` (no extra integration to configure or break the build).
export const GET: APIRoute = ({ site }) => {
  const home = (site ?? new URL('https://shadows-in-our-home.vercel.app/')).href;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${home}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
