"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

interface LoginPromptModalProps {
  actionLabel: "liker ce profil" | "ajouter ce profil à vos favoris";
  onClose: () => void;
}

export function LoginPromptModal({ actionLabel, onClose }: LoginPromptModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Fermer la fenêtre"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
        aria-describedby="login-prompt-description"
        className="relative w-full max-w-md rounded-2xl border-2 border-border bg-surface p-6 shadow-xl"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-institutional transition hover:bg-institutional/5"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <h2
          id="login-prompt-title"
          className="font-title pr-10 text-xl font-bold text-institutional"
        >
          Connexion requise
        </h2>

        <p id="login-prompt-description" className="mt-3 text-sm leading-relaxed text-institutional/85">
          Vous devez être connecté pour {actionLabel}. Connectez-vous à ProfilsActifs pour
          continuer.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/connexion?redirect=${encodeURIComponent("/")}`}
            className="font-title inline-flex flex-1 items-center justify-center rounded-lg bg-action px-4 py-3 text-sm font-bold text-white no-underline transition hover:bg-action-hover"
          >
            Se connecter
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="font-title inline-flex flex-1 items-center justify-center rounded-lg border-2 border-border px-4 py-3 text-sm font-bold text-institutional transition hover:border-institutional"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
