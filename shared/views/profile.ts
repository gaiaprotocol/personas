import { AnyBuilder } from "./b";

interface ProfileData {
  name: string;
  bio: string;
  address: string;
  avatarInitial: string;
  stats: {
    holders: number;
    volumeUsd: number;
    followers: number;
  };
}

interface SocialLink {
  id: string;
  label: string;
  icon: string; // Ionicon name
  href?: string;
}

interface Post {
  id: string;
  content: string;
  timeAgo: string;
}

export function profile(b: AnyBuilder) {
  // ===== 샘플 데이터 =====
  const profileData: ProfileData = {
    name: "Alex Chen",
    bio: "Web3 builder & persona fragment creator. Building the future of decentralized identity.",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    avatarInitial: "A",
    stats: {
      holders: 342,
      volumeUsd: 15420,
      followers: 1234
    }
  };

  const socialLinks: SocialLink[] = [
    {
      id: "twitter",
      label: "Twitter",
      icon: "logo-twitter",
      href: "https://x.com"
    },
    {
      id: "discord",
      label: "Discord",
      icon: "logo-discord",
      href: "https://discord.com"
    },
    {
      id: "website",
      label: "Website",
      icon: "globe-outline",
      href: "https://example.com"
    }
  ];

  const posts: Post[] = [
    {
      id: "post-1",
      content: "Just dropped something exciting! Check it out 🚀",
      timeAgo: "2 hours ago"
    },
    {
      id: "post-2",
      content: "Just dropped something exciting! Check it out 🚀",
      timeAgo: "2 hours ago"
    }
  ];

  // ===== Hero / 메인 프로필 카드 =====
  const editButton = b(
    "button.profile-edit-btn",
    { type: "button" },
    "Edit Profile"
  );

  const mainProfileCard = b(
    "section.profile-card.profile-main-card",
    b(
      "div.profile-main",
      b("div.profile-avatar", profileData.avatarInitial),
      b(
        "div.profile-main-text",
        b("div.profile-name", profileData.name),
        b("div.profile-bio", profileData.bio),
        b("div.profile-address", profileData.address)
      )
    )
  );

  const heroSection = b(
    "div.profile-hero",
    b("div.profile-cover"),
    editButton,
    mainProfileCard
  );

  // ===== Stats =====
  const statsRow = b(
    "div.profile-stats-row",
    b(
      "div.profile-stat-card",
      b("div.profile-stat-label", "Holders"),
      b(
        "div.profile-stat-value",
        profileData.stats.holders.toLocaleString()
      )
    ),
    b(
      "div.profile-stat-card",
      b("div.profile-stat-label", "Volume"),
      b(
        "div.profile-stat-value",
        `$${profileData.stats.volumeUsd.toLocaleString()}`
      )
    ),
    b(
      "div.profile-stat-card",
      b("div.profile-stat-label", "Followers"),
      b(
        "div.profile-stat-value",
        profileData.stats.followers.toLocaleString()
      )
    )
  );

  // ===== Connect With Me (소셜 링크 카드) =====
  const socialLinkNodes = socialLinks.map((link) =>
    b(
      link.href ? "a.profile-social-row" : "div.profile-social-row",
      link.href
        ? {
          href: link.href,
          target: "_blank",
          rel: "noreferrer noopener"
        } as any
        : {},
      b(
        "div.profile-social-left",
        b("ion-icon.profile-social-icon", { name: link.icon }),
        b("span.profile-social-label", link.label)
      ),
      b("ion-icon.profile-social-open-icon", { name: "open-outline" })
    )
  );

  const connectCard = b(
    "section.profile-card.profile-connect-card",
    b("div.profile-section-title", "Connect With Me"),
    b("div.profile-social-list", ...socialLinkNodes)
  );

  // ===== Recent Posts 카드 (🔗 href=/post/:id) =====
  const postRows = posts.map((post) =>
    b(
      "a.profile-post-row",
      {
        href: `/post/${post.id}`
      },
      b("div.profile-post-content", post.content),
      b("div.profile-post-meta", post.timeAgo)
    )
  );

  const postsCard = b(
    "section.profile-card.profile-posts-card",
    b("h2.profile-card-title", "Recent Posts"),
    b("div.profile-posts-list", ...postRows)
  );

  // ===== 전체 조립 =====
  const root = b(
    "section.profile-wrapper",
    b(
      "div.profile-inner",
      heroSection,
      b("div.profile-content-offset", statsRow, connectCard, postsCard)
    )
  );

  return root;
}
