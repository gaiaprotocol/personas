import { h } from '@webtaku/h';
import { tabConfig } from '../../shared/tab-config';

const tabButtons: string[] = [];

const bottomBar = h(
  'ion-tab-bar#main-tab-bar',
  { slot: 'bottom' },
  ...tabConfig.map((tab) => {
    // Common children: icon + label
    const children: any[] = [
      h('ion-icon', { name: tab.icon }),
      h('ion-label', tab.label),
    ];

    // Only notifications tab has a numeric badge
    if (tab.key === 'notifications') {
      children.push(
        h(
          'span',
          {
            class: 'notifications-tab-badge',
            'data-role': 'notifications-badge',
          },
          '',
        ),
      );
    }

    const btn = h(
      'ion-tab-button',
      {
        tab: tab.key,
        'data-tab': tab.key,
      },
      ...children,
    );
    tabButtons.push(btn);
    return btn;
  }),
);

export { bottomBar };
