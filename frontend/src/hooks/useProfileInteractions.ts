"use client";

import { useCallback, useEffect, useState } from "react";

interface InteractionState {
  liked: boolean;
  favorited: boolean;
  likeCount: number;
}

type InteractionsMap = Record<string, InteractionState>;

const STORAGE_KEY = "profilsactifs-interactions";

function readStorage(): InteractionsMap {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as InteractionsMap;
  } catch {
    return {};
  }
}

function writeStorage(data: InteractionsMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useProfileInteractions(profileId: string, initialLikes: number) {
  const [state, setState] = useState<InteractionState>({
    liked: false,
    favorited: false,
    likeCount: initialLikes,
  });

  useEffect(() => {
    const stored = readStorage()[profileId];
    if (stored) {
      setState(stored);
    } else {
      setState({ liked: false, favorited: false, likeCount: initialLikes });
    }
  }, [profileId, initialLikes]);

  const persist = useCallback(
    (next: InteractionState) => {
      const all = readStorage();
      all[profileId] = next;
      writeStorage(all);
      setState(next);
    },
    [profileId],
  );

  const toggleLike = useCallback(() => {
    const next: InteractionState = {
      ...state,
      liked: !state.liked,
      likeCount: state.liked ? state.likeCount - 1 : state.likeCount + 1,
    };
    persist(next);
    return next.liked;
  }, [persist, state]);

  const toggleFavorite = useCallback(() => {
    const next: InteractionState = {
      ...state,
      favorited: !state.favorited,
    };
    persist(next);
    return next.favorited;
  }, [persist, state]);

  return { ...state, toggleLike, toggleFavorite };
}
