import { el } from '@webtaku/el';
import { PersonaPost } from '../../shared/types/post';
import {
  postDetailMain,
  replyComposer,
  replyList,
} from '../../shared/ui/post';
import {
  createPersonaPostApi,
  likePersonaPostApi,
  unlikePersonaPostApi,
} from '../api/post';

export class PostTab {
  el: HTMLElement;
  private navigate?: (path: string) => void;

  constructor(
    post: PersonaPost,
    replies: PersonaPost[],
    opts: { navigate?: (path: string) => void; getAuthToken?: () => string | undefined },
  ) {
    this.navigate = opts.navigate;

    this.el = el(
      'section.post-wrapper',
      el(
        'div.post-inner',
        postDetailMain(el as any, { post }),
        replyComposer(el as any),
        replyList(el as any, replies),
      ),
    ) as HTMLElement;

    this.setupInternalLinks();
    this.setupMainLike(post, opts.getAuthToken);
    this.setupMainRepost(post, opts.getAuthToken);
    this.setupReplyComposer(post, opts.getAuthToken);
  }

  private setupInternalLinks() {
    if (!this.navigate) return;
    const links = this.el.querySelectorAll<HTMLAnchorElement>('a[href^="/"]');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate?.(href);
      });
    });
  }

  private setupMainLike(
    post: PersonaPost,
    getAuthToken?: () => string | undefined,
  ) {
    const likeBtn =
      this.el.querySelector<HTMLElement>('[data-hook="action-like"]');
    const likeStat =
      this.el.querySelector<HTMLElement>('[data-hook="stat-likes"]');
    if (!likeBtn || !likeStat) return;

    let liked = false;
    let likeCount = post.likeCount ?? 0;

    likeBtn.addEventListener('click', async () => {
      const token = getAuthToken?.();
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

  private setupMainRepost(
    post: PersonaPost,
    getAuthToken?: () => string | undefined,
  ) {
    const repostBtn =
      this.el.querySelector<HTMLElement>('[data-hook="action-repost"]');
    const repostStat =
      this.el.querySelector<HTMLElement>('[data-hook="stat-reposts"]');
    if (!repostBtn || !repostStat) return;

    let repostCount = post.repostCount ?? 0;

    repostBtn.addEventListener('click', async () => {
      const token = getAuthToken?.();
      if (!token) {
        alert('Login required.');
        return;
      }

      const ok = window.confirm('Repost this post to your feed?');
      if (!ok) return;

      try {
        const originalContent = post.content ?? '';
        if (!originalContent.trim()) {
          alert('This post has no content to repost.');
          return;
        }

        await createPersonaPostApi(
          { content: originalContent, repostOfId: post.id },
          token,
        );

        repostCount += 1;
        repostStat.textContent = String(repostCount);
      } catch (e) {
        console.error(e);
        alert('Failed to repost.');
      }
    });
  }

  private setupReplyComposer(
    post: PersonaPost,
    getAuthToken?: () => string | undefined,
  ) {
    const input =
      this.el.querySelector<HTMLTextAreaElement>('[data-hook="reply-input"]');
    const submit =
      this.el.querySelector<HTMLButtonElement>('[data-hook="reply-submit"]');
    const list =
      this.el.querySelector<HTMLElement>('.post-replies-list');
    const repliesStat =
      this.el.querySelector<HTMLElement>('[data-hook="stat-replies"]');

    if (!input || !submit || !list || !repliesStat) return;

    let replyCount = post.commentCount ?? 0;

    input.addEventListener('input', () => {
      submit.disabled = input.value.trim().length === 0;
    });

    submit.addEventListener('click', async () => {
      const text = input.value.trim();
      if (!text) return;

      const token = getAuthToken?.();
      if (!token) {
        alert('Login required.');
        return;
      }

      try {
        const created = await createPersonaPostApi(
          { content: text, parentPostId: post.id },
          token,
        );

        const node = (replyList(el as any, [created]) as HTMLElement)
          .querySelector('[data-hook="reply-item"]');
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
}
