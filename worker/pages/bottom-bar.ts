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
      },
      h('ion-icon', { name: tab.icon }),
      h('ion-label', tab.label),
    );
    tabButtons.push(btn);
    return btn;
  }),
);

export { bottomBar };
