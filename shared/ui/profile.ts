import { AnyBuilder } from '@webtaku/any-builder';
import { PersonaPost } from '../types/post';
import { Profile } from '../types/profile';
import { PersonaFragments } from '../types/persona-fragments';
import { postCard } from '../ui/post';
import {
  avatarInitialFromName,
  shortenAddress,
} from '../utils/formatting';

/**
 * 프로필 페이지 전체 템플릿
 * - 서버: h 빌더로 호출(SSR)
 * - 클라이언트: el 빌더로 호출(SPA)
 * - 이벤트/상태 없음, data-* 훅만 제공
 */
export function profile(
  b: AnyBuilder,
  profile: Profile,
  posts: PersonaPost[],
  personaFragments: PersonaFragments | null,
) {
  const displayName =
    profile.nickname && profile.nickname.trim().length > 0
      ? profile.nickname.trim()
      : shortenAddress(profile.account);

  const bio =
    profile.bio && profile.bio.trim().length > 0
      ? profile.bio.trim()
      : 'No bio yet.';

  const fullAddress = profile.account;
  const shortAddress = shortenAddress(profile.account, 6);
  const avatarInitial = avatarInitialFromName(displayName);

  const socialLinks = profile.socialLinks ?? {};

  // ===== personaFragments 기반 숫자들 =====
  const fragmentPriceText =
    personaFragments?.lastPrice && personaFragments.lastPrice.trim().length > 0
      ? personaFragments.lastPrice
      : '–';

  const holderCountText =
    typeof personaFragments?.holderCount === 'number'
      ? personaFragments.holderCount.toLocaleString()
      : '–';

  const currentSupplyText =
    personaFragments?.currentSupply && personaFragments.currentSupply.trim().length > 0
      ? personaFragments.currentSupply
      : '–';

  // ===== Hero / 메인 프로필 카드 =====
  const editButton = b(
    'button.profile-edit-btn',
    {
      type: 'button',
      'data-action': 'edit-profile',
      'data-address': fullAddress,
    },
    'Edit Profile',
  );

  const mainProfileCard = b(
    'section.profile-card.profile-main-card',
    b(
      'div.profile-main',
      b('div.profile-avatar', avatarInitial),
      b(
        'div.profile-main-text',
        b('div.profile-name', displayName),
        b('div.profile-bio', bio),
        b('div.profile-address', shortAddress),
      ),
    ),
  );

  const heroSection = b(
    'div.profile-hero',
    b('div.profile-cover'),
    editButton,
    mainProfileCard,
  );

  // ===== Connect With Me (소셜 링크 카드) =====
  const socialItems = [
    {
      key: 'twitter',
      label: 'Twitter / X',
      icon: 'logo-twitter',
    },
    {
      key: 'discord',
      label: 'Discord',
      icon: 'logo-discord',
    },
    {
      key: 'website',
      label: 'Website',
      icon: 'link-outline',
    },
  ] as const;

  const socialLinkNodes: any[] = socialItems
    .filter((item) => !!socialLinks[item.key])
    .map((item) => {
      const href = socialLinks[item.key]!;
      return b(
        'a.profile-social-row',
        {
          href,
          target: '_blank',
          rel: 'noreferrer noopener',
        } as any,
        b(
          'div.profile-social-left',
          b('ion-icon.profile-social-icon', { name: item.icon }),
          b('span.profile-social-label', item.label),
        ),
        b('ion-icon.profile-social-open-icon', { name: 'open-outline' }),
      );
    });

  if (socialLinkNodes.length === 0) {
    socialLinkNodes.push(
      b(
        'div.profile-social-row.profile-social-empty',
        b(
          'div.profile-social-left',
          b('span.profile-social-label', 'No social links yet.'),
        ),
      ),
    );
  }

  const connectCard = b(
    'section.profile-card.profile-connect-card',
    b('div.profile-section-title', 'Connect With Me'),
    b('div.profile-social-list', ...socialLinkNodes),
  );

  // ===== Stats: 프래그먼트 가격 / 홀더 수 / 공급량 =====
  const statsRow = b(
    'div.profile-stats-row',
    b(
      'div.profile-stat-card',
      b('div.profile-stat-label', 'Fragment Price'),
      b(
        'div.profile-stat-value',
        {
          'data-role': 'fragment-price',
        } as any,
        fragmentPriceText,
      ),
    ),
    b(
      'div.profile-stat-card',
      b('div.profile-stat-label', 'Holders'),
      b(
        'div.profile-stat-value',
        {
          'data-role': 'holder-count',
        } as any,
        holderCountText,
      ),
    ),
    b(
      'div.profile-stat-card',
      b('div.profile-stat-label', 'Supply'),
      b(
        'div.profile-stat-value',
        {
          'data-role': 'fragment-supply',
        } as any,
        currentSupplyText,
      ),
    ),
  );

  // ===== Recent Posts 카드 =====
  const postsCardBody =
    posts.length > 0
      ? b(
        'div.profile-posts-list',
        ...posts.map((post) =>
          postCard(b, {
            post,
            isMine: false,
            compact: true,
            variant: 'profile',
          } as any),
        ),
      )
      : b('div.profile-posts-empty', 'No posts yet.');

  const postsCard = b(
    'section.profile-card.profile-posts-card',
    b('h2.profile-card-title', 'Recent Posts'),
    postsCardBody,
  );

  // ===== 전체 조립 =====
  // 순서: 소셜 링크 → Stats → (TradePanel 이 여기 사이에 끼어들 예정) → Posts
  const root = b(
    'section.profile-wrapper',
    b(
      'div.profile-inner',
      heroSection,
      b(
        'div.profile-content-offset',
        connectCard,
        statsRow,
        postsCard,
      ),
    ),
  );

  return root;
}
