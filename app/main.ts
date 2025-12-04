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
import { formatEther, getAddress, zeroAddress } from 'viem';

import { tabConfig } from '../shared/tab-config';
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

// OAuth / wallet link
import { oauth2Me, OAuth2MeResult, oauthLinkWallet } from './auth/oauth2';
import { openWalletLinkModal } from './modals/google-link-wallet-modal';

// Session param
import { sessionManager } from './auth/session-manager';

// Profile types/manager
import type { Profile } from '../shared/types/profile';
import { fetchPersonaProfile } from './api/profile';
import { profileManager } from './services/profile-manager';

// Post API
import { fetchPersonaPostWithReplies } from './api/post';

// Google logout
import { TrendingPersonaFragment } from '../shared/types/persona-fragments';
import { fetchTrendingPersonaFragments } from './api/persona-fragments';
import { googleLogout } from './auth/google-login';

// =====================
//  Environment / Session / WebView
// =====================

const urlParams = new URLSearchParams(window.location.search);

// Handle ?session=... from backend
const sid = urlParams.get('session');
if (sid) {
  sessionManager.set(sid);
}

export const isWebView = urlParams.get('source') === 'webview';

// =====================
//    Ionic setup
// =====================

setupConfig({ hardwareBackButton: true, experimentalCloseWatcher: true });

const backHandler = (event: BackButtonEvent) => {
  event.detail.register(0, () => {
    const hasHistory = window.history.length > 1;
    const isFromExternal =
      document.referrer &&
      !document.referrer.startsWith(window.location.origin);
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
//    Navigo router
// =====================

const router = new Navigo('/', {
  hash: false,
  linksSelector: 'a[href]',
});

// Global references
let currentProfileRouteId: string | null = null;
let chatTab: ChatTab | null = null;
let pendingChatPersonaId: string | null = null;
let notificationsTab: NotificationsTab | null = null;

// =====================
//   Tab helpers
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
//   Notifications badge helper
// =====================

/**
 * Update the numeric badge on the notifications tab button.
 * If count <= 0, the badge is hidden.
 */
function updateNotificationsBadge(unreadCount: number) {
  const badge = document.querySelector<HTMLSpanElement>(
    '#main-tab-bar .notifications-tab-badge',
  );
  if (!badge) return;

  if (!unreadCount || unreadCount <= 0) {
    badge.style.display = 'none';
    badge.textContent = '';
  } else {
    // Show the badge and cap the count visually at 99+
    badge.style.display = 'flex';
    badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
  }
}

// =====================
//   Profile button avatar render
// =====================

function applyProfileAvatar(profile: Profile | null) {
  const buttons = document.querySelectorAll<HTMLElement>('#open-profile');
  if (!buttons.length) return;

  const hasToken = tokenManager.has();
  const rawAddr = hasToken ? tokenManager.getAddress() : undefined;

  buttons.forEach((btn) => {
    // reset content every time to avoid duplicated icons
    btn.innerHTML = '';

    // Not signed in → default icon
    if (!hasToken || !rawAddr) {
      const icon = document.createElement('ion-icon');
      icon.setAttribute('slot', 'icon-only');
      icon.setAttribute('name', 'person-circle');
      btn.appendChild(icon);

      btn.removeAttribute('title');
      return;
    }

    // Signed in → avatar
    const addr = getAddress(rawAddr || zeroAddress);

    const avatarContainer = document.createElement('span');
    avatarContainer.className = 'profile-avatar';
    avatarContainer.style.display = 'inline-flex';
    avatarContainer.style.alignItems = 'center';
    avatarContainer.style.justifyContent = 'center';
    avatarContainer.style.width = '28px';
    avatarContainer.style.height = '28px';
    avatarContainer.style.borderRadius = '999px';
    avatarContainer.style.overflow = 'hidden';

    if (profile?.avatarUrl) {
      const img = document.createElement('img');
      img.src = profile.avatarUrl;
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

    btn.appendChild(avatarContainer);

    if (profile?.nickname) {
      btn.title = profile.nickname;
    } else if (rawAddr) {
      btn.title = rawAddr;
    }
  });
}

// =====================
//   Shoelace menu (profile / logout)
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

      router.navigate('/');
    }
  });

  cleanupProfileMenu = () => {
    document.removeEventListener('mousedown', onDocMouseDown);
  };
  activeProfileMenu = wrapper;
}

// =====================
//   Google login + auto wallet link
// =====================

async function tryAutoLinkIfNeeded(
  meResult: OAuth2MeResult | null,
): Promise<'ok' | 'to-link' | 'skip'> {
  const walletHasToken = tokenManager.has();

  if (meResult?.ok && meResult.wallet_address && meResult.token) {
    tokenManager.set(
      meResult.token,
      meResult.wallet_address as `0x${string}`,
    );
    return 'ok';
  }

  if (meResult?.ok && !walletHasToken) {
    return 'to-link';
  }

  if (walletHasToken && meResult?.ok) {
    const authToken = tokenManager.getToken();
    if (!authToken) return 'to-link';

    try {
      const linkRes = await oauthLinkWallet();
      if (linkRes?.ok) {
        if (linkRes.token && linkRes.wallet_address) {
          tokenManager.set(
            linkRes.token,
            linkRes.wallet_address as `0x${string}`,
          );
        } else {
          const refreshed = await oauth2Me();
          if (
            refreshed.ok &&
            refreshed.token &&
            refreshed.wallet_address
          ) {
            tokenManager.set(
              refreshed.token,
              refreshed.wallet_address as `0x${string}`,
            );
          }
        }
        return 'ok';
      }
      return 'to-link';
    } catch {
      return 'to-link';
    }
  }

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
//   Routes (no SSR)
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

  // Profile view (/profile/:id)
  router.on('/profile/:id', (match: any) => {
    const { id } = match.data || {};
    if (!id) return;

    currentProfileRouteId = id;
    setActiveTab('profile');

    const profileContent = document.getElementById('profile-tab-content');
    if (!profileContent) return;

    const loadProfileView = async () => {
      try {
        const { profile, posts, personaFragments } =
          await fetchPersonaProfile(id);

        profileContent.innerHTML = '';
        const profileTab = new ProfileTab(
          profile,
          posts,
          personaFragments ?? null,
          router.navigate.bind(router),
        );
        profileContent.appendChild(profileTab.el);
      } catch (err) {
        console.error('[route:/profile/:id] failed to load', err);
        profileContent.innerHTML =
          '<div class="error">Failed to load profile. Please try again.</div>';
      }
    };

    loadProfileView();
  });

  // Post view (/post/:id)
  router.on('/post/:id', (match: any) => {
    const { id } = match.data || {};
    if (!id) return;

    setActiveTab('post');

    const postContent = document.getElementById('post-tab-content');
    if (!postContent) return;

    const postId = Number(id);
    if (!Number.isFinite(postId) || postId <= 0) {
      postContent.innerHTML =
        '<div class="error">Invalid post id.</div>';
      return;
    }

    (async () => {
      try {
        const { post, replies } = await fetchPersonaPostWithReplies(postId);

        postContent.innerHTML = '';
        const postTab = new PostTab(post, replies, {
          navigate: router.navigate.bind(router),
          getAuthToken: tokenManager.getToken.bind(tokenManager),
        });
        postContent.appendChild(postTab.el);
      } catch (err) {
        console.error('[route:/post/:id] failed to load', err);
        postContent.innerHTML =
          '<div class="error">Failed to load post. Please try again.</div>';
      }
    })();
  });

  // Chat view by persona address (/chat/:id)
  router.on('/chat/:id', (match: any) => {
    const { id } = match.data || {};
    if (!id) return;

    setActiveTab('chat');

    if (chatTab) {
      chatTab.openPersonaRoom(id);
    } else {
      // ChatTab is not mounted yet; remember it
      pendingChatPersonaId = id;
    }
  });

  router.notFound(() => {
    setActiveTab('home');
  });

  router.resolve();
}

function shortenEthAddress(addr: string): string {
  if (!addr.startsWith('0x') || addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function renderHomeTrendingCards(
  personas: TrendingPersonaFragment[],
  navigate: (path: string) => void,
) {
  const grid = document.querySelector<HTMLElement>('#home-trending-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (!personas.length) {
    grid.innerHTML =
      '<div style="padding:0.75rem; font-size:0.85rem; color:#888;">No persona fragments yet.</div>';
    return;
  }

  personas.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'home-trending-card';
    card.setAttribute('data-profile-id', p.personaAddress);

    const priceEth = (() => {
      try {
        return `${Number(formatEther(BigInt(p.lastPrice))).toFixed(4)} ETH`;
      } catch {
        return '-';
      }
    })();

    const avatarInitial = (p.name || '').trim().charAt(0).toUpperCase() || 'P';

    card.innerHTML = `
      <div class="home-card-header">
        <div class="home-card-avatar">${avatarInitial}</div>
        <div class="home-card-meta">
          <div class="home-card-name">${p.name}</div>
          <div class="home-card-address">${shortenEthAddress(p.personaAddress)}</div>
        </div>
      </div>

      <div class="home-card-price-label">Price</div>
      <div class="home-card-price-value">${priceEth}</div>

      <div class="home-card-stats-row">
        <div>
          <div class="home-card-stat-label">24h Change</div>
          <div class="home-card-stat-value home-card-change-up">—</div>
        </div>
        <div>
          <div class="home-card-stat-label">Holders</div>
          <div class="home-card-stat-value">${p.holderCount}</div>
        </div>
      </div>

      <div class="home-card-divider"></div>

      <div>
        <div class="home-card-volume-label">24h Volume</div>
        <div class="home-card-volume-value">—</div>
      </div>

      <button class="home-card-button" type="button">Open Persona</button>
    `;

    card.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(`/profile/${p.personaAddress}`);
    });

    const button = card.querySelector<HTMLButtonElement>('.home-card-button');
    if (button) {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        navigate(`/profile/${p.personaAddress}`);
      });
    }

    grid.appendChild(card);
  });
}

async function initHomeTrending(navigate: (path: string) => void) {
  const grid = document.querySelector<HTMLElement>('#home-trending-grid');
  if (!grid) return;

  try {
    const { personas } = await fetchTrendingPersonaFragments(6);
    renderHomeTrendingCards(personas, navigate);
  } catch (err) {
    console.error('[home] failed to load trending personas', err);
    grid.innerHTML =
      '<div style="padding:0.75rem; font-size:0.85rem; color:#f97373;">Failed to load trending personas.</div>';
  }
}

// =====================
//  Initial DOM setup
// =====================

document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    // Wallet linking / Google session
    await ensureWalletLinkedOnStartup().catch(console.error);

    // Profile load + avatar
    await profileManager.init();
    applyProfileAvatar(profileManager.profile);

    profileManager.on('change', (newProfile) => {
      applyProfileAvatar(newProfile);

      const myAddr = tokenManager.getAddress?.();
      if (!newProfile || !myAddr) return;

      try {
        const normalizedMy = getAddress(myAddr);
        const normalizedCurrent =
          currentProfileRouteId && currentProfileRouteId.startsWith('0x')
            ? getAddress(currentProfileRouteId as `0x${string}`)
            : null;

        if (normalizedCurrent && normalizedCurrent === normalizedMy) {
          const profileContent = document.getElementById('profile-tab-content');
          if (!profileContent) return;

          (async () => {
            try {
              const { profile, posts, personaFragments } =
                await fetchPersonaProfile(normalizedMy);

              profileContent.innerHTML = '';
              const profileTab = new ProfileTab(
                profile,
                posts,
                personaFragments ?? null,
                router.navigate.bind(router),
              );
              profileContent.appendChild(profileTab.el);
            } catch (err) {
              console.error('[profile auto-refresh] failed', err);
            }
          })();
        }
      } catch (e) {
        console.error('[profile auto-refresh] address normalize failed', e);
      }
    });

    (tokenManager as any).on?.('signedIn', async () => {
      await profileManager.init();
      applyProfileAvatar(profileManager.profile);

      // Reload notifications after sign-in and update badge
      await notificationsTab?.refresh();
    });

    (tokenManager as any).on?.('signedOut', () => {
      applyProfileAvatar(null);

      // Reset notifications (and badge) after sign-out
      void notificationsTab?.refresh();
    });

    const navigate = (path: string) => router.navigate(path);

    // Routes and navigation wiring
    setupRoutes();

    // Profile button click: login or menu
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

    const tabButtons = document.querySelectorAll(
      '#main-tab-bar ion-tab-button',
    );
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

    // App-wide settings modal
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
        await (settingsModal as any).present();
      });
    });

    // Explore CTA
    const exploreButtons = document.querySelectorAll(
      '[data-action="explore-personas"]',
    );
    exploreButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/explore');
      });
    });

    // Trending persona cards → /profile/:id
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

    // Edit profile → edit modal
    document.body.addEventListener('click', async (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action="edit-profile"]',
      ) as HTMLElement | null;

      if (!target) return;

      event.preventDefault();

      const address =
        target.getAttribute('data-address') ||
        '0x0000000000000000000000000000000000000000';

      const token = tokenManager.getToken();
      if (!token) {
        console.error('No token found');
        return;
      }

      const modal = createEditProfileModal(address as `0x${string}`, token);
      document.body.appendChild(modal);
      await (modal as any).present();
    });

    // Mount tab contents
    const exploreContent = document.getElementById('explore-tab-content');
    if (exploreContent) {
      const exploreTab = new ExploreTab(navigate);
      exploreContent.appendChild(exploreTab.el);
    }

    const feedContent = document.getElementById('feed-tab-content');
    if (feedContent) {
      const feedTab = new FeedTab({
        navigate,
        getAuthToken: tokenManager.getToken.bind(tokenManager),
        currentAccount: tokenManager.getAddress(),
      });
      feedContent.appendChild(feedTab.el);
    }

    const chatContent = document.getElementById('chat-tab-content');
    if (chatContent) {
      chatTab = new ChatTab(navigate);
      chatContent.appendChild(chatTab.el);

      // If there was a pending /chat/:id deep link before ChatTab mounted
      if (pendingChatPersonaId) {
        chatTab.openPersonaRoom(pendingChatPersonaId);
        pendingChatPersonaId = null;
      }
    }

    const notificationsContent = document.getElementById(
      'notifications-tab-content',
    );
    if (notificationsContent) {
      notificationsTab = new NotificationsTab(navigate, {
        // Whenever unread count changes, update the bottom tab badge
        onUnreadCountChange: (count) => updateNotificationsBadge(count),
      });
      notificationsContent.appendChild(notificationsTab.el);
    }

    await initHomeTrending(navigate);
  })();
});
