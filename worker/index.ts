import { tabConfig } from "../shared/tab-config";
import { renderPostPage } from "./handlers/post";
import { renderProfilePage } from "./handlers/profile";
import { website } from "./pages/website";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "");

    if (pathname === "/envtype") {
      return new Response(env.ENV_TYPE);
    }

    if (pathname.startsWith("/profile/svg/") || pathname.startsWith("/post/svg/")) {
      const segments = pathname.split("/");
      const rest = segments.slice(3).join("/");
      const targetUrl = new URL(`/svg/${rest}`, request.url);
      return Response.redirect(targetUrl.toString(), 302);
    }

    if (pathname.startsWith("/post/")) {
      return renderPostPage(request, env);
    }

    if (pathname.startsWith("/profile/")) {
      return renderProfilePage(request, env);
    }

    const firstSegment = pathname.split("/")[1];
    const isTabRoute =
      pathname === "" ||
      tabConfig.some((tab) => tab.path === `/${firstSegment}`);

    if (isTabRoute) {
      return new Response(website(url.search), {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
