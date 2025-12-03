import { h } from '@webtaku/h';

export const homeTab = h(
  'ion-content.main-content',
  { class: 'home-root' },

  /** ===== Hero Section ===== **/
  h(
    'section',
    { class: 'home-hero-section' },
    h(
      'div',
      { class: 'home-hero-inner' },
      h(
        'h1',
        { class: 'home-hero-title' },
        'Trade Your ',
        h('span', null, 'Identity'),
      ),
      h(
        'p',
        { class: 'home-hero-subtitle' },
        'Buy persona fragments on bonding curves, build your unique identity, ',
        'and earn from your community.',
      ),
      h(
        'div',
        { class: 'home-hero-actions' },
        h(
          'sl-button#start-trading',
          {
            variant: 'primary',
            size: 'large',
            pill: '',
            'data-action': 'start-trading',
          },
          'Start Trading',
        ),
        h(
          'sl-button',
          {
            variant: 'default',
            size: 'large',
            outline: '',
            pill: '',
            'data-action': 'learn-more',
            href: 'https://gaia-protocol.notion.site/What-Is-Gaia-Personas-2afb34b198408064bdcbddd898772c0b',
            target: '_blank',
          },
          'Learn More',
        ),
      ),
    ),
  ),

  /** ===== Trending Personas Section ===== **/
  h(
    'section',
    { class: 'home-trending-section' },
    h('h2', { class: 'home-trending-title' }, 'Trending Personas'),
    h(
      'div',
      {
        class: 'home-trending-grid',
        id: 'home-trending-grid',
      },
      // initial placeholder (optional)
      h(
        'div',
        {
          class: 'home-trending-placeholder',
        },
        'Loading trending personas...',
      ),
    ),
  ),

  /** ===== CTA Explore Section ===== **/
  h(
    'section',
    { class: 'home-cta-section' },
    h('h3', { class: 'home-cta-title' }, 'Ready to Explore?'),
    h(
      'p',
      { class: 'home-cta-text' },
      'Discover unique personas and start building your portfolio.',
    ),
    h(
      'a',
      {
        class: 'home-cta-button',
        'data-action': 'explore-personas',
        type: 'button',
        href: '/explore',
      },
      'Explore Personas',
    ),
  ),
);
