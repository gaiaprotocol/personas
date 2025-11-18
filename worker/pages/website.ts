import { h } from '@webtaku/h';
import { bottomBar } from './bottom-bar';
import { head } from './head';
import { scripts } from './scripts';
import { homeTab } from './tabs/home-tab';
import { topBar } from './top-bar';

function website(search: string) {
  return '<!DOCTYPE html>' + h(
    'html.dark.app-loading', { lang: 'en' },
    head('Gaia Personas'),
    h(
      'body.sl-theme-dark',
      h('ion-app',
        h('ion-tabs#main-tabs',
          h('ion-tab', { tab: 'home' }, topBar, homeTab),
          h('ion-tab', { tab: 'explore' }, topBar, h('ion-content.main-content', 'Explore')),
          h('ion-tab', { tab: 'chat' }, topBar, h('ion-content.main-content', 'Chat')),
          h('ion-tab', { tab: 'notifications' }, topBar, h('ion-content.main-content', 'Notifications')),
          h('ion-tab', { tab: 'wallet' }, topBar, h('ion-content.main-content', 'Wallet')),
          bottomBar,
        ),
      ),
      ...scripts(search)
    )
  );
}

export { website };
