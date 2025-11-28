import { PersonaPost } from "../../shared/types/post";

declare const GAIA_API_BASE_URI: string;

export type PostWithRepliesResult = {
  post: PersonaPost;
  replyPosts: PersonaPost[];
};

/**
 * 특정 post id의 포스트 + 댓글 목록 조회
 * 서버 엔드포인트: GET /post-with-replies?id=<postId>
 */
export async function fetchPostWithReplies(
  postId: number,
): Promise<PostWithRepliesResult> {
  if (!Number.isFinite(postId) || postId <= 0) {
    throw new Error('Invalid post id.');
  }

  const url = `${GAIA_API_BASE_URI}/post-with-replies?id=${encodeURIComponent(
    String(postId),
  )}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    let message = `Failed to fetch post with replies: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return (await res.json()) as PostWithRepliesResult;
}
