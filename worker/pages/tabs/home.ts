import { h } from "@webtaku/h";

const homeTab = h(
  "ion-content.main-content",
  // ion-content 전체 배경을 검정으로
  { class: "bg-black" },
  h(
    "section",
    {
      class:
        // 헤더 높이 제외하고 세로 가운데 정렬
        "min-h-[100%] flex items-center justify-center px-4 md:px-8",
    },
    // 실제 콘텐츠 폭을 제한해서 가운데 정렬
    h(
      "div",
      {
        class:
          "w-full max-w-4xl mx-auto text-center",
      },
      // 타이틀
      h(
        "h1",
        {
          class:
            "text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight " +
            "text-gray-100 mb-6",
        },
        "Trade Your ",
        h('span', { style: 'color: var(--sl-color-primary-600)' }, 'Identity')
      ),

      // 서브 카피
      h(
        "p",
        {
          class:
            "max-w-2xl mx-auto text-base md:text-lg text-gray-400 mb-10 " +
            "leading-relaxed",
        },
        "Buy persona fragments on bonding curves, build your unique identity, ",
        "and earn from your community."
      ),

      // 버튼 그룹
      h(
        "div",
        {
          class:
            "flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center",
        },
        // Start Trading 버튼 (여기에만 브랜드 컬러 적용)
        h(
          "sl-button#start-trading",
          {
            variant: "primary",
            size: "large",
            pill: "",
            class:
              "font-semibold shadow-lg " +
              "focus-visible:outline-none focus-visible:ring-2 " +
              "focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            "data-action": "start-trading",
          },
          "Start Trading"
        ),
        // Learn More 버튼 (기본 테마 사용 → hover 시 노랗게 안 변함)
        h(
          "sl-button",
          {
            variant: "default",
            size: "large",
            outline: "",
            pill: "",
            class:
              "font-semibold text-gray-100 border-gray-600 " +
              "focus-visible:outline-none focus-visible:ring-2 " +
              "focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            "data-action": "learn-more",
            href: 'https://gaia-protocol.notion.site/What-Is-Gaia-Personas-2afb34b198408064bdcbddd898772c0b',
            target: '_blank'
          },
          "Learn More"
        )
      )
    )
  ),
);

export { homeTab };
