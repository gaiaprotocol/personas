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

    // 거래 패널 mount (소셜 링크 → Stats → Trade → Posts 순서가 되도록)
    this.mountTradePanel(profile);

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

    // 순서: connectCard → statsRow → tradeContainer → postsCard
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
        const supplyText =
          typeof (supply as any).toLocaleString === 'function'
            ? (supply as any).toLocaleString()
            : supply.toString();

        supplyElement.textContent = supplyText;
      }
    } catch (err) {
      console.error('[ProfileTab] loadOnchainStats error', err);
      // 실패해도 SSR/DB 값(또는 "–") 그대로 두고 조용히 실패
    }
  }
}
