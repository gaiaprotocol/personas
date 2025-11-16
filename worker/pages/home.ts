import { h } from '@webtaku/h';
import { head } from './head';
import { bundle } from './bundle';
import { topBar } from './top-bar';
import { bottomBar } from './bottom-bar';

function home() {
  return '<!DOCTYPE html>' + h(
    'html.dark', { lang: 'en' },
    head('Gaia Personas'),
    h(
      'body.sl-theme-dark',
      h('ion-app',
        h('ion-tabs',
          h('ion-tab', { tab: 'home' }, topBar, h('ion-content', 'Home')),
          h('ion-tab', { tab: 'explore' }, topBar, h('ion-content', 'Explore')),
          h('ion-tab', { tab: 'chat' }, topBar, h('ion-content', 'Chat')),
          h('ion-tab', { tab: 'notifications' }, topBar, h('ion-content', 'Notifications')),
          h('ion-tab', { tab: 'wallet' }, topBar, h('ion-content', 'Wallet')),
          bottomBar,
        ),
      ),
      bundle
    )
  );
}

export { home };
