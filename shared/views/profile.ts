import { PersonaPost } from "../types/post";
import { Profile } from "../types/profile";
import { AnyBuilder } from "./b";
import { avatarInitialFromName, formatRelativeTimeFromSeconds, shortenAddress } from "./utils";

export function profile(
  b: AnyBuilder,
  profile: Profile,
  posts: PersonaPost[],
) {
  const displayName =
    profile.nickname && profile.nickname.trim().length > 0
      ? profile.nickname.trim()
      : shortenAddress(profile.account);
  const bio =
    profile.bio && profile.bio.trim().length > 0
      ? profile.bio.trim()
      : "No bio yet.";
  const fullAddress = profile.account;
  const shortAddress = shortenAddress(profile.account, 6);
  const avatarInitial = avatarInitialFromName(displayName);

  const createdDate = new Date(profile.createdAt ?? 0 * 1000);
  const memberSince = createdDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });

  const totalPosts = posts.length;
  const totalLikes = posts.reduce(
    (acc, p) => acc + (p.likeCount ?? 0),
    0,
  );

  const socialLinks = profile.socialLinks ?? {};

  // ===== Hero / 메인 프로필 카드 =====
  const editButton = b(
    "button.profile-edit-btn",
    {
      type: "button",
      "data-action": "edit-profile",
      "data-address": fullAddress,
    },
    "Edit Profile",
  );

  const mainProfileCard = b(
    "section.profile-card.profile-main-card",
    b(
      "div.profile-main",
      b("div.profile-avatar", avatarInitial),
      b(
        "div.profile-main-text",
        b("div.profile-name", displayName),
        b("div.profile-bio", bio),
        b("div.profile-address", shortAddress),
      ),
    ),
  );

  const heroSection = b(
    "div.profile-hero",
    b("div.profile-cover"),
    editButton,
    mainProfileCard,
  );

  // ===== Stats =====
  const statsRow = b(
    "div.profile-stats-row",
    b(
      "div.profile-stat-card",
      b("div.profile-stat-label", "Posts"),
      b("div.profile-stat-value", totalPosts.toLocaleString()),
    ),
    b(
      "div.profile-stat-card",
      b("div.profile-stat-label", "Total Likes"),
      b("div.profile-stat-value", totalLikes.toLocaleString()),
    ),
    b(
      "div.profile-stat-card",
      b("div.profile-stat-label", "Member Since"),
      b("div.profile-stat-value", memberSince),
    ),
  );

  // ===== Connect With Me (소셜 링크 카드) =====
  const socialItems: {
    key: string;
    label: string;
    icon: string;
  }[] = [
      {
        key: "twitter",
        label: "Twitter / X",
        icon: "logo-twitter",
      },
      {
        key: "discord",
        label: "Discord",
        icon: "logo-discord",
      },
      {
        key: "website",
        label: "Website",
        icon: "link-outline",
      },
    ];

  const socialLinkNodes: (HTMLElement | string)[] = socialItems
    .filter((item) => !!socialLinks[item.key])
    .map((item) => {
      const href = socialLinks[item.key]!;
      return b(
        "a.profile-social-row",
        {
          href,
          target: "_blank",
          rel: "noreferrer noopener",
        } as any,
        b(
          "div.profile-social-left",
          b("ion-icon.profile-social-icon", { name: item.icon }),
          b("span.profile-social-label", item.label),
        ),
        b("ion-icon.profile-social-open-icon", { name: "open-outline" }),
      );
    });

  // 소셜 링크가 하나도 없으면 placeholder
  if (socialLinkNodes.length === 0) {
    socialLinkNodes.push(
      b(
        "div.profile-social-row.profile-social-empty",
        b(
          "div.profile-social-left",
          b("span.profile-social-label", "No social links yet."),
        ),
      ),
    );
  }

  const connectCard = b(
    "section.profile-card.profile-connect-card",
    b("div.profile-section-title", "Connect With Me"),
    b("div.profile-social-list", ...socialLinkNodes),
  );

  // ===== Recent Posts 카드 (href=/post/:id) =====
  const postRows = posts.map((post) => {
    const contentPreview =
      post.content.length > 140
        ? `${post.content.slice(0, 140)}…`
        : post.content;

    const meta = `${formatRelativeTimeFromSeconds(
      post.createdAt,
    )} · ❤ ${post.likeCount ?? 0} · 💬 ${post.commentCount ?? 0}`;

    return b(
      "a.profile-post-row",
      {
        href: `/post/${post.id}`,
      },
      b("div.profile-post-content", contentPreview),
      b("div.profile-post-meta", meta),
    );
  });

  const postsCard = b(
    "section.profile-card.profile-posts-card",
    b("h2.profile-card-title", "Recent Posts"),
    postRows.length
      ? b("div.profile-posts-list", ...postRows)
      : b("div.profile-posts-empty", "No posts yet."),
  );

  // ===== 전체 조립 =====
  const root = b(
    "section.profile-wrapper",
    b(
      "div.profile-inner",
      heroSection,
      b("div.profile-content-offset", statsRow, connectCard, postsCard),
    ),
  );

  return root;
}
