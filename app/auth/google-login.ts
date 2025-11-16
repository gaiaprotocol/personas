import { verifyGoogleLogin } from "../api/google";
import { isWebView, platform } from "../platform";

declare const API_BASE_URI: string;

const GOOGLE_LOGIN_PATH = `${API_BASE_URI}/google-login`;
const GOOGLE_LOGOUT_PATH = `${API_BASE_URI}/google-logout`;

export function googleLogin() {
  if (isWebView && (window as any).Native?.signInWithGoogle) {
    (window as any).Native.signInWithGoogle()
  } else if (isWebView && (window as any).Android?.signInWithGoogle) {
    (window as any).Android.signInWithGoogle()
  } else {
    location.href = GOOGLE_LOGIN_PATH
  }
}

let signOutResolve: (() => void) | undefined;
export async function googleLogout() {
  if (isWebView && (window as any).Native?.signOutFromGoogle) {
    (window as any).Native.signOutFromGoogle()
    return new Promise<void>(resolve => signOutResolve = resolve)
  } else if (isWebView && (window as any).Android?.signOutFromGoogle) {
    (window as any).Android.signOutFromGoogle()
    return new Promise<void>(resolve => signOutResolve = resolve)
  } else {
    location.href = GOOGLE_LOGOUT_PATH
  }
}

if (isWebView) {
  window.addEventListener('googleSignInComplete', async (e: any) => {
    const { idToken, nonce } = e.detail
    try {
      // 서버에서 구글 공개키로 ID 토큰 검증 + nonce 검증 + aud(=WEB_CLIENT_ID) 검증 필수
      const { ok } = await verifyGoogleLogin({ provider: 'google', idToken, nonce })
      if (ok) location.href = `/?platform=${platform}&source=webview`;
      else {
        const toast = document.createElement("ion-toast");
        toast.message = `Google sign-in failed. ${e.detail.message}`;
        toast.duration = 1600;
        toast.position = "bottom";
        document.body.appendChild(toast);
        (toast as any).present();
      }
    } catch (error: any) {
      const toast = document.createElement("ion-toast");
      toast.message = `Google sign-in failed. ${error.message}`;
      toast.duration = 1600;
      toast.position = "bottom";
      document.body.appendChild(toast);
      (toast as any).present();
    }
  })

  window.addEventListener('googleSignInFailed', (e: any) => {
    console.warn('Google sign-in failed', e.detail)

    const toast = document.createElement("ion-toast");
    toast.message = `Google sign-in failed. ${e.detail.message}`;
    toast.duration = 1600;
    toast.position = "bottom";
    document.body.appendChild(toast);
    (toast as any).present();
  })

  window.addEventListener('googleSignOutComplete', () => {
    signOutResolve?.()
  });

  window.addEventListener('googleSignOutFailed', (e: any) => {
    console.error('Sign-out failed:', e.detail?.message);

    const toast = document.createElement("ion-toast");
    toast.message = `Google sign-out failed. ${e.detail.message}`;
    toast.duration = 1600;
    toast.position = "bottom";
    document.body.appendChild(toast);
    (toast as any).present();
  });
}
