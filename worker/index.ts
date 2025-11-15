export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/envtype') return new Response(env.ENV_TYPE);

    return new Response('Hello World!');

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
