declare const GAIA_API_BASE_URI: string;

/**
 * 서버 Notification 형식에 맞춘 RawNotification 타입
 */
export type RawNotification = {
  id: number;

  recipient: string;
  recipientNickname: string | null;
  recipientAvatarUrl: string | null;

  actor: string | null;
  actorType: string | null;
  actorNickname: string | null;
  actorAvatarUrl: string | null;

  notificationType: string;          // e.g. "post.like", "post.comment", "persona.buy"
  targetId: string | null;           // e.g. post id, persona address
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: number;                 // unix seconds
};

export type NotificationsListResponse = {
  notifications: RawNotification[];
  nextCursor: number | null;
  unreadCount: number;               // 전체 미읽은 개수 (counter 기반)
};

export type MarkReadResult = {
  ok: true;
  unreadCount?: number;              // 서버가 내려주는 최신 unreadCount (optional)
};

function parseError(res: Response, fallback: string): Promise<never> {
  return res
    .json()
    .catch(() => ({}))
    .then((data: any) => {
      const msg = data?.error ?? fallback;
      throw new Error(msg);
    });
}

/**
 * Fetch notifications list for the current user.
 * GET /notifications?limit=&cursor=
 * Authorization: Bearer <token>
 */
export async function fetchNotificationsApi(params: {
  token: string;
  limit?: number;
  cursor?: number;
}): Promise<NotificationsListResponse> {
  const { token } = params;
  if (!token) throw new Error('Missing authorization token.');

  const limit = params.limit ?? 50;
  const cursor = params.cursor ?? 0;

  const sp = new URLSearchParams();
  sp.set('limit', String(limit));
  sp.set('cursor', String(cursor));

  const url = `${GAIA_API_BASE_URI}/notifications?${sp.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return parseError(res, `Failed to fetch notifications: ${res.status}`);
  }

  return (await res.json()) as NotificationsListResponse;
}

/**
 * Mark specific notification IDs as read.
 * POST /notifications/mark-read
 * { id: number }
 */
export async function markNotificationsAsReadApi(params: {
  token: string;
  id: number;
}): Promise<MarkReadResult> {
  const { token, id } = params;
  if (!token) throw new Error('Missing authorization token.');

  const res = await fetch(`${GAIA_API_BASE_URI}/notifications/mark-read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    return parseError(res, `Failed to mark notifications as read: ${res.status}`);
  }

  return (await res.json()) as MarkReadResult;
}

/**
 * Mark all notifications as read.
 * POST /notifications/mark-all-read
 */
export async function markAllNotificationsAsReadApi(token: string): Promise<MarkReadResult> {
  if (!token) throw new Error('Missing authorization token.');

  const res = await fetch(`${GAIA_API_BASE_URI}/notifications/mark-all-read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return parseError(res, `Failed to mark all notifications as read: ${res.status}`);
  }

  return (await res.json()) as MarkReadResult;
}
