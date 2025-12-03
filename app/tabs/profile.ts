import { el } from '@webtaku/el';
import { formatEther } from 'viem';

import { tokenManager } from '@gaiaprotocol/client-common';
import { PersonaFragments } from '../../shared/types/persona-fragments';
import { PersonaPost } from '../../shared/types/post';
import { Profile } from '../../shared/types/profile';
import { profile as profileTemplate } from '../../shared/ui/profile';
import { TradePanel } from '../components/trade-panel';
import { Address } from '../contracts/persona-fragments';

export class ProfileTab {
  el: HTMLElement;
  private navigate?: (path: string) => void;

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

      const { getBuyPrice, getPersonaSupply } = await import(
        '../contracts/persona-fragments'
      );

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
   * 현재 로그인한 trader 의 페르소나 조각 보유 여부에 따라
   * - 보유 중이면: 보유 개수 + 채팅방 입장 버튼 (정성스럽게)
   * - 보유 중이 아니면: UI 숨김
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

      const { getPersonaBalance } = await import(
        '../contracts/persona-fragments'
      );

      const balance = await getPersonaBalance(
        personaAddress,
        traderAddress as Address,
      );

      // 보유량 0 이하면 아무 것도 안 보여줌
      if (balance <= 0n) {
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

      // 정성스럽게 꾸민 HTML 주입
      ctaRoot.innerHTML = `
        <div class="profile-user-cta">
          <div class="profile-user-cta-left">
            <div class="profile-user-cta-pill">
              You hold
              <span class="profile-user-cta-count">${balanceText}</span>
              fragments
            </div>
            <div class="profile-user-cta-subtext">
              As a fragment holder, you can join this persona&apos;s private chat room.
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
            this.navigate(`/chat/${personaAddress}`);
          } else {
            window.location.href = `/chat/${personaAddress}`;
          }
        });
      }
    } catch (err) {
      console.error('[ProfileTab] loadUserHoldingOrChatCTA error', err);
      ctaRoot.remove();
    }
  }
}
