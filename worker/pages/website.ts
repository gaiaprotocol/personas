import { h } from '@webtaku/h';
import { PersonaFragments } from '../../shared/types/persona-fragments';
import { PersonaPost } from '../../shared/types/post';
import { Profile } from '../../shared/types/profile';
import { profile } from '../../shared/ui/profile';
import { bottomBar } from './bottom-bar';
import { head } from './head';
import { postPage } from './post';
import { scripts } from './scripts';
import { homeTab } from './tabs/home';
import { topBar } from './top-bar';

type WebsiteData =
  | {
    type: 'post';
    post: PersonaPost;
    replies: PersonaPost[];
  }
  | {
    type: 'profile';
    profile: Profile;
    posts: PersonaPost[];
    personaFragments: PersonaFragments | null;
  };

function website(search: string, data?: WebsiteData) {
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
              h('ion-content.main-content#feed-tab-content'),
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
              h('ion-content.main-content#notifications-tab-content'),
            ),

            // Post 탭 (SSR 시 단일 포스트 뷰)
            h(
              'ion-tab',
              { tab: 'post' },
              topBar,
              h(
                'ion-content.main-content#post-tab-content',
                data?.type === 'post'
                  ? postPage(h, data.post, data.replies)
                  : undefined,
              ),
            ),

            // Profile 탭 (SSR 시 프로필 뷰)
            h(
              'ion-tab',
              { tab: 'profile' },
              topBar,
              h(
                'ion-content.main-content#profile-tab-content',
                data?.type === 'profile'
                  ? profile(
                    h,
                    data.profile,
                    data.posts,
                    data.personaFragments ?? null,
                  )
                  : undefined,
              ),
            ),

            bottomBar,
          ),
        ),
        ...scripts(search),

        `<script>
          const tabs = document.querySelector('#main-tabs');
          if (tabs) {
            ${data?.type === 'post' ? `tabs.select('post');` : ''}
            ${data?.type === 'profile' ? `tabs.select('profile');` : ''}
          }
        </script>`,
      ),
    )
  );
}

export { website };
