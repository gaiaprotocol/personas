import { tokenManager } from '@gaiaprotocol/client-common';
import { el } from '@webtaku/el';
import type { PersonaPost } from '../../shared/types/post';
import {
  postDetailMain,
  replyComposer,
  replyList,
} from '../../shared/ui/post';
import {
  createPersonaPostApi,
  fetchPersonaPostWithReplies,
  likePersonaPostApi,
  unlikePersonaPostApi,
} from '../api/post';
import './post.css';

/* ------------------------------
 * 내부 링크 → SPA 라우터 연결
 * ----------------------------*/
function setupInternalLinks(
  root: HTMLElement,
  modal: HTMLIonModalElement,
  navigate?: (path: string) => void,
) {
  if (!navigate) return;

  root.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      modal.dismiss();
      navigate(href);
    });
  });
}

/* ------------------------------
 * 메인 포스트 좋아요
 * ----------------------------*/
function setupMainLike(root: HTMLElement, post: PersonaPost) {
  const likeBtn = root.querySelector<HTMLElement>('[data-hook="action-like"]');
  const likeStat = root.querySelector<HTMLElement>('[data-hook="stat-likes"]');
  if (!likeBtn || !likeStat) return;

  let liked = false;
  let likeCount = post.likeCount ?? 0;

  likeBtn.addEventListener('click', async () => {
    const token = tokenManager.getToken?.();
    if (!token) {
      alert('Login required.');
      return;
    }

    try {
      if (liked) {
        await unlikePersonaPostApi(post.id, token);
        liked = false;
        likeCount = Math.max(0, likeCount - 1);
      } else {
        await likePersonaPostApi(post.id, token);
        liked = true;
        likeCount += 1;
      }
      likeStat.textContent = String(likeCount);
      likeBtn.dataset.liked = liked ? 'true' : 'false';
      likeBtn.classList.toggle('liked', liked);
    } catch (e) {
      console.error(e);
      alert('Failed to update like.');
    }
  });
}

/* ------------------------------
 * 답글 작성
 * ----------------------------*/
function setupReplyComposer(root: HTMLElement, post: PersonaPost) {
  const input =
    root.querySelector<HTMLTextAreaElement>('[data-hook="reply-input"]');
  const submit =
    root.querySelector<HTMLButtonElement>('[data-hook="reply-submit"]');
  const list = root.querySelector<HTMLElement>('.post-replies-list');
  const repliesStat =
    root.querySelector<HTMLElement>('[data-hook="stat-replies"]');

  if (!input || !submit || !list || !repliesStat) return;

  let replyCount = post.commentCount ?? 0;

  input.addEventListener('input', () => {
    submit.disabled = input.value.trim().length === 0;
  });

  submit.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) return;

    const token = tokenManager.getToken?.();
    if (!token) {
      alert('Login required.');
      return;
    }

    try {
      const created = await createPersonaPostApi(
        { content: text, parentPostId: post.id },
        token,
      );

      const node = (replyList(el as any, [created]) as HTMLElement).querySelector(
        '[data-hook="reply-item"]',
      );
      if (node) list.insertBefore(node, list.firstChild);

      replyCount += 1;
      repliesStat.textContent = String(replyCount);

      input.value = '';
      submit.disabled = true;
    } catch (e) {
      console.error(e);
      alert('Failed to post reply.');
    }
  });
}

/* ------------------------------
 * 댓글 클릭 → 포스트 모달 열기
 * ----------------------------*/
function setupReplyClicks(
  root: HTMLElement,
  navigate?: (path: string) => void,
) {
  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // 좋아요 버튼 클릭은 무시
    if (target.closest('[data-hook="reply-like"]')) return;

    const row = target.closest<HTMLElement>('[data-hook="reply-item"][data-reply-id]');
    if (!row) return;

    const idStr = row.getAttribute('data-reply-id');
    if (!idStr) return;

    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) return;

    e.preventDefault();
    e.stopPropagation();

    createPostModal(id, navigate);
  });
}

/* ------------------------------
 * Post Modal Public API
 * ----------------------------*/
export function createPostModal(
  postId: number | string,
  navigate?: (path: string) => void,
) {
  const idNum = typeof postId === 'string' ? Number(postId) : postId;
  if (!Number.isFinite(idNum) || idNum <= 0) {
    console.error('[post-modal] invalid postId', postId);
    return;
  }

  const modal = el('ion-modal.post-modal') as HTMLIonModalElement;

  /* Header */

  const backIcon = el('ion-icon', {
    name: 'chevron-back-outline',
    slot: 'icon-only',
  });

  const backInnerButton = el(
    'ion-button',
    { fill: 'clear' },
    backIcon,
  ) as HTMLElement;

  backInnerButton.addEventListener('click', () => modal.dismiss());

  const backBtn = el(
    'ion-buttons',
    { slot: 'start' },
    backInnerButton,
  );

  const titleEl = el('ion-title', 'Post');

  const header = el(
    'ion-header',
    el('ion-toolbar', backBtn, titleEl),
  );

  /* Content: 초기 로딩 상태 */

  const loadingEl = el(
    'div.post-loading',
    {
      style: `
        width: 100%;
        padding: 40px 0;
        text-align: center;
        font-size: 16px;
        opacity: 0.8;
      `,
    },
    'Loading post...',
  );

  const content = el(
    'ion-content',
    { fullscreen: true },
    loadingEl,
  ) as HTMLIonContentElement;

  modal.append(header, content);

  document.body.appendChild(modal);
  (modal as any).present();

  modal.addEventListener('ionModalDidDismiss', () => {
    modal.remove();
  });

  /* 비동기 로딩 */

  (async () => {
    try {
      const { post, replies } = await fetchPersonaPostWithReplies(idNum);

      content.innerHTML = '';

      const root = el(
        'div.post-modal-body',
        postDetailMain(el as any, { post }),
        replyComposer(el as any),
        replyList(el as any, replies),
      ) as HTMLElement;

      content.appendChild(root);

      // 타이틀에 살짝 내용 반영 (앞 24자 정도)
      const preview = (post.content ?? '').trim();
      if (preview) {
        titleEl.textContent =
          preview.length > 24 ? `${preview.slice(0, 24)}…` : preview;
      }

      setupInternalLinks(root, modal, navigate);
      setupMainLike(root, post);
      setupReplyComposer(root, post);
      setupReplyClicks(root, navigate);
    } catch (err) {
      console.error('[post-modal] failed to load post', err);
      content.innerHTML =
        '<div style="padding: 30px; text-align:center;">Failed to load post.</div>';
    }
  })();
}
