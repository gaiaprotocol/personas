import {
  openWalletConnectModal,
  tokenManager,
  wagmiConfig,
} from '@gaiaprotocol/client-common';
import { SlButton } from '@shoelace-style/shoelace';
import { disconnect, getAccount, watchAccount } from '@wagmi/core';
import { el } from '@webtaku/el';
import { googleLogout } from '../auth/google-login';
import { requestLogin } from '../auth/login';
import { signMessage } from '../auth/siwe';
import { showErrorAlert } from '../components/alert';
import './login.css';
import logoImage from './logo.png';

async function ensureWalletConnected(): Promise<`0x${string}`> {
  const account = getAccount(wagmiConfig);
  if (!account.isConnected || !account.address) {
    throw new Error('지갑이 연결되어 있지 않습니다.');
  }
  return account.address;
}

/** 지갑 서명 + 서버 로그인 + 토큰 저장 */
async function handleLinkWallet() {
  const address = await ensureWalletConnected();
  const signature = await signMessage(address);
  const token = await requestLogin(address, signature);
  tokenManager.set(token, address);
}

let currentDialog: HTMLElement | null = null;

/**
 * 구글 계정으로 로그인된 상태에서 Web3 지갑을 연동시키는 모달
 * - 1. 지갑 연결 (WalletConnect)
 * - 2. 서명 & 연동 (SIWE + requestLogin)
 * - 하단에 "Google 계정에서 로그아웃" 링크
 */
export async function openWalletLinkModal() {
  // 이미 열려 있으면 다시 열기만
  if (currentDialog) {
    (currentDialog as any).show?.();
    return;
  }

  const dialog = document.createElement('sl-dialog') as any;
  dialog.classList.add('login-modal');
  dialog.label = 'Link Web3 Wallet';
  dialog.style.setProperty('--width', '360px');
  dialog.style.setProperty('--body-spacing', '0');
  dialog.style.setProperty('--footer-spacing', '0');

  // ── 헤더 영역 ─────────────────────────────────────────────
  const logo = el('img.login-logo', {
    src: logoImage,
    alt: 'Gaia Personas',
  }) as HTMLImageElement;

  const title = el('h1.login-title', 'Web3 지갑 연결');
  const description = el(
    'p.login-description',
    'Google 계정으로 로그인되었습니다. 지갑을 연결하고 메시지 서명을 완료해 계정과 연동해주세요.'
  );

  // ── 1. 지갑 연결/해제 버튼 ─────────────────────────────────
  const connectButton = el(
    'sl-button.login-button',
    {
      variant: 'primary',
      'aria-label': '지갑 연결',
      onclick: () => {
        const account = getAccount(wagmiConfig);
        if (account.isConnected) {
          // 이미 연결되어 있으면 해제
          disconnect(wagmiConfig);
          linkButton.loading = false;
        } else {
          openWalletConnectModal();
        }
      },
    },
    '1. 지갑 연결'
  ) as SlButton;

  // ── 2. 지갑 연동(서명) 버튼 ────────────────────────────────
  const isConnected = getAccount(wagmiConfig).isConnected;
  const linkButton = el(
    'sl-button.login-button',
    {
      variant: isConnected ? 'primary' : 'default',
      disabled: !isConnected,
      'aria-label': '지갑 연동',
      onclick: async () => {
        linkButton.loading = true;
        try {
          await handleLinkWallet();
          // 토큰까지 세팅 완료 → 모달 닫고 새로고침(또는 필요 시 콜백으로 처리)
          dialog.hide();
          location.reload();
        } catch (err) {
          console.error(err);
          showErrorAlert(
            '연동 실패',
            err instanceof Error ? err.message : String(err)
          );
        } finally {
          linkButton.loading = false;
        }
      },
    },
    '2. 지갑 연동'
  ) as SlButton;

  // ── 안내 문구 ──────────────────────────────────────────────
  const orText = el(
    'span.login-or-text',
    '이미 Google로 로그인되어 있습니다. 지갑을 연결하고 서명하면 계정이 완전히 연동됩니다.'
  );

  // ── Google 로그아웃 링크 버튼 ───────────────────────────────
  const logoutLink = el(
    'sl-button.login-link',
    {
      'aria-label': 'Google 계정에서 로그아웃',
      onclick: async () => {
        try {
          await googleLogout();
        } catch (err) {
          console.error(err);
        } finally {
          try {
            tokenManager.clear();
          } catch { }
          try {
            await disconnect(wagmiConfig);
          } catch { }

          // 세션 정리 후 로그인 화면/루트로 이동
          location.href = '/login';
        }
      },
    },
    '다른 Google 계정으로 로그인'
  ) as SlButton;

  const bottomLinks = el(
    '.login-bottom-links',
    logoutLink
  );

  // ── 전체 래퍼 ──────────────────────────────────────────────
  const wrapper = el(
    '.login-wrapper',
    logo,
    title,
    description,
    connectButton,
    linkButton,
    orText,
    bottomLinks
  );

  dialog.appendChild(wrapper);
  document.body.appendChild(dialog);

  // Shoelace 로딩 보장
  await customElements.whenDefined('sl-dialog');
  if ((dialog as any).updateComplete) {
    await (dialog as any).updateComplete;
  }

  // 🔹 버튼 상태 동기화 함수
  function syncButtons() {
    const account = getAccount(wagmiConfig);
    if (account.isConnected) {
      connectButton.textContent = '지갑 연결 해제';
      connectButton.variant = 'default';
      connectButton.setAttribute('aria-label', '지갑 연결 해제');

      linkButton.disabled = false;
      linkButton.variant = 'primary';
    } else {
      connectButton.textContent = '1. 지갑 연결';
      connectButton.variant = 'primary';
      connectButton.setAttribute('aria-label', '지갑 연결');

      linkButton.disabled = true;
      linkButton.variant = 'default';
    }
  }

  // 처음 한 번 & 이후 상태 변경에 반영
  syncButtons();

  const unwatch = watchAccount(wagmiConfig, {
    onChange() {
      syncButtons();
    },
  });

  dialog.addEventListener('sl-after-hide', () => {
    unwatch();
    dialog.remove();
    currentDialog = null;
  });

  currentDialog = dialog;
  dialog.show();
}
