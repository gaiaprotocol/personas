// -----------------------------
// Chat message / reaction types
// -----------------------------

import { Profile, SocialLinks } from "./profile";

export type PersonaChatMessage = {
  id: number;
  personaAddress: string;
  sender: string;           // EVM address
  senderIp: string | null;

  content: string;
  attachments: unknown | null;
  parentMessageId: number | null;

  createdAt: number;        // epoch seconds
  updatedAt: number | null;

  isDeleted: boolean;
  deletedAt: number | null;

  /**
   * 프로필 정보 (profiles 테이블에서 join한 결과)
   * - 없으면 null
   */
  senderProfile: Profile | null;
};

export type PersonaChatReaction = {
  messageId: number;
  reactor: string;          // EVM address
  reactionType: string;     // 'heart', '👍', ...
  createdAt: number;
};

export type PersonaChatMessagesResponse = {
  messages: PersonaChatMessage[];
  nextCursor: number | null;
};

export type PersonaChatReactionsResponse = {
  reactions: PersonaChatReaction[];
  counts: Record<string, number>;
};

// -----------------------------
// DB row 타입 (messages)
// -----------------------------

export interface PersonaChatMessageRow {
  id: number;
  persona_address: string;
  sender: string;
  sender_ip: string | null;
  content: string;
  attachments: string | null;
  parent_message_id: number | null;
  created_at: number;
  updated_at: number | null;
  is_deleted: number; // 0 or 1
  deleted_at: number | null;
}

/**
 * profiles 를 LEFT JOIN 해서 가져올 때 사용하는 Row 타입
 *  SELECT m.*, p.account AS profile_account, ... 이런 식으로 alias 맞춰 사용
 */
export interface PersonaChatMessageWithProfileRow extends PersonaChatMessageRow {
  profile_account: string | null;
  profile_nickname: string | null;
  profile_bio: string | null;
  profile_avatar_url: string | null;
  profile_avatar_thumbnail_url: string | null;
  profile_banner_url: string | null;
  profile_banner_thumbnail_url: string | null;
  profile_social_links: string | null; // JSON string
  profile_created_at: number | null;
  profile_updated_at: number | null;
}

export function rowToPersonaChatMessage(
  row: PersonaChatMessageRow,
): PersonaChatMessage {
  let attachments: unknown | null = null;

  if (row.attachments) {
    try {
      attachments = JSON.parse(row.attachments);
    } catch {
      attachments = null;
    }
  }

  return {
    id: row.id,
    personaAddress: row.persona_address,
    sender: row.sender,
    senderIp: row.sender_ip,
    content: row.content,
    attachments,
    parentMessageId: row.parent_message_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDeleted: row.is_deleted === 1,
    deletedAt: row.deleted_at,
    senderProfile: null,
  };
}

/**
 * persona_chat_messages + profiles 조인 결과를
 * 도메인 PersonaChatMessage 로 변환하는 헬퍼
 */
export function rowWithProfileToPersonaChatMessage(
  row: PersonaChatMessageWithProfileRow,
): PersonaChatMessage {
  let attachments: unknown | null = null;

  if (row.attachments) {
    try {
      attachments = JSON.parse(row.attachments);
    } catch {
      attachments = null;
    }
  }

  // 프로필 join 여부
  const hasProfile = !!row.profile_account;

  let senderProfile: Profile | null = null;
  if (hasProfile) {
    let socialLinks: SocialLinks | null = null;

    if (row.profile_social_links) {
      try {
        socialLinks = JSON.parse(row.profile_social_links);
      } catch (err) {
        console.error("Failed to parse profile.social_links", err);
        socialLinks = null;
      }
    }

    senderProfile = {
      account: row.profile_account!,
      nickname: row.profile_nickname,
      bio: row.profile_bio,
      avatarUrl: row.profile_avatar_url,
      avatarThumbnailUrl: row.profile_avatar_thumbnail_url,
      bannerUrl: row.profile_banner_url,
      bannerThumbnailUrl: row.profile_banner_thumbnail_url,
      socialLinks,
      createdAt: row.profile_created_at,
      updatedAt: row.profile_updated_at,
    };
  }

  return {
    id: row.id,
    personaAddress: row.persona_address,
    sender: row.sender,
    senderIp: row.sender_ip,
    content: row.content,
    attachments,
    parentMessageId: row.parent_message_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDeleted: row.is_deleted === 1,
    deletedAt: row.deleted_at,
    senderProfile,
  };
}

// -----------------------------
// DB row 타입 (reactions)
// -----------------------------

export interface PersonaChatReactionRow {
  message_id: number;
  reactor: string;
  reaction_type: string;
  created_at: number;
}

export function rowToPersonaChatReaction(
  row: PersonaChatReactionRow,
): PersonaChatReaction {
  return {
    messageId: row.message_id,
    reactor: row.reactor,
    reactionType: row.reaction_type,
    createdAt: row.created_at,
  };
}
