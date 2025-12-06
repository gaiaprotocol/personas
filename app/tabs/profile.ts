import { el } from '@webtaku/el';
import { formatEther, getAddress } from 'viem';

import { getAddressAvatarDataUrl } from '@gaiaprotocol/address-avatar';
import { tokenManager, wagmiConfig } from '@gaiaprotocol/client-common';
import { watchContractEvent } from 'wagmi/actions';

import { PersonaFragments } from '../../shared/types/persona-fragments';
import { PersonaPost } from '../../shared/types/post';
import { Profile } from '../../shared/types/profile';
import { profile as profileTemplate } from '../../shared/ui/profile';

import { TradePanel } from '../components/trade-panel';
import {
  Address,
  getBuyPrice,
  getPersonaBalance,
  getPersonaSupply,
  personaFragmentsAbi,
} from '../contracts/persona-fragments';
import { PERSONA_FRAGMENTS_ADDRESS } from '../vars';

export class ProfileTab {
  el: HTMLElement;
  private navigate?: (path: string) => void;
  private unsubscribeFns: Array<() => void> = [];

  constructor(
    profile: Profile,
    posts: PersonaPost[],
    personaFragments: PersonaFragments | null,
    navigate?: (path: string) => void,
  ) {
    this.el = profileTemplate(
      el,
      profile,
      posts,
      personaFragments,
    ) as HTMLElement;

    this.navigate = navigate;
    this.setupInternalLinks();

    this.applyProfileAvatar(profile);
    this.applyPostCardAvatars(posts);

    this.setupPostCardClicks();
    this.mountTradePanel(profile);

    this.loadUserHoldingOrChatCTA(profile).catch((err) => {
      console.error('[ProfileTab] failed to load user holding/chat CTA', err);
    });

    this.loadOnchainStats(profile).catch((err) => {
      console.error('[ProfileTab] failed to load on-chain stats', err);
    });

    this.subscribeTradeEvents(profile).catch((err) => {
      console.error('[ProfileTab] failed to subscribe trade events', err);
    });
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

  private applyProfileAvatar(profile: Profile) {
    const container = this.el.querySelector<HTMLElement>('.profile-avatar');
    if (!container) return;

    container.innerHTML = '';

    let src: string | null = null;

    if (profile.avatarUrl && profile.avatarUrl.trim().length > 0) {
      src = profile.avatarUrl;
    } else if (profile.account && profile.account.startsWith('0x')) {
      try {
        const checksum = getAddress(profile.account as `0x${string}`);
        src = getAddressAvatarDataUrl(checksum as `0x${string}`);
      } catch {
        // ignore
      }
    }

    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = profile.nickname || 'Profile';
      img.className = 'profile-avatar-img';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      container.appendChild(img);
    } else {
      const initial =
        profile.nickname?.trim().charAt(0).toUpperCase() ??
        profile.account.trim().charAt(0).toUpperCase() ??
        'P';
      container.textContent = initial;
    }
  }

  private applyPostCardAvatars(posts: PersonaPost[]) {
    if (!posts.length) return;

    const postMap = new Map<number, PersonaPost>();
    posts.forEach((p) => postMap.set(p.id, p));

    const cards = this.el.querySelectorAll<HTMLElement>('[data-hook="post-card"]');

    cards.forEach((card) => {
      const idAttr = card.getAttribute('data-post-id');
      if (!idAttr) return;

      const postId = Number(idAttr);
      if (!Number.isFinite(postId) || postId <= 0) return;

      const post = postMap.get(postId);
      if (!post) return;

      const avatar = card.querySelector<HTMLElement>('.post-card-avatar');
      if (!avatar) return;

      if (avatar.querySelector('img')) return;

      avatar.innerHTML = '';

      let src: string | null = null;

      if (post.authorAvatarUrl && post.authorAvatarUrl.trim().length > 0) {
        src = post.authorAvatarUrl;
      } else if (post.author && post.author.startsWith('0x')) {
        try {
          const checksum = getAddress(post.author as `0x${string}`);
          src = getAddressAvatarDataUrl(checksum as `0x${string}`);
        } catch {
          // ignore
        }
      }

      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = post.authorNickname || 'Profile';
        img.className = 'post-card-avatar-img';
        avatar.appendChild(img);
      } else {
        const initial =
          (post.authorNickname || 'U').trim().charAt(0).toUpperCase() || 'U';
        avatar.textContent = initial;
      }
    });
  }

  private setupPostCardClicks() {
    const cards = this.el.querySelectorAll<HTMLElement>('[data-hook="post-card"]');

    cards.forEach((card) => {
      const idAttr = card.getAttribute('data-post-id');
      if (!idAttr) return;

      const postId = Number(idAttr);
      if (!Number.isFinite(postId) || postId <= 0) return;

      card.addEventListener('click', (event) => {
        const target = event.target as HTMLElement | null;

        if (
          target &&
          target.closest(
            '[data-hook="post-reply"],' +
            '[data-hook="post-repost"],' +
            '[data-hook="post-like"],' +
            '[data-hook="post-more"]',
          )
        ) {
          return;
        }

        const path = `/post/${postId}`;

        if (this.navigate) {
          this.navigate(path);
        } else {
          window.location.href = path;
        }
      });
    });
  }

  private mountTradePanel(profile: Profile) {
    const contentOffset = this.el.querySelector<HTMLElement>(
      '.profile-content-offset',
    );
    if (!contentOffset) return;

    const statsRow = contentOffset.querySelector<HTMLElement>(
      '.profile-stats-row',
    );
    if (!statsRow) return;

    const tradeContainer = document.createElement('section');
    tradeContainer.setAttribute('data-role', 'trade-panel-root');

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
        console.log('[ProfileTab] trade completed for', personaAddress);
        this.loadOnchainStats(profile).catch((err) => {
          console.error('[ProfileTab] loadOnchainStats after trade error', err);
        });
        this.loadUserHoldingOrChatCTA(profile).catch((err) => {
          console.error('[ProfileTab] loadUserHoldingOrChatCTA after trade error', err);
        });
      },
    });
  }

  private async loadOnchainStats(profile: Profile) {
    try {
      const account = profile.account;

      if (!account || !account.startsWith('0x')) return;

      const personaAddress = account as Address;

      const [priceWei, supply] = await Promise.all([
        getBuyPrice(personaAddress, 1n),
        getPersonaSupply(personaAddress),
      ]);

      const priceEth = formatEther(priceWei);

      const priceElement = this.el.querySelector<HTMLElement>(
        '[data-role="fragment-price"]',
      );
      if (priceElement) {
        priceElement.textContent = `${priceEth} ETH`;
      }

      const supplyElement = this.el.querySelector<HTMLElement>(
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
      console.error('[ProfileTab] loadOnchainStats error', err);
    }
  }

  private async loadUserHoldingOrChatCTA(profile: Profile) {
    const ctaRoot = this.el.querySelector<HTMLElement>(
      '[data-role="user-fragment-cta-root"]',
    );
    if (!ctaRoot) return;

    try {
      const personaAddress = profile.account as Address;

      if (!personaAddress || !personaAddress.startsWith('0x')) {
        ctaRoot.remove();
        return;
      }

      const traderAddress = tokenManager.getAddress?.();
      if (!traderAddress || !traderAddress.startsWith('0x')) {
        ctaRoot.remove();
        return;
      }

      const normalizedPersona = getAddress(
        personaAddress as `0x${string}`,
      ) as Address;
      const normalizedTrader = getAddress(
        traderAddress as `0x${string}`,
      ) as Address;

      const balance = await getPersonaBalance(
        normalizedPersona,
        normalizedTrader,
      );

      const isOwner =
        normalizedPersona.toLowerCase() === normalizedTrader.toLowerCase();
      const hasBalance = balance > 0n;

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
          if (this.navigate) {
            this.navigate(`/chat/${normalizedPersona}`);
          } else {
            window.location.href = `/chat/${normalizedPersona}`;
          }
        });
      }
    } catch (err) {
      console.error('[ProfileTab] loadUserHoldingOrChatCTA error', err);
      ctaRoot.remove();
    }
  }

  private async subscribeTradeEvents(profile: Profile) {
    const account = profile.account;
    if (!account || !account.startsWith('0x')) return;

    const personaAddress = account as Address;

    const unwatch = watchContractEvent(wagmiConfig, {
      address: PERSONA_FRAGMENTS_ADDRESS,
      abi: personaFragmentsAbi,
      eventName: 'TradeExecuted',
      args: {
        persona: personaAddress,
      },
      onLogs: () => {
        console.log('[ProfileTab] TradeExecuted event for persona', personaAddress);
        this.loadOnchainStats(profile).catch((err) => {
          console.error('[ProfileTab] loadOnchainStats from event error', err);
        });
        this.loadUserHoldingOrChatCTA(profile).catch((err) => {
          console.error('[ProfileTab] loadUserHoldingOrChatCTA from event error', err);
        });
      },
    });

    this.unsubscribeFns.push(unwatch);
  }

  destroy() {
    this.unsubscribeFns.forEach((fn) => fn());
    this.unsubscribeFns = [];
  }
}
