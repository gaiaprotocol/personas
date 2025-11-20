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

  // 예시: explore 디테일 라우트 (원하면)
  // /explore/123 이런거
  // router.on('/explore/:id', ({ data }) => {
  //   setActiveTab('explore');
  //   openPersonaDetail(data.id);  // 여기에 실제 로직
  // });

  // not found → home
  router.notFound(() => {
    setActiveTab('home');
  });

  // 현재 URL 기준으로 매칭
  router.resolve();
}

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

  // 필요하면 나중에 Feed 탭 content도 이런 식으로 mount 가능:
  // const feedContent = document.getElementById('feed-tab-content');
  // if (feedContent) {
  //   const feedTab = new FeedTab();
  //   feedContent.appendChild(feedTab.el);
  // }

  const chatContent = document.getElementById('chat-tab-content');
  if (chatContent) {
    const chatTab = new ChatTab();
    chatContent.appendChild(chatTab.el);
  }
});
