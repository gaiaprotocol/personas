import { PersonaPost } from "../types/post";
import { AnyBuilder } from "./b";
import { avatarInitialFromName, formatRelativeTimeFromSeconds, shortenAddress } from "./utils";

export function post(
  b: AnyBuilder,
  post: PersonaPost,
  replyPosts: PersonaPost[],
) {
  // 메인 포스트 표시용 데이터
  const authorAddress = post.author;
  const authorShort = shortenAddress(authorAddress);
  const authorHandle = `@${authorShort}`;
  const avatarInitial = avatarInitialFromName(authorShort);
  const timeLabel = formatRelativeTimeFromSeconds(post.createdAt);

  let mainLiked = false; // 클라이언트 로컬 상태
  let mainLikes = post.likeCount ?? 0;
  let replyCount = post.commentCount ?? replyPosts.length;

  // ---- 요소 레퍼런스 ----
  let likeActionEl: HTMLElement | null = null;
  let likeCountEl: HTMLElement | null = null;
  let repliesCountEl: HTMLElement | null = null;
  let replyListEl: HTMLElement | null = null;
  let replyInputEl: HTMLTextAreaElement | null = null;
  let replyButtonEl: HTMLButtonElement | null = null;

  // ---- 메인 포스트 좋아요 토글 ----
  function togglePostLike() {
    if (!likeCountEl || !likeActionEl) return;
    mainLiked = !mainLiked;
    mainLikes += mainLiked ? 1 : -1;
    if (mainLikes < 0) mainLikes = 0;
    likeCountEl.textContent = String(mainLikes);
    likeActionEl.classList.toggle("liked", mainLiked);
  }

  // ---- Reply UI 전용 타입 ----
  type ReplyView = {
    id: number | string;
    post: PersonaPost | null; // 새로 작성한 답글은 null
    author: string;
    handle: string;
    avatarInitial: string;
    timeLabel: string;
    content: string;
    likes: number;
    liked: boolean;
  };

  const replyViews: ReplyView[] = replyPosts.map((rp) => {
    const short = shortenAddress(rp.author);
    return {
      id: rp.id,
      post: rp,
      author: short,
      handle: `@${short}`,
      avatarInitial: avatarInitialFromName(short),
      timeLabel: formatRelativeTimeFromSeconds(rp.createdAt),
      content: rp.content,
      likes: rp.likeCount ?? 0,
      liked: false,
    };
  });

  // ---- 개별 답글 노드 생성 ----
  function createReplyNode(reply: ReplyView): HTMLElement | string {
    const likeRaw = b("div.post-reply-actions", `❤ ${reply.likes}`);

    if (typeof likeRaw !== "string") {
      const likeEl = likeRaw as HTMLElement;
      if (reply.liked) {
        likeEl.classList.add("liked");
      }
      likeEl.onclick = (ev) => {
        ev.stopPropagation();
        reply.liked = !reply.liked;
        reply.likes += reply.liked ? 1 : -1;
        if (reply.likes < 0) reply.likes = 0;
        likeEl.textContent = `❤ ${reply.likes}`;
        likeEl.classList.toggle("liked", reply.liked);
      };
    }

    const profileHref = `/profile/${reply.author}`;

    const item = b(
      "div.post-reply-item",
      { "data-id": reply.id },
      b("div.post-reply-avatar-small", reply.avatarInitial),
      b(
        "div.post-reply-body",
        b(
          "div.post-reply-header",
          b(
            "a.post-reply-author",
            { href: profileHref },
            reply.author,
          ),
          b("span.post-reply-handle", reply.handle),
          b("span", "·"),
          b("span.post-reply-time", reply.timeLabel),
        ),
        b("div.post-reply-content", reply.content),
        likeRaw,
      ),
    );

    return item;
  }

  // ---- 답글 전송 ----
  function handleReplySubmit() {
    if (!replyInputEl || !replyButtonEl) return;

    const raw = replyInputEl.value ?? "";
    const text = raw.trim();
    if (!text) return;

    const nowSec = Math.floor(Date.now() / 1000);

    const newReply: ReplyView = {
      id: `local-${Date.now()}`,
      post: null,
      author: "You",
      handle: "@you",
      avatarInitial: "Y",
      timeLabel: formatRelativeTimeFromSeconds(nowSec),
      content: text,
      likes: 0,
      liked: false,
    };

    replyViews.unshift(newReply);
    replyCount += 1;

    if (repliesCountEl) {
      repliesCountEl.textContent = String(replyCount);
    }

    replyInputEl.value = "";
    replyButtonEl.disabled = true;

    if (replyListEl) {
      const node = createReplyNode(newReply);
      if (typeof node !== "string") {
        replyListEl.insertBefore(node as HTMLElement, replyListEl.firstChild);
      }
    }
  }

  // ---- 헤더 (뒤로가기) ----
  const header = b(
    "div.post-header",
    b(
      "button.post-back-btn",
      {
        type: "button",
        onclick: () => {
          if (typeof window !== "undefined" && window.history) {
            window.history.back();
          }
        },
      },
      b("div.post-back-icon"),
    ),
    b("div.post-title", "Post"),
  );

  // ---- 메인 포스트: 통계 요소 ----
  const likeCountRaw = b(
    "span.post-main-stat-strong",
    String(mainLikes),
  );
  if (typeof likeCountRaw !== "string") {
    likeCountEl = likeCountRaw as HTMLElement;
  }

  const repliesCountRaw = b(
    "span.post-main-stat-strong",
    String(replyCount),
  );
  if (typeof repliesCountRaw !== "string") {
    repliesCountEl = repliesCountRaw as HTMLElement;
  }

  const stats = b(
    "div.post-main-stats",
    b("div.post-main-stat", repliesCountRaw, b("span", "Replies")),
    b(
      "div.post-main-stat",
      b("span.post-main-stat-strong", String(post.repostCount ?? 0)),
      b("span", "Reposts"),
    ),
    b("div.post-main-stat", likeCountRaw, b("span", "Likes")),
  );

  // ---- 메인 포스트 좋아요 액션 ----
  const likeActionRaw = b(
    "div.post-main-action.post-main-like",
    "Like",
  );
  if (typeof likeActionRaw !== "string") {
    likeActionEl = likeActionRaw as HTMLElement;
    likeActionEl.onclick = () => togglePostLike();
  }

  // ---- 메인 포스트 attachments (간단 이미지 렌더) ----
  const attachments = post.attachments;
  let attachmentsNode: HTMLElement | string | null = null;

  if (attachments && "images" in attachments && Array.isArray(attachments.images) && attachments.images.length) {
    const imageNodes = attachments.images.map((src) =>
      b("img.post-main-attachment-image", { src, loading: "lazy" }),
    );
    attachmentsNode = b(
      "div.post-main-attachments",
      ...imageNodes,
    );
  }

  // ---- 메인 포스트 본문 ----
  const profileHref = `/profile/${authorAddress}`;

  const mainPost = b(
    "div.post-main",
    b("div.post-avatar", avatarInitial),
    b(
      "div.post-main-body",
      b(
        "div.post-main-header",
        b(
          "a.post-main-author",
          { href: profileHref },
          authorShort,
        ),
        b("div.post-main-handle", authorHandle),
      ),
      b("div.post-main-content", post.content),
      attachmentsNode || "",
      b(
        "div.post-main-meta",
        `${timeLabel} · Shared with persona holders`,
      ),
      stats,
      b(
        "div.post-main-actions",
        b("div.post-main-action", "Reply"),
        b("div.post-main-action", "Repost"),
        likeActionRaw,
      ),
    ),
  );

  // ---- 답글 작성 폼 ----
  const replyInputRaw = b("textarea.post-reply-input", {
    placeholder: "Reply to this post...",
  });
  if (typeof replyInputRaw !== "string") {
    replyInputEl = replyInputRaw as HTMLTextAreaElement;

    replyInputEl.addEventListener("input", () => {
      const value = replyInputEl!.value.trim();
      if (replyButtonEl) {
        replyButtonEl.disabled = value.length === 0;
      }
    });

    replyInputEl.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        handleReplySubmit();
      }
    });
  }

  const replyButtonRaw = b(
    "button.post-reply-btn",
    { disabled: true },
    "Reply",
  );
  if (typeof replyButtonRaw !== "string") {
    replyButtonEl = replyButtonRaw as HTMLButtonElement;
    replyButtonEl.onclick = () => handleReplySubmit();
  }

  const replyComposer = b(
    "div.post-reply-composer",
    b("div.post-reply-avatar", "Y"),
    b(
      "div.post-reply-main",
      replyInputRaw,
      b("div.post-reply-footer", replyButtonRaw),
    ),
  );

  // ---- 초기 답글 리스트 ----
  const initialReplyNodes = replyViews.map((rv) => createReplyNode(rv));

  const replyListRaw = b("div.post-replies", ...initialReplyNodes);
  if (typeof replyListRaw !== "string") {
    replyListEl = replyListRaw as HTMLElement;
  }

  const repliesBlock = b(
    "div",
    b("div.post-replies-label", "Replies"),
    replyListRaw,
  );

  // ---- 전체 래퍼 ----
  const root = b(
    "section.post-wrapper",
    b(
      "div.post-inner",
      header,
      b("div.post-divider"),
      mainPost,
      replyComposer,
      repliesBlock,
    ),
  );

  return root;
}

