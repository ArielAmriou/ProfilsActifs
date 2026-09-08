"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchMyProfile, setCguConsent } from "@/lib/profiles-api";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatAcceptance(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function CguConsent() {
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchMyProfile().then((profile) => {
      if (!active) return;
      setAcceptedAt(profile?.cguAcceptedAt ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const toggle = useCallback(async (accepted: boolean) => {
    setPending(true);
    setError(null);

    try {
      const profile = await setCguConsent(accepted);
      setAcceptedAt(profile.cguAcceptedAt);
    } catch {
      setError("L'opération a échoué. Réessayez dans un instant.");
    } finally {
      setPending(false);
    }
  }, []);

  if (loading) {
    return null;
  }

  return (
    <section className="mt-8 rounded-xl border-2 border-border bg-content-bg p-4">
      <h2 className="font-title text-sm font-bold text-institutional">
        Conditions Générales d&apos;Utilisation
      </h2>

      {acceptedAt ? (
        <p className="mt-2 text-sm text-institutional/80">
          Acceptées le {formatAcceptance(acceptedAt)}.{" "}
          <Link href="/cgu" className="font-title font-bold text-institutional underline">
            Les relire
          </Link>
        </p>
      ) : (
        <p role="status" className="mt-2 text-sm text-institutional/80">
          Vous avez révoqué votre acceptation. Votre profil n&apos;est plus visible par les
          recruteurs tant que vous ne l&apos;acceptez pas de nouveau.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => toggle(!acceptedAt)}
        disabled={pending}
        className="font-title mt-4 rounded-lg border-2 border-border bg-surface px-4 py-2.5 text-sm font-bold text-institutional transition hover:border-institutional disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Enregistrement…"
          : acceptedAt
            ? "Révoquer mon acceptation"
            : "Accepter de nouveau les CGU"}
      </button>
    </section>
  );
}
