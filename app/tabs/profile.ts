import { el } from '@webtaku/el';
import { formatEther, getAddress } from 'viem';

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
    // SSR/공통 템플릿으로 기본 화면 먼저 렌더
    this.el = profileTemplate(
      el,
      profile,
      posts,
      personaFragments,
    ) as HTMLElement;

    this.navigate = navigate;
    this.setupInternalLinks();

    // 프로필 내 포스트 카드 클릭 → 상세/모달
    this.setupPostCardClicks();

    // 거래 패널 mount (소셜 링크 → Stats → Trade → User CTA → Posts 순서)
    this.mountTradePanel(profile);

    // 보유량 / 채팅방 CTA
    this.loadUserHoldingOrChatCTA(profile).catch((err) => {
      console.error('[ProfileTab] failed to load user holding/chat CTA', err);
    });

    // 온체인 가격/공급량 갱신 (SSR 값 덮어쓰기)
    this.loadOnchainStats(profile).catch((err) => {
      console.error('[ProfileTab] failed to load on-chain stats', err);
    });

    // TradeExecuted 이벤트 구독 → 다른 유저의 거래도 실시간 반영
    this.subscribeTradeEvents(profile).catch((err) => {
      console.error('[ProfileTab] failed to subscribe trade events', err);
    });
  }

  /** /로 시작하는 내부 링크만 SPA 라우팅으로 처리 */
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

  /**
   * 프로필의 "Recent Posts" 카드 내 포스트 클릭 처리
   * - 데스크탑: /post/:id 로 navigate
   * - 모바일(<= 768px): window 에 open-post-modal 이벤트 디스패치
   */
  private setupPostCardClicks() {
    const cards = this.el.querySelectorAll<HTMLElement>('[data-hook="post-card"]');

    cards.forEach((card) => {
      const idAttr = card.getAttribute('data-post-id');
      if (!idAttr) return;

      const postId = Number(idAttr);
      if (!Number.isFinite(postId) || postId <= 0) return;

      card.addEventListener('click', (event) => {
        const target = event.target as HTMLElement | null;

        // 카드 안의 개별 버튼(댓글/리포스트/좋아요/더보기)을 눌렀을 때는
        // 카드 네비게이션을 막고, 각 버튼의 핸들러가 동작하게 둠.
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

  /**
   * 프로필 내용 안에 거래 패널을 mount
   * - connectCard(소셜) 다음, statsRow 다음에 삽입
   */
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

    // 순서: connectCard → statsRow → tradeContainer → userFragmentCta → postsCard
    statsRow.insertAdjacentElement('afterend', tradeContainer);

    const personaAddress = profile.account as Address;

    // tokenManager 에서 현재 지갑 주소를 trader 로 사용
    const getTraderAddress = () => {
      const addr = tokenManager.getAddress?.();
      return addr && addr.startsWith('0x') ? (addr as Address) : null;
    };

    new TradePanel(tradeContainer, {
      personaAddress,
      getTraderAddress,
      onTraded: () => {
        console.log('[ProfileTab] trade completed for', personaAddress);
        // 내가 트레이드한 경우 즉시 stats / CTA 갱신
        this.loadOnchainStats(profile).catch((err) => {
          console.error('[ProfileTab] loadOnchainStats after trade error', err);
        });
        this.loadUserHoldingOrChatCTA(profile).catch((err) => {
          console.error('[ProfileTab] loadUserHoldingOrChatCTA after trade error', err);
        });
      },
    });
  }

  /**
   * 클라이언트에서 스마트 컨트랙트 호출해서
   * - Fragment Price (1개 기준)
   * - Supply
   * 를 프로필 상단 Stats 영역에 주입
   */
  private async loadOnchainStats(profile: Profile) {
    try {
      const account = profile.account;

      // EVM 주소 형태가 아니면 스킵
      if (!account || !account.startsWith('0x')) return;

      const personaAddress = account as Address;

      const [priceWei, supply] = await Promise.all([
        getBuyPrice(personaAddress, 1n), // 1 fragment 기준 가격 (wei)
        getPersonaSupply(personaAddress), // 총 공급량 (bigint)
      ]);

      // ===== Fragment Price 채우기 =====
      const priceEth = formatEther(priceWei);
      const priceElement = this.el.querySelector<HTMLElement>(
        '[data-role="fragment-price"]',
      );
      if (priceElement) {
        priceElement.textContent = `${priceEth} ETH`;
      }

      // ===== Supply 채우기 =====
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
      // 실패해도 SSR/DB 값(또는 "–") 그대로 두고 조용히 실패
    }
  }

  /**
   * 현재 로그인한 trader 의 페르소나 조각 보유 여부/owner 여부에 따라
   * - balance > 0: "You hold X fragments"
   * - balance === 0 && creator: "You are the creator"
   * - 둘 다 아니면: UI 숨김
   */
  private async loadUserHoldingOrChatCTA(profile: Profile) {
    const ctaRoot = this.el.querySelector<HTMLElement>(
      '[data-role="user-fragment-cta-root"]',
    );
    if (!ctaRoot) return;

    try {
      const personaAddress = profile.account as Address;

      // persona 가 EVM 주소가 아니면 UI 자체 제거
      if (!personaAddress || !personaAddress.startsWith('0x')) {
        ctaRoot.remove();
        return;
      }

      const traderAddress = tokenManager.getAddress?.();
      if (!traderAddress || !traderAddress.startsWith('0x')) {
        // 지갑 미연결이면 보유/채팅 UI 자체를 감춤
        ctaRoot.remove();
        return;
      }

      // 주소 normalize (checksum)
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

      // owner 가 아니고, balance 가 0이면 숨김
      if (!isOwner && !hasBalance) {
        ctaRoot.remove();
        return;
      }

      // BigInt → 보기 좋은 문자열
      const formatBigInt = (value: bigint) => {
        const anyValue = value as any;
        return typeof anyValue.toLocaleString === 'function'
          ? anyValue.toLocaleString()
          : value.toString();
      };

      const balanceText = formatBigInt(balance);

      // pill 내용 분기
      let pillHTML: string;

      if (hasBalance) {
        // 갖고 있는 개수가 있으면 → count 기준 (creator 여부와 무관)
        pillHTML = `
          You hold
          <span class="profile-user-cta-count">${balanceText}</span>
          fragments
        `;
      } else {
        // 개수는 없고, creator인 경우
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

  /**
   * TradeExecuted 이벤트 구독
   * - persona 인덱스로 필터
   * - 해당 페르소나에 트레이드 발생 시 stats / CTA 다시 로딩
   */
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

  /**
   * SPA 환경에서 언마운트 시 호출해주면 좋음
   */
  destroy() {
    this.unsubscribeFns.forEach((fn) => fn());
    this.unsubscribeFns = [];
  }
}
