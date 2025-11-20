import { el } from '@webtaku/el';
import './chat.css';
import { createUserProfileModal } from '../modals/profile';

type Sender = 'you' | 'other';

interface ChatMessage {
  id: string;
  sender: Sender;
  author: string; // "You", "Luna Park" 등
  text: string;
  time: string;   // "2:45 PM"
}

interface ChatThread {
  id: string;
  name: string;
  holdersInChat: number;
  unreadCount: number;
  avatarInitial: string;
  messages: ChatMessage[];
}

/** 데모용 샘플 데이터 */
const sampleThreads: ChatThread[] = [
  {
    id: 'alex',
    name: 'Alex Chen',
    holdersInChat: 342,
    unreadCount: 2,
    avatarInitial: 'A',
    messages: [
      {
        id: 'm1',
        sender: 'other',
        author: 'Luna Park',
        text: 'Hey everyone! Just bought more fragments 🚀',
        time: '2:45 PM'
      },
      {
        id: 'm2',
        sender: 'other',
        author: 'Noah Tech',
        text: 'Same here! The bonding curve is looking good',
        time: '2:46 PM'
      },
      {
        id: 'm3',
        sender: 'you',
        author: 'You',
        text: 'Thanks for the support everyone! This community is amazing',
        time: '2:47 PM'
      }
    ]
  },
  {
    id: 'luna',
    name: 'Luna Park',
    holdersInChat: 521,
    unreadCount: 0,
    avatarInitial: 'L',
    messages: [
      {
        id: 'm4',
        sender: 'other',
        author: 'Luna Park',
        text: 'Welcome to the channel 👋',
        time: '1:12 PM'
      }
    ]
  },
  {
    id: 'noah',
    name: 'Noah Tech',
    holdersInChat: 198,
    unreadCount: 5,
    avatarInitial: 'N',
    messages: [
      {
        id: 'm5',
        sender: 'other',
        author: 'Noah Tech',
        text: 'GM frens ☕️',
        time: '9:21 AM'
      }
    ]
  }
];

export class ChatTab {
  el: HTMLElement;

  private threads: ChatThread[];
  private filteredThreads: ChatThread[];
  private currentThread: ChatThread | null = null;

  private threadListEl!: HTMLElement;

  // 데스크톱 채팅 영역 레퍼런스
  private mainNameEl!: HTMLElement;
  private mainStatusEl!: HTMLElement;
  private messagesEl!: HTMLElement;
  private inputEl!: HTMLInputElement;

  // 🔹 추가: 라우팅용 콜백
  private navigate?: (path: string) => void;

  // 🔹 생성자에서 navigate 주입
  constructor(navigate?: (path: string) => void) {
    this.navigate = navigate;

    this.threads = sampleThreads;
    this.filteredThreads = [...this.threads];
    this.currentThread = this.threads[0] ?? null;

    this.el = el('section.chat-wrapper');

    const shell = el('div.chat-shell');

    // 사이드바
    const sidebar = this.buildSidebar();

    // 데스크톱 메인 채팅 영역
    const desktopMain = this.buildDesktopMain();

    shell.append(sidebar, desktopMain);
    this.el.append(shell);

    // 🔹 상단 유저 이름 클릭 시 /profile/:id 로 이동
    this.mainNameEl.addEventListener('click', (e) => {
      if (!this.navigate || !this.currentThread) return;
      e.preventDefault();
      this.navigate(`/profile/${this.currentThread.id}`);
    });

    this.renderThreadList();
    this.renderCurrentThread();
  }

  /* ---------------- 사이드바 ---------------- */

  private buildSidebar(): HTMLElement {
    const sidebar = el('div.chat-sidebar');

    const header = el(
      'div.chat-sidebar-header',
      el('h2.chat-sidebar-title', 'Chat')
    );

    // 검색 인풋
    const searchInput = el('input.chat-search-input', {
      type: 'search',
      placeholder: 'Search personas...'
    }) as HTMLInputElement;

    searchInput.addEventListener('input', () => {
      this.handleSearch(searchInput.value);
    });

    const search = el('div.chat-search', searchInput);

    // 스레드 리스트 컨테이너
    this.threadListEl = el('div.chat-thread-list');

    const footer = el(
      'div.chat-sidebar-footer',
      'Chat only available to persona holders'
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
        t.name.toLowerCase().includes(q)
      );
    }

    // 현재 스레드가 필터에 없으면 첫 번째로 교체
    if (
      this.currentThread &&
      !this.filteredThreads.find((t) => t.id === this.currentThread!.id)
    ) {
      this.currentThread = this.filteredThreads[0] ?? null;
    }

    this.renderThreadList();
    this.renderCurrentThread();
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
            `${thread.holdersInChat} holders in chat`
          )
        ),
        thread.unreadCount > 0
          ? el('div.chat-thread-unread', String(thread.unreadCount))
          : null
      ) as HTMLElement;

      if (this.currentThread && this.currentThread.id === thread.id) {
        item.classList.add('active');
      }

      // ✅ 여기서는 "채팅방 선택"만! 프로필로 안 감
      item.addEventListener('click', () => {
        this.currentThread = thread;
        thread.unreadCount = 0;

        this.renderThreadList();
        this.renderCurrentThread();

        // 모바일이면 모달로 채팅방 열기
        if (window.matchMedia('(max-width: 900px)').matches) {
          this.openMobileChatModal(thread);
        }
      });

      this.threadListEl.append(item);
    });
  }

  /* ---------------- 데스크톱 메인 채팅 영역 ---------------- */

  private buildDesktopMain(): HTMLElement {
    const main = el('div.chat-main.chat-main-desktop');

    const avatar = el('div.chat-main-avatar');

    this.mainNameEl = el('a.chat-main-name', { href: '#' }) as HTMLAnchorElement;
    this.mainStatusEl = el('div.chat-main-status');

    const header = el(
      'div.chat-main-header',
      avatar,
      el('div.chat-main-meta', this.mainNameEl, this.mainStatusEl)
    );

    this.messagesEl = el('div.chat-messages');

    // 입력 영역
    this.inputEl = el('input.chat-input-field', {
      type: 'text',
      placeholder: 'Type a message...'
    }) as HTMLInputElement;

    this.inputEl.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        this.sendMessageFromDesktop();
      }
    });

    const sendBtn = el(
      'button.chat-send-btn',
      el('div.chat-send-btn-icon')
    ) as HTMLButtonElement;

    sendBtn.addEventListener('click', () => this.sendMessageFromDesktop());

    const inputInner = el(
      'div.chat-input-inner',
      this.inputEl,
      sendBtn
    );

    const note = el(
      'div.chat-input-note',
      'Only persona holders can chat in this room'
    );

    const inputBar = el('div.chat-input-bar', inputInner, note);

    main.append(header, this.messagesEl, inputBar);
    return main;
  }

  private renderCurrentThread() {
    if (!this.currentThread) return;

    this.mainNameEl.textContent = this.currentThread.name;
    this.mainNameEl.setAttribute('href', `/profile/${this.currentThread.id}`);
    this.mainStatusEl.textContent = `${this.currentThread.holdersInChat} holders online`;

    // 메시지 리스트 렌더
    this.renderMessagesInto(this.currentThread, this.messagesEl);
  }

  private renderMessagesInto(thread: ChatThread, container: HTMLElement) {
    container.innerHTML = '';

    thread.messages.forEach((m) => {
      const row = el(
        'div.chat-message-row',
        { class: `chat-message-row ${m.sender}` }
      );

      const bubble = el(
        'div.chat-message-bubble',
        { class: `chat-message-bubble ${m.sender}` },
        m.text
      );

      const meta = el(
        'div.chat-message-meta',
        m.sender === 'you' ? `You  ${m.time}` : `${m.author}  ${m.time}`
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

  private sendMessageFromDesktop() {
    if (!this.currentThread) return;

    const text = this.inputEl.value.trim();
    if (!text) return;

    this.sendMessageCommon(this.currentThread, text);
    this.inputEl.value = '';
  }

  /* 공통 전송 로직 (데스크톱 + 모바일 모달에서 둘 다 사용) */
  private sendMessageCommon(thread: ChatThread, text: string) {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });

    const msg: ChatMessage = {
      id: `local-${Date.now()}`,
      sender: 'you',
      author: 'You',
      text,
      time
    };

    thread.messages.push(msg);

    // 현재 선택 스레드면 데스크톱 UI 갱신
    if (this.currentThread && this.currentThread.id === thread.id) {
      this.renderCurrentThread();
    }
  }

  /* ---------------- 모바일: ion-modal 채팅방 ---------------- */

  private openMobileChatModal(thread: ChatThread) {
    const modal = el('ion-modal.chat-room-modal') as any;

    const backBtn = el(
      'ion-button',
      {
        slot: 'start',
        fill: 'clear',
        onclick: () => modal.dismiss()
      },
      el('ion-icon', { name: 'chevron-back-outline' })
    );

    const header = el(
      'ion-header',
      el(
        'ion-toolbar',
        backBtn,
        el('ion-title', thread.name)
      )
    );

    const mobileMain = el('div.chat-main.chat-main-modal');

    const avatar = el('div.chat-main-avatar');

    const nameEl = el('div.chat-main-name', thread.name);
    const statusEl = el(
      'div.chat-main-status',
      `${thread.holdersInChat} holders online`
    );

    const mobileHeader = el(
      'div.chat-main-header',
      avatar,
      el('div.chat-main-meta', nameEl, statusEl)
    );

    avatar.addEventListener('click', () => {
      createUserProfileModal(thread.id, this.navigate);
    });

    nameEl.addEventListener('click', () => {
      createUserProfileModal(thread.id, this.navigate);
    });

    const messagesEl = el('div.chat-messages');
    this.renderMessagesInto(thread, messagesEl);

    const input = el('ion-input', {
      placeholder: 'Type a message...',
      class: 'chat-input-field',
      'aria-label': 'Message'
    }) as any;

    const sendFromModal = async () => {
      const raw = (await input.getInputElement?.()) as HTMLInputElement | undefined;
      const value = (raw?.value ?? '').trim();
      if (!value) return;

      this.sendMessageCommon(thread, value);
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
      el('div.chat-send-btn-icon')
    );

    const inputInner = el(
      'div.chat-input-inner',
      input,
      sendBtn
    );

    const note = el(
      'div.chat-input-note',
      'Only persona holders can chat in this room'
    );

    const inputBar = el('div.chat-input-bar', inputInner, note);

    mobileMain.append(mobileHeader, messagesEl, inputBar);

    const content = el(
      'ion-content',
      { fullscreen: true },
      mobileMain
    );

    modal.append(header, content);

    document.body.appendChild(modal);
    modal.present();

    modal.addEventListener('ionModalDidDismiss', () => {
      modal.remove();
    });
  }
}
