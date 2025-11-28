import { tokenManager } from '@gaiaprotocol/client-common';
import { EventEmitter } from '@webtaku/event-emitter';
import { Profile } from '../../shared/types/profile';
import {
  fetchMyProfile,
  saveMyProfile,
  type SaveProfileInput,
} from '../api/profile';

class ProfileManager extends EventEmitter<{
  change: (newProfile: Profile | null) => void;
}> {
  private _profile: Profile | null = null;
  private _loaded = false;
  private _loadingPromise: Promise<Profile | null> | null = null;

  get profile(): Profile | null {
    return this._profile;
  }

  get isLoaded(): boolean {
    return this._loaded;
  }

  /** 로그인 상태에서 한 번 호출해서 프로필 미리 로드 */
  async init(): Promise<Profile | null> {
    if (this._loaded && this._profile) return this._profile;
    return this.refresh();
  }

  /** 서버에서 내 프로필 다시 가져오기 */
  async refresh(): Promise<Profile | null> {
    if (this._loadingPromise) return this._loadingPromise;

    const token = tokenManager.getToken?.();
    if (!token) {
      this._profile = null;
      this._loaded = true;
      this.emit('change', null);
      return null;
    }

    this._loadingPromise = (async () => {
      try {
        const p = await fetchMyProfile(token);
        this._profile = p;
        this._loaded = true;
        this.emit('change', p);
        return p;
      } catch (err) {
        console.error('[profileManager] refresh failed', err);
        this._profile = null;
        this._loaded = true;
        this.emit('change', null);
        return null;
      } finally {
        this._loadingPromise = null;
      }
    })();

    return this._loadingPromise;
  }

  /** 부분 업데이트 + 로컬 상태 동기화 */
  async update(input: SaveProfileInput): Promise<Profile | null> {
    const token = tokenManager.getToken?.();
    if (!token) throw new Error('Not logged in');

    await saveMyProfile(input, token);
    return this.refresh();
  }

  /** 로그아웃 시 호출 */
  clear() {
    this._profile = null;
    this._loaded = false;
    this._loadingPromise = null;
    this.emit('change', null);
  }
}

export const profileManager = new ProfileManager();
