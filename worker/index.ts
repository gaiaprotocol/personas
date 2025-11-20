import { tabConfig } from "../shared/tab-config";
import { website } from "./pages/website";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, ""); // trailing slash 정리

    if (pathname === "/api/envtype") {
      return new Response(env.ENV_TYPE);
    }

    // ============================
    // 0) /profile/svg/*, /post/svg/* → /svg/*
    // ============================
    if (
      pathname.startsWith("/profile/svg/") ||
      pathname.startsWith("/post/svg/")
    ) {
      // /profile/svg/test.svg → test.svg
      // /post/svg/icons/user.svg → icons/user.svg
      const segments = pathname.split("/");
      // ["", "profile", "svg", "test.svg", ...]
      const rest = segments.slice(3).join("/"); // svg 뒤의 나머지 경로

      const targetPath = `/svg/${rest}`; // /svg/test.svg

      // 단순 리다이렉트 (URL 바뀌어도 괜찮으면 이 방법 사용)
      const targetUrl = new URL(targetPath, request.url);
      return Response.redirect(targetUrl.toString(), 302);
    }

    // ============================
    // 1) /post/{postId}
    // ============================
    if (pathname.startsWith("/post/")) {
      const segments = pathname.split("/");
      const postId = segments[2];

      if (!postId) return new Response("Not Found", { status: 404 });

      const routeUrl = new URL(request.url);
      routeUrl.searchParams.set("postId", postId);

      return new Response(
        website(routeUrl.search, { type: "post", post: { id: postId } }),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // ============================
    // 2) /profile/{walletAddress}
    // ============================
    if (pathname.startsWith("/profile/")) {
      const segments = pathname.split("/");
      const walletAddress = segments[2];

      if (!walletAddress) return new Response("Not Found", { status: 404 });

      const routeUrl = new URL(request.url);
      routeUrl.searchParams.set("profileWallet", walletAddress);

      return new Response(
        website(routeUrl.search, {
          type: "profile",
          profile: { walletAddress },
        }),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // ============================
    // 3) 기존 Tab 라우트
    // ============================
    const firstSegment = pathname.split("/")[1];
    const isTabRoute =
      pathname === "" ||
      tabConfig.some((tab) => tab.path === `/${firstSegment}`);

    if (isTabRoute) {
      return new Response(website(url.search), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // ============================
    // 4) 나머지는 404
    // ============================
    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
