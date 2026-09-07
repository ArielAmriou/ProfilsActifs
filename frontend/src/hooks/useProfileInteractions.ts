"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getDefaultInteractionState,
  readInteractions,
  writeInteractions,
  type InteractionState,
} from "@/lib/interactions";

export function useProfileInteractions(profileId: string, initialLikes: number) {
  const { isAuthenticated, email } = useAuth();
  const [state, setState] = useState<InteractionState>(() =>
    getDefaultInteractionState(initialLikes),
  );

  useEffect(() => {
    if (!isAuthenticated || !email) {
      setState(getDefaultInteractionState(initialLikes));
      return;
    }

    const stored = readInteractions(email)[profileId];
    setState(stored ?? getDefaultInteractionState(initialLikes));
  }, [profileId, initialLikes, isAuthenticated, email]);

  const persist = useCallback(
    (next: InteractionState) => {
      if (!email) {
        return;
      }
      const all = readInteractions(email);
      all[profileId] = next;
      writeInteractions(email, all);
      setState(next);
    },
    [email, profileId],
  );

  const toggleLike = useCallback(() => {
    if (!isAuthenticated || !email) {
      return false;
    }

    const next: InteractionState = {
      ...state,
      liked: !state.liked,
      likeCount: state.liked ? state.likeCount - 1 : state.likeCount + 1,
    };
    persist(next);
    return next.liked;
  }, [email, isAuthenticated, persist, state]);

  const toggleFavorite = useCallback(() => {
    if (!isAuthenticated || !email) {
      return false;
    }

    const next: InteractionState = {
      ...state,
      favorited: !state.favorited,
    };
    persist(next);
    return next.favorited;
  }, [email, isAuthenticated, persist, state]);

  const visibleLiked = isAuthenticated && state.liked;
  const visibleFavorited = isAuthenticated && state.favorited;

  return {
    liked: visibleLiked,
    favorited: visibleFavorited,
    // Compteur conservé en local pour usage futur (stockage DB) — jamais exposé à l'UI.
    likeCount: state.likeCount,
    showLikeCount: false,
    toggleLike,
    toggleFavorite,
  };
}
