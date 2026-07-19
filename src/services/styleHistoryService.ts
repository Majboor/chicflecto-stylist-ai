// styleHistoryService — local persistence for a user's past AI style analyses.
//
// Style analyses used to be entirely ephemeral: the moment a visitor hit
// "Analyze Another Outfit" or navigated away, the deck of style cards, the
// identified items and the AI suggestion image were gone forever. For a paid
// product with unlimited analyses that is a real loss of value — people want to
// look back at what the stylist told them last week.
//
// This service keeps a compact, per-user journal of past analyses in
// localStorage. It is intentionally backend-free: it needs no schema change,
// no edge function and no network round-trip, so it works instantly and even
// offline. Entries are capped and quota errors are handled by evicting the
// oldest looks, so the store can never wedge the app.

export interface StyleHistoryResponse {
  outfit_analysis: {
    items: string[];
  };
  style_advice: {
    cards: {
      card: number;
      content: string;
      suggestion_image?: string;
    }[];
    suggestion_image?: string;
  };
}

export interface StyleHistoryEntry {
  /** Stable id for this saved look. */
  id: string;
  /** Epoch millis the analysis was saved. */
  createdAt: number;
  /** The uploaded outfit photo as a data URI, used as the gallery thumbnail. */
  thumbnail: string | null;
  /** Items the AI identified in the outfit (also drives quick tag chips). */
  items: string[];
  /** Number of advice cards, shown as a quick "depth" hint in the gallery. */
  cardCount: number;
  /** Optional short excerpt from the first advice card, for preview text. */
  excerpt: string;
  /** Full response so the exact same flashcard deck can be re-rendered. */
  styleResponse: StyleHistoryResponse;
  /** Optional user note attached to the look. */
  note?: string;
}

const KEY_PREFIX = "chicflecto_style_history_";
/** Hard cap on stored looks per user — keeps localStorage well within quota. */
const MAX_ENTRIES = 40;

function storageKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

function safeParse(raw: string | null): StyleHistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Defensive: only keep records that still have the shape we depend on.
    return parsed.filter(
      (e): e is StyleHistoryEntry =>
        e &&
        typeof e.id === "string" &&
        typeof e.createdAt === "number" &&
        e.styleResponse &&
        e.styleResponse.outfit_analysis &&
        Array.isArray(e.styleResponse.outfit_analysis.items) &&
        e.styleResponse.style_advice &&
        Array.isArray(e.styleResponse.style_advice.cards)
    );
  } catch {
    return [];
  }
}

/** Returns saved looks for a user, newest first. */
export function getStyleHistory(userId: string): StyleHistoryEntry[] {
  if (!userId) return [];
  const entries = safeParse(localStorage.getItem(storageKey(userId)));
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

/** Returns a single saved look, or null if it no longer exists. */
export function getStyleEntry(userId: string, id: string): StyleHistoryEntry | null {
  return getStyleHistory(userId).find((e) => e.id === id) ?? null;
}

function persist(userId: string, entries: StyleHistoryEntry[]): void {
  const key = storageKey(userId);
  // Trim to the cap (newest kept) before writing.
  let toStore = [...entries]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_ENTRIES);

  // Thumbnails are data URIs and can be large; if we blow the quota, drop the
  // oldest looks one at a time until the write succeeds rather than throwing.
  for (;;) {
    try {
      localStorage.setItem(key, JSON.stringify(toStore));
      return;
    } catch {
      if (toStore.length <= 1) {
        // Even a single entry won't fit — give up gracefully without a thumbnail.
        try {
          localStorage.setItem(
            key,
            JSON.stringify(toStore.map((e) => ({ ...e, thumbnail: null })))
          );
        } catch {
          /* nothing more we can safely do */
        }
        return;
      }
      toStore = toStore.slice(0, toStore.length - 1);
    }
  }
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `look_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildExcerpt(styleResponse: StyleHistoryResponse): string {
  const firstCard = styleResponse.style_advice.cards.find(
    (c) => c.content && c.content.trim().length > 0
  );
  const text = firstCard?.content?.trim() ?? "";
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

/**
 * Saves a freshly-completed analysis to the user's history and returns the new
 * entry. No-ops (returns null) when there is no user or no analysis payload.
 */
export function saveStyleAnalysis(
  userId: string,
  styleResponse: StyleHistoryResponse | null | undefined,
  thumbnail: string | null
): StyleHistoryEntry | null {
  if (!userId || !styleResponse?.outfit_analysis || !styleResponse?.style_advice) {
    return null;
  }

  const entry: StyleHistoryEntry = {
    id: makeId(),
    createdAt: Date.now(),
    thumbnail: thumbnail ?? null,
    items: styleResponse.outfit_analysis.items ?? [],
    cardCount: styleResponse.style_advice.cards?.length ?? 0,
    excerpt: buildExcerpt(styleResponse),
    styleResponse,
  };

  const existing = getStyleHistory(userId);
  persist(userId, [entry, ...existing]);
  return entry;
}

/** Removes a single saved look. Returns the remaining looks. */
export function deleteStyleEntry(userId: string, id: string): StyleHistoryEntry[] {
  const remaining = getStyleHistory(userId).filter((e) => e.id !== id);
  persist(userId, remaining);
  return remaining;
}

/** Attaches / updates a short personal note on a saved look. */
export function updateStyleNote(
  userId: string,
  id: string,
  note: string
): StyleHistoryEntry[] {
  const entries = getStyleHistory(userId).map((e) =>
    e.id === id ? { ...e, note: note.trim() || undefined } : e
  );
  persist(userId, entries);
  return entries;
}

/** Wipes the entire history for a user. */
export function clearStyleHistory(userId: string): void {
  if (!userId) return;
  localStorage.removeItem(storageKey(userId));
}

/** Convenience count used for badges / empty-state decisions. */
export function getStyleHistoryCount(userId: string): number {
  return getStyleHistory(userId).length;
}
