import { el } from '@webtaku/el';
import './feed.css';

interface FeedPost {
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

const MAX_LENGTH = 280;

const samplePosts: FeedPost[] = [
  {
    id: 'p1',
    authorName: 'Noah Tech',
    handle: '@noahtech',
    avatarInitial: 'N',
    time: '2h',
    content:
      'Just shipped a new feature for my persona holders: realtime on-chain alerts 🔔\n\nIf you hold at least 1 fragment, you’ll start seeing it today.',
    replies: 18,
    reposts: 7,
    likes: 134
  },
  {
    id: 'p2',
    authorName: 'Luna Park',
    handle: '@lunalogs',
    avatarInitial: 'L',
    time: '5h',
    content:
      'Thinking about hosting a weekly AMA just for holders.\nWhat time works best for you? 👇',
    replies: 42,
    reposts: 11,
    likes: 201
  },
  {
    id: 'p3',
    authorName: 'Marcus Dev',
    handle: '@marcusdev',
    avatarInitial: 'M',
    time: '1d',
    content:
      'Open-sourced a new bonding curve simulator.\n\nIt’s been super helpful for planning my persona launch — hope it helps others too!',
    replies: 9,
    reposts: 3,
    likes: 89
  }
];

export class FeedTab {
  el: HTMLElement;

  private posts: FeedPost[];
  private listEl!: HTMLElement;
  private composerInput!: HTMLTextAreaElement;
  private composerCounter!: HTMLElement;
  private composerButton!: HTMLButtonElement;

  private navigate?: (path: string) => void;

  constructor(navigate?: (path: string) => void) {
    this.navigate = navigate;
    this.posts = [...samplePosts];

    this.el = el('section.feed-wrapper');
    const inner = el('div.feed-inner');

    /* 헤더 */
    const header = el(
      'div.feed-header',
      el('h2.feed-header-title', 'Feed'),
      el('p.feed-header-sub', 'See what personas are sharing with their holders')
    );

    /* 작성 폼 (Composer) */
    const composer = this.buildComposer();

    /* 리스트 컨테이너 */
    this.listEl = el('div.feed-list');

    inner.append(header, el('div.feed-divider'), composer, el('div.feed-divider'), this.listEl);
    this.el.append(inner);

    this.renderPosts();
  }

  /* ---------------- 작성 폼 ---------------- */

  private buildComposer(): HTMLElement {
    const composerAvatar = el('div.feed-composer-avatar', 'Y'); // You

    this.composerInput = el('textarea.feed-composer-input', {
      placeholder: "What's happening?",
    }) as HTMLTextAreaElement;

    this.composerCounter = el('span.feed-composer-counter', `${MAX_LENGTH}`) as HTMLElement;

    const metaLeft = el(
      'div.feed-composer-meta',
      el('span', 'Posting as '),
      el('span', { style: 'color: var(--accent-yellow); font-weight: 600;' }, '@you'),
      this.composerCounter
    );

    this.composerButton = el('button.feed-composer-btn', { disabled: true }, 'Post') as HTMLButtonElement;

    const footer = el(
      'div.feed-composer-footer',
      metaLeft,
      this.composerButton
    );

    const main = el(
      'div.feed-composer-main',
      this.composerInput,
      footer
    );

    const wrapper = el(
      'div.feed-composer',
      composerAvatar,
      main
    );

    // 이벤트 설정
    this.composerInput.addEventListener('input', () => this.handleComposerInput());
    this.composerButton.addEventListener('click', () => this.handleComposerSubmit());

    return wrapper;
  }

  private handleComposerInput() {
    const text = this.composerInput.value ?? '';
    const length = text.length;
    const remaining = MAX_LENGTH - length;

    this.composerCounter.textContent = remaining.toString();
    this.composerCounter.classList.toggle('over', remaining < 0);

    // 내용이 있고, 길이 제한 안 넘으면 활성화
    const disabled = length === 0 || remaining < 0;
    this.composerButton.disabled = disabled;
  }

  private handleComposerSubmit() {
    const raw = this.composerInput.value ?? '';
    const text = raw.trim();
    if (!text || text.length > MAX_LENGTH) return;

    const nowPost: FeedPost = {
      id: `local-${Date.now()}`,
      authorName: 'You',
      handle: '@you',
      avatarInitial: 'Y',
      time: 'Now',
      content: text,
      replies: 0,
      reposts: 0,
      likes: 0,
      liked: false
    };

    // 새 글을 맨 위에 추가
    this.posts.unshift(nowPost);
    this.composerInput.value = '';
    this.handleComposerInput();
    this.renderPosts();
  }

  /* ---------------- 리스트 렌더링 ---------------- */

  private renderPosts() {
    this.listEl.innerHTML = '';

    this.posts.forEach((post) => {
      const item = this.renderPost(post);
      this.listEl.append(item);
    });
  }

  private renderPost(post: FeedPost): HTMLElement {
    const avatar = el('div.feed-item-avatar', post.avatarInitial);

    const header = el(
      'div.feed-item-header',
      el('span.feed-item-author', post.authorName),
      el('span.feed-item-handle', post.handle),
      el('span.feed-item-dot'),
      el('span.feed-item-time', post.time)
    );

    const body = el('div.feed-item-body', post.content);

    const reply = el(
      'div.feed-item-action',
      { onclick: (ev: MouseEvent) => ev.stopPropagation() },
      el('span.feed-item-action-icon', '↩'),
      el('span', post.replies.toString())
    );

    const repost = el(
      'div.feed-item-action',
      { onclick: (ev: MouseEvent) => ev.stopPropagation() },
      el('span.feed-item-action-icon', '⤴'),
      el('span', post.reposts.toString())
    );

    const like = el(
      'div.feed-item-action feed-item-like',
      {
        onclick: (ev: MouseEvent) => {
          ev.stopPropagation();
          this.toggleLike(post);
        }
      },
      el('span.feed-item-action-icon', '❤'),
      el('span', post.likes.toString())
    );

    if (post.liked) {
      like.classList.add('liked');
    }

    const actions = el(
      'div.feed-item-actions',
      reply,
      repost,
      like
    );

    const main = el(
      'div.feed-item-main',
      header,
      body,
      actions
    );

    const item = el(
      'div.feed-item',
      { 'data-id': post.id },
      avatar,
      main
    ) as HTMLElement;

    item.addEventListener('click', () => {
      if (this.navigate) {
        this.navigate(`/post/${post.id}`);
      } else {
        console.log('Open post detail:', post.id);
      }
    });

    return item;
  }

  private toggleLike(post: FeedPost) {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    if (post.likes < 0) post.likes = 0;
    this.renderPosts();
  }
}
