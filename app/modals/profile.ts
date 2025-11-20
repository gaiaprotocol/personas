import { el } from '@webtaku/el';
import { profile } from '../../shared/views/profile';
import './profile.css';

interface UserSocialLink {
  label: string;
  icon: string; // Ionicon name (e.g. "logo-twitter")
  href?: string;
}

interface UserPost {
  id: string;
  content: string;
  timeAgo: string;
}

interface UserProfileData {
  id: string;
  name: string;
  bio: string;
  address: string;
  avatarInitial: string;
  stats: {
    holders: number;
    volumeUsd: number;
    followers: number;
  };
  socialLinks: UserSocialLink[];
  posts: UserPost[];
}

/**
 * TODO: 실제 API에 맞게 구현하세요.
 *  - profileId (예: persona id, address 등) 를 기준으로 서버에서 데이터를 가져오도록 교체
 */
async function fetchUserProfile(profileId: string): Promise<UserProfileData> {
  // 데모용 더미 데이터
  return {
    id: profileId,
    name: `Persona ${profileId}`,
    bio: 'Web3 builder & persona fragment creator. (Loaded from API)',
    address: '0x0000000000000000000000000000000000000000',
    avatarInitial: (profileId[0] ?? 'P').toUpperCase(),
    stats: {
      holders: 342,
      volumeUsd: 15420,
      followers: 1234
    },
    socialLinks: [
      {
        label: 'Twitter',
        icon: 'logo-twitter',
        href: 'https://x.com'
      },
      {
        label: 'Discord',
        icon: 'logo-discord',
        href: 'https://discord.com'
      },
      {
        label: 'Website',
        icon: 'globe-outline',
        href: 'https://example.com'
      }
    ],
    posts: [
      {
        id: 'post-1',
        content: 'Just dropped something exciting! Check it out 🚀',
        timeAgo: '2 hours ago'
      },
      {
        id: 'post-2',
        content: 'Loving this new bonding curve design.',
        timeAgo: '1 day ago'
      }
    ]
  };
}

/** profile(el)로 만들어진 DOM에 실제 프로필 데이터를 반영해주는 헬퍼 */
function applyProfileDataToView(root: HTMLElement, data: UserProfileData) {
  // 이름, 바이오, 주소
  const nameEl = root.querySelector<HTMLElement>('.profile-name');
  const bioEl = root.querySelector<HTMLElement>('.profile-bio');
  const addrEl = root.querySelector<HTMLElement>('.profile-address');
  const avatarEl = root.querySelector<HTMLElement>('.profile-avatar');

  if (nameEl) nameEl.textContent = data.name;
  if (bioEl) bioEl.textContent = data.bio;
  if (addrEl) addrEl.textContent = data.address;

  if (avatarEl) {
    avatarEl.textContent = data.avatarInitial;
    avatarEl.style.backgroundImage = '';
  }

  // 통계 (Holders / Volume / Followers 순서로 되어 있다고 가정)
  const statCards = root.querySelectorAll<HTMLElement>('.profile-stat-card');
  if (statCards[0]) {
    const v = statCards[0].querySelector<HTMLElement>('.profile-stat-value');
    if (v) v.textContent = data.stats.holders.toLocaleString();
  }
  if (statCards[1]) {
    const v = statCards[1].querySelector<HTMLElement>('.profile-stat-value');
    if (v) v.textContent = `$${data.stats.volumeUsd.toLocaleString()}`;
  }
  if (statCards[2]) {
    const v = statCards[2].querySelector<HTMLElement>('.profile-stat-value');
    if (v) v.textContent = data.stats.followers.toLocaleString();
  }

  // 소셜 링크
  const socialListEl = root.querySelector<HTMLElement>('.profile-social-list');
  if (socialListEl) {
    socialListEl.innerHTML = '';

    data.socialLinks.forEach((link) => {
      const rowTag = link.href
        ? 'a.profile-social-row'
        : 'div.profile-social-row';

      const row = el(
        rowTag,
        link.href
          ? {
            href: link.href,
            target: '_blank',
            rel: 'noreferrer noopener'
          } as any
          : {},
        el(
          'div.profile-social-left',
          el('ion-icon.profile-social-icon', { name: link.icon }),
          el('span.profile-social-label', link.label)
        ),
        el('ion-icon.profile-social-open-icon', { name: 'open-outline' })
      ) as HTMLElement;

      socialListEl.appendChild(row);
    });
  }

  // Recent Posts
  const postsListEl = root.querySelector<HTMLElement>('.profile-posts-list');
  if (postsListEl) {
    postsListEl.innerHTML = '';

    data.posts.forEach((post, index) => {
      const row = el(
        'a.profile-post-row',
        {
          href: `/post/${post.id ?? `post-${index}`}`
        },
        el('div.profile-post-content', post.content),
        el('div.profile-post-meta', post.timeAgo)
      ) as HTMLAnchorElement;

      postsListEl.appendChild(row);
    });
  }
}

/** 모달 안 프로필 뷰 내부 링크 설정 (SPA 라우팅 + 모달 닫기) */
function setupInternalLinksWithinProfile(
  root: HTMLElement,
  modal: HTMLElement,
  navigate?: (path: string) => void
) {
  if (!navigate) return;

  const links = root.querySelectorAll<HTMLAnchorElement>('a[href^="/"]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      modal.dispatchEvent(new CustomEvent('user-profile-modal:navigate'));
      (modal as any).dismiss?.();
      navigate(href);
    });
  });
}

/**
 * 프로필 전체 뷰(profile.ts)를 그대로 사용하는 유저 정보 모달
 *
 * @param profileId 유저/퍼소나 id (API에서 프로필 조회용)
 * @param navigate  SPA 라우팅 콜백 (선택)
 */
export function createUserProfileModal(
  profileId: string,
  navigate?: (path: string) => void
) {
  const modal = el('ion-modal.user-profile-modal') as any;

  // 헤더
  const closeBtn = el(
    'ion-button',
    {
      slot: 'start',
      fill: 'clear',
      onclick: () => modal.dismiss()
    },
    el('ion-icon', { name: 'chevron-back-outline' })
  );

  const titleEl = el('ion-title', 'Profile');

  const header = el(
    'ion-header',
    el('ion-toolbar', closeBtn, titleEl)
  );

  // 프로필 전체 레이아웃 (shared/views/profile.ts 재사용)
  const profileRoot = profile(el) as HTMLElement;
  profileRoot.classList.add('user-profile-modal-body');

  // 내부 링크들을 SPA 라우팅으로 연결
  setupInternalLinksWithinProfile(profileRoot, modal, navigate);

  const content = el(
    'ion-content',
    { fullscreen: true },
    profileRoot
  );

  modal.append(header, content);

  document.body.appendChild(modal);
  modal.present();

  modal.addEventListener('ionModalDidDismiss', () => {
    modal.remove();
  });

  // 프로필 데이터 비동기 로딩
  (async () => {
    try {
      const data = await fetchUserProfile(profileId);
      applyProfileDataToView(profileRoot, data);
      titleEl.textContent = data.name || 'Profile';
    } catch (err) {
      console.error('Failed to load user profile', err);
      // TODO: 에러 토스트 등 표시
    }
  })();

  return modal;
}
