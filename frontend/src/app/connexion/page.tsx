"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { ConnexionSidebar } from "@/components/AppSidebar";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { FrenchDateInput } from "@/components/FrenchDateInput";
import { getHomeForRole, type UserRole } from "@/types/auth";

type AuthMode = "login" | "register";

const inputClassName =
  "mt-1.5 w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional outline-none focus:border-action focus:ring-2 focus:ring-action/30";

function RoleChoice({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (role: UserRole) => void;
}) {
  const options: { role: UserRole; title: string; description: string }[] = [
    {
      role: "recruiter",
      title: "Recruteur",
      description: "Parcourez les profils, likez et enregistrez vos favoris.",
    },
    {
      role: "jobseeker",
      title: "Demandeur d'emploi",
      description: "Gérez votre profil, votre vidéo et votre questionnaire.",
    },
  ];

  return (
    <fieldset className="space-y-3">
      <legend className="font-title text-sm font-bold text-institutional">
        Type de compte
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.role;
          return (
            <label
              key={option.role}
              className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                selected
                  ? "border-action bg-action/5"
                  : "border-border bg-surface hover:border-institutional/30"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option.role}
                checked={selected}
                onChange={() => onChange(option.role)}
                className="sr-only"
              />
              <span className="font-title block text-sm font-bold text-institutional">
                {option.title}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-institutional/75">
                {option.description}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, isAuthenticated, role, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [cguAccepted, setCguAccepted] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("recruiter");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectParam = searchParams.get("redirect");

  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      router.replace(redirectParam ?? getHomeForRole(role));
    }
  }, [isAuthenticated, isLoading, redirectParam, role, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (mode === "register" && !firstname.trim()) {
      setError("Le prénom est obligatoire.");
      return;
    }

    if (mode === "register" && !lastname.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }

    if (mode === "register" && !/^\d{4}-\d{2}-\d{2}$/.test(birthdate.trim())) {
      setError("La date de naissance doit être au format JJ/MM/AAAA.");
      return;
    }

    if (mode === "register" && !cguAccepted) {
      setError(
        "Vous devez accepter les Conditions Générales d'Utilisation pour créer un compte.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const nextRole =
        mode === "login"
          ? await login(email, password)
          : await register(email, password, selectedRole, {
              firstname,
              lastname,
              birthdate,
              cguAccepted,
            });

      router.push(redirectParam ?? getHomeForRole(nextRole));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de contacter le serveur d'authentification.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout sidebar={<ConnexionSidebar />}>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <ContentCard className="w-full max-w-lg">
          <h1 className="font-title text-2xl font-bold text-institutional">
            {mode === "login" ? "Connexion à ProfilsActifs" : "Créer un compte"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-institutional/80">
            {mode === "login"
              ? "Connectez-vous pour accéder à votre espace."
              : "Choisissez votre type de compte pour commencer."}
          </p>

          <div
            className="mt-6 flex rounded-lg border-2 border-border bg-content-bg p-1"
            role="tablist"
            aria-label="Mode d'authentification"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`font-title flex-1 rounded-md px-3 py-2 text-sm font-bold transition ${
                mode === "login"
                  ? "bg-action text-white"
                  : "text-institutional hover:bg-surface"
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`font-title flex-1 rounded-md px-3 py-2 text-sm font-bold transition ${
                mode === "register"
                  ? "bg-action text-white"
                  : "text-institutional hover:bg-surface"
              }`}
            >
              Créer un compte
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {mode === "register" && (
              <>
                <RoleChoice value={selectedRole} onChange={setSelectedRole} />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstname" className="font-title block text-sm font-bold">
                      Prénom
                    </label>
                    <input
                      id="firstname"
                      name="firstname"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={firstname}
                      onChange={(event) => setFirstname(event.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastname" className="font-title block text-sm font-bold">
                      Nom
                    </label>
                    <input
                      id="lastname"
                      name="lastname"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={lastname}
                      onChange={(event) => setLastname(event.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </div>
              </>
            )}

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
                className={inputClassName}
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
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClassName}
              />
            </div>

            {mode === "register" && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="font-title block text-sm font-bold"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={inputClassName}
                />
              </div>
            )}

            {mode === "register" && (
              <div>
                <label htmlFor="birthdate" className="font-title block text-sm font-bold">
                  Date de naissance
                </label>
                <FrenchDateInput
                  id="birthdate"
                  name="birthdate"
                  autoComplete="bday"
                  required
                  value={birthdate}
                  onChange={setBirthdate}
                  className={inputClassName}
                />
              </div>
            )}

            {mode === "register" && (
              <div className="flex items-start gap-3 rounded-lg border-2 border-border bg-content-bg p-3">
                <input
                  id="cgu"
                  name="cgu"
                  type="checkbox"
                  required
                  checked={cguAccepted}
                  onChange={(event) => setCguAccepted(event.target.checked)}
                  className="mt-0.5 size-5 shrink-0 accent-action"
                />
                <label htmlFor="cgu" className="text-sm text-institutional">
                  J&apos;ai lu et j&apos;accepte les{" "}
                  <Link
                    href="/cgu"
                    target="_blank"
                    className="font-title font-bold text-institutional underline"
                  >
                    Conditions Générales d&apos;Utilisation
                  </Link>
                  . La date et l&apos;heure de votre acceptation sont conservées ; vous pouvez la
                  révoquer à tout moment depuis votre profil.
                </label>
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-lg bg-action/10 px-3 py-2 text-sm text-action">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="font-title w-full rounded-lg bg-action px-4 py-3 text-sm font-bold text-white transition hover:bg-action-hover disabled:opacity-60"
            >
              {submitting
                ? "Patientez…"
                : mode === "login"
                  ? "Se connecter"
                  : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link href="/" className="font-title font-bold text-institutional underline">
              Retour à l&apos;accueil
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
        <div className="flex min-h-dvh items-center justify-center bg-content-bg">
          <p className="text-institutional" role="status">
            Chargement…
          </p>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
