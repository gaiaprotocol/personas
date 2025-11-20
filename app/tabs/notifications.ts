import { el } from '@webtaku/el';
import './notifications.css';

type NotificationType =
  | 'like'
  | 'comment'
  | 'buy'
  | 'follow'
  | 'mention'
  | 'system';

interface NotificationItem {
  id: string;
  actorName: string;
  actorInitial: string;
  type: NotificationType;
  verb: string;          // "liked your post"
  subline?: string;      // "commented on your post" 같은 설명
  preview?: string;      // 박스 안에 들어가는 텍스트
  timeAgo: string;       // "2 hours ago"
  unread: boolean;
}

const sampleNotifications: NotificationItem[] = [
  {
    id: 'n1',
    actorName: 'Alex Chen',
    actorInitial: 'A',
    type: 'like',
    verb: 'liked your post',
    preview: 'Just dropped my new persona fragment collection!',
    timeAgo: '2 hours ago',
    unread: true
  },
  {
    id: 'n2',
    actorName: 'Luna Park',
    actorInitial: 'L',
    type: 'comment',
    verb: 'commented on your post',
    preview: 'This is amazing! Congrats on the momentum!🔥',
    timeAgo: '3 hours ago',
    unread: true
  },
  {
    id: 'n3',
    actorName: 'Noah Tech',
    actorInitial: 'N',
    type: 'buy',
    verb: 'bought 10 fragments of your persona',
    preview: 'Price increased to $45.32',
    timeAgo: '5 hours ago',
    unread: true
  },
  {
    id: 'n4',
    actorName: 'Crypto Trader',
    actorInitial: 'C',
    type: 'follow',
    verb: 'started following you',
    timeAgo: '1 day ago',
    unread: false
  },
  {
    id: 'n5',
    actorName: 'Web3 Dev',
    actorInitial: 'W',
    type: 'mention',
    verb: 'mentioned you in a post',
    preview: '@You is building something incredible on Gaia',
    timeAgo: '1 day ago',
    unread: false
  },
  {
    id: 'n6',
    actorName: 'System',
    actorInitial: 'S',
    type: 'system',
    verb: 'Your persona price reached a milestone',
    preview: 'Price ATH: $50.00',
    timeAgo: '2 days ago',
    unread: false
  }
];

export class NotificationsTab {
  el: HTMLElement;

  private items: NotificationItem[];

  private subtitleEl!: HTMLElement;
  private markAllButton!: HTMLButtonElement;
  private listEl!: HTMLElement;

  constructor() {
    this.items = [...sampleNotifications];

    this.el = el('section.notifications-wrapper');
    const inner = el('div.notifications-inner');

    const header = this.buildHeader();
    this.listEl = el('div.notifications-list');

    inner.append(header, this.listEl);
    this.el.append(inner);

    this.renderList();
    this.updateUnreadSummary();
  }

  /* ---------- 헤더 ---------- */

  private buildHeader(): HTMLElement {
    const title = el('h2.notifications-title', 'Notifications');

    this.subtitleEl = el(
      'p.notifications-subtitle',
      ''
    ) as HTMLElement;

    const left = el(
      'div',
      title,
      this.subtitleEl
    );

    this.markAllButton = el(
      'button.notifications-mark-all-btn',
      {},
      'Mark all as read'
    ) as HTMLButtonElement;

    this.markAllButton.addEventListener('click', () => this.handleMarkAll());

    const right = el(
      'div.notifications-header-actions',
      this.markAllButton
    );

    return el(
      'div.notifications-header',
      left,
      right
    );
  }

  private updateUnreadSummary() {
    const unreadCount = this.items.filter((n) => n.unread).length;
    if (unreadCount === 0) {
      this.subtitleEl.textContent = 'You have no unread notifications';
      this.markAllButton.disabled = true;
    } else if (unreadCount === 1) {
      this.subtitleEl.textContent = 'You have 1 unread notification';
      this.markAllButton.disabled = false;
    } else {
      this.subtitleEl.textContent = `You have ${unreadCount} unread notifications`;
      this.markAllButton.disabled = false;
    }
  }

  private handleMarkAll() {
    this.items = this.items.map((n) => ({ ...n, unread: false }));
    this.renderList();
    this.updateUnreadSummary();
  }

  /* ---------- 리스트 렌더링 ---------- */

  private renderList() {
    this.listEl.innerHTML = '';

    this.items.forEach((item) => {
      const row = this.renderItem(item);
      this.listEl.append(row);
    });
  }

  private renderItem(item: NotificationItem): HTMLElement {
    // 왼쪽: 아바타 + 타입 아이콘
    const avatar = el('div.notification-avatar', item.actorInitial);

    const typeIcon = el(
      'div.notification-type-icon',
      this.getTypeSymbol(item.type)
    );
    typeIcon.classList.add(this.getTypeClass(item.type));

    const left = el(
      'div.notification-left',
      avatar,
      typeIcon
    );

    // 가운데: 본문
    const actor = el('span.notification-actor', item.actorName);
    const verb = el('span.notification-verb', item.verb);

    const mainRow = el(
      'div.notification-main-row',
      actor,
      verb
    );

    const subline =
      item.subline &&
      el('div.notification-subline', item.subline);

    const preview =
      item.preview &&
      el('div.notification-preview', item.preview);

    const body = el(
      'div.notification-body',
      mainRow,
      subline || null,
      preview || null
    );

    // 오른쪽: 점 + 시간
    const unreadDot = el('div.notification-unread-dot');
    const time = el('div.notification-time', item.timeAgo);

    const meta = el(
      'div.notification-meta',
      unreadDot,
      time
    );

    const row = el(
      'div.notification-item',
      { 'data-id': item.id },
      left,
      body,
      meta
    ) as HTMLElement;

    if (!item.unread) {
      row.classList.add('read');
    }

    row.addEventListener('click', () => {
      if (item.unread) {
        item.unread = false;
        this.renderList();
        this.updateUnreadSummary();
      } else {
        // 이미 읽은 알림을 눌렀을 때는 여기에 상세 화면/링크 연결 가능
        console.log('Open notification target:', item.id);
      }
    });

    return row;
  }

  private getTypeSymbol(type: NotificationType): string {
    switch (type) {
      case 'like':
        return '♡';
      case 'comment':
        return '💬';
      case 'buy':
        return '↗';
      case 'follow':
        return '➕';
      case 'mention':
        return '@';
      case 'system':
        return '★';
      default:
        return '•';
    }
  }

  private getTypeClass(type: NotificationType): string {
    switch (type) {
      case 'like':
        return 'notification-type-like';
      case 'comment':
        return 'notification-type-comment';
      case 'buy':
        return 'notification-type-buy';
      case 'follow':
        return 'notification-type-follow';
      case 'mention':
        return 'notification-type-mention';
      case 'system':
        return 'notification-type-system';
      default:
        return '';
    }
  }
}
