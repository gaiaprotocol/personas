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

// contract-based holder check
import { getAddress } from 'viem';
import {
  getPersonaBalance,
  type Address,
} from '../contracts/persona-fragments';

type Sender = 'you' | 'other';

interface ViewChatMessage {
  id: number;
  sender: Sender;
  author: string; // "You", "0x1234…abcd" etc
  text: string;
  time: string;   // "2:45 PM"
  raw: PersonaChatMessage;
}

interface ChatThread {
  id: string;             // UI id (persona address)
  personaAddress: string; // 0x...
  name: string;
  holdersInChat: number;
  unreadCount: number;
  avatarInitial: string;
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
  private messagesEl!: HTMLElement;
  private inputEl!: HTMLInputElement;

  // Router callback
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
   * Used by router for /chat/:personaAddress deep link.
   *
   * 이제 owner 인 경우 balance 0 이어도 입장 허용.
   */
  public async openPersonaRoom(personaAddress: string) {
    // Ensure base thread list (from backend) is loaded
    await this.ensureThreadsInitialized();

    const token = tokenManager.getToken?.();
    const rawUserAddr = tokenManager.getAddress?.();

    if (!token || !rawUserAddr) {
      // Not logged in → open login modal
      openLoginModal();
      return;
    }

    let persona: Address;
    let user: Address;

    try {
      // Normalize to checksum addresses
      persona = getAddress(personaAddress) as Address;
      user = getAddress(rawUserAddr) as Address;
    } catch {
      showErrorAlert(
        'Invalid address',
        'Persona address is not a valid EVM address.',
      );
      return;
    }

    // On-chain holder check using contract read helper
    try {
      const balance = await getPersonaBalance(persona, user);
      const isOwner =
        persona.toLowerCase() === user.toLowerCase();

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

    // Find existing thread (from backend holdings list)
    let target = this.threads.find(
      (t) => t.personaAddress.toLowerCase() === persona.toLowerCase(),
    );

    // If not present (e.g. backend index is stale), create a minimal thread
    if (!target) {
      const avatarInitial = persona.slice(2, 3).toUpperCase();

      target = {
        id: persona,
        personaAddress: persona,
        name: this.shortenAddress(persona),
        holdersInChat: 0, // unknown here, could be fetched later if needed
        unreadCount: 0,
        avatarInitial,
        messages: [],
      };

      // Prepend to thread lists
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
   */
  private async initThreads() {
    const token = tokenManager.getToken?.();
    if (!token) {
      // Not logged in → keep empty list and rely on CTA in footer
      this.threadListEl.innerHTML = '';
      return;
    }

    try {
      const { holdings } = await fetchHeldPersonaFragments(token);

      this.threads = holdings.map((h: PersonaFragmentHolding) => {
        const persona = h.personaAddress;
        const name = this.shortenAddress(persona);
        const avatarInitial = persona.slice(2, 3).toUpperCase();

        return {
          id: persona,
          personaAddress: persona,
          name,
          holdersInChat: h.holderCount,
          unreadCount: 0,
          avatarInitial,
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
          const name = this.shortenAddress(normalizedMy);
          const avatarInitial = normalizedMy.slice(2, 3).toUpperCase();

          const myThread: ChatThread = {
            id: normalizedMy,
            personaAddress: normalizedMy,
            name,
            holdersInChat: 0,
            unreadCount: 0,
            avatarInitial,
            messages: [],
          };

          // 내 방을 가장 위에 배치
          this.threads.unshift(myThread);
        }
      }

      this.filteredThreads = [...this.threads];
      this.currentThread = this.threads[0] ?? null;

      this.renderThreadList();

      if (this.currentThread) {
        await this.activateThread(this.currentThread);
      } else {
        // No persona holdings: show helper message
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
      const item = el(
        'div.chat-thread-item',
        { 'data-id': thread.id },
        el('div.chat-thread-avatar', thread.avatarInitial),
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

        // On mobile open full-screen modal
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
    this.mainNameEl.textContent = thread.name;
    this.mainStatusEl.textContent = `${thread.holdersInChat} holders online`;

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

        const author =
          senderType === 'you' ? 'You' : this.shortenAddress(m.sender);

        const time = new Date(m.createdAt * 1000).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        });

        return {
          id: m.id,
          sender: senderType,
          author,
          text: m.content,
          time,
          raw: m,
        };
      });
    } catch (err) {
      console.error('[chat] failed to load messages', err);
    }
  }

  private shortenAddress(addr: string) {
    if (!addr.startsWith('0x') || addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  /* ================================================================== */
  /*  Desktop main chat area                                            */
  /* ================================================================== */

  private buildDesktopMain(): HTMLElement {
    const main = el('div.chat-main.chat-main-desktop');

    const avatar = el('div.chat-main-avatar');

    this.mainNameEl = el('a.chat-main-name', { href: '#' }) as HTMLAnchorElement;
    this.mainStatusEl = el('div.chat-main-status');

    const header = el(
      'div.chat-main-header',
      avatar,
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

  private renderCurrentThread() {
    if (!this.currentThread) return;
    this.mainNameEl.textContent = this.currentThread.name;
    this.mainStatusEl.textContent = `${this.currentThread.holdersInChat} holders online`;

    this.renderMessagesInto(this.currentThread, this.messagesEl);
  }

  private renderMessagesInto(thread: ChatThread, container: HTMLElement) {
    container.innerHTML = '';

    thread.messages.forEach((m) => {
      const row = el(
        'div.chat-message-row',
        { class: `chat-message-row ${m.sender}` },
      );

      const bubble = el(
        'div.chat-message-bubble',
        { class: `chat-message-bubble ${m.sender}` },
        m.text,
      );

      const meta = el(
        'div.chat-message-meta',
        m.sender === 'you' ? `You  ${m.time}` : `${m.author}  ${m.time}`,
      );

      if (m.sender === 'other') {
        row.append(meta, bubble);
      } else {
        row.append(bubble, meta);
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

      // WS가 정상적으로 연결되어 있으면, 서버 브로드캐스트를 통해서만 메시지를 추가.
      const wsOpen =
        this.ws &&
        this.wsPersona &&
        this.wsPersona.toLowerCase() === thread.personaAddress.toLowerCase() &&
        this.ws.readyState === WebSocket.OPEN;

      if (!wsOpen) {
        // fallback: 서버 응답을 바로 반영
        const myAddr = tokenManager.getAddress?.();
        const senderType: Sender =
          myAddr && msg.sender.toLowerCase() === myAddr.toLowerCase()
            ? 'you'
            : 'other';

        const author =
          senderType === 'you' ? 'You' : this.shortenAddress(msg.sender);

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
          raw: msg,
        };

        // 이미 들어가 있다면 중복 방지
        if (!thread.messages.some((m) => Number(m.id) === Number(msg.id))) {
          thread.messages.push(view);
        }

        if (this.currentThread && this.currentThread.id === thread.id) {
          this.renderCurrentThread();
        }
      }

      // WS가 열려 있는 경우엔 아무 것도 하지 않는다.
      // 메시지는 handleIncomingMessage 를 통해 한 번만 추가된다.
    } catch (err: any) {
      console.error('[chat] send failed', err);
      showErrorAlert('Failed to send', err?.message ?? 'Failed to send message');
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

    const author =
      senderType === 'you' ? 'You' : this.shortenAddress(msg.sender);

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
      raw: msg,
    };

    // 숫자/문자열 섞여도 잘 동작하도록 방어
    if (thread.messages.some((m) => Number(m.id) === Number(msg.id))) {
      return;
    }

    thread.messages.push(view);

    if (this.currentThread && this.currentThread.id === thread.id) {
      this.renderCurrentThread();
    } else {
      thread.unreadCount += 1;
      this.renderThreadList();
    }
  }

  /* ================================================================== */
  /*  Mobile modal                                                       */
  /* ================================================================== */

  private openMobileChatModal(thread: ChatThread) {
    const modal = el('ion-modal.chat-room-modal') as any;

    const backBtn = el(
      'ion-button',
      {
        slot: 'start',
        fill: 'clear',
        onclick: () => modal.dismiss(),
      },
      el('ion-icon', { name: 'chevron-back-outline' }),
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

    const avatar = el('div.chat-main-avatar');

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

    const input = el('ion-input', {
      placeholder: 'Type a message...',
      class: 'chat-input-field',
      'aria-label': 'Message',
    }) as any;

    const sendFromModal = async () => {
      const raw = (await input.getInputElement?.()) as
        | HTMLInputElement
        | undefined;
      const value = (raw?.value ?? '').trim();
      if (!value) return;

      await this.sendMessageCommon(thread, value);
      if (raw) raw.value = '';

      this.renderMessagesInto(thread, messagesEl);
    };

    input.addEventListener('keyup', async (ev: any) => {
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

    modal.addEventListener('ionModalDidDismiss', () => {
      modal.remove();
    });
  }
}
