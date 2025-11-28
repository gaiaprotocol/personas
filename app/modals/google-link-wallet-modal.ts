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
    throw new Error('Wallet is not connected.');
  }
  return account.address;
}

/** Wallet signature + server login + token storage */
async function handleLinkWallet() {
  const address = await ensureWalletConnected();
  const signature = await signMessage(address);
  const token = await requestLogin(address, signature);
  tokenManager.set(token, address);
}

let currentDialog: HTMLElement | null = null;

/**
 * Modal for linking a Web3 wallet while logged in with Google
 * - 1. Connect wallet (WalletConnect)
 * - 2. Sign & link (SIWE + requestLogin)
 * - Includes a "Log out from Google" link at the bottom
 */
export async function openWalletLinkModal() {
  // If already opened, simply reopen it
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

  // ── Header area ─────────────────────────────────────────────
  const logo = el('img.login-logo', {
    src: logoImage,
    alt: 'Gaia Personas',
  }) as HTMLImageElement;

  const title = el('h1.login-title', 'Connect Web3 Wallet');
  const description = el(
    'p.login-description',
    'You are logged in with your Google account. Please connect your wallet and complete message signing to fully link your account.'
  );

  // ── 1. Wallet connect/disconnect button ─────────────────────
  const connectButton = el(
    'sl-button.login-button',
    {
      variant: 'primary',
      'aria-label': 'Connect Wallet',
      onclick: () => {
        const account = getAccount(wagmiConfig);
        if (account.isConnected) {
          // Disconnect if already connected
          disconnect(wagmiConfig);
          linkButton.loading = false;
        } else {
          openWalletConnectModal();
        }
      },
    },
    '1. Connect Wallet'
  ) as SlButton;

  // ── 2. Wallet linking (signing) button ──────────────────────
  const isConnected = getAccount(wagmiConfig).isConnected;
  const linkButton = el(
    'sl-button.login-button',
    {
      variant: isConnected ? 'primary' : 'default',
      disabled: !isConnected,
      'aria-label': 'Link Wallet',
      onclick: async () => {
        linkButton.loading = true;
        try {
          await handleLinkWallet();
          // Token stored → close modal and reload (or handle through callback if needed)
          dialog.hide();
          location.reload();
        } catch (err) {
          console.error(err);
          showErrorAlert(
            'Link Failed',
            err instanceof Error ? err.message : String(err)
          );
        } finally {
          linkButton.loading = false;
        }
      },
    },
    '2. Link Wallet'
  ) as SlButton;

  // ── Informational text ───────────────────────────────────────
  const orText = el(
    'span.login-or-text',
    'You are already logged in with Google. Connect and sign with your wallet to complete account linking.'
  );

  // ── Google logout link button ────────────────────────────────
  const logoutLink = el(
    'sl-button.login-link',
    {
      'aria-label': 'Log out from Google Account',
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

          // After clearing session, go back to login/root page
          location.href = '/login';
        }
      },
    },
    'Sign in with a different Google Account'
  ) as SlButton;

  const bottomLinks = el('.login-bottom-links', logoutLink);

  // ── Main wrapper ─────────────────────────────────────────────
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

  // Ensure Shoelace components are loaded
  await customElements.whenDefined('sl-dialog');
  if ((dialog as any).updateComplete) {
    await (dialog as any).updateComplete;
  }

  // 🔹 Sync button state
  function syncButtons() {
    const account = getAccount(wagmiConfig);
    if (account.isConnected) {
      connectButton.textContent = 'Disconnect Wallet';
      connectButton.variant = 'default';
      connectButton.setAttribute('aria-label', 'Disconnect Wallet');

      linkButton.disabled = false;
      linkButton.variant = 'primary';
    } else {
      connectButton.textContent = '1. Connect Wallet';
      connectButton.variant = 'primary';
      connectButton.setAttribute('aria-label', 'Connect Wallet');

      linkButton.disabled = true;
      linkButton.variant = 'default';
    }
  }

  // Initial sync & update on state change
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
