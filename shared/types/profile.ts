export type Profile = {
  account: string;
  nickname: string | null;
  bio: string | null;
  profile_image: string | null;
  social_links: string | null;
  created_at: number;     // Unix timestamp (seconds)
  updated_at: number | null;
};
