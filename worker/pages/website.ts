import { h } from '@webtaku/h';
import { bottomBar } from './bottom-bar';
import { head } from './head';
import { scripts } from './scripts';
import { homeTab } from './tabs/home';
import { topBar } from './top-bar';

function website(search: string) {
  return (
    '<!DOCTYPE html>' +
    h(
      'html.dark.app-loading',
      { lang: 'en' },
      head('Gaia Personas'),
      h(
        'body.sl-theme-dark',
        h(
          'ion-app',
          h(
            'ion-tabs#main-tabs',
            // Home 탭
            h('ion-tab', { tab: 'home' }, topBar, homeTab),

            // Explore 탭
            h(
              'ion-tab',
              { tab: 'explore' },
              topBar,
              h('ion-content.main-content#explore-tab-content'),
            ),

            // 🔹 Feed 탭 (Chat 전에 배치)
            h(
              'ion-tab',
              { tab: 'feed' },
              topBar,
              // 당장은 간단히 텍스트 placeholder
              // 필요하면 #feed-tab-content 로 바꿔서 main.ts에서 mount 가능
              h('ion-content.main-content', 'Feed'),
            ),

            // Chat 탭
            h(
              'ion-tab',
              { tab: 'chat' },
              topBar,
              h('ion-content.main-content#chat-tab-content'),
            ),

            // Notifications 탭
            h(
              'ion-tab',
              { tab: 'notifications' },
              topBar,
              h('ion-content.main-content', 'Notifications'),
            ),

            // ❌ Wallet 탭 제거
            bottomBar,
          ),
        ),
        ...scripts(search),
      ),
    )
  );
}

export { website };
