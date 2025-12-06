import { getAddressAvatarDataUrl } from '@gaiaprotocol/address-avatar';
import { tokenManager } from '@gaiaprotocol/client-common';
import { el } from '@webtaku/el';
import { profile as profileTemplate } from '../../shared/ui/profile'; // (builder, profile, posts)
import './profile.css';

import type { PersonaPost } from '../../shared/types/post';
import type { Profile } from '../../shared/types/profile';
import { fetchPersonaProfile } from '../api/profile';

import { formatEther, getAddress } from 'viem';
import { TradePanel } from '../components/trade-panel';
import { Address } from '../contracts/persona-fragments';
import { profileManager } from '../services/profile-manager';
import { createPostModal } from './post';

/* =========================
 *   헬퍼들
 * =======================*/

function shortenAddress(addr: string, head = 6, tail = 4) {
  if (!addr || addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

function isWalletAddress(value?: string | null): value is `0x${string}` {
  if (!value) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

/** 서버 Profile + Posts → 뷰모델 */
function toUserProfileData(profile: Profile, posts: PersonaPost[]) {
  const rawNickname = profile.nickname?.trim();
  let name: string;

  if (rawNickname && isWalletAddress(rawNickname)) {
    name = shortenAddress(rawNickname);
  } else if (rawNickname && rawNickname.length > 0) {
    name = rawNickname;
  } else {
    name = shortenAddress(profile.account);
  }

  const avatarInitial =
    (
      profile.nickname?.trim()[0] ??
      profile.account.replace(/^0x/, '')[0] ??
      'P'
    ).toUpperCase();

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
      } catch {
        // ignore
      }
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
    avatarUrl: profile.avatarUrl ?? null,
    posts: mappedPosts,
  };
}

/** DOM 반영 (텍스트/아바타만 업데이트, 포스트 DOM은 건드리지 않음) */
function applyProfileData(
  root: HTMLElement,
  data: ReturnType<typeof toUserProfileData>,
) {
  const nameEl = root.querySelector<HTMLElement>('.profile-name');
  if (nameEl) nameEl.textContent = data.name;

  const bioEl = root.querySelector<HTMLElement>('.profile-bio');
  if (bioEl) bioEl.textContent = data.bio ?? '';

  const addrEl = root.querySelector<HTMLElement>('.profile-address');
  if (addrEl) addrEl.textContent = shortenAddress(data.address);

  const avatar = root.querySelector<HTMLElement>('.profile-avatar');
  if (avatar) {
    avatar.innerHTML = '';

    let src: string | null = null;

    if (data.avatarUrl && data.avatarUrl.trim().length > 0) {
      src = data.avatarUrl;
    } else if (isWalletAddress(data.address)) {
      const checksum = getAddress(data.address as `0x${string}`);
      src = getAddressAvatarDataUrl(checksum as `0x${string}`);
    }

    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = data.name;
      img.className = 'profile-avatar-img';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      avatar.appendChild(img);
    } else {
      avatar.textContent = data.avatarInitial;
    }
  }
}

/** 내부 링크를 SPA 라우터로 연결 */
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

/** 프로필 모달 안에서 포스트 카드를 눌렀을 때 → 포스트 모달 띄우기 */
function setupPostModalTriggers(
  root: HTMLElement,
  navigate?: (path: string) => void,
) {
  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const card = target.closest<HTMLElement>(
      '[data-hook="post-card"][data-post-id]',
    );
    if (!card) return;

    const idStr = card.getAttribute('data-post-id');
    if (!idStr) return;

    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) return;

    e.preventDefault();
    e.stopPropagation();

    createPostModal(id, navigate);
  });
}

/** 프로필 내용 안에 거래 패널을 mount (모달 버전) */
function mountTradePanel(root: HTMLElement, profile: Profile) {
  const contentOffset =
    root.querySelector<HTMLElement>('.profile-content-offset');
  if (!contentOffset) return;

  const statsRow =
    contentOffset.querySelector<HTMLElement>('.profile-stats-row');
  if (!statsRow) return;

  const tradeContainer = document.createElement('section');
  tradeContainer.setAttribute('data-role', 'trade-panel-root');

  // 순서: statsRow → tradeContainer → postsCard
  statsRow.insertAdjacentElement('afterend', tradeContainer);

  const personaAddress = profile.account as Address;

  const getTraderAddress = () => {
    const addr = tokenManager.getAddress?.();
    return addr && addr.startsWith('0x') ? (addr as Address) : null;
  };

  new TradePanel(tradeContainer, {
    personaAddress,
    getTraderAddress,
    onTraded: () => {
      console.log('[user-profile-modal] trade completed for', personaAddress);
    },
  });
}

/** 모달에서 온체인 가격/공급량 갱신 */
async function loadOnchainStats(root: HTMLElement, profile: Profile) {
  try {
    const account = profile.account;

    // EVM 주소가 아니면 스킵
    if (!account || !account.startsWith('0x')) return;

    const { getBuyPrice, getPersonaSupply } = await import(
      '../contracts/persona-fragments'
    );

    const personaAddress = account as Address;

    const [priceWei, supply] = await Promise.all([
      getBuyPrice(personaAddress, 1n),
      getPersonaSupply(personaAddress),
    ]);

    const priceEth = formatEther(priceWei);

    // Fragment Price
    const priceElement = root.querySelector<HTMLElement>(
      '[data-role="fragment-price"]',
    );
    if (priceElement) {
      priceElement.textContent = `${priceEth} ETH`;
    }

    // Supply
    const supplyElement = root.querySelector<HTMLElement>(
      '[data-role="fragment-supply"]',
    );
    if (supplyElement) {
      const anySupply = supply as any;
      const supplyText =
        typeof anySupply.toLocaleString === 'function'
          ? anySupply.toLocaleString()
          : supply.toString();

      supplyElement.textContent = supplyText;
    }
  } catch (err) {
    console.error('[user-profile-modal] loadOnchainStats error', err);
  }
}

/** 모달에서 현재 로그인한 trader의 보유 조각/채팅 CTA 처리 */
async function loadUserHoldingOrChatCTA(
  root: HTMLElement,
  profile: Profile,
  navigate?: (path: string) => void,
) {
  const ctaRoot = root.querySelector<HTMLElement>(
    '[data-role="user-fragment-cta-root"]',
  );
  if (!ctaRoot) return;

  try {
    const personaAddress = profile.account as Address;

    // persona가 EVM 주소가 아니면 UI 제거
    if (!personaAddress || !personaAddress.startsWith('0x')) {
      ctaRoot.remove();
      return;
    }

    const traderAddress = tokenManager.getAddress?.();
    if (!traderAddress || !traderAddress.startsWith('0x')) {
      // 지갑 미연결이면 UI 감춤
      ctaRoot.remove();
      return;
    }

    const normalizedPersona = getAddress(
      personaAddress as `0x${string}`,
    ) as Address;
    const normalizedTrader = getAddress(
      traderAddress as `0x${string}`,
    ) as Address;

    const { getPersonaBalance } = await import(
      '../contracts/persona-fragments'
    );

    const balance = await getPersonaBalance(
      normalizedPersona,
      normalizedTrader,
    );

    const isOwner =
      normalizedPersona.toLowerCase() === normalizedTrader.toLowerCase();
    const hasBalance = balance > 0n;

    // owner도 아니고 balance도 0이면 UI 숨김
    if (!isOwner && !hasBalance) {
      ctaRoot.remove();
      return;
    }

    const formatBigInt = (value: bigint) => {
      const anyValue = value as any;
      return typeof anyValue.toLocaleString === 'function'
        ? anyValue.toLocaleString()
        : value.toString();
    };

    const balanceText = formatBigInt(balance);

    let pillHTML: string;

    if (hasBalance) {
      pillHTML = `
        You hold
        <span class="profile-user-cta-count">${balanceText}</span>
        fragments
      `;
    } else {
      pillHTML = `You are the creator`;
    }

    const subText = hasBalance
      ? `As a fragment holder${isOwner ? ' (and creator)' : ''}, you can join this persona&apos;s private chat room.`
      : `As the creator, you can join this persona&apos;s private chat room.`;

    ctaRoot.innerHTML = `
      <div class="profile-user-cta">
        <div class="profile-user-cta-left">
          <div class="profile-user-cta-pill">
            ${pillHTML}
          </div>
          <div class="profile-user-cta-subtext">
            ${subText}
          </div>
        </div>
        <button type="button" class="profile-chat-btn" data-action="enter-chat-room">
          <span class="profile-chat-btn-icon">💬</span>
          <span>Enter Chat Room</span>
        </button>
      </div>
    `;

    const button = ctaRoot.querySelector<HTMLButtonElement>(
      '[data-action="enter-chat-room"]',
    );
    if (button) {
      button.addEventListener('click', () => {
        const url = `/chat/${normalizedPersona}`;
        if (navigate) {
          navigate(url);
        } else {
          window.location.href = url;
        }
      });
    }
  } catch (err) {
    console.error('[user-profile-modal] loadUserHoldingOrChatCTA error', err);
    ctaRoot.remove();
  }
}

/* =========================
 *   public API
 * =======================*/

export function createUserProfileModal(
  profileId: string,
  navigate?: (path: string) => void,
) {
  const modal = el('ion-modal.user-profile-modal') as HTMLIonModalElement;

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

  const titleEl = el('ion-title', 'Profile');

  const header = el(
    'ion-header',
    el('ion-toolbar', backBtn, titleEl),
  );

  /* Content: 초기에는 로딩 */

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
  ) as HTMLIonContentElement;

  modal.append(header, content);

  document.body.appendChild(modal);
  (modal as any).present();

  let unsubscribe: (() => void) | null = null;

  modal.addEventListener('ionModalDidDismiss', () => {
    modal.remove();
    if (unsubscribe) unsubscribe();
  });

  /* 비동기 로딩 */

  (async () => {
    try {
      const { profile, posts, personaFragments } =
        await fetchPersonaProfile(profileId);
      const data = toUserProfileData(profile, posts);

      // 기존 로딩 제거
      content.innerHTML = '';

      // 실제 프로필 DOM 생성 (SSR/SPA 공용 템플릿 재사용)
      const profileRoot = profileTemplate(
        el,
        profile,
        posts,
        personaFragments,
      ) as HTMLElement;

      profileRoot.classList.add('user-profile-modal-body');

      // 기본 데이터 적용 (텍스트/아바타만)
      applyProfileData(profileRoot, data);

      // 내부 링크 처리
      setupInternalLinks(profileRoot, modal, navigate);

      // 포스트 카드 클릭 → 포스트 모달
      setupPostModalTriggers(profileRoot, navigate);

      // DOM 삽입
      content.appendChild(profileRoot);

      // 제목 업데이트
      titleEl.textContent = data.name;

      // 인터랙티브 기능 mount
      try {
        mountTradePanel(profileRoot, profile);
        loadUserHoldingOrChatCTA(profileRoot, profile, navigate).catch(
          (err) => {
            console.error(
              '[user-profile-modal] failed to load user holding/chat CTA',
              err,
            );
          },
        );
        loadOnchainStats(profileRoot, profile).catch((err) => {
          console.error(
            '[user-profile-modal] failed to load on-chain stats',
            err,
          );
        });
      } catch (e) {
        console.error(
          '[user-profile-modal] setup interactive features failed',
          e,
        );
      }

      // 내 프로필 모달인 경우, profileManager.change 구독해서 실시간 업데이트
      try {
        const myAddr = tokenManager.getAddress?.();
        if (myAddr) {
          const normalizedMy = getAddress(myAddr);
          const normalizedProfile = getAddress(
            profile.account as `0x${string}`,
          );

          if (normalizedMy === normalizedProfile) {
            const handler = (updated: Profile | null) => {
              if (!updated) return;
              try {
                const updatedAddr = getAddress(
                  updated.account as `0x${string}`,
                );
                if (updatedAddr !== normalizedMy) return;
              } catch {
                return;
              }

              const updatedData = toUserProfileData(updated, posts);
              applyProfileData(profileRoot, updatedData);
              titleEl.textContent = updatedData.name;
            };

            profileManager.on('change', handler);
            unsubscribe = () => profileManager.off('change', handler as any);
          }
        }
      } catch (e) {
        console.error('[user-profile-modal] auto-sync setup failed', e);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
      content.innerHTML =
        '<div style="padding: 30px; text-align:center;">Failed to load profile.</div>';
    }
  })();

  return modal;
}
