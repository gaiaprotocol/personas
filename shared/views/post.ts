import { AnyBuilder } from "./b";

interface Post {
  id: string;
  authorName: string;
  handle: string;
  avatarInitial: string;
  time: string;   // "2h", "5m", "Now"
  content: string;
  replies: number;
  reposts: number;
  likes: number;
  liked?: boolean;
}

interface Reply {
  id: string;
  authorName: string;
  handle: string;
  avatarInitial: string;
  time: string;
  content: string;
  likes: number;
  liked?: boolean;
}

export function post(b: AnyBuilder) {

  // ---- 샘플 데이터 ----
  let postData: Post = {
    id: 'p1',
    authorName: 'Noah Tech',
    handle: '@noahtech',
    avatarInitial: 'N',
    time: '2h',
    content:
      'Just shipped a new feature for my persona holders: realtime on-chain alerts 🔔\n\nIf you hold at least 1 fragment, you’ll start seeing it today.',
    replies: 3,
    reposts: 7,
    likes: 134
  };

  let replies: Reply[] = [
    {
      id: 'r1',
      authorName: 'Luna Park',
      handle: '@lunalogs',
      avatarInitial: 'L',
      time: '1h',
      content: 'Tried it earlier — UX feels great. Thanks for shipping this so fast ⚡️',
      likes: 12
    },
    {
      id: 'r2',
      authorName: 'You',
      handle: '@you',
      avatarInitial: 'Y',
      time: '45m',
      content: 'This is exactly what I needed for tracking whales 🐋',
      likes: 5,
      liked: true
    },
    {
      id: 'r3',
      authorName: 'Marcus Dev',
      handle: '@marcusdev',
      avatarInitial: 'M',
      time: '10m',
      content: 'Can you open source some of the alert logic? Would love to contribute.',
      likes: 0
    }
  ];

  // ---- 요소 레퍼런스 (클라이언트에서만 HTMLElement로 세팅) ----
  let likeActionEl: HTMLElement | null = null;
  let likeCountEl: HTMLElement | null = null;
  let repliesCountEl: HTMLElement | null = null;
  let replyListEl: HTMLElement | null = null;
  let replyInputEl: HTMLTextAreaElement | null = null;
  let replyButtonEl: HTMLButtonElement | null = null;

  // ---- 헬퍼: 메인 포스트 좋아요 토글 ----
  function togglePostLike() {
    if (!likeCountEl || !likeActionEl) return;

    postData.liked = !postData.liked;
    postData.likes += postData.liked ? 1 : -1;
    if (postData.likes < 0) postData.likes = 0;

    likeCountEl.textContent = String(postData.likes);
    likeActionEl.classList.toggle('liked', !!postData.liked);
  }

  // ---- 헬퍼: 개별 답글 노드 생성 ----
  function createReplyNode(reply: Reply): HTMLElement | string {
    const likeRaw = b(
      'div.post-reply-actions',
      `❤ ${reply.likes}`
    );

    // 클라이언트에서만 인터랙션 설정
    if (typeof likeRaw !== 'string') {
      const likeEl = likeRaw as HTMLElement;
      if (reply.liked) {
        likeEl.classList.add('liked');
      }
      likeEl.onclick = (ev) => {
        ev.stopPropagation();
        reply.liked = !reply.liked;
        reply.likes += reply.liked ? 1 : -1;
        if (reply.likes < 0) reply.likes = 0;
        likeEl.textContent = `❤ ${reply.likes}`;
        likeEl.classList.toggle('liked', !!reply.liked);
      };
    }

    const item = b(
      'div.post-reply-item',
      { 'data-id': reply.id },
      b('div.post-reply-avatar-small', reply.avatarInitial),
      b(
        'div.post-reply-body',
        b(
          'div.post-reply-header',
          b('span.post-reply-author', reply.authorName),
          b('span.post-reply-handle', reply.handle),
          b('span', '·'),
          b('span.post-reply-time', reply.time)
        ),
        b('div.post-reply-content', reply.content),
        likeRaw
      )
    );

    return item;
  }

  // ---- 헬퍼: 답글 전송 ----
  function handleReplySubmit() {
    if (!replyInputEl || !replyButtonEl) return;

    const raw = replyInputEl.value ?? '';
    const text = raw.trim();
    if (!text) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });

    const reply: Reply = {
      id: `reply-${Date.now()}`,
      authorName: 'You',
      handle: '@you',
      avatarInitial: 'Y',
      time,
      content: text,
      likes: 0,
      liked: false
    };

    replies.unshift(reply);
    postData.replies += 1;

    if (repliesCountEl) {
      repliesCountEl.textContent = String(postData.replies);
    }

    replyInputEl.value = '';
    replyButtonEl.disabled = true;

    if (replyListEl) {
      const node = createReplyNode(reply);
      if (typeof node !== 'string') {
        replyListEl.insertBefore(node as HTMLElement, replyListEl.firstChild);
      }
    }
  }

  // ---- 헤더 (뒤로가기) ----
  const header = b(
    'div.post-header',
    b(
      'button.post-back-btn',
      {
        type: 'button',
        onclick: () => {
          if (typeof window !== 'undefined' && window.history) {
            window.history.back();
          }
        }
      },
      b('div.post-back-icon')
    ),
    b('div.post-title', 'Post')
  );

  // ---- 메인 포스트: 통계 요소 생성 ----
  const likeCountRaw = b(
    'span.post-main-stat-strong',
    String(postData.likes)
  );
  if (typeof likeCountRaw !== 'string') {
    likeCountEl = likeCountRaw as HTMLElement;
  }

  const repliesCountRaw = b(
    'span.post-main-stat-strong',
    String(postData.replies)
  );
  if (typeof repliesCountRaw !== 'string') {
    repliesCountEl = repliesCountRaw as HTMLElement;
  }

  const stats = b(
    'div.post-main-stats',
    b(
      'div.post-main-stat',
      repliesCountRaw,
      b('span', 'Replies')
    ),
    b(
      'div.post-main-stat',
      b('span.post-main-stat-strong', String(postData.reposts)),
      b('span', 'Reposts')
    ),
    b(
      'div.post-main-stat',
      likeCountRaw,
      b('span', 'Likes')
    )
  );

  const likeActionRaw = b(
    'div.post-main-action.post-main-like',
    'Like'
  );
  if (typeof likeActionRaw !== 'string') {
    likeActionEl = likeActionRaw as HTMLElement;
    if (postData.liked) {
      likeActionEl.classList.add('liked');
    }
    likeActionEl.onclick = () => togglePostLike();
  }

  const mainPost = b(
    'div.post-main',
    b('div.post-avatar', postData.avatarInitial),
    b(
      'div.post-main-body',
      b(
        'div.post-main-header',
        b('div.post-main-author', postData.authorName),
        b('div.post-main-handle', postData.handle)
      ),
      b('div.post-main-content', postData.content),
      b(
        'div.post-main-meta',
        `${postData.time} · Shared with persona holders`
      ),
      stats,
      b(
        'div.post-main-actions',
        b('div.post-main-action', 'Reply'),
        b('div.post-main-action', 'Repost'),
        likeActionRaw
      )
    )
  );

  // ---- 답글 작성 폼 ----
  const replyInputRaw = b(
    'textarea.post-reply-input',
    {
      placeholder: 'Reply to this post...'
    }
  );
  if (typeof replyInputRaw !== 'string') {
    replyInputEl = replyInputRaw as HTMLTextAreaElement;

    replyInputEl.addEventListener('input', () => {
      const value = replyInputEl!.value.trim();
      if (replyButtonEl) {
        replyButtonEl.disabled = value.length === 0;
      }
    });

    replyInputEl.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        handleReplySubmit();
      }
    });
  }

  const replyButtonRaw = b(
    'button.post-reply-btn',
    { disabled: true },
    'Reply'
  );
  if (typeof replyButtonRaw !== 'string') {
    replyButtonEl = replyButtonRaw as HTMLButtonElement;
    replyButtonEl.onclick = () => handleReplySubmit();
  }

  const replyComposer = b(
    'div.post-reply-composer',
    b('div.post-reply-avatar', 'Y'),
    b(
      'div.post-reply-main',
      replyInputRaw,
      b('div.post-reply-footer', replyButtonRaw)
    )
  );

  // ---- 답글 리스트 컨테이너 + 초기 답글들 ----
  const initialReplyNodes = replies.map((reply) => createReplyNode(reply));

  const replyListRaw = b(
    'div.post-replies',
    ...initialReplyNodes
  );
  if (typeof replyListRaw !== 'string') {
    replyListEl = replyListRaw as HTMLElement;
  }

  const repliesBlock = b(
    'div',
    b('div.post-replies-label', 'Replies'),
    replyListRaw
  );

  // ---- 전체 래퍼 조립 ----
  const root = b(
    'section.post-wrapper',
    b(
      'div.post-inner',
      header,
      b('div.post-divider'),
      mainPost,
      replyComposer,
      repliesBlock
    )
  );

  return root;
}
