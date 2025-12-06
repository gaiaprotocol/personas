import { AnyBuilder } from '@webtaku/any-builder';
import { PersonaPost } from '../types/post';
import {
  avatarInitialFromName,
  formatRelativeTimeFromSeconds,
  shortenAddress,
} from '../utils/formatting';

export interface PostViewProps {
  post: PersonaPost;
  isMine?: boolean;
}

export type PostCardVariant = 'feed' | 'profile';

export function postCard<B extends AnyBuilder>(
  b: B,
  props: PostViewProps & { compact?: boolean; variant?: PostCardVariant },
) {
  const { post, isMine, variant = 'feed', compact } = props;

  const shortAddress = shortenAddress(post.author);
  const displayName = post.authorNickname ?? shortAddress;
  const handle = `@${shortAddress}`;
  const time = formatRelativeTimeFromSeconds(post.createdAt);
  const avatarInitial = avatarInitialFromName(displayName);

  const extraClass =
    variant === 'profile'
      ? 'post-card--profile'
      : compact
        ? 'post-card--compact'
        : 'post-card--feed';

  const avatarNode = post.authorAvatarUrl
    ? b(
      'div.post-card-avatar',
      b('img.post-card-avatar-img', {
        src: post.authorAvatarUrl,
        alt: displayName,
      }),
    )
    : b('div.post-card-avatar', avatarInitial);

  return b(
    'article.post-card',
    {
      'data-post-id': post.id,
      'data-hook': 'post-card',
      class: extraClass,
    },
    avatarNode,
    b(
      'div.post-card-main',
      b(
        'div.post-card-header',
        b('span.post-card-author', displayName),
        b('span.post-card-handle', handle),
        b('span.post-card-dot', '·'),
        b('span.post-card-time', time),
      ),
      b('div.post-card-content', post.content),
      b(
        'div.post-card-footer',
        b(
          'button.post-card-action',
          { 'data-hook': 'post-reply' },
          `💬 ${post.commentCount ?? 0}`,
        ),
        b(
          'button.post-card-action',
          { 'data-hook': 'post-repost' },
          `⤴ ${post.repostCount ?? 0}`,
        ),
        b(
          'button.post-card-action',
          {
            'data-hook': 'post-like',
            'data-liked': 'false',
          },
          `❤ ${post.likeCount ?? 0}`,
        ),
        isMine
          ? b(
            'button.post-card-action post-card-more',
            { 'data-hook': 'post-more' },
            '···',
          )
          : '',
      ),
    ),
  );
}

/** 상세 화면용 메인 포스트 */
export function postDetailMain<B extends AnyBuilder>(
  b: B,
  props: PostViewProps,
) {
  const { post, isMine } = props;
  const shortAddress = shortenAddress(post.author);
  const displayName = post.authorNickname ?? shortAddress;
  const handle = `@${shortAddress}`;
  const avatarInitial = avatarInitialFromName(displayName);
  const time = formatRelativeTimeFromSeconds(post.createdAt);

  const avatarNode = post.authorAvatarUrl
    ? b(
      'div.post-avatar',
      b('img.post-avatar-img', {
        src: post.authorAvatarUrl,
        alt: displayName,
      }),
    )
    : b('div.post-avatar', avatarInitial);

  return b(
    'section.post-main',
    { 'data-post-id': post.id, 'data-hook': 'post-main' },
    avatarNode,
    b(
      'div.post-main-body',
      b(
        'div.post-main-header',
        b(
          'a.post-main-author',
          { href: `/profile/${post.author}`, 'data-hook': 'link-profile' },
          displayName,
        ),
        b('span.post-main-handle', handle),
      ),
      b('div.post-main-content', post.content),
      b(
        'div.post-main-meta',
        `${time} · Shared with persona holders`,
      ),
      b(
        'div.post-main-stats',
        b(
          'div.post-main-stat',
          b(
            'span.post-main-stat-strong',
            { 'data-hook': 'stat-replies' },
            String(post.commentCount ?? 0),
          ),
          b('span', 'Replies'),
        ),
        b(
          'div.post-main-stat',
          b(
            'span.post-main-stat-strong',
            { 'data-hook': 'stat-reposts' },
            String(post.repostCount ?? 0),
          ),
          b('span', 'Reposts'),
        ),
        b(
          'div.post-main-stat',
          b(
            'span.post-main-stat-strong',
            { 'data-hook': 'stat-likes' },
            String(post.likeCount ?? 0),
          ),
          b('span', 'Likes'),
        ),
      ),
      b(
        'div.post-main-actions',
        b(
          'button.post-main-action',
          { 'data-hook': 'action-reply' },
          'Reply',
        ),
        b(
          'button.post-main-action',
          { 'data-hook': 'action-repost' },
          'Repost',
        ),
        b(
          'button.post-main-action post-main-like',
          {
            'data-hook': 'action-like',
            'data-liked': 'false',
          },
          'Like',
        ),
        isMine
          ? b(
            'button.post-main-action post-main-edit',
            { 'data-hook': 'action-edit' },
            'Edit',
          )
          : '',
      ),
    ),
  );
}

/** 답글 목록 */
export function replyList<B extends AnyBuilder>(
  b: B,
  replies: PersonaPost[],
) {
  const items = replies.map((rp) => {
    const shortAddress = shortenAddress(rp.author);
    const displayName = rp.authorNickname ?? shortAddress;
    const handle = `@${shortAddress}`;
    const avatarInitial = avatarInitialFromName(displayName);
    const time = formatRelativeTimeFromSeconds(rp.createdAt);

    const avatarNode = rp.authorAvatarUrl
      ? b(
        'div.post-reply-avatar-small',
        b('img.post-reply-avatar-small-img', {
          src: rp.authorAvatarUrl,
          alt: displayName,
        }),
      )
      : b('div.post-reply-avatar-small', avatarInitial);

    return b(
      'div.post-reply-item',
      { 'data-reply-id': rp.id, 'data-hook': 'reply-item' },
      avatarNode,
      b(
        'div.post-reply-body',
        b(
          'div.post-reply-header',
          b(
            'a.post-reply-author',
            {
              href: `/profile/${rp.author}`,
              'data-hook': 'link-profile',
            },
            displayName,
          ),
          b('span.post-reply-handle', handle),
          b('span', '·'),
          b('span.post-reply-time', time),
        ),
        b('div.post-reply-content', rp.content),
        b(
          'button.post-reply-like',
          {
            'data-hook': 'reply-like',
            'data-liked': 'false',
          },
          `❤ ${rp.likeCount ?? 0}`,
        ),
      ),
    );
  });

  return b(
    'section.post-replies',
    b('div.post-replies-label', 'Replies'),
    b('div.post-replies-list', ...items),
  );
}

/** 답글 작성 컴포저 */
export function replyComposer<B extends AnyBuilder>(b: B) {
  // TODO: 현재는 "Y" 고정이지만, 나중에 내 프로필 닉네임/아바타 적용 가능
  return b(
    'section.post-reply-composer',
    b('div.post-reply-avatar', 'Y'),
    b(
      'div.post-reply-main',
      b('textarea.post-reply-input', {
        'data-hook': 'reply-input',
        placeholder: 'Reply to this post...',
      }),
      b(
        'div.post-reply-footer',
        b(
          'button.post-reply-btn',
          { 'data-hook': 'reply-submit', disabled: true },
          'Reply',
        ),
      ),
    ),
  );
}
