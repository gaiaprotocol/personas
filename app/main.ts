import {
  createJazzicon,
  createRainbowKit,
  logout,
  tokenManager,
} from '@gaiaprotocol/client-common';
import { BackButtonEvent, setupConfig } from '@ionic/core';
import { defineCustomElements } from '@ionic/core/loader';
import '@shoelace-style/shoelace';
import Navigo from 'navigo';
import { getAddress, zeroAddress } from 'viem';

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

// 🔹 OAuth / 지갑 링크 관련
import { oauth2Me, OAuth2MeResult, oauthLinkWallet } from './auth/oauth2';
import { openWalletLinkModal } from './modals/google-link-wallet-modal';

// 🔹 세션 파라미터 관리
import { sessionManager } from './auth/session-manager';

// 🔹 프로필 타입/매니저
import type { Profile } from './api/profile';
import { profileManager } from './services/profile-manager';

// 🔹 구글 로그아웃
import { googleLogout } from './auth/google-login';

// =====================
//  Environment / Session / WebView
// =====================

const urlParams = new URLSearchParams(window.location.search);

// backend에서 넘겨주는 ?session=... 처리
const sid = urlParams.get('session');
if (sid) {
  sessionManager.set(sid);
}

export const isWebView = urlParams.get('source') === 'webview';

// =====================
//    Ionic 기본 셋업
// =====================

setupConfig({ hardwareBackButton: true, experimentalCloseWatcher: true });

const backHandler = (event: BackButtonEvent) => {
  event.detail.register(0, () => {
    const hasHistory = window.history.length > 1;
    const isFromExternal =
      document.referrer && !document.referrer.startsWith(window.location.origin);
    if (!hasHistory || isFromExternal) {
      document.removeEventListener('ionBackButton' as any, backHandler);
    }
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
  hash: false,
  linksSelector: 'a[href]',
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

// =====================
//   프로필 버튼 아바타 렌더링
// =====================

function applyProfileAvatar(profile: Profile | null) {
  const buttons = document.querySelectorAll<HTMLElement>('#open-profile');
  if (!buttons.length) return;

  const hasToken = tokenManager.has();
  const rawAddr = hasToken ? tokenManager.getAddress() : undefined;

  buttons.forEach((btn) => {
    let avatarContainer = btn.querySelector<HTMLElement>('.profile-avatar');

    // 🔹 로그인 안 된 상태면 아바타 제거 + title 제거
    if (!hasToken || !rawAddr) {
      if (avatarContainer) avatarContainer.remove();
      btn.removeAttribute('title');
      return;
    }

    const addr = getAddress(rawAddr || zeroAddress);

    // 컨테이너 없으면 생성
    if (!avatarContainer) {
      avatarContainer = document.createElement('span');
      avatarContainer.className = 'profile-avatar';
      avatarContainer.style.display = 'inline-flex';
      avatarContainer.style.alignItems = 'center';
      avatarContainer.style.justifyContent = 'center';
      avatarContainer.style.width = '28px';
      avatarContainer.style.height = '28px';
      avatarContainer.style.borderRadius = '999px';
      avatarContainer.style.overflow = 'hidden';
      // padding/margin 건드리지 않음
      btn.appendChild(avatarContainer);
    }

    avatarContainer.innerHTML = '';

    if (profile?.profile_image) {
      const img = document.createElement('img');
      img.src = profile.profile_image;
      img.alt = profile.nickname || 'Profile';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      avatarContainer.appendChild(img);
    } else {
      const jazz = createJazzicon(addr);
      (jazz as HTMLElement).style.width = '100%';
      (jazz as HTMLElement).style.height = '100%';
      avatarContainer.appendChild(jazz as HTMLElement);
    }

    if (profile?.nickname) {
      btn.title = profile.nickname;
    } else if (rawAddr) {
      btn.title = rawAddr;
    }
  });
}

// =====================
//   Shoelace 메뉴 (프로필/로그아웃)
//   - <sl-menu> 사용 + data-action (gods 코드 스타일)
// =====================

let activeProfileMenu: HTMLElement | null = null;
let cleanupProfileMenu: (() => void) | null = null;

function closeProfileMenu() {
  if (cleanupProfileMenu) {
    cleanupProfileMenu();
    cleanupProfileMenu = null;
  }
  if (activeProfileMenu) {
    activeProfileMenu.remove();
    activeProfileMenu = null;
  }
}

function openProfileMenu(anchorBtn: HTMLElement) {
  closeProfileMenu();

  const rect = anchorBtn.getBoundingClientRect();

  const wrapper = document.createElement('div');
  wrapper.className = 'profile-menu-wrapper';
  wrapper.style.position = 'fixed';
  wrapper.style.zIndex = '9999';
  wrapper.style.top = `${rect.bottom + 8}px`;
  wrapper.style.left = `${Math.max(rect.left - 80, 8)}px`;
  wrapper.style.minWidth = '160px';
  wrapper.style.background = 'var(--sl-panel-background-color, #111827)';
  wrapper.style.borderRadius = '12px';
  wrapper.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
  wrapper.style.padding = '4px';
  wrapper.style.boxSizing = 'border-box';

  const menu = document.createElement('sl-menu') as HTMLElement & {
    addEventListener: (type: string, cb: (e: any) => void) => void;
  };

  const itemProfile = document.createElement('sl-menu-item') as HTMLElement;
  itemProfile.setAttribute('data-action', 'profile');
  itemProfile.style.textTransform = 'capitalize';
  itemProfile.textContent = 'View profile';

  const itemLogout = document.createElement('sl-menu-item') as HTMLElement;
  itemLogout.setAttribute('data-action', 'logout');
  itemLogout.textContent = 'Logout';

  menu.append(itemProfile, itemLogout);
  wrapper.appendChild(menu);
  document.body.appendChild(wrapper);

  const onDocMouseDown = (ev: MouseEvent) => {
    const t = ev.target as Node;
    if (!wrapper.contains(t) && t !== anchorBtn) {
      closeProfileMenu();
    }
  };

  document.addEventListener('mousedown', onDocMouseDown);

  menu.addEventListener('sl-select', async (e: any) => {
    const action = e.detail?.item?.getAttribute('data-action');
    closeProfileMenu();

    if (action === 'profile') {
      const addr = tokenManager.getAddress();
      if (addr) {
        router.navigate(`/profile/${addr}`);
      }
    } else if (action === 'logout') {
      try {
        await logout();
      } catch (err) {
        console.error('[logout] failed', err);
      }
      try {
        await googleLogout();
      } catch {
        // ignore
      }
      tokenManager.clear();
    }
  });

  cleanupProfileMenu = () => {
    document.removeEventListener('mousedown', onDocMouseDown);
  };
  activeProfileMenu = wrapper;
}

// =====================
//   구글 로그인 + 자동 지갑 링크
// =====================

async function tryAutoLinkIfNeeded(
  meResult: OAuth2MeResult | null,
): Promise<'ok' | 'to-link' | 'skip'> {
  const walletHasToken = tokenManager.has();

  // 1) 구글 세션이 완전한 경우: 토큰 + 지갑주소 보유 → 바로 주입
  if (meResult?.ok && meResult.wallet_address && meResult.token) {
    tokenManager.set(meResult.token, meResult.wallet_address as `0x${string}`);
    return 'ok';
  }

  // 2) 구글 로그인 O, 지갑 토큰 X → 링크 필요
  if (meResult?.ok && !walletHasToken) {
    return 'to-link';
  }

  // 3) 지갑 토큰 O, 구글 세션 O → 서버에 링크 요청
  if (walletHasToken && meResult?.ok) {
    const authToken = tokenManager.getToken();
    if (!authToken) return 'to-link';

    try {
      const linkRes = await oauthLinkWallet();
      if (linkRes?.ok) {
        if (linkRes.token && linkRes.wallet_address) {
          tokenManager.set(linkRes.token, linkRes.wallet_address as `0x${string}`);
        } else {
          const refreshed = await oauth2Me();
          if (refreshed.ok && refreshed.token && refreshed.wallet_address) {
            tokenManager.set(refreshed.token, refreshed.wallet_address as `0x${string}`);
          }
        }
        return 'ok';
      }
      return 'to-link';
    } catch {
      return 'to-link';
    }
  }

  // 4) 그 외 케이스
  return 'skip';
}

async function ensureWalletLinkedOnStartup() {
  let meResult: OAuth2MeResult | null = null;

  try {
    meResult = await oauth2Me();
  } catch (err) {
    console.error('[auth] oauth2Me failed', err);
    return;
  }

  if (!meResult?.ok) return;

  const linkResult = await tryAutoLinkIfNeeded(meResult);

  if (linkResult === 'to-link') {
    openWalletLinkModal();
  }
}

// =====================
//   라우트 정의
// =====================

function setupRoutes() {
  tabConfig.forEach((t) => {
    router.on(t.path, () => {
      setActiveTab(t.key);
    });
  });

  router.on('/', () => {
    setActiveTab('home');
  });

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

  router.notFound(() => {
    setActiveTab('home');
  });

  router.resolve();
}

// =====================
//  초기 DOM 세팅
// =====================

document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    // 1) 지갑 자동 링크 / 링크 모달
    await ensureWalletLinkedOnStartup().catch(console.error);

    // 2) 프로필 로드 + 아바타 적용
    await profileManager.init();
    applyProfileAvatar(profileManager.profile);

    profileManager.addEventListener('change', () => {
      applyProfileAvatar(profileManager.profile);
    });

    // 🔹 tokenManager 이벤트 기반 아바타 갱신
    //   (client-common의 tokenManager가 on/off를 지원하지 않는다면 이 부분은 제거 필요)
    (tokenManager as any).on?.('signedIn', async () => {
      await profileManager.init();
      applyProfileAvatar(profileManager.profile);
    });

    (tokenManager as any).on?.('signedOut', () => {
      applyProfileAvatar(null);
    });

    // 3) 라우터 및 나머지 UI 초기화
    setupRoutes();

    const navigate = (path: string) => router.navigate(path);

    // 프로필 버튼 클릭: 로그인 여부에 따라 분기
    const profileBtns = document.querySelectorAll<HTMLElement>('#open-profile');
    profileBtns.forEach((profileBtn) => {
      profileBtn.addEventListener('click', (e) => {
        if (!tokenManager.has()) {
          e.preventDefault();
          closeProfileMenu();
          openLoginModal();
        } else {
          e.preventDefault();
          if (activeProfileMenu) {
            closeProfileMenu();
          } else {
            openProfileMenu(profileBtn);
          }
        }
      });
    });

    const startTradingButton = document.getElementById('start-trading');
    startTradingButton?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('/explore');
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

    // 앱 전체 설정 모달
    let currentSettings: AppSettings = {
      darkMode: true,
      pushEnabled: true,
      tradeNotifications: true,
      commentNotifications: true,
      marketingEmails: false,
      language: 'system',
    };

    const settingsModal = createSettingsModal(currentSettings, {
      async onSave(next) {
        currentSettings = next;
      },
    });
    document.body.appendChild(settingsModal);

    const settingsBtns = document.querySelectorAll('#open-settings');
    settingsBtns.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        await settingsModal.present();
      });
    });

    // Explore CTA
    const exploreButtons = document.querySelectorAll(
      '[data-action="explore-personas"]'
    );
    exploreButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/explore');
      });
    });

    // Trending Persona 카드 → /profile/:id
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

    // Edit Profile 버튼 → 프로필 수정 모달
    document.body.addEventListener('click', async (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action="edit-profile"]'
      ) as HTMLElement | null;

      if (!target) return;

      event.preventDefault();

      const address =
        target.getAttribute('data-address') ||
        '0x0000000000000000000000000000000000000000';

      const token = 'TEMP_AUTH_TOKEN'; // TODO: 실제 토큰으로 교체

      const modal = createEditProfileModal(address as `0x${string}`, token);
      document.body.appendChild(modal);
      await (modal as any).present();
    });

    // 탭 콘텐츠 mount
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

    console.log(await getProtocolFeeRate());
  })();
});
