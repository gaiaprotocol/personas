import { getAddress } from 'viem';
import {
  PersonaPost,
  PersonaPostAttachments,
} from '../../shared/types/post';
import {
  Profile,
  SocialLinks,
} from '../../shared/types/profile';

declare const GAIA_API_BASE_URI: string;

/* ------------------------------------------------------------------ */
/* 프로필 관련 타입/함수 (기존 유지)                                   */
/* ------------------------------------------------------------------ */

export type SaveProfileInput = {
  // 전부 optional — 일부만 보냈을 때 서버에서 기존 값 유지
  nickname?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  socialLinks?: SocialLinks;
};

export type SaveProfileResult = { ok: true };

const MAX_NICKNAME_LEN = 50;
const MAX_BIO_LEN = 1000;
const MAX_URL_LEN = 2048;

/** 서버와 동일한 규칙 */
function isValidNicknameLocal(nickname: string): boolean {
  if (!nickname) return false;
  if (nickname !== nickname.normalize('NFC')) return false;
  if (nickname.length > MAX_NICKNAME_LEN) return false;
  if (/^\s|\s$/.test(nickname)) return false;     // 앞/뒤 공백 금지
  if (/\s{2,}/.test(nickname)) return false;      // 연속 공백 금지 (원치 않으면 제거)
  const re = /^[\p{L}\p{N}\s._-]+$/u;             // 글자/숫자/공백/._-
  return re.test(nickname);
}

function assertValidProfileInput(input: SaveProfileInput) {
  // 최소 한 필드 이상
  if (
    input.nickname === undefined &&
    input.bio === undefined &&
    input.avatarUrl === undefined &&
    input.bannerUrl === undefined
  ) {
    throw new Error('At least one of nickname, bio, avatarUrl, or bannerUrl must be provided.');
  }

  if (input.nickname !== undefined) {
    const nickname = input.nickname.trim();
    if (!nickname) throw new Error('nickname is empty');
    if (nickname.length > MAX_NICKNAME_LEN) {
      throw new Error(`Nickname exceeds maximum length of ${MAX_NICKNAME_LEN}.`);
    }
    if (!isValidNicknameLocal(nickname)) {
      throw new Error('The provided nickname contains invalid characters or format.');
    }
  }

  if (input.bio !== undefined) {
    const bio = input.bio.trim();
    if (bio.length > MAX_BIO_LEN) {
      throw new Error(`Bio exceeds maximum length of ${MAX_BIO_LEN}.`);
    }
    if (bio !== bio.normalize('NFC')) {
      throw new Error('Bio must be NFC-normalized.');
    }
  }

  if (input.avatarUrl !== undefined) {
    const url = input.avatarUrl.trim();
    if (url.length > MAX_URL_LEN) {
      throw new Error(`avatarUrl URL exceeds maximum length of ${MAX_URL_LEN}.`);
    }
    try {
      const u = new URL(url);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        throw new Error('Only http(s) URLs are allowed for avatarUrl.');
      }
    } catch {
      throw new Error('avatarUrl must be a valid URL.');
    }
  }
}

/**
 * 내 프로필 저장 (부분 업데이트 가능)
 * 서버 엔드포인트: POST /set-profile
 * Authorization: Bearer <token>
 */
export async function saveMyProfile(input: SaveProfileInput, token: string): Promise<SaveProfileResult> {
  if (!token) throw new Error('Missing authorization token.');

  // 서버 정책과 동일한 로컬 검증
  assertValidProfileInput(input);

  const res = await fetch(`${GAIA_API_BASE_URI}/set-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    // 서버는 { error } 형태 우선
    let message = `Failed to save profile: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      try {
        const text = await res.text();
        if (text) message = text;
      } catch { /* ignore */ }
    }
    throw new Error(message);
  }

  return (await res.json()) as SaveProfileResult;
}

/** 내 프로필 조회: GET /my-profile */
export async function fetchMyProfile(token: string): Promise<Profile> {
  if (!token) throw new Error('Missing authorization token.');
  const res = await fetch(`${GAIA_API_BASE_URI}/my-profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    let message = `Failed to fetch my profile: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return (await res.json()) as Profile;
}

/**
 * 특정 계정의 프로필 조회: GET /get-profile?account=<EVM 주소>
 */
export async function fetchProfileByAccount(account: string): Promise<Profile> {
  if (!account) throw new Error('Missing account address.');

  const checksummedAccount = getAddress(account); // EVM 체크섬 주소 변환
  const res = await fetch(
    `${GAIA_API_BASE_URI}/get-profile?account=${encodeURIComponent(checksummedAccount)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    let message = `Failed to fetch profile: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as Profile;
}

export type ProfileWithPostsResult = {
  profile: Profile;
  posts: PersonaPost[];
};

/**
 * 특정 지갑 주소의 프로필 + 포스트 목록 조회
 * 서버 엔드포인트: GET /profile-with-posts?address=<EVM 주소>
 */
export async function fetchProfileWithPosts(
  account: string,
): Promise<ProfileWithPostsResult> {
  if (!account) throw new Error('Missing account address.');

  const checksummedAccount = getAddress(account);

  const url = `${GAIA_API_BASE_URI}/profile-with-posts?address=${encodeURIComponent(
    checksummedAccount,
  )}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    let message = `Failed to fetch profile with posts: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return (await res.json()) as ProfileWithPostsResult;
}

/* ------------------------------------------------------------------ */
/* Persona Post API (새로운 서버 엔드포인트 기준)                       */
/* ------------------------------------------------------------------ */

const MAX_POST_CONTENT_LEN = 10_000;

function assertValidCreatePostInput(input: CreatePersonaPostInput) {
  const content = input.content?.trim() ?? '';

  if (!content) {
    throw new Error('content is empty');
  }
  if (content.length > MAX_POST_CONTENT_LEN) {
    throw new Error(`content exceeds maximum length of ${MAX_POST_CONTENT_LEN}.`);
  }

  // parentPostId / repostOfId / quoteOfId 중 하나만 허용
  const flags = [input.parentPostId, input.repostOfId, input.quoteOfId].filter(
    (v) => v !== undefined && v !== null,
  );
  if (flags.length > 1) {
    throw new Error('Only one of parentPostId, repostOfId, quoteOfId can be provided.');
  }
}

function assertValidUpdatePostInput(input: UpdatePersonaPostInput) {
  if (input.content === undefined && input.attachments === undefined) {
    throw new Error('At least one of content or attachments must be provided.');
  }

  if (input.content !== undefined) {
    const content = input.content.trim();
    if (content.length > MAX_POST_CONTENT_LEN) {
      throw new Error(`content exceeds maximum length of ${MAX_POST_CONTENT_LEN}.`);
    }
  }
}

/* -------------------------- 타입 정의 ------------------------------ */

export type CreatePersonaPostInput = {
  content: string;
  attachments?: PersonaPostAttachments;
  parentPostId?: number | null;
  repostOfId?: number | null;
  quoteOfId?: number | null;
};

export type UpdatePersonaPostInput = {
  id: number;
  content?: string;
  attachments?: PersonaPostAttachments | null;
};

export type DeletePersonaPostResult = { ok: true };
export type MutatePersonaPostResult = PersonaPost;

export type PersonaPostListParams = {
  author?: string;
  parentPostId?: number;
  limit?: number;
  offset?: number;
};

export type PersonaPostListResult = {
  posts: PersonaPost[];
};

export type PersonaPostWithRepliesResult = {
  post: PersonaPost;
  replies: PersonaPost[];
};

export type SimpleOkResult = { ok: true };

/* -------------------------- 생성 / 수정 / 삭제 -------------------- */

/**
 * 포스트 생성 (글/댓글/리포스트/인용)
 * 서버 엔드포인트: POST /persona/posts
 */
export async function createPersonaPostApi(
  input: CreatePersonaPostInput,
  token: string,
): Promise<MutatePersonaPostResult> {
  if (!token) throw new Error('Missing authorization token.');
  assertValidCreatePostInput(input);

  const res = await fetch(`${GAIA_API_BASE_URI}/persona/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    let message = `Failed to create post: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as PersonaPost;
}

/**
 * 포스트 수정
 * 서버 엔드포인트: POST /persona/posts/update
 */
export async function updatePersonaPostApi(
  input: UpdatePersonaPostInput,
  token: string,
): Promise<MutatePersonaPostResult> {
  if (!token) throw new Error('Missing authorization token.');
  if (!Number.isFinite(input.id) || input.id <= 0) {
    throw new Error('Invalid post id.');
  }
  assertValidUpdatePostInput(input);

  const res = await fetch(`${GAIA_API_BASE_URI}/persona/posts/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    let message = `Failed to update post: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as PersonaPost;
}

/**
 * 포스트 삭제 (소프트 삭제)
 * 서버 엔드포인트: POST /persona/posts/delete
 */
export async function deletePersonaPostApi(
  postId: number,
  token: string,
): Promise<DeletePersonaPostResult> {
  if (!token) throw new Error('Missing authorization token.');
  if (!Number.isFinite(postId) || postId <= 0) {
    throw new Error('Invalid post id.');
  }

  const res = await fetch(`${GAIA_API_BASE_URI}/persona/posts/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: postId }),
  });

  if (!res.ok) {
    let message = `Failed to delete post: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as DeletePersonaPostResult;
}

/* -------------------------- 목록 / 단일+댓글 ---------------------- */

/**
 * 포스트 목록 조회
 * - author: 특정 지갑 글만
 * - parentPostId: 특정 글의 댓글 목록
 * - 둘 다 없으면 전체(또는 서버 정책에 따른 타임라인)
 *
 * 서버 엔드포인트: GET /persona/posts
 */
export async function fetchPersonaPostList(
  params: PersonaPostListParams = {},
): Promise<PersonaPostListResult> {
  const searchParams = new URLSearchParams();

  if (params.author) {
    // author는 지갑 주소 그대로 사용 (서버에서 체크섬 처리할 수도 있음)
    searchParams.set('author', params.author);
  }
  if (params.parentPostId !== undefined) {
    if (!Number.isFinite(params.parentPostId) || params.parentPostId! <= 0) {
      throw new Error('Invalid parentPostId.');
    }
    searchParams.set('parentPostId', String(params.parentPostId));
  }
  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }
  if (params.offset !== undefined) {
    searchParams.set('offset', String(params.offset));
  }

  const qs = searchParams.toString();
  const url = `${GAIA_API_BASE_URI}/persona/posts${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    let message = `Failed to fetch posts: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as PersonaPostListResult;
}

/**
 * 특정 post id의 포스트 + 댓글 목록 조회
 * 서버 엔드포인트: GET /persona/post-with-replies?id=<postId>
 */
export async function fetchPersonaPostWithReplies(
  postId: number,
): Promise<PersonaPostWithRepliesResult> {
  if (!Number.isFinite(postId) || postId <= 0) {
    throw new Error('Invalid post id.');
  }

  const url = `${GAIA_API_BASE_URI}/persona/post-with-replies?id=${encodeURIComponent(
    String(postId),
  )}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    let message = `Failed to fetch post with replies: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as PersonaPostWithRepliesResult;
}

/* -------------------------- 좋아요 / 북마크 ----------------------- */

/**
 * 좋아요
 * 서버 엔드포인트: POST /persona/posts/like
 */
export async function likePersonaPostApi(
  postId: number,
  token: string,
): Promise<SimpleOkResult> {
  if (!token) throw new Error('Missing authorization token.');
  if (!Number.isFinite(postId) || postId <= 0) {
    throw new Error('Invalid post id.');
  }

  const res = await fetch(`${GAIA_API_BASE_URI}/persona/posts/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId }),
  });

  if (!res.ok) {
    let message = `Failed to like post: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as SimpleOkResult;
}

/**
 * 좋아요 취소
 * 서버 엔드포인트: POST /persona/posts/unlike
 */
export async function unlikePersonaPostApi(
  postId: number,
  token: string,
): Promise<SimpleOkResult> {
  if (!token) throw new Error('Missing authorization token.');
  if (!Number.isFinite(postId) || postId <= 0) {
    throw new Error('Invalid post id.');
  }

  const res = await fetch(`${GAIA_API_BASE_URI}/persona/posts/unlike`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId }),
  });

  if (!res.ok) {
    let message = `Failed to unlike post: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as SimpleOkResult;
}

/**
 * 북마크
 * 서버 엔드포인트: POST /persona/posts/bookmark
 */
export async function bookmarkPersonaPostApi(
  postId: number,
  token: string,
): Promise<SimpleOkResult> {
  if (!token) throw new Error('Missing authorization token.');
  if (!Number.isFinite(postId) || postId <= 0) {
    throw new Error('Invalid post id.');
  }

  const res = await fetch(`${GAIA_API_BASE_URI}/persona/posts/bookmark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId }),
  });

  if (!res.ok) {
    let message = `Failed to bookmark post: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as SimpleOkResult;
}

/**
 * 북마크 취소
 * 서버 엔드포인트: POST /persona/posts/unbookmark
 */
export async function unbookmarkPersonaPostApi(
  postId: number,
  token: string,
): Promise<SimpleOkResult> {
  if (!token) throw new Error('Missing authorization token.');
  if (!Number.isFinite(postId) || postId <= 0) {
    throw new Error('Invalid post id.');
  }

  const res = await fetch(`${GAIA_API_BASE_URI}/persona/posts/unbookmark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId }),
  });

  if (!res.ok) {
    let message = `Failed to unbookmark post: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as SimpleOkResult;
}
