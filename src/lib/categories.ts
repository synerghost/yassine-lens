// Single source of truth for photography categories (no server deps,
// safe to import from client components and the admin panel).
export const CATEGORIES = ["nightlife", "concerts", "motorsport", "sports"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CAT_LABEL: Record<string, string> = {
  nightlife: "Nightlife",
  concerts: "Live Music",
  motorsport: "Motorsport",
  sports: "Sports",
};
