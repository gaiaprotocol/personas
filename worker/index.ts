import { tabConfig } from "../shared/tab-config";
import { website } from "./pages/website";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, ""); // trailing slash 정리

    if (pathname === '/api/envtype') return new Response(env.ENV_TYPE);

    const firstSegment = pathname.split("/")[1]; // /explore/123 → "explore"
    const isTabRoute = pathname === '' || tabConfig.some(tab => tab.path === `/${firstSegment}`);
    if (isTabRoute) return new Response(website(url.search), { headers: { 'Content-Type': 'text/html' } });

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
