import { h } from "@webtaku/h";

const tabs: {
  key: string;
  icon: string;
  label: string;
  path: string;
}[] = [
    { key: 'home', icon: 'home', label: 'Home', path: '/home' },
    { key: 'explore', icon: 'compass', label: 'Explore', path: '/explore' },
    { key: 'chat', icon: 'chatbubbles', label: 'Chat', path: '/chat' },
    {
      key: 'notifications',
      icon: 'notifications',
      label: 'Notifications',
      path: '/notifications',
    },
    { key: 'wallet', icon: 'wallet', label: 'Wallet', path: '/wallet' },
  ];

const tabButtons: string[] = [];

const bottomBar = h(
  'ion-tab-bar#main-tab-bar',
  { slot: 'bottom' },
  ...tabs.map((tab, index) => {
    const btn = h(
      'ion-tab-button',
      {
        tab: tab.key,
        'data-tab': tab.key,
        // 기본 활성 탭: home
        'aria-selected': index === 0 ? 'true' : 'false',
      },
      h('ion-icon', { name: tab.icon }),
      h('ion-label', tab.label)
    );
    tabButtons.push(btn);
    return btn;
  })
);

export { bottomBar };
