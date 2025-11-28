export type PersonaPost = {
  id: number;
  author: string;         // wallet address of the author

  content: string;
  attachments: string | null;  // JSON string

  parent_post_id: number | null;
  repost_of_id: number | null;
  quote_of_id: number | null;

  view_count: number;
  like_count: number;
  comment_count: number;
  repost_count: number;
  quote_count: number;
  bookmark_count: number;

  created_at: number;          // Unix timestamp (seconds)
  updated_at: number | null;
};

export type PersonaPostView = {
  post_id: number;        // references persona_posts.id
  viewer_hash: string;    // hashed identifier (session / cookie / userID / wallet)

  last_viewed_at: number; // Unix timestamp (seconds)
};

export type PersonaPostLike = {
  post_id: number;        // references persona_posts.id
  account: string;        // wallet address of the liker
  created_at: number;     // Unix timestamp (seconds)
};

export type PersonaPostBookmark = {
  post_id: number;        // references persona_posts.id
  account: string;        // wallet address of the bookmarker
  created_at: number;     // Unix timestamp (seconds)
};
