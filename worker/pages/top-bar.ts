import { h } from "@webtaku/h";

const topBar = h(
  'ion-header',
  h(
    'ion-toolbar',
    // 왼쪽: 유저 아이콘 (프로필 열기)
    h(
      'ion-buttons',
      { slot: 'start' },
      h(
        'ion-button',
        {
          id: 'open-profile', // 필요하면 프로필 모달 trigger 로도 사용 가능
          ariaLabel: 'Open profile',
        },
        h('ion-icon', { slot: 'icon-only', name: 'person-circle' })
      )
    ),

    // 가운데: 앱 아이콘 (로고 이미지)
    h(
      'ion-title',
      // 앱 로고는 원하는 경로로 교체해서 사용하세요.
      h('a', {
        style: {
          display: 'block',
          cursor: 'pointer',
          margin: 'auto',
          width: '32px',
          height: '32px',
        }
      },
        h('img', {
          src: '/images/logo-icon.png',
          alt: 'Personas',
          style: 'height: 32px;',
        })
      )
    ),

    // 오른쪽: 설정 버튼
    h(
      'ion-buttons',
      { slot: 'end' },
      h(
        'ion-button',
        {
          id: 'open-settings',
          ariaLabel: 'Open settings',
        },
        h('ion-icon', { slot: 'icon-only', name: 'settings-outline' })
      )
    )
  )
);

export { topBar };
