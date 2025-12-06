import '@shoelace-style/shoelace';
import { el } from '@webtaku/el';
import './explore.css';

import { formatEther } from 'viem';
import type { TrendingPersonaFragment } from '../../shared/types/persona-fragments';
import {
  ExploreSortKey,
  fetchTrendingPersonaFragments,
} from '../api/persona-fragments';

type SortKey = ExploreSortKey;

interface PersonaData {
  id: string; // personaAddress
  name: string;
  role: string;
  verified?: boolean;

  // 새로 추가: 아바타 이미지 URL
  avatarUrl?: string | null;

  priceEth: number;
  priceLabel: string;

  holders: number;
  holdersLabel: string;

  volumeEth24h: number;
  volumeLabel: string;

  changePct24h: number | null;
  changeLabel: string;
}

export class ExploreTab {
  el: HTMLElement;
  listEl: HTMLElement;

  private personas: PersonaData[] = [];
  private filtered: PersonaData[] = [];

  private currentSort: SortKey = 'trending';
  private currentQuery: string = '';

  private navigate?: (path: string) => void;
  private isLoading = false;

  constructor(navigate?: (path: string) => void) {
    this.navigate = navigate;

    this.el = el('section.explore-wrapper');

    // 헤더
    const header = el(
      'div.explore-header',
      el('h2', 'Explore Personas'),
      el('p', 'Discover and invest in unique digital identities'),
    );

    // 검색바
    const search = el(
      'div.explore-search',
      el(
        'sl-input',
        {
          type: 'search',
          size: 'medium',
          pill: true,
          clearable: true,
          placeholder: 'Search personas by name or address…',
          'data-role': 'explore-search',
        },
        el('sl-icon', { slot: 'prefix', name: 'search' }),
      ) as any,
    );

    const searchInput = search.querySelector('sl-input') as any;
    if (searchInput) {
      searchInput.addEventListener('sl-input', (event: any) => {
        const value = (event.target as any).value ?? '';
        this.handleSearch(value);
      });
      searchInput.addEventListener('sl-clear', () => this.handleSearch(''));
    }

    // 탭 그룹
    const tabs = el(
      'sl-tab-group.explore-tabs',
      el('sl-tab', { slot: 'nav', panel: 'trending', active: true }, 'Trending'),
      el('sl-tab', { slot: 'nav', panel: 'holders' }, 'Most Holders'),
      el('sl-tab', { slot: 'nav', panel: 'volume' }, 'Volume'),
      el('sl-tab', { slot: 'nav', panel: 'price' }, 'Price'),
      el('sl-tab-panel', { name: 'trending' }),
      el('sl-tab-panel', { name: 'holders' }),
      el('sl-tab-panel', { name: 'volume' }),
      el('sl-tab-panel', { name: 'price' }),
    ) as any;

    tabs.addEventListener('sl-tab-show', (event: any) => {
      const name = event.detail?.name as string | undefined;
      if (!name) return;
      const sortKey = name as SortKey;
      void this.loadData(sortKey);
    });

    // 리스트 컨테이너
    this.listEl = el('div.explore-list');

    // 카운트
    const countEl = el(
      'div.explore-count',
      el('span', 'Loading personas...'),
    );

    const controls = el('div.explore-controls', search, tabs, countEl);

    this.el.append(header, controls, this.listEl);

    // 초기 로딩: trending 기준
    void this.loadData('trending');
  }

  /* ---------- 데이터 로드 ---------- */

  private async loadData(sort: SortKey) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.currentSort = sort;

    const countEl = this.el.querySelector('.explore-count span');
    if (countEl) countEl.textContent = 'Loading personas...';

    this.listEl.innerHTML =
      '<div style="padding:0.75rem; font-size:0.9rem; color:#888;">Loading personas...</div>';

    try {
      // Explore 화면이니 최대 100개 정도만
      const { personas } = await fetchTrendingPersonaFragments(100, sort);

      this.personas = personas.map((p) => this.fromTrendingFragment(p));

      // 현재 검색어가 있으면 즉시 필터 적용
      this.applySearchFilter();
      this.applySortAndRender();
      this.updateCount();
    } catch (err) {
      console.error('[ExploreTab] failed to load personas', err);
      this.listEl.innerHTML =
        '<div style="padding:0.75rem; font-size:0.9rem; color:#f97373;">Failed to load personas. Please try again.</div>';
      const count = this.el.querySelector('.explore-count span');
      if (count) count.textContent = '0 personas found';
    } finally {
      this.isLoading = false;
    }
  }

  private fromTrendingFragment(p: TrendingPersonaFragment): PersonaData {
    // price (wei → ETH)
    let priceEth = 0;
    let priceLabel = '-';
    try {
      const v = Number(formatEther(BigInt(p.lastPrice)));
      priceEth = Number.isFinite(v) ? v : 0;
      priceLabel =
        priceEth >= 1000
          ? `${priceEth.toFixed(0)} ETH`
          : `${priceEth.toFixed(4)} ETH`;
    } catch {
      // ignore
    }

    // 24h volume
    let volumeEth = 0;
    let volumeLabel = '0 ETH';
    try {
      const v = Number(formatEther(BigInt(p.volume24hWei ?? '0')));
      volumeEth = Number.isFinite(v) ? v : 0;

      if (!volumeEth) {
        volumeLabel = '0 ETH';
      } else if (volumeEth < 0.0001) {
        volumeLabel = '<0.0001 ETH';
      } else if (volumeEth >= 1000) {
        volumeLabel = `${volumeEth.toFixed(0)} ETH`;
      } else {
        volumeLabel = `${volumeEth.toFixed(4)} ETH`;
      }
    } catch {
      // ignore
    }

    // 24h change
    const changePct = p.change24hPct ?? null;
    const changeLabel =
      changePct === null || Number.isNaN(changePct)
        ? '—'
        : `${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}%`;

    return {
      id: p.personaAddress,
      name: p.name || p.personaAddress,
      role: 'On-chain Persona', // 나중에 프로필 정보로 대체 가능
      verified: false, // 필요하다면 profile 플래그 반영

      // 여기서 avatarUrl 매핑
      avatarUrl: p.avatarUrl,

      priceEth,
      priceLabel,

      holders: p.holderCount,
      holdersLabel: p.holderCount.toLocaleString(),

      volumeEth24h: volumeEth,
      volumeLabel,

      changePct24h: changePct,
      changeLabel,
    };
  }

  /* ---------- 검색 ---------- */

  private handleSearch(raw: string) {
    this.currentQuery = raw.toLowerCase().trim();
    this.applySearchFilter();
    this.updateCount();
    this.applySortAndRender();
  }

  private applySearchFilter() {
    const q = this.currentQuery;
    if (!q) {
      this.filtered = [...this.personas];
      return;
    }

    this.filtered = this.personas.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q),
    );
  }

  private updateCount() {
    const countEl = this.el.querySelector('.explore-count span');
    if (countEl) {
      countEl.textContent = `${this.filtered.length} personas found`;
    }
  }

  /* ---------- 정렬 + 렌더 ---------- */

  private applySortAndRender() {
    const data = [...this.filtered];

    switch (this.currentSort) {
      case 'holders':
        data.sort((a, b) => b.holders - a.holders);
        break;
      case 'volume':
        data.sort((a, b) => b.volumeEth24h - a.volumeEth24h);
        break;
      case 'price':
        data.sort((a, b) => b.priceEth - a.priceEth);
        break;
      case 'trending':
      default:
        data.sort((a, b) => {
          const av =
            a.changePct24h === null || Number.isNaN(a.changePct24h)
              ? -Infinity
              : a.changePct24h;
          const bv =
            b.changePct24h === null || Number.isNaN(b.changePct24h)
              ? -Infinity
              : b.changePct24h;
          return bv - av;
        });
        break;
    }

    this.renderList(data);
  }

  private renderList(data: PersonaData[]) {
    this.listEl.innerHTML = '';

    if (!data.length) {
      this.listEl.innerHTML =
        '<div style="padding:0.75rem; font-size:0.9rem; color:#888;">No personas found.</div>';
      return;
    }

    data.forEach((p) => {
      // 아바타 엘리먼트: 이미지 있으면 image, 없으면 initials
      const avatarEl = p.avatarUrl
        ? el('sl-avatar', {
          image: p.avatarUrl,
          shape: 'circle',
          label: p.name,
        })
        : el('sl-avatar', {
          initials: p.name[0] || 'P',
          shape: 'circle',
          label: p.name,
        });

      const row = el(
        'div.persona-row',
        { 'data-id': p.id },

        // 왼쪽: 아바타 + 이름/역할
        el(
          'div.row-left',
          el('div.avatar-wrapper', avatarEl),
          el(
            'div.info',
            el(
              'div.name-row',
              el('span.name', p.name),
              p.verified
                ? el('sl-icon', {
                  name: 'patch-check-fill',
                  class: 'icon-verified',
                })
                : null,
            ),
            el('span.role', p.role),
          ),
        ),

        // 오른쪽: 스탯
        el(
          'div.row-right',
          this.createStatCol('Price', p.priceLabel, 'highlight'),
          this.createStatCol(
            '24h',
            p.changeLabel,
            p.changePct24h !== null && p.changePct24h > 0 ? 'success' : 'default',
          ),
          this.createStatCol('Holders', p.holdersLabel),
          this.createStatCol('Volume', p.volumeLabel),
        ),
      ) as HTMLElement;

      row.addEventListener('click', () => {
        if (this.navigate) {
          this.navigate(`/profile/${p.id}`);
        } else {
          console.log(`Navigate to /profile/${p.id}`);
        }
      });

      this.listEl.append(row);
    });
  }

  private createStatCol(
    label: string,
    value: string,
    variant: 'default' | 'highlight' | 'success' = 'default',
  ) {
    let valueClass = 'stat-value';
    if (variant === 'highlight') valueClass += ' text-highlight';
    if (variant === 'success') valueClass += ' text-success';

    return el(
      'div.stat-col',
      el('span.stat-label', label),
      el('span', { class: valueClass }, value),
    );
  }
}
