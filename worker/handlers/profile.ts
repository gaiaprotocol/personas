import { website } from "../pages/website";

export async function renderProfilePage(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const wallet = url.pathname.split("/")[2];

  if (!wallet) {
    return new Response("Invalid Wallet Address", { status: 400 });
  }

  const { profile, posts } = await (env.API_WORKER as any).getProfileWithPosts(wallet);

  // profile() 컴포넌트가 null 허용 안하면 여기서 기본값 만들어서 넘겨도 됨
  url.searchParams.set("profileWallet", wallet);

  return new Response(
    website(url.search, {
      type: "profile",
      profile: profile ?? {
        account: wallet,
        nickname: null,
        bio: null,
        avatarUrl: null,
        bannerUrl: null,
        socialLinks: null,
        createdAt: 0,
        updatedAt: null,
      },
      posts,
    }),
    { headers: { "Content-Type": "text/html" } },
  );
}
