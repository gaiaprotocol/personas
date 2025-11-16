import { openWalletConnectModal, tokenManager, wagmiConfig } from '@gaiaprotocol/client-common';
import { SlButton } from '@shoelace-style/shoelace';
import { disconnect, getAccount, watchAccount } from '@wagmi/core';
import { el } from '@webtaku/el';
import { googleLogin } from '../auth/google-login';
import { requestLogin } from '../auth/login';
import { signMessage } from '../auth/siwe';
import { showErrorAlert } from '../components/alert';
import './login.css'; // 아래 CSS를 여기에 두고 임포트한다고 가정
import logoImage from './logo.png';

// ---------- 내부 유틸 함수들 ----------

async function ensureWalletConnected(): Promise<`0x${string}`> {
  const account = getAccount(wagmiConfig);
  if (!account.isConnected || !account.address) {
    throw new Error('No wallet connected');
  }
  return account.address;
}

async function handleLoginClick() {
  try {
    const address = await ensureWalletConnected();
    const signature = await signMessage(address);
    const token = await requestLogin(address, signature);

    tokenManager.set(token, address);
  } catch (err) {
    console.error(err);
    showErrorAlert('Error', err instanceof Error ? err.message : String(err));
  }
}

// ---------- 모달 생성 함수 ----------
let currentDialog: HTMLElement | null = null;

export async function openLoginModal() {
  if (currentDialog) {
    (currentDialog as any).show?.();
    return;
  }

  const dialog = document.createElement('sl-dialog') as any;
  dialog.classList.add('login-modal');
  dialog.label = 'Login';
  dialog.style.setProperty('--width', '360px');
  dialog.style.setProperty('--body-spacing', '0');
  dialog.style.setProperty('--footer-spacing', '0');

  const description = el(
    'p.login-description',
    'Please connect your wallet and sign a message to access Gaia Personas.'
  );

  const connectButton = el(
    'sl-button.login-button',
    {
      variant: 'primary',
      onclick: () => {
        const account = getAccount(wagmiConfig);
        if (account.isConnected) {
          disconnect(wagmiConfig);
          signButton.loading = false;
        } else {
          openWalletConnectModal();
        }
      }
    },
    '1. Connect Wallet'
  ) as SlButton;

  const signButton = el(
    'sl-button.login-button',
    {
      variant: 'default',
      disabled: true,
      onclick: async () => {
        signButton.loading = true;
        try {
          await handleLoginClick();
          dialog.hide();
        } finally {
          signButton.loading = false;
        }
      }
    },
    '2. Sign Message'
  ) as SlButton;

  const orDivider = el(
    '.login-or',
    el('span.login-or-line'),
    el(
      'span.login-or-text',
      'Use Google if your wallet is already linked, or to link it after login'
    ),
    el('span.login-or-line'),
  );

  const googleButton = el(
    'sl-button.login-button.google',
    {
      variant: 'default',
      'aria-label': 'Continue with Google',
      onclick: () => googleLogin()
    },
    el('.login-google-content',
      el('.login-google-icon'),
      el('span.login-google-text', 'Continue with Google')
    )
  ) as SlButton;

  const wrapper = el(
    '.login-wrapper',
    description,
    connectButton,
    signButton,
    orDivider,
    googleButton,
  );

  dialog.appendChild(wrapper);
  document.body.appendChild(dialog);

  await customElements.whenDefined('sl-dialog');
  if ((dialog as any).updateComplete) {
    await (dialog as any).updateComplete;
  }

  // 🔹 버튼 상태 동기화 함수
  function syncButtons() {
    const account = getAccount(wagmiConfig);
    if (account.isConnected) {
      connectButton.textContent = 'Disconnect Wallet';
      connectButton.variant = 'default';
      signButton.disabled = false;
      signButton.variant = 'primary';
    } else {
      connectButton.textContent = '1. Connect Wallet';
      connectButton.variant = 'primary';
      signButton.disabled = true;
      signButton.variant = 'default';
    }
  }

  // 🔹 1) 모달 처음 뜰 때 한 번 즉시 동기화
  syncButtons();

  // 🔹 2) 이후 계정 변경 시에도 동기화
  const unwatch = watchAccount(wagmiConfig, {
    onChange() {
      syncButtons();
    }
  });

  dialog.addEventListener('sl-after-hide', () => {
    unwatch();
    dialog.remove();
    currentDialog = null;
  });

  currentDialog = dialog;
  dialog.show();
}
