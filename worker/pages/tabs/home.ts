import { h } from "@webtaku/h";

const trendingPersonas = [
  {
    id: "alex",
    name: "Alex Chen",
    address: "0x1234...5678",
    avatar: "A",
    price: "$2.45",
    change: "+12.5%",
    holders: 342,
    volume: "$15,420",
  },
  {
    id: "luna",
    name: "Luna Park",
    address: "0xabcd...efgh",
    avatar: "L",
    price: "$3.82",
    change: "-5.2%",
    holders: 521,
    volume: "$28,500",
  },
  {
    id: "noah",
    name: "Noah Tech",
    address: "0x9876...5432",
    avatar: "N",
    price: "$1.92",
    change: "+23.1%",
    holders: 198,
    volume: "$8,920",
  },
];

function personaCard(p: any) {
  const isUp = p.change.trim().startsWith("+");

  return h(
    "div",
    {
      class: "home-trending-card",
      href: `/profile/${p.id}`,      // ← 🔧 링크 추가
      "data-profile-id": p.id,       // SPA 이동용
    },

    // Header
    h(
      "div",
      { class: "home-card-header" },
      h("div", { class: "home-card-avatar" }, p.avatar),
      h(
        "div",
        { class: "home-card-meta" },
        h("div", { class: "home-card-name" }, p.name),
        h("div", { class: "home-card-address" }, p.address)
      )
    ),

    // Price
    h("div", { class: "home-card-price-label" }, "Price"),
    h("div", { class: "home-card-price-value" }, p.price),

    // Stat Row
    h(
      "div",
      { class: "home-card-stats-row" },
      h(
        "div",
        {},
        h("div", { class: "home-card-stat-label" }, "24h Change"),
        h(
          "div",
          {
            class:
              "home-card-stat-value " +
              (isUp ? "home-card-change-up" : "home-card-change-down"),
          },
          p.change
        )
      ),
      h(
        "div",
        {},
        h("div", { class: "home-card-stat-label" }, "Holders"),
        h("div", { class: "home-card-stat-value" }, String(p.holders))
      )
    ),

    // Divider
    h("div", { class: "home-card-divider" }),

    // Volume
    h(
      "div",
      {},
      h("div", { class: "home-card-volume-label" }, "24h Volume"),
      h("div", { class: "home-card-volume-value" }, p.volume)
    ),

    // Button (여기서도 프로필/트레이드로 가고 싶으면 data-action 추가해서 써도 됨)
    h(
      "button",
      {
        class: "home-card-button",
        "data-action": "buy-fragments",
        type: "button",
      },
      "Buy Fragments"
    )
  );
}

export const homeTab = h(
  "ion-content.main-content",
  { class: "home-root" },

  /** ===== Hero Section ===== **/
  h(
    "section",
    { class: "home-hero-section" },
    h(
      "div",
      { class: "home-hero-inner" },
      h(
        "h1",
        { class: "home-hero-title" },
        "Trade Your ",
        h("span", null, "Identity")
      ),
      h(
        "p",
        { class: "home-hero-subtitle" },
        "Buy persona fragments on bonding curves, build your unique identity, ",
        "and earn from your community."
      ),
      h(
        "div",
        { class: "home-hero-actions" },
        h(
          "sl-button#start-trading",
          {
            variant: "primary",
            size: "large",
            pill: "",
            "data-action": "start-trading",
          },
          "Start Trading"
        ),
        h(
          "sl-button",
          {
            variant: "default",
            size: "large",
            outline: "",
            pill: "",
            "data-action": "learn-more",
            href: "https://gaia-protocol.notion.site/What-Is-Gaia-Personas-2afb34b198408064bdcbddd898772c0b",
            target: "_blank",
          },
          "Learn More"
        )
      )
    )
  ),

  /** ===== Trending Personas Section ===== **/
  h(
    "section",
    { class: "home-trending-section" },
    h("h2", { class: "home-trending-title" }, "Trending Personas"),
    h(
      "div",
      { class: "home-trending-grid" },
      ...trendingPersonas.map(personaCard)
    )
  ),

  /** ===== CTA Explore Section ===== **/
  h(
    "section",
    { class: "home-cta-section" },
    h("h3", { class: "home-cta-title" }, "Ready to Explore?"),
    h(
      "p",
      { class: "home-cta-text" },
      "Discover unique personas and start building your portfolio."
    ),
    h(
      "a",
      {
        class: "home-cta-button",
        "data-action": "explore-personas",
        type: "button",
        href: "/explore",            // ← 🔧 추가
      },
      "Explore Personas"
    )
  )
);
