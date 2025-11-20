import { el } from '@webtaku/el';
import './edit-profile.css';

interface SocialLinkInput {
  id: string;
  label: string;
  url: string;
}

interface ProfileData {
  nickname?: string;
  bio?: string;
  socialLinks?: SocialLinkInput[];
  bannerUrl?: string | null;
  avatarUrl?: string | null;
}

/**
 * TODO: 실제 API에 맞게 구현하세요.
 * 이 예시는 타입/형태 참고용입니다.
 */
async function fetchProfile(_address: `0x${string}`): Promise<{
  nickname?: string | null;
  bio?: string | null;
  socialLinks?: { label: string; url: string }[] | null;
  bannerUrl?: string | null;
  avatarUrl?: string | null;
}> {
  // 서버에서 가져오도록 교체
  return {
    nickname: '',
    bio: '',
    socialLinks: [],
    bannerUrl: null,
    avatarUrl: null
  };
}

/**
 * TODO: 실제 API에 맞게 구현하세요.
 *  - 파일 업로드 전략(multipart / 사전 업로드 후 URL만 전송 등)에 맞게 수정 필요
 */
async function setProfile(
  _payload: {
    nickname: string;
    bio: string;
    socialLinks: { label: string; url: string }[];
    bannerImageFile?: File;
    avatarImageFile?: File;
  },
  _token: string
): Promise<void> {
  // 서버로 전송하도록 교체
}

/* 랜덤 ID 헬퍼 (crypto.randomUUID가 없을 경우 대비) */
const newId = () =>
(globalThis.crypto && 'randomUUID' in globalThis.crypto
  ? globalThis.crypto.randomUUID()
  : `id_${Math.random().toString(36).slice(2)}`);

/* 파일 -> dataURL */
const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function createEditProfileModal(address: string, token: string) {
  const modal = el('ion-modal.edit-profile-modal') as any;

  /* ---------- 숨겨진 파일 인풋 ---------- */

  const bannerFileInput = el('input', {
    type: 'file',
    accept: 'image/*',
    style: 'display:none'
  }) as HTMLInputElement;

  const avatarFileInput = el('input', {
    type: 'file',
    accept: 'image/*',
    style: 'display:none'
  }) as HTMLInputElement;

  modal.appendChild(bannerFileInput);
  modal.appendChild(avatarFileInput);

  /* ---------- 헤더 ---------- */

  const closeBtn = el(
    'ion-button',
    {
      slot: 'start',
      fill: 'clear',
      onclick: () => modal.dismiss()
    },
    el('ion-icon', { name: 'chevron-back-outline' })
  );

  const header = el(
    'ion-header.edit-profile-header',
    el(
      'ion-toolbar',
      closeBtn,
      el('ion-title', 'Edit Profile')
    )
  );

  /* ---------- 상단 프로필 카드 (지갑 주소) ---------- */

  const avatarSmall = el('div.edit-profile-avatar', 'Y') as HTMLDivElement;

  const nameEl = el(
    'div',
    { style: 'font-weight: 600; font-size: 1rem;' },
    'Your profile'
  );

  const addrEl = el(
    'div.edit-profile-address',
    `${address.slice(0, 6)}...${address.slice(-4)}`
  );
  const hintEl = el(
    'div.edit-profile-hint',
    'Set how you appear to persona holders.'
  );

  const topMain = el(
    'div.edit-profile-top-main',
    nameEl,
    addrEl,
    hintEl
  );

  const top = el(
    'div.edit-profile-top',
    avatarSmall,
    topMain
  );

  /* ---------- 배너 & 큰 아바타 프리뷰 ---------- */

  const bannerPreview = el(
    'div.edit-profile-banner-preview'
  ) as HTMLDivElement;
  bannerPreview.classList.add('is-empty');

  const bannerOverlay = el('div.edit-profile-banner-overlay');

  const bannerChangeBtn = el(
    'ion-button',
    {
      size: 'small',
      fill: 'solid',
      color: 'dark',
      onclick: () => bannerFileInput.click()
    },
    'Change banner'
  );

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
      }
    },
    'Reset'
  );

  const bannerActions = el(
    'div.edit-profile-banner-actions',
    bannerChangeBtn,
    bannerResetBtn
  );

  const heroAvatarInner = el('div.edit-profile-hero-avatar-inner');
  const heroAvatarInitial = el(
    'span.edit-profile-hero-avatar-initial',
    'Y'
  );
  heroAvatarInner.appendChild(heroAvatarInitial);

  const heroAvatar = el(
    'div.edit-profile-hero-avatar',
    heroAvatarInner
  ) as HTMLDivElement;

  const bannerWrapper = el(
    'div.edit-profile-banner-wrapper',
    bannerPreview,
    bannerOverlay,
    heroAvatar,
    bannerActions
  );

  const avatarChangeBtn = el(
    'ion-button',
    {
      size: 'small',
      fill: 'solid',
      color: 'dark',
      onclick: () => avatarFileInput.click()
    },
    'Change avatar'
  );

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
      }
    },
    'Reset'
  );

  const avatarActions = el(
    'div.edit-profile-avatar-actions',
    avatarChangeBtn,
    avatarResetBtn
  );

  const mediaSection = el(
    'div.edit-profile-media',
    bannerWrapper,
    avatarActions
  );

  /* ---------- 입력 폼: 기본 정보 ---------- */

  const nicknameInput = el('ion-input', {
    label: 'Nickname',
    labelPlacement: 'stacked',
    placeholder: 'How should people call you?',
    value: ''
  }) as any;

  const bioInput = el('ion-textarea', {
    label: 'Bio',
    labelPlacement: 'stacked',
    placeholder: 'Introduce yourself to persona holders',
    value: '',
    rows: 4,
    autoGrow: true
  }) as any;

  /* ---------- 입력 폼: 소셜 링크 ---------- */

  let socialLinks: SocialLinkInput[] = [];

  const socialListContainer = el('div.edit-profile-social-list');

  const createSocialRow = (link: SocialLinkInput, index: number) => {
    const rowTitle = el(
      'div.edit-profile-social-row-title',
      link.label || `Link ${index + 1}`
    );

    const deleteBtn = el(
      'ion-button',
      {
        fill: 'clear',
        size: 'small',
        color: 'danger',
        onclick: () => {
          socialLinks = socialLinks.filter((l) => l.id !== link.id);
          renderSocialList();
          updateSaveButtonState();
        }
      },
      el('ion-icon', { name: 'trash-outline', slot: 'icon-only' })
    );

    const headerRow = el(
      'div.edit-profile-social-row-header',
      rowTitle,
      el('div.edit-profile-social-row-actions', deleteBtn)
    );

    const labelInput = el('ion-input', {
      label: 'Label',
      labelPlacement: 'stacked',
      placeholder: 'e.g. Twitter',
      value: link.label
    }) as any;

    const urlInput = el('ion-input', {
      label: 'URL',
      labelPlacement: 'stacked',
      placeholder: 'https://',
      inputmode: 'url',
      value: link.url
    }) as any;

    labelInput.addEventListener('ionInput', () => {
      link.label = (labelInput.value ?? '').toString();
      rowTitle.textContent = link.label || `Link ${index + 1}`;
      updateSaveButtonState();
    });

    urlInput.addEventListener('ionInput', () => {
      link.url = (urlInput.value ?? '').toString();
      updateSaveButtonState();
    });

    const body = el(
      'div.edit-profile-social-body',
      labelInput,
      urlInput
    );

    return el(
      'div.edit-profile-social-row',
      headerRow,
      body
    );
  };

  const renderSocialList = () => {
    socialListContainer.innerHTML = '';
    socialLinks.forEach((link, idx) => {
      socialListContainer.appendChild(createSocialRow(link, idx));
    });
  };

  const addLink = (initial?: Partial<SocialLinkInput>) => {
    const newLink: SocialLinkInput = {
      id: initial?.id ?? newId(),
      label: initial?.label ?? '',
      url: initial?.url ?? ''
    };
    socialLinks.push(newLink);
    renderSocialList();
    updateSaveButtonState();
  };

  const addLinkButton = el(
    'ion-button.edit-profile-add-link',
    {
      fill: 'outline',
      size: 'small',
      onclick: () => addLink()
    },
    '+ Add Link'
  );

  const form = el(
    'div.edit-profile-form',
    el(
      'ion-list',
      el('div.edit-profile-section-label', 'Profile'),
      nicknameInput,
      bioInput,
      el('div.edit-profile-section-label', 'Social Links'),
      socialListContainer,
      addLinkButton
    )
  );

  /* ---------- 하단 버튼 ---------- */

  const cancelBtn = el(
    'ion-button',
    {
      fill: 'outline',
      color: 'medium',
      onclick: () => modal.dismiss()
    },
    'Cancel'
  ) as any;

  const saveBtn = el(
    'ion-button',
    {
      expand: 'block',
      disabled: true
    },
    'Save'
  ) as any;

  const footer = el(
    'div.edit-profile-footer',
    cancelBtn,
    saveBtn
  );

  const content = el(
    'ion-content.edit-profile-content',
    top,
    mediaSection,
    form,
    footer
  );

  modal.append(header, content);

  /* ---------- 상태 ---------- */

  let originalProfile: ProfileData = {};
  let isSaving = false;

  let originalBannerUrl: string | null = null;
  let originalAvatarUrl: string | null = null;

  let bannerPreviewUrl: string | null = null;
  let avatarPreviewUrl: string | null = null;

  let newBannerFile: File | null = null;
  let newAvatarFile: File | null = null;

  const socialsEqual = (
    a?: SocialLinkInput[],
    b?: SocialLinkInput[]
  ) => {
    const norm = (arr?: SocialLinkInput[]) =>
      (arr ?? [])
        .map((l) => ({
          label: l.label.trim(),
          url: l.url.trim()
        }))
        .filter((l) => l.label || l.url);

    const aa = norm(a);
    const bb = norm(b);

    if (aa.length !== bb.length) return false;
    for (let i = 0; i < aa.length; i++) {
      if (aa[i].label !== bb[i].label || aa[i].url !== bb[i].url) {
        return false;
      }
    }
    return true;
  };

  /* ---------- 프리뷰 적용 함수 ---------- */

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
    const nicknameVal = (nicknameInput.value ??
      originalProfile.nickname ??
      'Y') as string;
    const initialChar =
      nicknameVal.trim().charAt(0).toUpperCase() || 'Y';

    heroAvatarInitial.textContent = initialChar;

    if (avatarPreviewUrl) {
      heroAvatar.classList.add('has-image');
      (heroAvatar.querySelector(
        '.edit-profile-hero-avatar-inner'
      ) as HTMLElement).style.backgroundImage = `url(${avatarPreviewUrl})`;

      avatarSmall.classList.add('has-image');
      avatarSmall.style.backgroundImage = `url(${avatarPreviewUrl})`;
      avatarSmall.textContent = '';
    } else {
      heroAvatar.classList.remove('has-image');
      (heroAvatar.querySelector(
        '.edit-profile-hero-avatar-inner'
      ) as HTMLElement).style.backgroundImage = '';

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

    const nickname = (nicknameInput.value ?? '').toString().trim();
    const bio = (bioInput.value ?? '').toString().trim();
    const origNick = (originalProfile.nickname ?? '').trim();
    const origBio = (originalProfile.bio ?? '').trim();

    const bannerChanged =
      (bannerPreviewUrl || null) !== (originalBannerUrl || null);
    const avatarChanged =
      (avatarPreviewUrl || null) !== (originalAvatarUrl || null);

    const changed =
      nickname !== origNick ||
      bio !== origBio ||
      !socialsEqual(socialLinks, originalProfile.socialLinks) ||
      bannerChanged ||
      avatarChanged;

    saveBtn.disabled = !changed;
  };

  nicknameInput.addEventListener('ionInput', () => {
    updateSaveButtonState();
    applyAvatarPreview();
  });

  bioInput.addEventListener('ionInput', updateSaveButtonState);

  /* ---------- 파일 입력 핸들러 ---------- */

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
      const profile = await fetchProfile(address as `0x${string}`);

      originalProfile = {
        nickname: profile.nickname ?? '',
        bio: profile.bio ?? '',
        socialLinks: (profile.socialLinks ?? []).map((l) => ({
          id: newId(),
          label: l.label ?? '',
          url: l.url ?? ''
        })),
        bannerUrl: profile.bannerUrl ?? null,
        avatarUrl: profile.avatarUrl ?? null
      };

      nicknameInput.value = originalProfile.nickname;
      bioInput.value = originalProfile.bio;

      socialLinks = [...(originalProfile.socialLinks ?? [])];
      if (!socialLinks.length) addLink();
      else renderSocialList();

      originalBannerUrl = originalProfile.bannerUrl ?? null;
      originalAvatarUrl = originalProfile.avatarUrl ?? null;

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
        socialLinks: [],
        bannerUrl: null,
        avatarUrl: null
      };

      socialLinks = [];
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

  /* ---------- 저장 로직 ---------- */

  saveBtn.onclick = async () => {
    if (isSaving) return;
    isSaving = true;
    updateSaveButtonState();

    const nickname = (nicknameInput.value ?? '').toString().trim();
    const bio = (bioInput.value ?? '').toString().trim();

    const cleanSocials = socialLinks
      .map((l) => ({
        label: l.label.trim(),
        url: l.url.trim()
      }))
      .filter((l) => l.label || l.url);

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
          avatarImageFile: newAvatarFile || undefined
        },
        token
      );

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
