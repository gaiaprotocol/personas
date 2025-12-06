import { getAddressAvatarDataUrl } from '@gaiaprotocol/address-avatar';
import { tokenManager } from '@gaiaprotocol/client-common';
import { el } from '@webtaku/el';
import type { PersonaChatMessage } from '../../shared/types/chat';
import type { PersonaFragmentHolding } from '../../shared/types/persona-fragments';
import {
  buildPersonaChatWsUrl,
  fetchPersonaChatMessages,
  sendPersonaChatMessage,
} from '../api/chat';
import { fetchHeldPersonaFragments } from '../api/persona-fragments';
import { showErrorAlert } from '../components/alert';
import { openLoginModal } from '../modals/login';
import { createUserProfileModal } from '../modals/profile';
import './chat.css';

import { getAddress } from 'viem';
import {
  getPersonaBalance,
  type Address,
} from '../contracts/persona-fragments';

import { profileManager } from '../services/profile-manager';

type Sender = 'you' | 'other';

interface ViewChatMessage {
  id: number;
  sender: Sender;
  author: string;
  text: string;
  time: string;
  avatarUrl: string | null;
  walletAddress?: string | null;
  raw: PersonaChatMessage;
}

interface ChatThread {
  id: string;
  personaAddress: string;
  name: string;
  holdersInChat: number;
  unreadCount: number;
  avatarInitial: string;
  avatarUrl?: string | null;
  messages: ViewChatMessage[];
}

type ChatWsEvent =
  | { type: 'hello'; persona: string; address: string }
  | { type: 'message'; message: PersonaChatMessage }
  | {
    type: 'reaction_added' | 'reaction_removed';
    messageId: number;
    reactor: string;
    reactionType: string;
  };

export class ChatTab {
  el: HTMLElement;

  private threads: ChatThread[] = [];
  private filteredThreads: ChatThread[] = [];
  private currentThread: ChatThread | null = null;

  private threadListEl!: HTMLElement;

  // Desktop chat area refs
  private mainNameEl!: HTMLElement;
  private mainStatusEl!: HTMLElement;
  private headerAvatarEl!: HTMLElement;
  private messagesEl!: HTMLElement;
  private inputEl!: HTMLInputElement;

  // Mobile(modal) chat area refs
  private mobileMessagesEl: HTMLElement | null = null;
  private mobileThreadId: string | null = null;

  private navigate?: (path: string) => void;

  // WebSocket state
  private ws: WebSocket | null = null;
  private wsPersona: string | null = null;

  // Async initialization latch
  private initPromise: Promise<void> | null = null;

  constructor(navigate?: (path: string) => void) {
    this.navigate = navigate;

    this.el = el('section.chat-wrapper');
    const shell = el('div.chat-shell');

    const sidebar = this.buildSidebar();
    const desktopMain = this.buildDesktopMain();

    shell.append(sidebar, desktopMain);
    this.el.append(shell);

    // Profile link from desktop header
    this.mainNameEl.addEventListener('click', (e) => {
      if (!this.navigate || !this.currentThread) return;
      e.preventDefault();
      const addr = this.currentThread.personaAddress;
      this.navigate(`/profile/${addr}`);
    });

    this.renderThreadList();

    // Kick off async initialization
    this.initPromise = this.initThreads();
    this.initPromise.catch((err) =>
      console.error('[ChatTab] initThreads failed', err),
    );
  }

  /**
   * Public helper: open chat room for a specific persona address.
   * /chat/:personaAddress 딥링크용
   * - owner 인 경우 balance 0 이어도 입장 허용
   */
  public async openPersonaRoom(personaAddress: string) {
    await this.ensureThreadsInitialized();

    const token = tokenManager.getToken?.();
    const rawUserAddr = tokenManager.getAddress?.();

    if (!token || !rawUserAddr) {
      openLoginModal();
      return;
    }

    let persona: Address;
    let user: Address;

    try {
      persona = getAddress(personaAddress) as Address;
      user = getAddress(rawUserAddr) as Address;
    } catch {
      showErrorAlert(
        'Invalid address',
        'Persona address is not a valid EVM address.',
      );
      return;
    }

    try {
      const balance = await getPersonaBalance(persona, user);
      const isOwner = persona.toLowerCase() === user.toLowerCase();

      if (!isOwner && balance <= 0n) {
        showErrorAlert(
          'Chat not available',
          'You do not hold this persona, so the chat room is not available.',
        );
        return;
      }
    } catch (err) {
      console.error('[chat] getPersonaBalance failed', err);
      showErrorAlert(
        'Chat error',
        'Failed to verify persona holdings from contract. Please try again.',
      );
      return;
    }

    let target = this.threads.find(
      (t) => t.personaAddress.toLowerCase() === persona.toLowerCase(),
    );

    // 아직 쓰레드가 없으면 새로 생성
    if (!target) {
      const myAddr = tokenManager.getAddress?.();
      const isMe =
        myAddr && myAddr.toLowerCase() === persona.toLowerCase();
      const myProfile = isMe ? profileManager.profile : null;

      const nickname = myProfile?.nickname ?? null;

      const displayName = this.formatDisplayName(
        persona,
        nickname ?? persona,
      );

      const avatarUrl = myProfile?.avatarUrl ?? null;

      const avatarInitial =
        displayName.trim().charAt(0).toUpperCase() ||
        persona.slice(2, 3).toUpperCase() ||
        'P';

      target = {
        id: persona,
        personaAddress: persona,
        name: displayName,
        holdersInChat: 0,
        unreadCount: 0,
        avatarInitial,
        avatarUrl,
        messages: [],
      };

      this.threads.unshift(target);
      this.filteredThreads = [...this.threads];
      this.renderThreadList();
    }

    await this.activateThread(target);

    if (window.matchMedia('(max-width: 900px)').matches) {
      this.openMobileChatModal(target);
    }
  }

  /* ================================================================== */
  /*  Initialization helpers                                            */
  /* ================================================================== */

  private async ensureThreadsInitialized() {
    if (!this.initPromise) {
      this.initPromise = this.initThreads();
    }
    await this.initPromise;
  }

  /**
   * Load persona holdings and build chat thread list.
   * - 백엔드 holdings 기반으로 기본 목록 구성
   * - 여기에 "내 지갑 주소"를 페르소나로 하는 방을 강제로 하나 추가 (없으면)
   *   → 이 때 profileManager.profile 사용해서 이름/아바타 채움
   */
  private async initThreads() {
    const token = tokenManager.getToken?.();
    if (!token) {
      this.threadListEl.innerHTML = '';
      return;
    }

    try {
      const { holdings } = await fetchHeldPersonaFragments(token);

      this.threads = holdings.map((h: PersonaFragmentHolding) => {
        const persona = h.personaAddress;

        const rawName = (h as any).name as string | undefined | null;
        const displayName = this.formatDisplayName(persona, rawName);

        const avatarUrl = (h as any).avatarUrl ?? null;

        const avatarInitial =
          displayName.trim().charAt(0).toUpperCase() ||
          persona.slice(2, 3).toUpperCase() ||
          'P';

        return {
          id: persona,
          personaAddress: persona,
          name: displayName,
          holdersInChat: h.holderCount,
          unreadCount: 0,
          avatarInitial,
          avatarUrl,
          messages: [],
        };
      });

      // === 내 페르소나(내 주소) 강제 추가 ===
      const myAddr = tokenManager.getAddress?.();
      if (myAddr && myAddr.startsWith('0x')) {
        const normalizedMy = getAddress(myAddr) as Address;

        const exists = this.threads.some(
          (t) =>
            t.personaAddress.toLowerCase() === normalizedMy.toLowerCase(),
        );

        if (!exists) {
          const myProfile = profileManager.profile ?? null;
          const nickname = myProfile?.nickname ?? normalizedMy;

          const displayName = this.formatDisplayName(
            normalizedMy,
            nickname,
          );

          const avatarUrl = myProfile?.avatarUrl ?? null;

          const avatarInitial =
            displayName.trim().charAt(0).toUpperCase() ||
            normalizedMy.slice(2, 3).toUpperCase() ||
            'P';

          const myThread: ChatThread = {
            id: normalizedMy,
            personaAddress: normalizedMy,
            name: displayName,
            holdersInChat: 0,
            unreadCount: 0,
            avatarInitial,
            avatarUrl,
            messages: [],
          };

          this.threads.unshift(myThread);
        }
      }

      this.filteredThreads = [...this.threads];
      this.currentThread = this.threads[0] ?? null;

      this.renderThreadList();

      if (this.currentThread) {
        await this.activateThread(this.currentThread);
      } else {
        this.threadListEl.innerHTML =
          '<div style="padding:0.75rem 1.5rem; font-size:0.85rem; color:#888;">You do not hold any persona fragments yet.</div>';
      }
    } catch (err) {
      console.error('[chat] failed to load held personas', err);
      this.threadListEl.innerHTML =
        '<div style="padding:0.75rem 1.5rem; font-size:0.85rem; color:#f97373;">Failed to load chat rooms. Please try again.</div>';
    }
  }

  /* ================================================================== */
  /*  Sidebar                                                           */
  /* ================================================================== */

  private buildSidebar(): HTMLElement {
    const sidebar = el('div.chat-sidebar');

    const header = el(
      'div.chat-sidebar-header',
      el('h2.chat-sidebar-title', 'Chat'),
    );

    const searchInput = el('input.chat-search-input', {
      type: 'search',
      placeholder: 'Search personas...',
    }) as HTMLInputElement;

    searchInput.addEventListener('input', () => {
      this.handleSearch(searchInput.value);
    });

    const search = el('div.chat-search', searchInput);

    this.threadListEl = el('div.chat-thread-list');

    const footer = el(
      'div.chat-sidebar-footer',
      'Chat only available to persona holders',
    );

    sidebar.append(header, search, this.threadListEl, footer);
    return sidebar;
  }

  private handleSearch(raw: string) {
    const q = raw.toLowerCase().trim();
    if (!q) {
      this.filteredThreads = [...this.threads];
    } else {
      this.filteredThreads = this.threads.filter((t) =>
        t.name.toLowerCase().includes(q),
      );
    }

    if (
      this.currentThread &&
      !this.filteredThreads.find((t) => t.id === this.currentThread!.id)
    ) {
      this.currentThread = this.filteredThreads[0] ?? null;
    }

    this.renderThreadList();
    if (this.currentThread) this.activateThread(this.currentThread);
  }

  private renderThreadList() {
    this.threadListEl.innerHTML = '';

    this.filteredThreads.forEach((thread) => {
      const avatarEl = el('div.chat-thread-avatar') as HTMLElement;
      avatarEl.innerHTML = '';

      if (thread.avatarUrl) {
        const img = el('img.chat-thread-avatar-img', {
          src: thread.avatarUrl,
          alt: thread.name || 'Persona',
        }) as HTMLImageElement;
        avatarEl.append(img);
      } else {
        const img = this.createAddressAvatarImg(
          thread.personaAddress,
          thread.name || 'Persona',
          'chat-thread-avatar-img',
        );
        if (img) {
          avatarEl.append(img);
        } else {
          avatarEl.textContent = thread.avatarInitial;
        }
      }

      const item = el(
        'div.chat-thread-item',
        { 'data-id': thread.id },
        avatarEl,
        el(
          'div.chat-thread-main',
          el('div.chat-thread-name', thread.name),
          el(
            'div.chat-thread-sub',
            `${thread.holdersInChat} holders in chat`,
          ),
        ),
        thread.unreadCount > 0
          ? el('div.chat-thread-unread', String(thread.unreadCount))
          : null,
      ) as HTMLElement;

      if (this.currentThread && this.currentThread.id === thread.id) {
        item.classList.add('active');
      }

      item.addEventListener('click', () => {
        this.activateThread(thread);

        if (window.matchMedia('(max-width: 900px)').matches) {
          this.openMobileChatModal(thread);
        }
      });

      this.threadListEl.append(item);
    });
  }

  /* ================================================================== */
  /*  Thread activation + data load                                     */
  /* ================================================================== */

  private async activateThread(thread: ChatThread | null) {
    if (!thread) return;

    this.currentThread = thread;
    this.renderThreadList();
    this.updateDesktopHeader(thread);

    await this.loadMessagesForThread(thread);
    this.renderMessagesInto(thread, this.messagesEl);

    this.connectWebSocket(thread);
  }

  private async loadMessagesForThread(thread: ChatThread) {
    try {
      const res = await fetchPersonaChatMessages({
        persona: thread.personaAddress,
        limit: 100,
        cursor: 0,
      });

      const myAddr = tokenManager.getAddress?.();
      const lowerMy = myAddr?.toLowerCase() ?? null;

      thread.messages = res.messages.map((m) => {
        const senderType: Sender =
          lowerMy && m.sender.toLowerCase() === lowerMy ? 'you' : 'other';

        const profile = m.senderProfile;
        const displayName = this.formatDisplayName(
          m.sender,
          profile?.nickname,
        );
        const avatarUrl = profile?.avatarUrl ?? null;

        const time = new Date(m.createdAt * 1000).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        });

        return {
          id: m.id,
          sender: senderType,
          author: senderType === 'you' ? 'You' : displayName,
          text: m.content,
          time,
          avatarUrl,
          walletAddress: m.sender,
          raw: m,
        };
      });
    } catch (err) {
      console.error('[chat] failed to load messages', err);
    }
  }

  private shortenAddress(addr: string) {
    if (!addr?.startsWith('0x') || addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  private isWalletAddress(value?: string | null): value is `0x${string}` {
    if (!value) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(value);
  }

  private formatDisplayName(address: string, nickname?: string | null): string {
    const trimmed = nickname?.trim();
    if (trimmed && this.isWalletAddress(trimmed)) {
      return this.shortenAddress(trimmed);
    }
    if (trimmed && trimmed.length > 0) return trimmed;
    return this.shortenAddress(address);
  }

  private createAddressAvatarImg(
    address: string,
    alt: string,
    className: string,
  ): HTMLImageElement | null {
    if (!this.isWalletAddress(address)) return null;
    try {
      const checksum = getAddress(address as `0x${string}`);
      const src = getAddressAvatarDataUrl(checksum as `0x${string}`);
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.className = className;
      return img;
    } catch {
      return null;
    }
  }

  /* ================================================================== */
  /*  Desktop main chat area                                            */
  /* ================================================================== */

  private buildDesktopMain(): HTMLElement {
    const main = el('div.chat-main.chat-main-desktop');

    this.headerAvatarEl = el('div.chat-main-avatar') as HTMLElement;

    this.mainNameEl = el('a.chat-main-name', {
      href: '#',
    }) as HTMLAnchorElement;
    this.mainStatusEl = el('div.chat-main-status');

    const header = el(
      'div.chat-main-header',
      this.headerAvatarEl,
      el('div.chat-main-meta', this.mainNameEl, this.mainStatusEl),
    );

    this.messagesEl = el('div.chat-messages');

    this.inputEl = el('input.chat-input-field', {
      type: 'text',
      placeholder: 'Type a message...',
    }) as HTMLInputElement;

    this.inputEl.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        this.sendMessageFromDesktop();
      }
    });

    const sendBtn = el(
      'button.chat-send-btn',
      el('div.chat-send-btn-icon'),
    ) as HTMLButtonElement;

    sendBtn.addEventListener('click', () => this.sendMessageFromDesktop());

    const inputInner = el('div.chat-input-inner', this.inputEl, sendBtn);

    const note = el(
      'div.chat-input-note',
      'Only persona holders can chat in this room',
    );

    const inputBar = el('div.chat-input-bar', inputInner, note);

    main.append(header, this.messagesEl, inputBar);
    return main;
  }

  private updateDesktopHeader(thread: ChatThread) {
    this.mainNameEl.textContent = thread.name;
    this.mainStatusEl.textContent = `${thread.holdersInChat} holders online`;

    if (!this.headerAvatarEl) return;

    this.headerAvatarEl.innerHTML = '';

    if (thread.avatarUrl) {
      const img = el('img.chat-main-avatar-img', {
        src: thread.avatarUrl,
        alt: thread.name || 'Persona',
      }) as HTMLImageElement;
      this.headerAvatarEl.append(img);
    } else {
      const img = this.createAddressAvatarImg(
        thread.personaAddress,
        thread.name || 'Persona',
        'chat-main-avatar-img',
      );
      if (img) {
        this.headerAvatarEl.append(img);
      } else {
        this.headerAvatarEl.textContent = thread.avatarInitial;
      }
    }
  }

  private renderCurrentThread() {
    if (!this.currentThread) return;
    this.updateDesktopHeader(this.currentThread);
    this.renderMessagesInto(this.currentThread, this.messagesEl);
  }

  private renderMessagesInto(thread: ChatThread, container: HTMLElement) {
    container.innerHTML = '';

    thread.messages.forEach((m) => {
      const row = el(
        'div.chat-message-row',
        { class: `chat-message-row ${m.sender}` },
      );

      let avatarEl: HTMLElement | null = null;
      if (m.sender === 'other') {
        avatarEl = el('div.chat-message-avatar') as HTMLElement;
        avatarEl.innerHTML = '';

        if (m.avatarUrl) {
          const img = el('img.chat-message-avatar-img', {
            src: m.avatarUrl,
            alt: m.author || 'User',
          }) as HTMLImageElement;
          avatarEl.append(img);
        } else if (m.walletAddress && this.isWalletAddress(m.walletAddress)) {
          const img = this.createAddressAvatarImg(
            m.walletAddress,
            m.author || 'User',
            'chat-message-avatar-img',
          );
          if (img) {
            avatarEl.append(img);
          } else {
            avatarEl.textContent =
              m.author && m.author.length > 0
                ? m.author.charAt(0).toUpperCase()
                : '?';
          }
        } else {
          avatarEl.textContent =
            m.author && m.author.length > 0
              ? m.author.charAt(0).toUpperCase()
              : '?';
        }
      }

      const bubble = el(
        'div.chat-message-bubble',
        { class: `chat-message-bubble ${m.sender}` },
        m.text,
      );

      const meta = el(
        'div.chat-message-meta',
        m.sender === 'you' ? `You  ${m.time}` : `${m.author}  ${m.time}`,
      );

      const contentWrap = el(
        'div.chat-message-content',
        bubble,
        meta,
      );

      if (m.sender === 'other') {
        if (avatarEl) row.append(avatarEl, contentWrap);
        else row.append(contentWrap);
      } else {
        row.append(contentWrap);
      }

      container.append(row);
    });

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }

  private async sendMessageFromDesktop() {
    if (!this.currentThread) return;

    const text = this.inputEl.value.trim();
    if (!text) return;

    await this.sendMessageCommon(this.currentThread, text);
    this.inputEl.value = '';
  }

  /* ================================================================== */
  /*  Message send (shared)                                             */
  /* ================================================================== */

  private async sendMessageCommon(thread: ChatThread, text: string) {
    const token = tokenManager.getToken?.();
    if (!token) {
      openLoginModal();
      return;
    }

    try {
      const msg = await sendPersonaChatMessage({
        persona: thread.personaAddress,
        content: text,
        token,
      });

      const wsOpen =
        this.ws &&
        this.wsPersona &&
        this.wsPersona.toLowerCase() === thread.personaAddress.toLowerCase() &&
        this.ws.readyState === WebSocket.OPEN;

      if (!wsOpen) {
        const myAddr = tokenManager.getAddress?.();
        const senderType: Sender =
          myAddr && msg.sender.toLowerCase() === myAddr.toLowerCase()
            ? 'you'
            : 'other';

        const profile = msg.senderProfile;
        const displayName = this.formatDisplayName(
          msg.sender,
          profile?.nickname,
        );
        const avatarUrl = profile?.avatarUrl ?? null;

        const author = senderType === 'you' ? 'You' : displayName;

        const time = new Date(msg.createdAt * 1000).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        });

        const view: ViewChatMessage = {
          id: msg.id,
          sender: senderType,
          author,
          text: msg.content,
          time,
          avatarUrl,
          walletAddress: msg.sender,
          raw: msg,
        };

        if (!thread.messages.some((m) => Number(m.id) === Number(msg.id))) {
          thread.messages.push(view);
        }

        const isCurrentDesktop =
          this.currentThread && this.currentThread.id === thread.id;
        const isCurrentMobile =
          this.mobileMessagesEl && this.mobileThreadId === thread.id;

        if (isCurrentDesktop) {
          this.renderCurrentThread();
        }

        if (isCurrentMobile && this.mobileMessagesEl) {
          this.renderMessagesInto(thread, this.mobileMessagesEl);
        }
      }
    } catch (err: any) {
      console.error('[chat] send failed', err);
      showErrorAlert(
        'Failed to send',
        err?.message ?? 'Failed to send message',
      );
    }
  }

  /* ================================================================== */
  /*  WebSocket                                                          */
  /* ================================================================== */

  private connectWebSocket(thread: ChatThread) {
    const token = tokenManager.getToken?.();
    if (!token) {
      this.closeWebSocket();
      return;
    }

    const persona = thread.personaAddress;

    if (
      this.ws &&
      this.wsPersona === persona &&
      this.ws.readyState === WebSocket.OPEN
    ) {
      return;
    }

    this.closeWebSocket();

    const wsUrl = buildPersonaChatWsUrl(persona, token);

    try {
      const ws = new WebSocket(wsUrl);
      this.ws = ws;
      this.wsPersona = persona;

      ws.onopen = () => {
        // noop
      };

      ws.onmessage = (event) => {
        let data: ChatWsEvent;
        try {
          data = JSON.parse(event.data);
        } catch (err) {
          console.error('[chat] ws parse error', err);
          return;
        }

        if (data.type === 'message') {
          this.handleIncomingMessage(data.message);
        }
      };

      ws.onerror = (ev) => {
        console.error('[chat] ws error', ev);
      };

      ws.onclose = () => {
        this.ws = null;
        this.wsPersona = null;
      };
    } catch (err) {
      console.error('[chat] ws connect failed', err);
    }
  }

  private closeWebSocket() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
    }
    this.ws = null;
    this.wsPersona = null;
  }

  private handleIncomingMessage(msg: PersonaChatMessage) {
    const thread = this.threads.find(
      (t) =>
        t.personaAddress.toLowerCase() === msg.personaAddress.toLowerCase(),
    );
    if (!thread) return;

    const myAddr = tokenManager.getAddress?.();
    const senderType: Sender =
      myAddr && msg.sender.toLowerCase() === myAddr.toLowerCase()
        ? 'you'
        : 'other';

    const profile = msg.senderProfile;
    const displayName = this.formatDisplayName(
      msg.sender,
      profile?.nickname,
    );
    const avatarUrl = profile?.avatarUrl ?? null;

    const author = senderType === 'you' ? 'You' : displayName;

    const time = new Date(msg.createdAt * 1000).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    const view: ViewChatMessage = {
      id: msg.id,
      sender: senderType,
      author,
      text: msg.content,
      time,
      avatarUrl,
      walletAddress: msg.sender,
      raw: msg,
    };

    if (thread.messages.some((m) => Number(m.id) === Number(msg.id))) {
      return;
    }

    thread.messages.push(view);

    const isCurrentDesktop =
      this.currentThread && this.currentThread.id === thread.id;
    const isCurrentMobile =
      this.mobileMessagesEl && this.mobileThreadId === thread.id;

    if (isCurrentDesktop) {
      this.renderCurrentThread();
    }

    if (isCurrentMobile && this.mobileMessagesEl) {
      this.renderMessagesInto(thread, this.mobileMessagesEl);
    }

    if (!isCurrentDesktop && !isCurrentMobile) {
      thread.unreadCount += 1;
      this.renderThreadList();
    }
  }

  /* ================================================================== */
  /*  Mobile modal                                                       */
  /* ================================================================== */

  private openMobileChatModal(thread: ChatThread) {
    const modal = el('ion-modal.chat-room-modal') as any;

    const backIcon = el('ion-icon', {
      name: 'chevron-back-outline',
      slot: 'icon-only',
    });

    const backInnerButton = el(
      'ion-button',
      { fill: 'clear' },
      backIcon,
    ) as HTMLElement;

    backInnerButton.addEventListener('click', () => modal.dismiss());

    const backBtn = el(
      'ion-buttons',
      { slot: 'start' },
      backInnerButton,
    );

    const header = el(
      'ion-header',
      el(
        'ion-toolbar',
        backBtn,
        el('ion-title', thread.name),
      ),
    );

    const mobileMain = el('div.chat-main.chat-main-modal');

    const avatar = el('div.chat-main-avatar') as HTMLElement;
    avatar.innerHTML = '';

    if (thread.avatarUrl) {
      const img = el('img.chat-main-avatar-img', {
        src: thread.avatarUrl,
        alt: thread.name || 'Persona',
      }) as HTMLImageElement;
      avatar.append(img);
    } else {
      const img = this.createAddressAvatarImg(
        thread.personaAddress,
        thread.name || 'Persona',
        'chat-main-avatar-img',
      );
      if (img) {
        avatar.append(img);
      } else {
        avatar.textContent = thread.avatarInitial;
      }
    }

    const nameEl = el('div.chat-main-name', thread.name);
    const statusEl = el(
      'div.chat-main-status',
      `${thread.holdersInChat} holders online`,
    );

    const mobileHeader = el(
      'div.chat-main-header',
      avatar,
      el('div.chat-main-meta', nameEl, statusEl),
    );

    avatar.addEventListener('click', () => {
      createUserProfileModal(thread.personaAddress, this.navigate);
    });

    nameEl.addEventListener('click', () => {
      createUserProfileModal(thread.personaAddress, this.navigate);
    });

    const messagesEl = el('div.chat-messages');
    this.renderMessagesInto(thread, messagesEl);

    this.mobileMessagesEl = messagesEl;
    this.mobileThreadId = thread.id;

    const input = el('input', {
      type: 'text',
      placeholder: 'Type a message...',
      class: 'chat-input-field',
      'aria-label': 'Message',
    }) as HTMLInputElement;

    const sendFromModal = async () => {
      const value = input.value.trim();
      if (!value) return;

      await this.sendMessageCommon(thread, value);
      input.value = '';

      this.renderMessagesInto(thread, messagesEl);
    };

    input.addEventListener('keydown', async (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        await sendFromModal();
      }
    });

    const sendBtn = el(
      'button.chat-send-btn',
      { onclick: () => sendFromModal() },
      el('div.chat-send-btn-icon'),
    );

    const inputInner = el('div.chat-input-inner', input, sendBtn);

    const note = el(
      'div.chat-input-note',
      'Only persona holders can chat in this room',
    );

    const inputBar = el('div.chat-input-bar', inputInner, note);

    mobileMain.append(mobileHeader, messagesEl, inputBar);

    const content = el('ion-content', { fullscreen: true }, mobileMain);

    modal.append(header, content);

    document.body.appendChild(modal);
    modal.present();

    modal.addEventListener('ionModalDidPresent', () => {
      this.renderMessagesInto(thread, messagesEl);
    });

    modal.addEventListener('ionModalDidDismiss', () => {
      modal.remove();
      this.mobileMessagesEl = null;
      this.mobileThreadId = null;
    });
  }
}
