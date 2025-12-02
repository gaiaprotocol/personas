import { getAddress } from 'viem';
import { PersonaFragments } from '../../shared/types/persona-fragments';
import { PersonaPost } from '../../shared/types/post';
import { Profile, SocialLinks } from '../../shared/types/profile';

declare const GAIA_API_BASE_URI: string;

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
 * 특정 계정의 프로필 조회: GET /profile?account=<EVM 주소>
 */
export async function fetchProfileByAccount(account: string): Promise<Profile> {
  if (!account) throw new Error('Missing account address.');

  const checksummedAccount = getAddress(account); // EVM 체크섬 주소 변환
  const res = await fetch(`${GAIA_API_BASE_URI}/get-profile?account=${encodeURIComponent(checksummedAccount)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

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

export type PersonaProfileResult = {
  profile: Profile;
  posts: PersonaPost[];
  personaFragments: PersonaFragments | null;
};

/**
 * 특정 지갑 주소의 프로필 + 포스트 목록 조회
 * 서버 엔드포인트: GET /persona-profile?address=<EVM 주소>
 */
export async function fetchPersonaProfile(
  account: string,
): Promise<PersonaProfileResult> {
  if (!account) throw new Error('Missing account address.');

  const checksummedAccount = getAddress(account);

  const url = `${GAIA_API_BASE_URI}/persona-profile?address=${encodeURIComponent(
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

  return (await res.json()) as PersonaProfileResult;
}
