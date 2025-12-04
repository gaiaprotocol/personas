import { h } from "@webtaku/h";

const topBar = h(
  "ion-header",
  h(
    "ion-toolbar",
    // 왼쪽: 유저 아이콘 (프로필 열기)
    h(
      "ion-buttons",
      { slot: "start" },
      h(
        "ion-button",
        {
          id: "open-profile", // JS에서 avatar or 기본 아이콘을 채워 넣음
          ariaLabel: "Open profile",
        },
        // 🔥 여기서는 초기 콘텐츠를 넣지 않는다.
        // 아이콘/아바타는 main.ts 의 applyProfileAvatar() 에서 그려줌
      )
    ),

    // 가운데: 앱 아이콘 (로고 이미지)
    h(
      "ion-title",
      h(
        "a",
        {
          style: {
            display: "block",
            cursor: "pointer",
            margin: "auto",
            width: "32px",
            height: "32px",
          },
        },
        h("img", {
          src: "/images/logo-icon.png",
          alt: "Personas",
          style: "height: 32px;",
        })
      )
    ),

    // 오른쪽: 설정 버튼
    h(
      "ion-buttons",
      { slot: "end" },
      //TODO: 우선 숨김
      /*h(
        "ion-button",
        {
          id: "open-settings",
          ariaLabel: "Open settings",
        },
        h("ion-icon", { slot: "icon-only", name: "settings-outline" })
      )*/
    )
  )
);

export { topBar };
