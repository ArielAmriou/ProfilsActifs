"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getDefaultInteractionState,
  readInteractions,
  writeInteractions,
  type InteractionState,
} from "@/lib/interactions";
import { addFavorite, removeFavorite } from "@/lib/favorites-api";

export function useProfileInteractions(profileId: string, initialLikes: number) {
  const { isAuthenticated, email, role } = useAuth();
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

  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated || !email) {
      return false;
    }

    const nextFavorited = !state.favorited;
    const previous = state;
    persist({ ...state, favorited: nextFavorited });

    if (role === "recruiter") {
      try {
        if (nextFavorited) {
          await addFavorite(profileId);
        } else {
          await removeFavorite(profileId);
        }
      } catch {
        persist(previous);
        return previous.favorited;
      }
    }

    return nextFavorited;
  }, [email, isAuthenticated, persist, profileId, role, state]);

  return {
    liked: isAuthenticated && state.liked,
    favorited: isAuthenticated && state.favorited,
    likeCount: state.likeCount,
    showLikeCount: false,
    toggleLike,
    toggleFavorite,
  };
}
