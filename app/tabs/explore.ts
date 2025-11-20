import '@shoelace-style/shoelace';
import { el } from '@webtaku/el';
import './explore.css';

type SortKey = 'trending' | 'holders' | 'volume' | 'price';

interface PersonaData {
  id: string;
  name: string;
  role: string;
  verified?: boolean;
  price: string;   // "$1.92"
  holders: string; // "2.4k" / "198"
  volume: string;  // "$420k"
  change: string;  // "+35%"
}

const samplePersonas: PersonaData[] = [
  {
    id: 'satoshi',
    name: 'Satoshi',
    role: 'Bitcoin Creator',
    verified: true,
    price: '$0.82',
    holders: '2.4k',
    volume: '$420k',
    change: '+35%'
  },
  {
    id: 'noah',
    name: 'Noah Tech',
    role: 'Blockchain Engineer',
    verified: false,
    price: '$1.92',
    holders: '198',
    volume: '$8.9k',
    change: '+23.1%'
  },
  {
    id: 'james',
    name: 'James Miller',
    role: 'Content Creator & Streamer',
    verified: false,
    price: '$1.33',
    holders: '156',
    volume: '$7.5k',
    change: '+19.4%'
  },
  {
    id: 'marcus',
    name: 'Marcus Dev',
    role: 'Open Source Contributor',
    verified: true,
    price: '$1.55',
    holders: '234',
    volume: '$12.3k',
    change: '+15.7%'
  }
];

export class ExploreTab {
  el: HTMLElement;
  listEl: HTMLElement;

  private personas: PersonaData[];
  private filtered: PersonaData[];
  private currentSort: SortKey = 'trending';

  private navigate?: (path: string) => void;

  constructor(navigate?: (path: string) => void) {
    this.navigate = navigate;
    this.personas = samplePersonas;
    this.filtered = [...this.personas];

    this.el = el('section.explore-wrapper');

    // 헤더
    const header = el(
      'div.explore-header',
      el('h2', 'Explore Personas'),
      el('p', 'Discover and invest in unique digital identities')
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
          placeholder: 'Search personas by name or description…',
          'data-role': 'explore-search'
        },
        el('sl-icon', { slot: 'prefix', name: 'search' })
      ) as any
    );

    const searchInput = search.querySelector('sl-input') as any;
    if (searchInput) {
      searchInput.addEventListener('sl-input', (event: any) => {
        const value = (event.target as any).value ?? '';
        this.handleSearch(value);
      });
      searchInput.addEventListener('sl-clear', () => this.handleSearch(''));
    }

    // 탭 그룹 (Shoelace 규격대로 탭 + 패널 모두 생성)
    const tabs = el(
      'sl-tab-group.explore-tabs',
      // nav
      el('sl-tab', { slot: 'nav', panel: 'trending', active: true }, 'Trending'),
      el('sl-tab', { slot: 'nav', panel: 'holders' }, 'Most Holders'),
      el('sl-tab', { slot: 'nav', panel: 'volume' }, 'Volume'),
      el('sl-tab', { slot: 'nav', panel: 'price' }, 'Price'),
      // panels (내용은 안 쓰지만 탭 동작을 위해 필요)
      el('sl-tab-panel', { name: 'trending' }),
      el('sl-tab-panel', { name: 'holders' }),
      el('sl-tab-panel', { name: 'volume' }),
      el('sl-tab-panel', { name: 'price' })
    ) as any;

    // 탭 변경 시 정렬 키 변경
    tabs.addEventListener('sl-tab-show', (event: any) => {
      const name = event.detail?.name as string | undefined;
      if (!name) return;

      // name값이 SortKey와 동일하므로 그대로 캐스팅
      this.currentSort = name as SortKey;
      this.applySortAndRender();
    });

    // 리스트 컨테이너
    this.listEl = el('div.explore-list');

    // 카운트 (탭 바로 아래에 배치)
    const countEl = el(
      'div.explore-count',
      el('span', `${this.filtered.length} personas found`)
    );

    const controls = el(
      'div.explore-controls',
      search,
      tabs,
      countEl
    );

    // 전체 조립
    this.el.append(
      header,
      controls,
      this.listEl
    );

    this.applySortAndRender();
  }

  /* ---------- 검색 ---------- */

  private handleSearch(raw: string) {
    const query = raw.toLowerCase().trim();
    if (!query) {
      this.filtered = [...this.personas];
    } else {
      this.filtered = this.personas.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.role.toLowerCase().includes(query)
      );
    }
    this.updateCount();
    this.applySortAndRender();
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
        data.sort((a, b) => parseHolders(b.holders) - parseHolders(a.holders));
        break;
      case 'volume':
        data.sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
        break;
      case 'price':
        data.sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); // 가격 높은 순
        break;
      case 'trending':
      default:
        data.sort((a, b) => parseChange(b.change) - parseChange(a.change)); // 변화율 높은 순
        break;
    }

    this.renderList(data);
  }

  private renderList(data: PersonaData[]) {
    this.listEl.innerHTML = '';

    data.forEach((p) => {
      const row = el(
        'div.persona-row',
        { 'data-id': p.id },

        // 왼쪽: 아바타 + 이름/역할
        el(
          'div.row-left',
          el(
            'div.avatar-wrapper',
            el('sl-avatar', { initials: p.name[0], shape: 'circle' })
          ),
          el(
            'div.info',
            el(
              'div.name-row',
              el('span.name', p.name),
              p.verified
                ? el('sl-icon', {
                  name: 'patch-check-fill',
                  class: 'icon-verified'
                })
                : null
            ),
            el('span.role', p.role)
          )
        ),

        // 오른쪽: 스탯
        el(
          'div.row-right',
          this.createStatCol('Price', p.price, 'highlight'),
          this.createStatCol('24h', p.change, 'success'),
          this.createStatCol('Holders', p.holders),
          this.createStatCol('Volume', p.volume)
        )
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
    variant: 'default' | 'highlight' | 'success' = 'default'
  ) {
    let valueClass = 'stat-value';
    if (variant === 'highlight') valueClass += ' text-highlight';
    if (variant === 'success') valueClass += ' text-success';

    return el(
      'div.stat-col',
      el('span.stat-label', label),
      el('span', { class: valueClass }, value)
    );
  }
}

/* ---------- 숫자 파싱 유틸 ---------- */

function parsePrice(s: string): number {
  return parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
}

function parseHolders(s: string): number {
  const m = s.includes('k') ? 1000 : 1;
  return (parseFloat(s.replace(/[^0-9.]/g, '')) || 0) * m;
}

function parseVolume(s: string): number {
  return parseHolders(s); // 같은 포맷 ($8.9k, $420k)
}

function parseChange(s: string): number {
  return parseFloat(s.replace(/[^0-9.-]/g, '')) || 0;
}
