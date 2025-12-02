import { el } from '@webtaku/el';
import { formatEther } from 'viem';

import { PersonaFragments } from '../../shared/types/persona-fragments';
import { PersonaPost } from '../../shared/types/post';
import { Profile } from '../../shared/types/profile';
import { profile as profileTemplate } from '../../shared/ui/profile';
import {
  Address,
  getBuyPrice,
  getPersonaSupply,
} from '../contracts/persona-fragments';

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

    // 클라이언트에서 온체인 가격/공급량 갱신
    this.loadOnchainStats(profile).catch((err) => {
      console.error('[ProfileTab] failed to load on-chain stats', err);
    });
  }

  /** /로 시작하는 내부 링크만 SPA 라우팅으로 처리 */
  private setupInternalLinks() {
    if (!this.navigate) return;

    // 프로필 뷰 안의 내부 링크들 (Recent Posts 등)
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
   * 클라이언트에서 스마트 컨트랙트 호출:
   * - getBuyPrice(persona, 1n) → Fragment Price
   * - getPersonaSupply(persona) → Supply
   * 두 값을 프로필 카드의 data-role 영역에 주입
   */
  private async loadOnchainStats(profile: Profile) {
    try {
      const account = profile.account;

      // EVM 주소 형태가 아니면 스킵
      if (!account || !account.startsWith('0x')) return;

      const personaAddress = account as Address;

      // 가격 / 공급량을 동시에 가져오기
      const [priceWei, supply] = await Promise.all([
        getBuyPrice(personaAddress, 1n),     // 1 fragment 기준 가격 (wei)
        getPersonaSupply(personaAddress),    // 총 공급량 (bigint)
      ]);

      // ===== Fragment Price 채우기 =====
      const priceEth = formatEther(priceWei);
      const priceElement = this.el.querySelector<HTMLElement>(
        '[data-role="fragment-price"]',
      );
      if (priceElement) {
        // 예: "0.1234 ETH"
        priceElement.textContent = `${priceEth} ETH`;
      }

      // ===== Supply 채우기 =====
      const supplyElement = this.el.querySelector<HTMLElement>(
        '[data-role="fragment-supply"]',
      );
      if (supplyElement) {
        // bigint → 문자열 (toLocaleString 사용하면 1,234 처럼 쉼표포맷)
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
