import { el } from '@webtaku/el';
import './edit-profile.css';

import { Profile, SocialLinks } from '../../shared/types/profile';
import { fetchMyProfile, saveMyProfile } from '../api/profile';
import { profileManager } from '../services/profile-manager';

/* ===== 타입 정의 ===== */

type SocialLinkInput = {
  id: string;
  label: string;
  url: string;
};

type ProfileData = {
  nickname: string;
  bio: string;
  socialLinks: SocialLinks; // 항상 Record<string, string>
  bannerUrl: string | null;
  avatarUrl: string | null;
};

/* 랜덤 ID 헬퍼 (crypto.randomUUID가 없을 경우 대비) */
const newId = () =>
  globalThis.crypto && 'randomUUID' in globalThis.crypto
    ? globalThis.crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2)}`;

/* 파일 -> dataURL (프리뷰용) */
const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * 서버에서 내 프로필 받아오기
 *  - /my-profile 응답을 Profile로 가정
 *  - 아직 백엔드에 배너 컬럼이 없으므로 bannerUrl은 null로 강제
 */
async function fetchProfile(
  _address: `0x${string}`,
  token: string,
): Promise<{
  nickname: string | null;
  bio: string | null;
  socialLinks: SocialLinks | null;
  bannerUrl: string | null;
  avatarUrl: string | null;
}> {
  const res: Profile = await fetchMyProfile(token);

  return {
    nickname: res.nickname ?? null,
    bio: res.bio ?? null,
    socialLinks: res.socialLinks ?? null,
    bannerUrl: null, // 아직 백엔드에 배너 컬럼이 없으므로
    avatarUrl: res.avatarUrl ?? null,
  };
}

/**
 * 실제 저장 로직
 *  - nickname / bio / social_links 를 /set-profile 로 전송
 *  - avatar/banner 파일은 아직 업로드 엔드포인트 정보가 없어서 payload에는 넣지 않음
 */
async function setProfile(
  payload: {
    nickname: string;
    bio: string;
    socialLinks: SocialLinks;
    bannerImageFile?: File;
    avatarImageFile?: File;
  },
  token: string,
): Promise<void> {
  const { nickname, bio, socialLinks } = payload;

  const body: Record<string, unknown> = {
    nickname,
    bio,
    socialLinks,
  };

  await saveMyProfile(body, token);
}

/* SocialLinkInput[] -> SocialLinks 로 변환 */
const socialInputsToRecord = (inputs: SocialLinkInput[]): SocialLinks => {
  const result: SocialLinks = {};
  inputs
    .map((l) => ({
      label: l.label.trim(),
      url: l.url.trim(),
    }))
    .filter((l) => l.label || l.url)
    .forEach((l) => {
      result[l.label] = l.url;
    });

  return result;
};

/* SocialLinks 동등성 비교 (공백/빈 값 정규화) */
const socialsEqual = (
  original: SocialLinks,
  currentInputs: SocialLinkInput[],
): boolean => {
  const normRecord = (obj: SocialLinks): SocialLinks => {
    const res: SocialLinks = {};
    Object.entries(obj)
      .map(([label, url]) => [label.trim(), url.trim()] as [string, string])
      .filter(([label, url]) => label || url)
      .forEach(([label, url]) => {
        res[label] = url;
      });
    return res;
  };

  const a = normRecord(original);
  const b = normRecord(socialInputsToRecord(currentInputs));

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
};

// =====================
//   모달 생성
// =====================

export function createEditProfileModal(address: string, token: string) {
  const modal = el('ion-modal.edit-profile-modal') as HTMLIonModalElement;

  /* ---------- 숨겨진 파일 인풋 (프리뷰 전용) ---------- */

  const bannerFileInput = el('input', {
    type: 'file',
    accept: 'image/*',
    style: 'display:none',
  }) as HTMLInputElement;

  const avatarFileInput = el('input', {
    type: 'file',
    accept: 'image/*',
    style: 'display:none',
  }) as HTMLInputElement;

  modal.appendChild(bannerFileInput);
  modal.appendChild(avatarFileInput);

  /* ---------- 헤더 ---------- */

  const closeBtn = el(
    'ion-button',
    {
      slot: 'start',
      fill: 'clear',
      onclick: () => modal.dismiss(),
    },
    el('ion-icon', { name: 'chevron-back-outline' }),
  ) as HTMLIonButtonElement;

  const header = el(
    'ion-header.edit-profile-header',
    el('ion-toolbar', closeBtn, el('ion-title', 'Edit Profile')),
  );

  /* ---------- 상단 프로필 카드 (지갑 주소) ---------- */

  const avatarSmall = el('div.edit-profile-avatar', 'Y') as HTMLDivElement;

  const nameEl = el(
    'div',
    { style: 'font-weight: 600; font-size: 1rem;' },
    'Your profile',
  );

  const addrEl = el(
    'div.edit-profile-address',
    `${address.slice(0, 6)}...${address.slice(-4)}`,
  );
  const hintEl = el(
    'div.edit-profile-hint',
    'Set how you appear to persona holders.',
  );

  const topMain = el('div.edit-profile-top-main', nameEl, addrEl, hintEl);

  const top = el('div.edit-profile-top', avatarSmall, topMain);

  /* ---------- 배너 & 큰 아바타 프리뷰 ---------- */

  const bannerPreview = el(
    'div.edit-profile-banner-preview',
  ) as HTMLDivElement;
  bannerPreview.classList.add('is-empty');

  const bannerOverlay = el('div.edit-profile-banner-overlay');

  const bannerChangeBtn = el(
    'ion-button',
    {
      size: 'small',
      fill: 'solid',
      color: 'dark',
      onclick: () => bannerFileInput.click(),
    },
    'Change banner',
  ) as HTMLIonButtonElement;

  const bannerResetBtn = el(
    'ion-button',
    {
      size: 'small',
      fill: 'clear',
      color: 'medium',
      onclick: () => {
        newBannerFile = null;
        bannerPreviewUrl = originalBannerUrl;
        applyBannerPreview();
        updateSaveButtonState();
      },
    },
    'Reset',
  ) as HTMLIonButtonElement;

  const bannerActions = el(
    'div.edit-profile-banner-actions',
    bannerChangeBtn,
    bannerResetBtn,
  );

  const heroAvatarInner = el('div.edit-profile-hero-avatar-inner');
  const heroAvatarInitial = el(
    'span.edit-profile-hero-avatar-initial',
    'Y',
  ) as HTMLSpanElement;
  heroAvatarInner.appendChild(heroAvatarInitial);

  const heroAvatar = el(
    'div.edit-profile-hero-avatar',
    heroAvatarInner,
  ) as HTMLDivElement;

  const bannerWrapper = el(
    'div.edit-profile-banner-wrapper',
    bannerPreview,
    bannerOverlay,
    heroAvatar,
    bannerActions,
  );

  const avatarChangeBtn = el(
    'ion-button',
    {
      size: 'small',
      fill: 'solid',
      color: 'dark',
      onclick: () => avatarFileInput.click(),
    },
    'Change avatar',
  ) as HTMLIonButtonElement;

  const avatarResetBtn = el(
    'ion-button',
    {
      size: 'small',
      fill: 'clear',
      color: 'medium',
      onclick: () => {
        newAvatarFile = null;
        avatarPreviewUrl = originalAvatarUrl;
        applyAvatarPreview();
        updateSaveButtonState();
      },
    },
    'Reset',
  ) as HTMLIonButtonElement;

  const avatarActions = el(
    'div.edit-profile-avatar-actions',
    avatarChangeBtn,
    avatarResetBtn,
  );

  const mediaSection = el(
    'div.edit-profile-media',
    bannerWrapper,
    avatarActions,
  );

  /* ---------- 입력 폼: 기본 정보 ---------- */

  const nicknameInput = el('ion-input', {
    label: 'Nickname',
    labelPlacement: 'stacked',
    placeholder: 'How should people call you?',
    value: '',
  }) as HTMLIonInputElement;

  const bioInput = el('ion-textarea', {
    label: 'Bio',
    labelPlacement: 'stacked',
    placeholder: 'Introduce yourself to persona holders',
    value: '',
    rows: 4,
    autoGrow: true,
  }) as HTMLIonTextareaElement;

  /* ---------- 입력 폼: 소셜 링크 ---------- */

  let socialLinkInputs: SocialLinkInput[] = [];

  const socialListContainer = el(
    'div.edit-profile-social-list',
  ) as HTMLDivElement;

  const createSocialRow = (link: SocialLinkInput, index: number) => {
    const rowTitle = el(
      'div.edit-profile-social-row-title',
      link.label || `Link ${index + 1}`,
    ) as HTMLDivElement;

    const deleteBtn = el(
      'ion-button',
      {
        fill: 'clear',
        size: 'small',
        color: 'danger',
        onclick: () => {
          socialLinkInputs = socialLinkInputs.filter((l) => l.id !== link.id);
          renderSocialList();
          updateSaveButtonState();
        },
      },
      el('ion-icon', { name: 'trash-outline', slot: 'icon-only' }),
    ) as HTMLIonButtonElement;

    const headerRow = el(
      'div.edit-profile-social-row-header',
      rowTitle,
      el('div.edit-profile-social-row-actions', deleteBtn),
    );

    const labelInput = el('ion-input', {
      label: 'Label',
      labelPlacement: 'stacked',
      placeholder: 'e.g. Twitter',
      value: link.label,
    }) as HTMLIonInputElement;

    const urlInput = el('ion-input', {
      label: 'URL',
      labelPlacement: 'stacked',
      placeholder: 'https://',
      inputmode: 'url',
      value: link.url,
    }) as HTMLIonInputElement;

    labelInput.addEventListener('ionInput', () => {
      const value = (labelInput.value ?? '').toString();
      link.label = value;
      rowTitle.textContent = value || `Link ${index + 1}`;
      updateSaveButtonState();
    });

    urlInput.addEventListener('ionInput', () => {
      link.url = (urlInput.value ?? '').toString();
      updateSaveButtonState();
    });

    const body = el(
      'div.edit-profile-social-body',
      labelInput as any,
      urlInput as any,
    );

    return el('div.edit-profile-social-row', headerRow, body);
  };

  const renderSocialList = () => {
    socialListContainer.innerHTML = '';
    if (!socialLinkInputs.length) {
      const empty = el(
        'div.edit-profile-social-empty',
        'No social links yet. Add one!',
      );
      socialListContainer.appendChild(empty);
      return;
    }

    socialLinkInputs.forEach((link, idx) => {
      socialListContainer.appendChild(createSocialRow(link, idx));
    });
  };

  const addLink = (initial?: Partial<SocialLinkInput>) => {
    const newLink: SocialLinkInput = {
      id: initial?.id ?? newId(),
      label: initial?.label ?? '',
      url: initial?.url ?? '',
    };
    socialLinkInputs.push(newLink);
    renderSocialList();
    updateSaveButtonState();
  };

  const addLinkButton = el(
    'ion-button.edit-profile-add-link',
    {
      fill: 'outline',
      size: 'small',
      onclick: () => addLink(),
    },
    '+ Add Link',
  ) as HTMLIonButtonElement;

  const form = el(
    'div.edit-profile-form',
    el(
      'ion-list',
      el('div.edit-profile-section-label', 'Profile'),
      nicknameInput as any,
      bioInput as any,
      el('div.edit-profile-section-label', 'Social Links'),
      socialListContainer,
      addLinkButton,
    ),
  );

  /* ---------- content / footer 분리 ---------- */

  const scrollInner = el(
    'div.edit-profile-scroll-inner',
    top,
    mediaSection,
    form,
  );

  const content = el(
    'ion-content.edit-profile-content',
    scrollInner,
  ) as HTMLIonContentElement;

  const cancelBtn = el(
    'ion-button',
    {
      fill: 'outline',
      color: 'medium',
    },
    'Cancel',
  ) as HTMLIonButtonElement;

  const saveBtn = el(
    'ion-button',
    {
      expand: 'block',
      disabled: true,
    },
    'Save',
  ) as HTMLIonButtonElement;

  const footerInner = el(
    'div.edit-profile-footer-inner',
    cancelBtn,
    saveBtn,
  );

  const footer = el(
    'ion-footer.edit-profile-footer',
    footerInner,
  ) as HTMLIonFooterElement;

  cancelBtn.onclick = () => modal.dismiss();

  modal.append(header, content, footer);

  /* ---------- 상태 ---------- */

  let originalProfile: ProfileData = {
    nickname: '',
    bio: '',
    socialLinks: {},
    bannerUrl: null,
    avatarUrl: null,
  };
  let isSaving = false;

  let originalBannerUrl: string | null = null;
  let originalAvatarUrl: string | null = null;

  let bannerPreviewUrl: string | null = null;
  let avatarPreviewUrl: string | null = null;

  let newBannerFile: File | null = null;
  let newAvatarFile: File | null = null;

  /* ---------- 프리뷰 적용 ---------- */

  const applyBannerPreview = () => {
    if (bannerPreviewUrl) {
      bannerPreview.style.backgroundImage = `url(${bannerPreviewUrl})`;
      bannerPreview.classList.remove('is-empty');
    } else {
      bannerPreview.style.backgroundImage = '';
      bannerPreview.classList.add('is-empty');
    }
  };

  const applyAvatarPreview = () => {
    const nicknameVal =
      (nicknameInput.value as string | null) ??
      originalProfile.nickname ??
      'Y';
    const initialChar =
      nicknameVal.trim().charAt(0).toUpperCase() || 'Y';

    heroAvatarInitial.textContent = initialChar;

    const heroAvatarInnerEl = heroAvatar.querySelector(
      '.edit-profile-hero-avatar-inner',
    ) as HTMLElement;

    if (avatarPreviewUrl) {
      heroAvatar.classList.add('has-image');
      heroAvatarInnerEl.style.backgroundImage = `url(${avatarPreviewUrl})`;

      avatarSmall.classList.add('has-image');
      avatarSmall.style.backgroundImage = `url(${avatarPreviewUrl})`;
      avatarSmall.textContent = '';
    } else {
      heroAvatar.classList.remove('has-image');
      heroAvatarInnerEl.style.backgroundImage = '';

      avatarSmall.classList.remove('has-image');
      avatarSmall.style.backgroundImage = '';
      avatarSmall.textContent = initialChar;
    }
  };

  /* ---------- Save 버튼 활성화 로직 ---------- */

  const updateSaveButtonState = () => {
    if (isSaving) {
      saveBtn.disabled = true;
      return;
    }

    const nickname = ((nicknameInput.value ?? '') as string).trim();
    const bio = ((bioInput.value ?? '') as string).trim();
    const origNick = originalProfile.nickname.trim();
    const origBio = originalProfile.bio.trim();

    const bannerChanged =
      (bannerPreviewUrl || null) !== (originalBannerUrl || null);
    const avatarChanged =
      (avatarPreviewUrl || null) !== (originalAvatarUrl || null);

    const socialsChanged = !socialsEqual(
      originalProfile.socialLinks,
      socialLinkInputs,
    );

    const changed =
      nickname !== origNick ||
      bio !== origBio ||
      socialsChanged ||
      bannerChanged ||
      avatarChanged;

    saveBtn.disabled = !changed;
  };

  nicknameInput.addEventListener('ionInput', () => {
    updateSaveButtonState();
    applyAvatarPreview();
  });

  bioInput.addEventListener('ionInput', updateSaveButtonState);

  /* ---------- 파일 인풋 핸들러 (프리뷰 전용) ---------- */

  bannerFileInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    newBannerFile = file;
    bannerPreviewUrl = await readFileAsDataUrl(file);
    applyBannerPreview();
    updateSaveButtonState();
  });

  avatarFileInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    newAvatarFile = file;
    avatarPreviewUrl = await readFileAsDataUrl(file);
    applyAvatarPreview();
    updateSaveButtonState();
  });

  /* ---------- 프로필 초기 로딩 ---------- */

  (async () => {
    try {
      const profile = await fetchProfile(address as `0x${string}`, token);

      originalProfile = {
        nickname: profile.nickname ?? '',
        bio: profile.bio ?? '',
        socialLinks: profile.socialLinks ?? {},
        bannerUrl: profile.bannerUrl,
        avatarUrl: profile.avatarUrl,
      };

      nicknameInput.value = originalProfile.nickname;
      bioInput.value = originalProfile.bio;

      // Record<string, string> -> SocialLinkInput[]
      socialLinkInputs = Object.entries(originalProfile.socialLinks).map(
        ([label, url]) => ({
          id: newId(),
          label,
          url,
        }),
      );

      if (!socialLinkInputs.length) addLink();
      else renderSocialList();

      originalBannerUrl = originalProfile.bannerUrl;
      originalAvatarUrl = originalProfile.avatarUrl;

      bannerPreviewUrl = originalBannerUrl;
      avatarPreviewUrl = originalAvatarUrl;
      applyBannerPreview();
      applyAvatarPreview();

      updateSaveButtonState();
    } catch (err) {
      console.error('Failed to fetch profile', err);

      originalProfile = {
        nickname: '',
        bio: '',
        socialLinks: {},
        bannerUrl: null,
        avatarUrl: null,
      };

      socialLinkInputs = [];
      addLink();

      originalBannerUrl = null;
      originalAvatarUrl = null;
      bannerPreviewUrl = null;
      avatarPreviewUrl = null;
      applyBannerPreview();
      applyAvatarPreview();

      updateSaveButtonState();
    }
  })();

  /* ---------- 저장 ---------- */

  saveBtn.onclick = async () => {
    if (isSaving) return;
    isSaving = true;
    updateSaveButtonState();

    const nickname = ((nicknameInput.value ?? '') as string).trim();
    const bio = ((bioInput.value ?? '') as string).trim();

    const cleanSocials: SocialLinks = socialInputsToRecord(socialLinkInputs);

    const prevLabel = saveBtn.textContent;
    saveBtn.textContent = '';
    const spinner = el('ion-spinner', { name: 'crescent' });
    saveBtn.append(spinner);

    try {
      await setProfile(
        {
          nickname,
          bio,
          socialLinks: cleanSocials,
          bannerImageFile: newBannerFile || undefined,
          avatarImageFile: newAvatarFile || undefined,
        },
        token,
      );

      // 저장 성공 후 전역 프로필 상태를 최신으로 갱신
      try {
        await profileManager.refresh();
      } catch (refreshErr) {
        console.error('[edit-profile] failed to refresh profile', refreshErr);
      }

      const toast = document.createElement('ion-toast');
      toast.message = 'Profile updated successfully';
      toast.duration = 2000;
      toast.color = 'success';
      document.body.appendChild(toast);
      toast.present();

      modal.dismiss();
    } catch (err) {
      console.error('Failed to save profile', err);

      const toast = document.createElement('ion-toast');
      toast.message = 'Failed to save profile. Please try again.';
      toast.duration = 2500;
      toast.color = 'danger';
      document.body.appendChild(toast);
      toast.present();

      saveBtn.textContent = prevLabel;
    } finally {
      isSaving = false;
      if (!saveBtn.textContent) {
        saveBtn.textContent = 'Save';
      }
      updateSaveButtonState();
    }
  };

  return modal;
}
