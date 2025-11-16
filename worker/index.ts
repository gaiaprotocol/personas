import { home } from "./pages/home";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/envtype') return new Response(env.ENV_TYPE);

    if (url.pathname === '/') return new Response(home(), { headers: { 'Content-Type': 'text/html' } });

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
