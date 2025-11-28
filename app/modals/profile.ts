import { el } from '@webtaku/el';
import { profile as profileTemplate } from '../../shared/views/profile'; // (builder, profile, posts)
import './profile.css';

// 실제 타입
import type { PersonaPost } from '../../shared/types/post';
import type { Profile } from '../../shared/types/profile';
import { fetchProfileWithPosts } from '../api/profile';

/* =========================
 *   헬퍼
 * =======================*/

function shortenAddress(addr: string, head = 6, tail = 4) {
  if (!addr || addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

/** 서버 Profile + Posts → 뷰모델 */
function toUserProfileData(
  profile: Profile,
  posts: PersonaPost[],
) {
  const name =
    profile.nickname?.trim().length
      ? profile.nickname
      : shortenAddress(profile.account);

  const avatarInitial =
    (profile.nickname?.trim()[0] ??
      profile.account.replace(/^0x/, '')[0] ??
      'P'
    ).toUpperCase();

  // TODO: 실제 시스템에 맞게 가공
  const mappedPosts = posts.map((post, idx) => {
    const p: any = post;
    const content = p.content ?? p.text ?? '[No content]';

    let timeAgo = '';
    const createdAt = p.created_at || p.createdAt;

    if (createdAt) {
      try {
        const ms =
          typeof createdAt === 'number'
            ? createdAt * 1000
            : Date.parse(createdAt);
        const diff = Math.floor((Date.now() - ms) / 1000);
        if (diff < 60) timeAgo = `${diff}s ago`;
        else if (diff < 3600) timeAgo = `${Math.floor(diff / 60)}m ago`;
        else if (diff < 86400) timeAgo = `${Math.floor(diff / 3600)}h ago`;
        else timeAgo = `${Math.floor(diff / 86400)}d ago`;
      } catch { }
    }

    return {
      id: String(p.id ?? idx),
      content,
      timeAgo,
    };
  });

  return {
    id: profile.account,
    name,
    bio: profile.bio ?? '',
    address: profile.account,
    avatarInitial,
    posts: mappedPosts,
  };
}

/** DOM 반영 */
function applyProfileData(root: HTMLElement, data: ReturnType<typeof toUserProfileData>) {
  // 이름 / 바이오 / 주소
  root.querySelector<HTMLElement>('.profile-name')!.textContent = data.name;
  root.querySelector<HTMLElement>('.profile-bio')!.textContent = data.bio;
  root.querySelector<HTMLElement>('.profile-address')!.textContent = data.address;

  const avatar = root.querySelector<HTMLElement>('.profile-avatar')!;
  avatar.textContent = data.avatarInitial;
  avatar.style.backgroundImage = '';

  // 최근 글
  const postsEl = root.querySelector<HTMLElement>('.profile-posts-list')!;
  postsEl.innerHTML = '';

  data.posts.forEach((post) => {
    const row = el(
      'a.profile-post-row',
      { href: `/post/${post.id}` },
      el('div.profile-post-content', post.content),
      el('div.profile-post-meta', post.timeAgo),
    ) as HTMLAnchorElement;

    postsEl.appendChild(row);
  });
}

/** 내부 링크를 SPA 라우터로 연결 */
function setupInternalLinks(root: HTMLElement, modal: HTMLIonModalElement, navigate?: (path: string) => void) {
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

/* =========================
 *   public API
 * =======================*/

export function createUserProfileModal(
  profileId: string,
  navigate?: (path: string) => void,
) {
  const modal = el('ion-modal.user-profile-modal');

  /* -------------------------
   *     Header
   * ------------------------*/
  const closeBtn = el(
    'ion-button',
    {
      slot: 'start',
      fill: 'clear',
      onclick: () => modal.dismiss(),
    },
    el('ion-icon', { name: 'chevron-back-outline' }),
  );

  const titleEl = el('ion-title', 'Profile');

  const header = el(
    'ion-header',
    el('ion-toolbar', closeBtn, titleEl),
  );

  /* -------------------------
   *   Content: 초기에는 로딩
   * ------------------------*/

  const loadingEl = el(
    'div.profile-loading',
    {
      style: `
        width: 100%;
        padding: 40px 0;
        text-align: center;
        font-size: 16px;
        opacity: 0.8;
      `,
    },
    'Loading profile...',
  );

  const content = el(
    'ion-content',
    { fullscreen: true },
    loadingEl,
  );

  modal.append(header, content);

  document.body.appendChild(modal);
  modal.present();

  modal.addEventListener('ionModalDidDismiss', () => modal.remove());

  /* -------------------------
   *   비동기 로딩: 완료 후 템플릿 생성
   * ------------------------*/
  (async () => {
    try {
      const { profile, posts } = await fetchProfileWithPosts(profileId);
      const data = toUserProfileData(profile, posts);

      // 기존 로딩 제거
      content.innerHTML = '';

      // 🔥 여기서 처음으로 실제 프로필 DOM 생성!
      const profileRoot = profileTemplate(
        el,
        profile,
        posts,
      ) as HTMLElement;

      profileRoot.classList.add('user-profile-modal-body');

      // 데이터 적용
      applyProfileData(profileRoot, data);

      // 내부 링크 처리
      setupInternalLinks(profileRoot, modal, navigate);

      // 최종 DOM 삽입
      content.appendChild(profileRoot);

      // 제목도 업데이트
      titleEl.textContent = data.name;
    } catch (err) {
      console.error('Failed to load profile', err);
      content.innerHTML = `<div style="padding: 30px; text-align:center;">Failed to load profile.</div>`;
    }
  })();

  return modal;
}
