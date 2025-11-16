import { createRainbowKit } from '@gaiaprotocol/client-common';
import { BackButtonEvent, setupConfig } from '@ionic/core';
import { defineCustomElements } from '@ionic/core/loader';
import '@shoelace-style/shoelace';
import './main.css';
import { openLoginModal } from './modals/login';

setupConfig({ hardwareBackButton: true, experimentalCloseWatcher: true });

const backHandler = (event: BackButtonEvent) => {
  event.detail.register(0, () => {
    const hasHistory = window.history.length > 1;
    const isFromExternal = document.referrer && !document.referrer.startsWith(window.location.origin);
    if (!hasHistory || isFromExternal) {
      document.removeEventListener('ionBackButton' as any, backHandler);
    }
    window.history.back();
  });
};
document.addEventListener('ionBackButton' as any, backHandler);

defineCustomElements(window);
document.body.appendChild(createRainbowKit());

document.documentElement.classList.remove('app-loading');

document.addEventListener('DOMContentLoaded', () => {

  const profileBtns = document.querySelectorAll('#open-profile');
  profileBtns.forEach((profileBtn) => {
    profileBtn.addEventListener('click', () => {
      //TODO: 로그인 되었는지 체크
      openLoginModal();
    });
  });

  const logos = document.querySelectorAll('ion-title a');
  logos.forEach((logo) => {
    logo.addEventListener('click', async (e) => {
      e.preventDefault();
      const tabs = document.querySelector('ion-tabs');
      await tabs?.select('home');
    });
  });
});
