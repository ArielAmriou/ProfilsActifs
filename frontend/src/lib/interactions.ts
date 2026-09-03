export interface InteractionState {
  liked: boolean;
  favorited: boolean;
  likeCount: number;
}

export type InteractionsMap = Record<string, InteractionState>;

const INTERACTIONS_PREFIX = "profilsactifs-interactions";

export function getInteractionsStorageKey(email: string | null): string | null {
  if (!email) {
    return null;
  }
  return `${INTERACTIONS_PREFIX}-${email}`;
}

export function readInteractions(email: string | null): InteractionsMap {
  const key = getInteractionsStorageKey(email);
  if (!key || typeof window === "undefined") {
    return {};
  }
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}") as InteractionsMap;
  } catch {
    return {};
  }
}

export function writeInteractions(email: string, data: InteractionsMap) {
  const key = getInteractionsStorageKey(email);
  if (!key) {
    return;
  }
  localStorage.setItem(key, JSON.stringify(data));
}

export function getDefaultInteractionState(initialLikes: number): InteractionState {
  return {
    liked: false,
    favorited: false,
    likeCount: initialLikes,
  };
}
