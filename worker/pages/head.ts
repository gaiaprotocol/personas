import { h } from '@webtaku/h';

function head(title: string) {
  return h(
    'head',
    '<meta charset="UTF-8">',
    h('meta', {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0'
    }),
    h('title', title),
    // PWA meta tags
    h('meta', { name: 'theme-color', content: '#000000' }),
    h('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }),
    h('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }),
    h('meta', { name: 'apple-mobile-web-app-title', content: 'Personas' }),
    h('link', { rel: 'apple-touch-icon', href: '/images/icon.png' }),
    h('link', { rel: 'manifest', href: '/manifest.json' }),
    h('script', { src: 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4' }),
    h('link', {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/dark.css'
    }),
    h('link', { rel: 'stylesheet', href: '/styles.css' }),
    h('script', {
      type: 'module',
      src: 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/shoelace-autoloader.js'
    }),
  );
}

export { head };
