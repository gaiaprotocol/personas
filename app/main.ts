import { createRainbowKit } from '@gaiaprotocol/client-common';
import { BackButtonEvent, setupConfig } from '@ionic/core';
import { defineCustomElements } from '@ionic/core/loader';
import '@shoelace-style/shoelace';
import Navigo from 'navigo';
import { tabConfig } from '../shared/tab-config';
import { getProtocolFeeRate } from './contracts/persona-fragments';
import './main.css';
import { createEditProfileModal } from './modals/edit-profile';
import { openLoginModal } from './modals/login';
import { AppSettings, createSettingsModal } from './modals/settings';
import { ChatTab } from './tabs/chat';
import { ExploreTab } from './tabs/explore';
import { FeedTab } from './tabs/feed';
import { NotificationsTab } from './tabs/notifications';
import { PostTab } from './tabs/post';
import { ProfileTab } from './tabs/profile';

setupConfig({ hardwareBackButton: true, experimentalCloseWatcher: true });

const backHandler = (event: BackButtonEvent) => {
  event.detail.register(0, () => {
    const hasHistory = window.history.length > 1;
    const isFromExternal =
      document.referrer && !document.referrer.startsWith(window.location.origin);
    if (!hasHistory || isFromExternal) {
      document.removeEventListener('ionBackButton' as any, backHandler);
    }
    // Navigo가 popstate를 듣고 있으니, 그냥 뒤로가기 호출
    window.history.back();
  });
};
document.addEventListener('ionBackButton' as any, backHandler);

defineCustomElements(window);
document.body.appendChild(createRainbowKit());

document.documentElement.classList.remove('app-loading');

// =====================
//    Navigo 라우터
// =====================

const router = new Navigo('/', {
  hash: false, // /#/home 같은 hash 모드 안 쓰고
  linksSelector: 'a[href]', // 기본 값이라 생략해도 됨
});

// =====================
//   탭 헬퍼
// =====================

async function setActiveTab(tabKey: string) {
  const ionTabs = document.querySelector('ion-tabs') as any;
  if (!ionTabs) return;

  await ionTabs.select(tabKey);

  const buttons = document.querySelectorAll('#main-tab-bar ion-tab-button');
  buttons.forEach((btn) => {
    const btnTab = btn.getAttribute('data-tab');
    const isActive = btnTab === tabKey;
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}

function getPathFromTab(tabKey: string): string {
  const found = tabConfig.find((t) => t.key === tabKey);
  return found?.path ?? '/';
}

// 라우트 정의
function setupRoutes() {
  // 탭 라우트들
  tabConfig.forEach((t) => {
    router.on(t.path, () => {
      setActiveTab(t.key);
    });
  });

  // 루트(/) → home
  router.on('/', () => {
    setActiveTab('home');
  });

  // =========================
  //   디테일 라우트들
  // =========================

  router.on('/profile/:id', (match: any) => {
    const { id } = match.data || {};

    setActiveTab('profile');

    const profileContent = document.getElementById('profile-tab-content');
    if (profileContent) {
      profileContent.innerHTML = '';
      const profileTab = new ProfileTab(router.navigate.bind(router));
      profileContent.appendChild(profileTab.el);
    }
  });

  router.on('/post/:id', (match: any) => {
    const { id } = match.data || {};

    setActiveTab('post');

    const postContent = document.getElementById('post-tab-content');
    if (postContent) {
      postContent.innerHTML = '';
      const postTab = new PostTab(router.navigate.bind(router));
      postContent.appendChild(postTab.el);
    }
  });

  // not found → home (혹은 원하면 별도의 404 페이지로)
  router.notFound(() => {
    setActiveTab('home');
  });

  // 현재 URL 기준으로 매칭
  router.resolve();
}

// =====================
//  초기 DOM 세팅
// =====================

document.addEventListener('DOMContentLoaded', () => {
  setupRoutes();

  const navigate = (path: string) => router.navigate(path);

  const startTradingButton = document.getElementById('start-trading');
  startTradingButton?.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/explore');
  });

  const profileBtns = document.querySelectorAll('#open-profile');
  profileBtns.forEach((profileBtn) => {
    profileBtn.addEventListener('click', () => {
      openLoginModal();
    });
  });

  const logos = document.querySelectorAll('ion-title a');
  logos.forEach((logo) => {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('/');
    });
  });

  const tabButtons = document.querySelectorAll('#main-tab-bar ion-tab-button');
  tabButtons.forEach((btn) => {
    const tabKey = btn.getAttribute('data-tab');
    if (!tabKey) return;

    const path = getPathFromTab(tabKey);
    btn.setAttribute('href', path);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(path);
    });
  });

  // 앱 전체에서 사용할 현재 설정 값 (원하면 localStorage에서 불러오기)
  let currentSettings: AppSettings = {
    darkMode: true,
    pushEnabled: true,
    tradeNotifications: true,
    commentNotifications: true,
    marketingEmails: false,
    language: 'system',
  };

  const settingsBtns = document.querySelectorAll('#open-settings');
  settingsBtns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      const modal = createSettingsModal(currentSettings, {
        async onSave(next) {
          // 1) 메모리 상의 설정 업데이트
          currentSettings = next;

          // 2) 필요하면 여기서 persist
          // localStorage.setItem('app-settings', JSON.stringify(next));
          // 또는 서버로 PATCH /settings 호출 등
        },
      });

      document.body.appendChild(modal);
      await (modal as any).present();
    });
  });

  // 🔹 Explore Personas CTA → /explore
  const exploreButtons = document.querySelectorAll(
    '[data-action="explore-personas"]'
  );
  exploreButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('/explore');
    });
  });

  // 🔹 Trending Persona 카드 클릭 → /profile/:id
  const personaCards = document.querySelectorAll('[data-profile-id]');
  personaCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (card as HTMLElement).getAttribute('data-profile-id');
      if (id) {
        navigate(`/profile/${id}`);
      }
    });
  });

  // 🔹 Edit Profile 버튼 → 프로필 수정 모달
  document.body.addEventListener('click', async (event) => {
    const target = (event.target as HTMLElement).closest(
      '[data-action="edit-profile"]'
    ) as HTMLElement | null;

    if (!target) return;

    event.preventDefault();

    const address =
      target.getAttribute('data-address') ||
      '0x0000000000000000000000000000000000000000';

    // TODO: 실제 로그인/인증 로직과 연결해서 토큰을 가져오세요.
    const token = 'TEMP_AUTH_TOKEN';

    const modal = createEditProfileModal(address as `0x${string}`, token);
    document.body.appendChild(modal);
    await (modal as any).present();
  });

  // =========================
  //   나머지 탭 mount 코드
  // =========================
  const exploreContent = document.getElementById('explore-tab-content');
  if (exploreContent) {
    const exploreTab = new ExploreTab(navigate);
    exploreContent.appendChild(exploreTab.el);
  }

  const feedContent = document.getElementById('feed-tab-content');
  if (feedContent) {
    const feedTab = new FeedTab(navigate);
    feedContent.appendChild(feedTab.el);
  }

  const chatContent = document.getElementById('chat-tab-content');
  if (chatContent) {
    const chatTab = new ChatTab(navigate);
    chatContent.appendChild(chatTab.el);
  }

  const notificationsContent = document.getElementById('notifications-tab-content');
  if (notificationsContent) {
    const notificationsTab = new NotificationsTab(navigate);
    notificationsContent.appendChild(notificationsTab.el);
  }

  (async () => {
    console.log(await getProtocolFeeRate())
  })()
});
