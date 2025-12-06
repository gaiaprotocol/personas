import '@shoelace-style/shoelace';
import { el } from '@webtaku/el';
import './feed.css';

import { getAddressAvatarDataUrl } from '@gaiaprotocol/address-avatar';
import { getAddress } from 'viem';
import type { PersonaPost } from '../../shared/types/post';
import type { Profile } from '../../shared/types/profile';
import { postCard } from '../../shared/ui/post';
import {
  createPersonaPostApi,
  deletePersonaPostApi,
  fetchPersonaPostList,
  likePersonaPostApi,
  PersonaPostListParams,
  unlikePersonaPostApi,
  updatePersonaPostApi,
} from '../api/post';
import { fetchMyProfile } from '../api/profile';

const MAX_LENGTH = 280;

export interface FeedTabOptions {
  navigate: (path: string) => void;

  currentAccount?: string | null;
  currentDisplayName?: string | null;
  currentHandle?: string | null;

  getAuthToken: () => string | null | undefined;
}

type FeedItemState = {
  post: PersonaPost;
  liked: boolean;
};

function shortenAddress(addr: string, len = 4) {
  if (!addr || addr.length < len * 2 + 3) return addr;
  return `${addr.slice(0, len + 2)}...${addr.slice(-len)}`;
}

export class FeedTab {
  el: HTMLElement;

  private options: FeedTabOptions;
  private items: FeedItemState[] = [];

  private listEl!: HTMLElement;
  private composerInput!: HTMLTextAreaElement;
  private composerCounter!: HTMLElement;
  private composerButton!: HTMLButtonElement;
  private loadingEl!: HTMLElement;
  private errorEl!: HTMLElement;

  constructor(options: FeedTabOptions) {
    this.options = options;

    this.el = el('section.feed-wrapper');
    const inner = el('div.feed-inner');

    const header = el(
      'div.feed-header',
      el('h2.feed-header-title', 'Feed'),
      el('p.feed-header-sub', 'See what personas are sharing with their holders'),
    );

    const composer = this.buildComposer();

    this.loadingEl = el('div.feed-status.feed-status-loading', 'Loading feed...');
    this.errorEl = el('div.feed-status.feed-status-error');
    this.errorEl.style.display = 'none';

    this.listEl = el('div.feed-list');

    inner.append(
      header,
      el('div.feed-divider'),
      composer,
      el('div.feed-divider'),
      this.loadingEl,
      this.errorEl,
      this.listEl,
    );
    this.el.append(inner);

    this.loadInitialPosts().catch((err) => {
      console.error(err);
      this.showError('Failed to load feed.');
    });
  }

  /* ================= composer ================= */

  private buildComposer(): HTMLElement {
    const rawDisplay =
      this.options.currentDisplayName ??
      (this.options.currentAccount
        ? this.options.currentAccount
        : 'Guest');

    let displayName = rawDisplay;
    if (displayName && displayName.startsWith('0x') && displayName.length > 10) {
      displayName = shortenAddress(displayName);
    }

    const rawHandle =
      this.options.currentHandle ??
      (this.options.currentAccount
        ? `@${shortenAddress(this.options.currentAccount)}`
        : '@guest');

    const handle = rawHandle;

    const composerAvatar = el('div.feed-composer-avatar') as HTMLElement;

    const defaultInitial =
      (displayName || '?')[0]?.toUpperCase() ?? '?';
    composerAvatar.textContent = defaultInitial;

    this.loadComposerAvatar(composerAvatar, defaultInitial).catch((err) => {
      console.error('[FeedTab] loadComposerAvatar error', err);
    });

    this.composerInput = el('textarea.feed-composer-input', {
      placeholder: "What's happening?",
    }) as HTMLTextAreaElement;

    this.composerCounter = el(
      'span.feed-composer-counter',
      `${MAX_LENGTH}`,
    ) as HTMLElement;

    const metaLeft = el(
      'div.feed-composer-meta',
      el('span', 'Posting as '),
      el(
        'span',
        { style: 'color: var(--accent-yellow); font-weight: 600;' },
        handle,
      ),
      this.composerCounter,
    );

    this.composerButton = el(
      'button.feed-composer-btn',
      { disabled: true },
      'Post',
    ) as HTMLButtonElement;

    const footer = el('div.feed-composer-footer', metaLeft, this.composerButton);

    const main = el('div.feed-composer-main', this.composerInput, footer);

    const wrapper = el('div.feed-composer', composerAvatar, main);

    if (!this.options.getAuthToken()) {
      this.composerInput.disabled = true;
      this.composerButton.disabled = true;
      metaLeft.append(
        el(
          'span',
          {
            style:
              'margin-left: 8px; font-size: 12px; color: var(--muted-foreground);',
          },
          '(Login required to post)',
        ),
      );
    }

    this.composerInput.addEventListener('input', () =>
      this.handleComposerInput(),
    );
    this.composerButton.addEventListener('click', () =>
      this.handleComposerSubmit(),
    );

    return wrapper;
  }

  private async loadComposerAvatar(
    avatarEl: HTMLElement,
    fallbackInitial: string,
  ) {
    const token = this.options.getAuthToken();
    const account = this.options.currentAccount;

    let avatarUrl: string | null = null;

    if (token) {
      try {
        const profile: Profile = await fetchMyProfile(token);
        if (profile.avatarUrl && profile.avatarUrl.trim().length > 0) {
          avatarUrl = profile.avatarUrl;
        }
      } catch (err) {
        console.error('[FeedTab] fetchMyProfile failed', err);
      }
    }

    if (!avatarUrl && account && account.startsWith('0x')) {
      try {
        const checksum = getAddress(account as `0x${string}`);
        avatarUrl = getAddressAvatarDataUrl(checksum as `0x${string}`);
      } catch {
        // ignore
      }
    }

    if (avatarUrl) {
      avatarEl.innerHTML = '';
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = 'Your avatar';
      img.className = 'feed-composer-avatar-img';
      avatarEl.appendChild(img);
    } else {
      avatarEl.textContent = fallbackInitial;
    }
  }

  private handleComposerInput() {
    const text = this.composerInput.value ?? '';
    const length = text.length;
    const remaining = MAX_LENGTH - length;

    this.composerCounter.textContent = remaining.toString();
    this.composerCounter.classList.toggle('over', remaining < 0);

    const disabled = length === 0 || remaining < 0;
    this.composerButton.disabled = disabled;
  }

  private async handleComposerSubmit() {
    const raw = this.composerInput.value ?? '';
    const text = raw.trim();
    if (!text || text.length > MAX_LENGTH) return;

    const token = this.options.getAuthToken();
    if (!token) {
      alert('You need to log in to post.');
      return;
    }

    try {
      this.composerButton.disabled = true;

      const created = await createPersonaPostApi({ content: text }, token);

      const newItem: FeedItemState = {
        post: created,
        liked: false,
      };

      this.items.unshift(newItem);
      this.composerInput.value = '';
      this.handleComposerInput();
      this.renderPosts();
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? 'Failed to create post.');
    } finally {
      this.handleComposerInput();
    }
  }

  /* ================= 데이터 로딩 / 상태 ================= */

  private showLoading(show: boolean) {
    this.loadingEl.style.display = show ? 'block' : 'none';
  }

  private showError(msg?: string) {
    if (!msg) {
      this.errorEl.style.display = 'none';
      return;
    }
    this.errorEl.textContent = msg;
    this.errorEl.style.display = 'block';
  }

  private async loadInitialPosts() {
    this.showLoading(true);
    this.showError(undefined);

    try {
      const params: PersonaPostListParams = { limit: 50 };
      const res = await fetchPersonaPostList(params);

      this.items =
        res.posts?.map((p) => ({
          post: p,
          liked: false,
        })) ?? [];

      this.renderPosts();
    } catch (err) {
      console.error('[FeedTab] loadInitialPosts error', err);
      this.showError('Failed to load feed.');
    } finally {
      this.showLoading(false);
    }
  }

  /* ================= 렌더 ================= */

  private renderPosts() {
    this.listEl.innerHTML = '';

    if (!this.items.length) {
      this.listEl.append(
        el('div.feed-empty', 'No posts yet. Be the first to post!'),
      );
      return;
    }

    const currentAccount = this.options.currentAccount;

    for (const item of this.items) {
      const isMine =
        !!currentAccount &&
        item.post.author.toLowerCase() === currentAccount.toLowerCase();

      const node = postCard(el as any, {
        post: item.post,
        isMine,
      }) as HTMLElement;

      this.attachCardHandlers(node, item);
      this.listEl.append(node);
    }
  }

  /* ================= 카드 이벤트 부착 ================= */

  private attachCardHandlers(card: HTMLElement, item: FeedItemState) {
    const postId = item.post.id;

    card.addEventListener('click', () => {
      this.options.navigate(`/post/${postId}`);
    });

    const replyBtn = card.querySelector<HTMLButtonElement>(
      '[data-hook="post-reply"]',
    );
    if (replyBtn) {
      replyBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.options.navigate(`/post/${postId}`);
      });
    }

    const repostBtn = card.querySelector<HTMLButtonElement>(
      '[data-hook="post-repost"]',
    );
    if (repostBtn) {
      repostBtn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        await this.handleRepost(item, repostBtn);
      });
    }

    const likeBtn = card.querySelector<HTMLButtonElement>(
      '[data-hook="post-like"]',
    );
    if (likeBtn) {
      if (item.liked) {
        likeBtn.dataset.liked = 'true';
        likeBtn.classList.add('liked');
      }

      likeBtn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        await this.handleToggleLike(item, likeBtn);
      });
    }

    const moreBtn = card.querySelector<HTMLButtonElement>(
      '[data-hook="post-more"]',
    );
    if (moreBtn) {
      moreBtn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        await this.handleMoreMenu(item);
      });
    }
  }

  /* ================= 좋아요 / 리포스트 / 수정 / 삭제 ================= */

  private async handleToggleLike(
    item: FeedItemState,
    likeBtn: HTMLButtonElement,
  ) {
    const token = this.options.getAuthToken();
    if (!token) {
      alert('You need to log in to like posts.');
      return;
    }

    try {
      if (item.liked) {
        await unlikePersonaPostApi(item.post.id, token);
        item.liked = false;
        item.post.likeCount = Math.max(0, (item.post.likeCount ?? 0) - 1);
      } else {
        await likePersonaPostApi(item.post.id, token);
        item.liked = true;
        item.post.likeCount = (item.post.likeCount ?? 0) + 1;
      }

      likeBtn.dataset.liked = item.liked ? 'true' : 'false';
      likeBtn.classList.toggle('liked', item.liked);
      likeBtn.textContent = `❤ ${item.post.likeCount ?? 0}`;
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? 'Failed to update like.');
    }
  }

  private async handleRepost(
    item: FeedItemState,
    repostBtn?: HTMLButtonElement,
  ) {
    const token = this.options.getAuthToken();
    if (!token) {
      alert('You need to log in to repost.');
      return;
    }

    const ok = window.confirm('Repost this post to your feed?');
    if (!ok) return;

    try {
      const originalContent = item.post.content ?? '';
      if (!originalContent.trim()) {
        alert('This post has no content to repost.');
        return;
      }

      await createPersonaPostApi(
        {
          content: originalContent,
          repostOfId: item.post.id,
        },
        token,
      );

      item.post.repostCount = (item.post.repostCount ?? 0) + 1;

      if (repostBtn) {
        repostBtn.textContent = `⤴ ${item.post.repostCount ?? 0}`;
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? 'Failed to repost.');
    }
  }

  private async handleMoreMenu(item: FeedItemState) {
    const token = this.options.getAuthToken();
    if (!token) {
      alert('You need to log in to edit/delete posts.');
      return;
    }

    const choice = window.prompt('Edit (e) or delete (d)?', 'e');
    if (!choice) return;

    if (choice.toLowerCase().startsWith('d')) {
      const ok = window.confirm('Delete this post?');
      if (!ok) return;

      try {
        await deletePersonaPostApi(item.post.id, token);
        this.items = this.items.filter((it) => it.post.id !== item.post.id);
        this.renderPosts();
      } catch (err: any) {
        console.error(err);
        alert(err?.message ?? 'Failed to delete post.');
      }
      return;
    }

    if (choice.toLowerCase().startsWith('e')) {
      const next = window.prompt('Edit your post:', item.post.content);
      if (next == null) return;

      const trimmed = next.trim();
      if (!trimmed) {
        alert('Post cannot be empty.');
        return;
      }
      if (trimmed.length > MAX_LENGTH) {
        alert(`Post must be at most ${MAX_LENGTH} characters.`);
        return;
      }

      try {
        const updated = await updatePersonaPostApi(
          { id: item.post.id, content: trimmed },
          token,
        );
        item.post = updated;
        this.renderPosts();
      } catch (err: any) {
        console.error(err);
        alert(err?.message ?? 'Failed to update post.');
      }
    }
  }
}
