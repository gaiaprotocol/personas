import '@shoelace-style/shoelace';
import { el } from '@webtaku/el';
import './chat.css';

type Sender = 'you' | 'other';

interface ChatMessage {
  id: string;
  sender: Sender;
  author: string; // 표시용 이름 (You / Luna Park 등)
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
  private messagesEl!: HTMLElement;
  private mainNameEl!: HTMLElement;
  private mainStatusEl!: HTMLElement;
  private inputEl!: any; // sl-input

  constructor() {
    this.threads = sampleThreads;
    this.filteredThreads = [...this.threads];
    this.currentThread = this.threads[0] ?? null;

    this.el = el('section.chat-wrapper');

    const shell = el('div.chat-shell');

    /* ---------- 사이드바 ---------- */
    const sidebar = this.buildSidebar();

    /* ---------- 메인 영역 ---------- */
    const main = this.buildMainArea();

    shell.append(sidebar, main);
    this.el.append(shell);

    this.renderThreadList();
    this.renderCurrentThread();
  }

  /* 사이드바 구성 */
  private buildSidebar() {
    const sidebar = el('div.chat-sidebar');

    const header = el(
      'div.chat-sidebar-header',
      el('h2.chat-sidebar-title', 'Chat')
    );

    const search = el(
      'div.chat-search',
      el(
        'sl-input',
        {
          type: 'search',
          size: 'medium',
          pill: true,
          clearable: true,
          placeholder: 'Search personas...'
        },
        el('sl-icon', { slot: 'prefix', name: 'search' })
      ) as any
    );

    const searchInput = search.querySelector('sl-input') as any;
    if (searchInput) {
      searchInput.addEventListener('sl-input', (event: any) => {
        const value = (event.target as any).value ?? '';
        this.handleSearch(value);
      });
      searchInput.addEventListener('sl-clear', () => this.handleSearch(''));
    }

    this.threadListEl = el('div.chat-thread-list');

    const footer = el(
      'div.chat-sidebar-footer',
      'Chat only available to persona holders'
    );

    sidebar.append(header, search, this.threadListEl, footer);
    return sidebar;
  }

  /* 메인 영역 구성 */
  private buildMainArea() {
    const main = el('div.chat-main');

    // 헤더
    const avatar = el('div.chat-main-avatar');
    this.mainNameEl = el('div.chat-main-name');
    this.mainStatusEl = el('div.chat-main-status');

    const header = el(
      'div.chat-main-header',
      avatar,
      el('div.chat-main-meta', this.mainNameEl, this.mainStatusEl)
    );

    // 메시지 영역
    this.messagesEl = el('div.chat-messages');

    // 입력 영역
    const inputBar = el('div.chat-input-bar');

    const input = el(
      'sl-input',
      {
        size: 'large',
        pill: true,
        placeholder: 'Type a message...'
      }
    ) as any;

    this.inputEl = input;

    const sendBtn = el(
      'button.chat-send-btn',
      el('sl-icon', { name: 'send' })
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

    inputBar.append(inputInner, note);

    // 이벤트: 엔터 / 버튼 클릭 시 메시지 전송
    input.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        this.sendMessage();
      }
    });

    sendBtn.addEventListener('click', () => this.sendMessage());

    main.append(header, this.messagesEl, inputBar);
    return main;
  }

  /* 검색 */
  private handleSearch(raw: string) {
    const q = raw.toLowerCase().trim();
    if (!q) {
      this.filteredThreads = [...this.threads];
    } else {
      this.filteredThreads = this.threads.filter((t) =>
        t.name.toLowerCase().includes(q)
      );
    }

    // 현재 선택된 스레드가 필터에 없으면 첫 번째로 변경
    if (
      this.currentThread &&
      !this.filteredThreads.find((t) => t.id === this.currentThread!.id)
    ) {
      this.currentThread = this.filteredThreads[0] ?? null;
    }

    this.renderThreadList();
    this.renderCurrentThread();
  }

  /* 스레드 리스트 렌더 */
  private renderThreadList() {
    this.threadListEl.innerHTML = '';

    this.filteredThreads.forEach((thread) => {
      const item = el(
        'div.chat-thread-item',
        { 'data-id': thread.id },
        el(
          'div.chat-thread-avatar',
          thread.avatarInitial
        ),
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
      );

      if (this.currentThread && this.currentThread.id === thread.id) {
        item.classList.add('active');
      }

      item.addEventListener('click', () => {
        this.currentThread = thread;
        thread.unreadCount = 0;
        this.renderThreadList();
        this.renderCurrentThread();
      });

      this.threadListEl.append(item);
    });
  }

  /* 현재 스레드 렌더 */
  private renderCurrentThread() {
    this.messagesEl.innerHTML = '';

    if (!this.currentThread) return;

    this.mainNameEl.textContent = this.currentThread.name;
    this.mainStatusEl.textContent = `${this.currentThread.holdersInChat} holders online`;

    this.currentThread.messages.forEach((m) => {
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

      this.messagesEl.append(row);
    });

    // 스크롤을 맨 아래로
    requestAnimationFrame(() => {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    });
  }

  /* 메시지 전송 (로컬 state만) */
  private sendMessage() {
    if (!this.currentThread || !this.inputEl) return;

    const text = (this.inputEl.value as string).trim();
    if (!text) return;

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

    this.currentThread.messages.push(msg);
    this.inputEl.value = '';
    this.renderCurrentThread();
  }
}
