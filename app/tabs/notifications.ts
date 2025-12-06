import { getAddressAvatarDataUrl } from '@gaiaprotocol/address-avatar';
import { tokenManager } from '@gaiaprotocol/client-common';
import { el } from '@webtaku/el';
import { getAddress } from 'viem';
import {
  fetchNotificationsApi,
  markAllNotificationsAsReadApi,
  markNotificationsAsReadApi,
  RawNotification,
} from '../api/notifications';
import './notifications.css';

type NotificationVerbType =
  | 'post.like'
  | 'post.comment'
  | 'post.reply'
  | 'post.repost'
  | 'post.quote'
  | 'post.mention'
  | 'persona.buy'
  | 'persona.sell'
  | 'trade.buy'
  | 'trade.sell'
  | 'user.follow'
  | 'chat.reply'
  | 'chat.reaction'
  | 'system.announcement'
  | string;

interface NotificationItemUI {
  id: number;
  type: NotificationVerbType;
  actorAddress: string | null;
  actorName: string;
  actorInitial: string;
  actorAvatarUrl?: string;
  verb: string;
  preview?: string | null;
  timeAgo: string;
  unread: boolean;
  navigatePath?: string | null;
}

function shortenAddress(addr: string | null): string {
  if (!addr) return 'Someone';
  if (!addr.startsWith('0x') || addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function isEthAddress(value: string | null | undefined): value is `0x${string}` {
  if (!value) return false;
  const v = value.trim();
  return /^0x[0-9a-fA-F]{40}$/.test(v);
}

function formatTimeAgo(createdAtSec: number): string {
  const nowMs = Date.now();
  const createdMs = createdAtSec * 1000;
  const diffSec = Math.max(0, Math.floor((nowMs - createdMs) / 1000));

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
}

function mapRawToUI(n: RawNotification): NotificationItemUI {
  const type = n.notificationType as NotificationVerbType;

  const meta = n.metadata ?? {};

  const actorNickname =
    n.actorNickname ??
    (meta.actorNickname as string | undefined) ??
    (meta.actor_name as string | undefined) ??
    undefined;

  const actorAvatarUrl =
    n.actorAvatarUrl ??
    (meta.actorAvatarUrl as string | undefined) ??
    (meta.actorAvatar as string | undefined) ??
    (meta.avatarUrl as string | undefined) ??
    undefined;

  let actorName: string;
  if (actorNickname && actorNickname.trim().length > 0) {
    const trimmed = actorNickname.trim();
    actorName =
      trimmed.startsWith('0x') && trimmed.length > 10
        ? shortenAddress(trimmed)
        : trimmed;
  } else {
    actorName = shortenAddress(n.actor);
  }

  const actorInitial = actorName.trim().charAt(0).toUpperCase() || 'U';

  let verb = 'did something';
  let preview: string | null = null;
  let navigatePath: string | null = null;

  switch (type) {
    case 'post.like':
      verb = 'liked your post';
      preview = (meta.postPreview as string) ?? null;
      if (n.targetId) navigatePath = `/post/${n.targetId}`;
      break;
    case 'post.comment':
    case 'post.reply':
      verb = 'commented on your post';
      preview =
        (meta.commentPreview as string) ??
        (meta.replyPreview as string) ??
        (meta.postPreview as string) ??
        null;
      if (n.targetId) navigatePath = `/post/${n.targetId}`;
      break;
    case 'post.repost':
      verb = 'reposted your post';
      preview = (meta.postPreview as string) ?? null;
      if (n.targetId) navigatePath = `/post/${n.targetId}`;
      break;
    case 'post.quote':
      verb = 'quoted your post';
      preview =
        (meta.quotePreview as string) ??
        (meta.postPreview as string) ??
        null;
      if (n.targetId) navigatePath = `/post/${n.targetId}`;
      break;
    case 'post.mention':
      verb = 'mentioned you in a post';
      preview = (meta.postPreview as string) ?? null;
      if (n.targetId) navigatePath = `/post/${n.targetId}`;
      break;

    case 'persona.buy':
      verb = 'bought fragments of your persona';
      preview = (meta.message as string) ?? null;
      if (meta.personaAddress) {
        navigatePath = `/profile/${meta.personaAddress as string}`;
      }
      break;
    case 'persona.sell':
      verb = 'sold fragments of your persona';
      preview = (meta.message as string) ?? null;
      if (meta.personaAddress) {
        navigatePath = `/profile/${meta.personaAddress as string}`;
      }
      break;
    case 'trade.buy':
      verb = 'bought persona fragments';
      preview = (meta.message as string) ?? null;
      if (meta.personaAddress) {
        navigatePath = `/profile/${meta.personaAddress as string}`;
      }
      break;
    case 'trade.sell':
      verb = 'sold persona fragments';
      preview = (meta.message as string) ?? null;
      if (meta.personaAddress) {
        navigatePath = `/profile/${meta.personaAddress as string}`;
      }
      break;

    case 'user.follow':
      verb = 'started following you';
      break;
    case 'chat.reply':
      verb = 'replied to your chat';
      preview =
        (meta.messagePreview as string) ??
        (meta.chatPreview as string) ??
        null;
      if (meta.personaAddress) {
        navigatePath = `/chat/${meta.personaAddress as string}`;
      }
      break;
    case 'chat.reaction':
      verb = 'reacted to your chat message';
      preview =
        (meta.messagePreview as string) ??
        (meta.chatPreview as string) ??
        null;
      if (meta.personaAddress) {
        navigatePath = `/chat/${meta.personaAddress as string}`;
      }
      break;
    case 'system.announcement':
      verb = 'System notification';
      preview = (meta.message as string) ?? null;
      break;

    default:
      verb = 'sent you a notification';
      preview = (meta.message as string) ?? null;
      break;
  }

  return {
    id: n.id,
    type,
    actorAddress: n.actor,
    actorName,
    actorInitial,
    actorAvatarUrl,
    verb,
    preview: preview ?? undefined,
    timeAgo: formatTimeAgo(n.createdAt),
    unread: !n.isRead,
    navigatePath,
  };
}

type NotificationTypeUI =
  | 'like'
  | 'comment'
  | 'buy'
  | 'follow'
  | 'mention'
  | 'system'
  | 'other';

function mapTypeToVisual(type: NotificationVerbType): NotificationTypeUI {
  if (type.startsWith('post.like')) return 'like';
  if (
    type.startsWith('post.comment') ||
    type.startsWith('post.reply') ||
    type.startsWith('post.repost') ||
    type.startsWith('post.quote')
  ) {
    return 'comment';
  }
  if (type.startsWith('post.mention')) return 'mention';

  if (
    type.startsWith('persona.buy') ||
    type.startsWith('persona.sell') ||
    type.startsWith('trade.buy') ||
    type.startsWith('trade.sell')
  ) {
    return 'buy';
  }

  if (type.startsWith('user.follow')) return 'follow';
  if (type.startsWith('chat.')) return 'comment';
  if (type.startsWith('system.')) return 'system';

  return 'other';
}

interface NotificationsTabOptions {
  onUnreadCountChange?: (count: number) => void;
}

export class NotificationsTab {
  el: HTMLElement;

  private items: NotificationItemUI[] = [];
  private subtitleEl!: HTMLElement;
  private markAllButton!: HTMLButtonElement;
  private listEl!: HTMLElement;

  private navigate?: (path: string) => void;
  private loading = false;

  private onUnreadCountChange?: (count: number) => void;

  constructor(
    navigate?: (path: string) => void,
    options?: NotificationsTabOptions,
  ) {
    this.navigate = navigate;
    this.onUnreadCountChange = options?.onUnreadCountChange;

    this.el = el('section.notifications-wrapper');
    const inner = el('div.notifications-inner');

    const header = this.buildHeader();
    this.listEl = el('div.notifications-list');

    inner.append(header, this.listEl);
    this.el.append(inner);

    void this.fetchAndRender();
  }

  public async refresh() {
    await this.fetchAndRender();
  }

  private buildHeader(): HTMLElement {
    const title = el('h2.notifications-title', 'Notifications');

    this.subtitleEl = el(
      'p.notifications-subtitle',
      '',
    ) as HTMLElement;

    const left = el('div', title, this.subtitleEl);

    this.markAllButton = el(
      'button.notifications-mark-all-btn',
      {},
      'Mark all as read',
    ) as HTMLButtonElement;

    this.markAllButton.addEventListener('click', () => this.handleMarkAll());

    const right = el(
      'div.notifications-header-actions',
      this.markAllButton,
    );

    return el('div.notifications-header', left, right);
  }

  private async fetchAndRender() {
    const token = tokenManager.getToken?.();
    if (!token) {
      this.items = [];
      this.renderList();
      this.subtitleEl.textContent = 'Sign in to see your notifications';
      this.markAllButton.disabled = true;
      if (this.onUnreadCountChange) {
        this.onUnreadCountChange(0);
      }
      return;
    }

    if (this.loading) return;
    this.loading = true;

    try {
      const { notifications, unreadCount } = await fetchNotificationsApi({
        token,
        limit: 50,
        cursor: 0,
      });

      this.items = notifications.map(mapRawToUI);
      this.renderList();
      this.updateUnreadSummary(unreadCount);
    } catch (err: any) {
      console.error('[NotificationsTab] fetch failed', err);
      this.items = [];
      this.listEl.innerHTML =
        '<div style="padding:0.75rem; font-size:0.85rem; color:#f97373;">Failed to load notifications.</div>';
      this.subtitleEl.textContent = 'Failed to load notifications';
      this.markAllButton.disabled = true;

      if (this.onUnreadCountChange) {
        this.onUnreadCountChange(0);
      }
    } finally {
      this.loading = false;
    }
  }

  private updateUnreadSummary(totalUnread?: number) {
    const unreadCount =
      typeof totalUnread === 'number'
        ? totalUnread
        : this.items.filter((n) => n.unread).length;

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

    if (this.onUnreadCountChange) {
      this.onUnreadCountChange(unreadCount);
    }
  }

  private async handleMarkAll() {
    const token = tokenManager.getToken?.();
    if (!token) return;

    try {
      const res = await markAllNotificationsAsReadApi(token);
      this.items = this.items.map((n) => ({ ...n, unread: false }));
      this.renderList();
      this.updateUnreadSummary((res as any).unreadCount ?? 0);
    } catch (err) {
      console.error('[NotificationsTab] markAll error', err);
    }
  }

  private renderList() {
    this.listEl.innerHTML = '';

    if (!this.items.length) {
      this.listEl.innerHTML =
        '<div style="padding:0.75rem; font-size:0.85rem; color:#888;">No notifications yet.</div>';
      return;
    }

    this.items.forEach((item) => {
      const row = this.renderItem(item);
      this.listEl.append(row);
    });
  }

  private renderItem(item: NotificationItemUI): HTMLElement {
    const typeVisual = mapTypeToVisual(item.type);

    const avatar = el('div.notification-avatar') as HTMLElement;

    if (item.actorAvatarUrl) {
      const img = document.createElement('img');
      img.src = item.actorAvatarUrl;
      img.alt = item.actorName || 'Profile';
      img.className = 'notification-avatar-img';
      avatar.appendChild(img);
    } else if (isEthAddress(item.actorAddress)) {
      try {
        const checksum = getAddress(item.actorAddress as `0x${string}`);
        const src = getAddressAvatarDataUrl(checksum as `0x${string}`);
        const img = document.createElement('img');
        img.src = src;
        img.alt = item.actorName || 'Profile';
        img.className = 'notification-avatar-img';
        avatar.appendChild(img);
      } catch {
        avatar.textContent = item.actorInitial;
      }
    } else {
      avatar.textContent = item.actorInitial;
    }

    const typeIcon = el(
      'div.notification-type-icon',
      this.getTypeSymbol(typeVisual),
    );
    const typeClass = this.getTypeClass(typeVisual);
    if (typeClass) typeIcon.classList.add(typeClass);

    const left = el('div.notification-left', avatar, typeIcon);

    const actor = el('span.notification-actor', item.actorName);
    const verb = el('span.notification-verb', item.verb);

    const mainRow = el('div.notification-main-row', actor, verb);

    const preview =
      item.preview && el('div.notification-preview', item.preview);

    const body = el(
      'div.notification-body',
      mainRow,
      preview || null,
    );

    const unreadDot = el('div.notification-unread-dot');
    const time = el('div.notification-time', item.timeAgo);

    const meta = el('div.notification-meta', unreadDot, time);

    const row = el(
      'div.notification-item',
      { 'data-id': String(item.id) },
      left,
      body,
      meta,
    ) as HTMLElement;

    if (!item.unread) {
      row.classList.add('read');
    }

    row.addEventListener('click', () => this.handleItemClick(item));

    return row;
  }

  private async handleItemClick(item: NotificationItemUI) {
    const token = tokenManager.getToken?.();

    if (item.unread) {
      item.unread = false;
      this.renderList();
      this.updateUnreadSummary();

      if (token) {
        try {
          const res = await markNotificationsAsReadApi({
            token,
            id: item.id,
          });
          if ((res as any).unreadCount != null) {
            this.updateUnreadSummary((res as any).unreadCount);
          }
        } catch (err) {
          console.error('[NotificationsTab] mark read error', err);
        }
      }
    }

    if (!this.navigate || !item.navigatePath) {
      return;
    }
    this.navigate(item.navigatePath);
  }

  private getTypeSymbol(type: NotificationTypeUI): string {
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

  private getTypeClass(type: NotificationTypeUI): string {
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
