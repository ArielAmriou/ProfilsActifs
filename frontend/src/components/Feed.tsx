"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile } from "@/data/profiles";
import { getInitialProfiles, getProfileBatch } from "@/data/profiles";
import { VideoSlide } from "./VideoSlide";

export function Feed() {
  const sliderRef = useRef<HTMLDivElement>(null);  // div de translation CSS
  const sectionRef = useRef<HTMLElement>(null);     // section cliquable / clavier
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<Profile[]>(getInitialProfiles);
  const [activeIndex, setActiveIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const isAnimating = useRef(false);
  const activeIndexRef = useRef(0); // ref pour accès dans les event listeners

  // Sync ref avec state
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);

  const loadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    const nextPage = page + 1;
    setProfiles((current) => [...current, ...getProfileBatch(nextPage)]);
    setPage(nextPage);
    setLoading(false);
  }, [loading, page]);

  // Charge plus de profils quand on approche de la fin
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadMore(); },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // Déplace le slider via CSS transform — zéro scroll natif
  const goTo = useCallback((nextIndex: number, maxIndex: number) => {
    const clamped = Math.max(0, Math.min(maxIndex, nextIndex));
    if (isAnimating.current) return;
    if (clamped === activeIndexRef.current) return;
    isAnimating.current = true;
    setActiveIndex(clamped);
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateY(calc(-${clamped} * 100dvh))`;
    }
    setTimeout(() => { isAnimating.current = false; }, 500);
  }, []);

  // Molette souris
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let wheelLock = false;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelLock) return;
      wheelLock = true;
      setTimeout(() => { wheelLock = false; }, 500);
      const dir = e.deltaY > 0 ? 1 : -1;
      goTo(activeIndexRef.current + dir, profiles.length - 1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [goTo, profiles.length]);

  // Touch swipe
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => { startY = e.touches[0]?.clientY ?? 0; };
    const onTouchEnd = (e: TouchEvent) => {
      const delta = startY - (e.changedTouches[0]?.clientY ?? 0);
      if (Math.abs(delta) < 50) return;
      goTo(activeIndexRef.current + (delta > 0 ? 1 : -1), profiles.length - 1);
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [goTo, profiles.length]);

  // Flèches clavier sur la section (quand on clique dans la zone vidéo)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      goTo(activeIndexRef.current + 1, profiles.length - 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(activeIndexRef.current - 1, profiles.length - 1);
    }
  };

  // Empêche le focus sur un bouton enfant de déclencher un scroll
  const handleFocusCapture = (e: React.FocusEvent) => {
    const el = e.target as HTMLElement;
    if (el?.focus) setTimeout(() => el.focus({ preventScroll: true }), 0);
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex-1 overflow-hidden h-[100dvh]"
      aria-label="Profils mis en avant"
      onKeyDown={handleKeyDown}
      onFocusCapture={handleFocusCapture}
    >
      {/* Slider CSS — aucun scroll natif */}
      <div
        ref={sliderRef}
        className="will-change-transform"
        style={{ transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)" }}
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
        {/* Lien de bouclage accessibilité */}
        <button
          type="button"
          className="loop-link"
          onClick={() => {
            const main = document.getElementById("contenu-principal");
            const firstFocusable = main?.querySelector<HTMLElement>(
              'button:not([tabindex="-1"]), [href]:not([tabindex="-1"])'
            );
            firstFocusable?.focus({ preventScroll: true });
          }}
        >
          Revenir au début du fil de profils
        </button>
      </div>

      {/* Flèches de navigation droite (desktop) */}
      <div
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
        role="group"
        aria-label="Navigation entre les profils"
      >
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1, profiles.length - 1)}
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
          onClick={() => goTo(activeIndex + 1, profiles.length - 1)}
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
