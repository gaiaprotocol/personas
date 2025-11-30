import { website } from "../pages/website";

export async function renderPostPage(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const postIdStr = url.pathname.split("/")[2];
  const postId = Number(postIdStr);

  if (!postIdStr || Number.isNaN(postId)) {
    return new Response("Invalid Post ID", { status: 400 });
  }

  const data = await (env.API_WORKER as any).getPersonaPostWithReplies(postId);
  if (!data) {
    return new Response("Post Not Found", { status: 404 });
  }

  url.searchParams.set("postId", postIdStr);

  return new Response(
    website(url.search, {
      type: "post",
      post: data.post,
      replies: data.replies,
    }),
    { headers: { "Content-Type": "text/html" } },
  );
}
