import { createRainbowKit } from '@gaiaprotocol/client-common';
import { BackButtonEvent, setupConfig } from '@ionic/core';
import { defineCustomElements } from '@ionic/core/loader';
import '@shoelace-style/shoelace';
import Navigo from 'navigo';
import { tabConfig } from '../shared/tab-config';
import './main.css';
import { openLoginModal } from './modals/login';
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

  // /profile/:id → Profile 탭 활성화 + profile-tab-content에 렌더
  router.on('/profile/:id', (match: any) => {
    const { id } = match.data || {};

    // 1) 프로필 탭 활성화
    setActiveTab('profile');

    // 2) 해당 탭 content에 ProfileTab 렌더
    const profileContent = document.getElementById('profile-tab-content');
    if (profileContent) {
      profileContent.innerHTML = ''; // 기존 내용 제거 (선택)
      const profileTab = new ProfileTab(); // id를 쓰고 싶으면 생성자/메서드에 넘기면 됨
      // 예: const profileTab = new ProfileTab(id);
      profileContent.appendChild(profileTab.el);
    }
  });

  // /post/:id → Post 탭 활성화 + post-tab-content에 렌더
  router.on('/post/:id', (match: any) => {
    const { id } = match.data || {};

    // 1) 포스트 탭 활성화
    setActiveTab('post');

    // 2) 해당 탭 content에 PostTab 렌더
    const postContent = document.getElementById('post-tab-content');
    if (postContent) {
      postContent.innerHTML = ''; // 기존 내용 제거 (선택)
      const postTab = new PostTab(); // 필요하면 id 전달
      // 예: const postTab = new PostTab(id);
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

  // Start Trading 버튼 → /explore로 라우트
  const startTradingButton = document.getElementById('start-trading');
  startTradingButton?.addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/explore');
  });

  // 프로필 버튼 → 로그인 모달
  const profileBtns = document.querySelectorAll('#open-profile');
  profileBtns.forEach((profileBtn) => {
    profileBtn.addEventListener('click', () => {
      openLoginModal();
    });
  });

  // 로고 클릭 → /
  const logos = document.querySelectorAll('ion-title a');
  logos.forEach((logo) => {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate('/');
    });
  });

  // 탭 버튼이 a 태그는 아니니까 직접 라우트 호출
  const tabButtons = document.querySelectorAll('#main-tab-bar ion-tab-button');
  tabButtons.forEach((btn) => {
    const tabKey = btn.getAttribute('data-tab');
    if (!tabKey) return;

    const path = getPathFromTab(tabKey);

    // 접근성/UX용: href 넣어두면 우클릭/미들클릭 등도 더 자연스러움
    btn.setAttribute('href', path);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate(path);
    });
  });

  // explore content mount
  const exploreContent = document.getElementById('explore-tab-content');
  if (exploreContent) {
    const exploreTab = new ExploreTab();
    exploreContent.appendChild(exploreTab.el);
  }

  const feedContent = document.getElementById('feed-tab-content');
  if (feedContent) {
    const feedTab = new FeedTab();
    feedContent.appendChild(feedTab.el);
  }

  const chatContent = document.getElementById('chat-tab-content');
  if (chatContent) {
    const chatTab = new ChatTab();
    chatContent.appendChild(chatTab.el);
  }

  const notificationsContent = document.getElementById('notifications-tab-content');
  if (notificationsContent) {
    const notificationsTab = new NotificationsTab();
    notificationsContent.appendChild(notificationsTab.el);
  }

  // 필요하다면 기본 프로필/포스트 탭 내용도 초기 렌더 가능
  const profileContent = document.getElementById('profile-tab-content');
  if (profileContent) {
    const profileTab = new ProfileTab();
    profileContent.appendChild(profileTab.el);
  }

  const postContent = document.getElementById('post-tab-content');
  if (postContent) {
    const postTab = new PostTab();
    postContent.appendChild(postTab.el);
  }
});
