"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile } from "@/data/profiles";
import { getInitialProfiles, getProfileBatch } from "@/data/profiles";
import { VideoSlide } from "./VideoSlide";

export function Feed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<Profile[]>(getInitialProfiles);
  const [activeIndex, setActiveIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (loading) {
      return;
    }
    setLoading(true);
    const nextPage = page + 1;
    setProfiles((current) => [...current, ...getProfileBatch(nextPage)]);
    setPage(nextPage);
    setLoading(false);
  }, [loading, page]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const slides = container.querySelectorAll(".feed-slide");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!Number.isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      { root: container, threshold: 0.65 },
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [profiles.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { root: container, rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const scrollTo = (direction: "up" | "down") => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const nextIndex = direction === "down" ? activeIndex + 1 : activeIndex - 1;
    const target = container.querySelector(`[data-index="${nextIndex}"]`);
    target?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex-1" aria-label="Profils mis en avant">
      <div
        ref={containerRef}
        className="feed-scroll h-[100dvh] overflow-y-auto pb-16 lg:pb-0"
        tabIndex={0}
        aria-label="Fil de profils, faites défiler verticalement"
      >
        {profiles.map((profile, index) => (
          <div key={profile.id} data-index={index}>
            <VideoSlide profile={profile} isActive={index === activeIndex} />
          </div>
        ))}
        <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        {loading && (
          <p className="py-4 text-center text-sm text-institutional/70" role="status">
            Chargement de profils supplémentaires…
          </p>
        )}
      </div>

      <div
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
        role="group"
        aria-label="Navigation entre les profils"
      >
        <button
          type="button"
          onClick={() => scrollTo("up")}
          disabled={activeIndex === 0}
          aria-label="Profil précédent"
          className="flex size-11 items-center justify-center rounded-full border-2 border-border bg-surface text-institutional transition enabled:hover:border-institutional disabled:opacity-30"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollTo("down")}
          disabled={activeIndex >= profiles.length - 1}
          aria-label="Profil suivant"
          className="flex size-11 items-center justify-center rounded-full border-2 border-border bg-surface text-institutional transition enabled:hover:border-institutional disabled:opacity-30"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
          </svg>
        </button>
      </div>
    </section>
  );
}
