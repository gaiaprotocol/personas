import { h } from '@webtaku/h';
import { tabConfig } from '../../shared/tab-config';

const tabButtons: string[] = [];

const bottomBar = h(
  'ion-tab-bar#main-tab-bar',
  { slot: 'bottom' },
  ...tabConfig.map((tab, index) => {
    const btn = h(
      'ion-tab-button',
      {
        tab: tab.key,
        'data-tab': tab.key,
        // 기본 활성 탭: home
        'aria-selected': index === 0 ? 'true' : 'false',
      },
      h('ion-icon', { name: tab.icon }),
      h('ion-label', tab.label),
    );
    tabButtons.push(btn);
    return btn;
  }),
);

export { bottomBar };
