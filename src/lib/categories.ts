// Single source of truth for photography categories (no server deps,
// safe to import from client components and the admin panel).
export const CATEGORIES = ["music", "hospitality", "sports"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CAT_LABEL: Record<string, string> = {
  music: "Music",
  hospitality: "Hospitality",
  sports: "Sports",
};
