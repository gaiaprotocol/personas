import { getAddressAvatarDataUrl } from '@gaiaprotocol/address-avatar';
import { AnyBuilder } from '@webtaku/any-builder';
import { formatEther } from 'viem';
import { PersonaFragments } from '../types/persona-fragments';
import { PersonaPost } from '../types/post';
import { Profile } from '../types/profile';
import { postCard } from '../ui/post';
import {
  avatarInitialFromName,
  shortenAddress,
} from '../utils/formatting';

/**
 * Profile page template (SSR/SPA compatible)
 * - Server: called with `h` builder (SSR)
 * - Client: called with `el` builder (SPA)
 * - No internal state/event wiring, only data-* hooks for external scripts
 */
export function profile(
  b: AnyBuilder,
  profile: Profile,
  posts: PersonaPost[],
  personaFragments: PersonaFragments | null,
) {
  const nickname = profile.nickname?.trim();
  const displayName =
    nickname && nickname.length > 0
      ? nickname.startsWith('0x')
        ? shortenAddress(nickname)
        : nickname
      : shortenAddress(profile.account);

  const bio =
    profile.bio && profile.bio.trim().length > 0
      ? profile.bio.trim()
      : 'No bio yet.';

  const fullAddress = profile.account;
  const shortAddress = shortenAddress(profile.account, 6);

  const socialLinks = profile.socialLinks ?? {};

  // ===== Persona fragment-related stats =====
  const fragmentPriceText =
    personaFragments?.lastPrice && personaFragments.lastPrice.trim().length > 0
      ? `${Number(formatEther(BigInt(personaFragments.lastPrice))).toFixed(4)} ETH`
      : '–';

  const holderCountText =
    typeof personaFragments?.holderCount === 'number'
      ? personaFragments.holderCount.toLocaleString()
      : '0';

  const currentSupplyText =
    personaFragments?.currentSupply &&
      personaFragments.currentSupply.trim().length > 0
      ? personaFragments.currentSupply
      : '0';

  // ===== Social links (all entries, icon inferred from URL) =====
  const inferSocialIcon = (url: string): string => {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase().replace(/^www\./, '');

      if (host.includes('twitter.com') || host === 'x.com') return 'logo-twitter';
      if (host.includes('discord.com') || host.includes('discord.gg')) return 'logo-discord';
      if (host.includes('github.com')) return 'logo-github';
      if (host === 'youtu.be' || host.includes('youtube.com')) return 'logo-youtube';
      if (
        host.includes('t.me') ||
        host.includes('telegram.me') ||
        host.includes('telegram.org')
      ) {
        return 'paper-plane-outline';
      }
      if (host.includes('linkedin.com')) return 'logo-linkedin';
      if (host.includes('instagram.com')) return 'logo-instagram';

      return 'link-outline';
    } catch {
      return 'link-outline';
    }
  };

  const socialEntries = Object.entries(socialLinks).filter(
    ([, url]) => !!url && url.toString().trim().length > 0,
  );

  const socialChips =
    socialEntries.length > 0
      ? b(
        'div.profile-social-chips',
        ...socialEntries.map(([label, url]) => {
          const href = url.toString().trim();
          const iconName = inferSocialIcon(href);

          let displayLabel = label.trim();
          if (!displayLabel) {
            try {
              const u = new URL(href);
              displayLabel = u.hostname.replace(/^www\./, '');
            } catch {
              displayLabel = href;
            }
          }

          return b(
            'a.profile-social-chip',
            {
              href,
              target: '_blank',
              rel: 'noreferrer noopener',
            } as any,
            b('ion-icon.profile-social-chip-icon', { name: iconName }),
            b('span.profile-social-chip-label', displayLabel),
          );
        }),
      )
      : null;

  const editButton = b(
    'button.profile-edit-btn',
    {
      type: 'button',
      'data-action': 'edit-profile',
      'data-address': fullAddress,
    },
    'Edit Profile',
  );

  const profileMainTextChildren: any[] = [
    b('div.profile-name', displayName),
    b('div.profile-bio', bio),
    b('div.profile-address', shortAddress),
  ];

  if (socialChips) {
    profileMainTextChildren.push(socialChips);
  }

  const avatarInitial = avatarInitialFromName(displayName);
  const avatarSrc =
    profile.avatarUrl && profile.avatarUrl.trim().length > 0
      ? profile.avatarUrl
      : getAddressAvatarDataUrl(profile.account as `0x${string}`);

  const avatarChildren = b('img.profile-avatar-img', {
    src: avatarSrc,
    alt: displayName,
  });

  const coverProps =
    profile.bannerUrl && profile.bannerUrl.trim().length > 0
      ? ({ style: `background-image: url('${profile.bannerUrl}')` } as any)
      : ({} as any);

  const mainProfileCard = b(
    'section.profile-card.profile-main-card',
    b(
      'div.profile-main',
      // data-address를 심어두면 클라이언트에서 AddressAvatar / Jazzicon 등으로 교체 가능
      b(
        'div.profile-avatar',
        {
          'data-address': profile.account,
        } as any,
        avatarChildren,
      ),
      b('div.profile-main-text', ...profileMainTextChildren),
    ),
  );

  const heroSection = b(
    'div.profile-hero',
    b('div.profile-cover', coverProps),
    editButton,
    mainProfileCard,
  );

  // ===== Stats: fragment price / holder count / supply =====
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

  // ===== User-specific fragment / chat CTA placeholder =====
  const userFragmentCta = b(
    'section.profile-card.profile-user-cta-card',
    {
      'data-role': 'user-fragment-cta-root',
    } as any,
    b('div.profile-user-cta-loading', 'Loading your fragments...'),
  );

  // ===== Recent Posts card =====
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

  // ===== Assemble whole layout =====
  // Order: hero → user fragment CTA → stats → posts
  const root = b(
    'section.profile-wrapper',
    b(
      'div.profile-inner',
      heroSection,
      b(
        'div.profile-content-offset',
        userFragmentCta,
        statsRow,
        postsCard,
      ),
    ),
  );

  return root;
}
