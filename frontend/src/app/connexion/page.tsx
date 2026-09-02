"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { BrandBlock } from "@/components/layout/BrandBlock";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";

function ConnexionSidebar() {
  return (
    <>
      <BrandBlock />

      <blockquote className="mt-10 max-w-sm text-lg leading-relaxed text-institutional lg:mt-8">
        « ProfilsActifs met en avant vos compétences professionnelles par la vidéo
        pour faciliter la mise en relation avec les recruteurs. »
      </blockquote>

      <p className="mt-auto pt-8 text-xs text-institutional/60">
        Démo : saisissez n&apos;importe quelle adresse e-mail et mot de passe pour vous
        connecter.
      </p>
    </>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const redirect = searchParams.get("redirect") ?? "/";

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const success = login(email, password);
    if (success) {
      router.push(redirect);
      return;
    }

    setError("Veuillez renseigner votre adresse e-mail et votre mot de passe.");
  };

  return (
    <PageLayout sidebar={<ConnexionSidebar />}>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <ContentCard className="w-full max-w-md">
          <h1 className="font-title text-2xl font-bold text-institutional">
            Connexion à ProfilsActifs
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-institutional/80">
            Connectez-vous pour liker un profil ou l&apos;ajouter à vos favoris.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="font-title block text-sm font-bold">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional outline-none focus:border-action focus:ring-2 focus:ring-action/30"
              />
            </div>

            <div>
              <label htmlFor="password" className="font-title block text-sm font-bold">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5 w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional outline-none focus:border-action focus:ring-2 focus:ring-action/30"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-action/10 px-3 py-2 text-sm text-action">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="font-title w-full rounded-lg bg-action px-4 py-3 text-sm font-bold text-white transition hover:bg-action-hover"
            >
              Se connecter
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link href="/" className="font-title font-bold text-institutional underline">
              Retour aux profils mis en avant
            </Link>
          </p>
        </ContentCard>
      </div>
    </PageLayout>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-content-bg">
          <p className="text-institutional" role="status">
            Chargement…
          </p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
