import {
  PersonaChatMessage,
  PersonaChatMessagesResponse,
  PersonaChatReactionsResponse,
} from '../../shared/types/chat';

declare const GAIA_API_BASE_URI: string;

const MAX_CHAT_CONTENT_LEN = 10_000;

export function assertValidChatMessageContent(content: string) {
  const trimmed = content.trim();
  if (!trimmed) throw new Error('content is empty');
  if (trimmed.length > MAX_CHAT_CONTENT_LEN) {
    throw new Error(`content exceeds maximum length of ${MAX_CHAT_CONTENT_LEN}.`);
  }
}

/**
 * 특정 페르소나 채팅 메시지 목록 조회
 * GET /persona/chat/messages?persona=0x...&limit=&cursor=
 */
export async function fetchPersonaChatMessages(params: {
  persona: string;          // 0x...
  limit?: number;
  cursor?: number;
}): Promise<PersonaChatMessagesResponse> {
  const { persona } = params;
  const limit = params.limit ?? 50;
  const cursor = params.cursor ?? 0;

  const searchParams = new URLSearchParams();
  searchParams.set('persona', persona);
  searchParams.set('limit', String(limit));
  searchParams.set('cursor', String(cursor));

  const url = `${GAIA_API_BASE_URI}/persona/chat/messages?${searchParams.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    let message = `Failed to fetch chat messages: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return (await res.json()) as PersonaChatMessagesResponse;
}

/**
 * 채팅 메시지 전송
 * POST /persona/chat/messages
 * Authorization: Bearer <token>
 */
export async function sendPersonaChatMessage(params: {
  persona: string;
  content: string;
  token: string;
  parentMessageId?: number | null;
  attachments?: unknown;
}): Promise<PersonaChatMessage> {
  const { persona, content, token, parentMessageId, attachments } = params;

  if (!token) throw new Error('Missing authorization token.');
  assertValidChatMessageContent(content);

  const res = await fetch(`${GAIA_API_BASE_URI}/persona/chat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      persona,
      content,
      parentMessageId: parentMessageId ?? undefined,
      attachments: attachments ?? undefined,
    }),
  });

  if (!res.ok) {
    let message = `Failed to send chat message: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return (await res.json()) as PersonaChatMessage;
}

/**
 * 리액션 토글
 * POST /persona/chat/reactions/toggle
 */
export async function togglePersonaChatReactionApi(params: {
  messageId: number;
  reactionType: string;
  token: string;
}): Promise<{ status: 'added' | 'removed' }> {
  const { messageId, reactionType, token } = params;

  if (!token) throw new Error('Missing authorization token.');

  const res = await fetch(`${GAIA_API_BASE_URI}/persona/chat/reactions/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messageId, reactionType }),
  });

  if (!res.ok) {
    let message = `Failed to toggle reaction: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return (await res.json()) as { status: 'added' | 'removed' };
}

/**
 * 특정 메시지의 리액션 목록 / 카운트 조회
 * GET /persona/chat/reactions?messageId=123
 */
export async function fetchPersonaChatReactions(params: {
  messageId: number;
}): Promise<PersonaChatReactionsResponse> {
  const { messageId } = params;

  const url = `${GAIA_API_BASE_URI}/persona/chat/reactions?messageId=${encodeURIComponent(
    String(messageId),
  )}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    let message = `Failed to fetch reactions: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return (await res.json()) as PersonaChatReactionsResponse;
}

/**
 * WebSocket URL 헬퍼
 *  - api:  https://api.example.com
 *  - ws :  wss://api.example.com/persona/chat/ws?...
 */
export function buildPersonaChatWsUrl(persona: string, token: string): string {
  const base = new URL(GAIA_API_BASE_URI);
  base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';

  const wsUrl = new URL('/persona/chat/ws', base.origin);
  wsUrl.searchParams.set('persona', persona);
  wsUrl.searchParams.set('token', token);

  return wsUrl.toString();
}
