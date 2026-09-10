"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { CandidateDisclaimerBanner } from "@/components/CandidateDisclaimerBanner";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RequireRole } from "@/components/RequireRole";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { CertifiedBadge } from "@/components/Certif";
import { PendingValidationBadge } from "@/components/PendingValidationBadge";
import { CguConsent } from "@/components/CguConsent";
import { FrenchDateInput } from "@/components/FrenchDateInput";
import { PostalCodeAutocomplete } from "@/components/PostalCodeAutocomplete";
import { PROFILE_SECTORS, isProfileSector } from "@/data/sectors";
import { isOfLegalWorkAge, parseIsoDateLocal, UNDERAGE_MESSAGE } from "@/lib/age";
import { fetchMyVideo, isPendingValidation, NO_VIDEO, type VideoDescriptor } from "@/lib/videos";

const inputClassName =
  "mt-1.5 w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional outline-none focus:border-action focus:ring-2 focus:ring-action/30";

export default function ProfilPage() {
  const { jobseekerProfile, updateJobseekerProfile, email } = useAuth();
  const [form, setForm] = useState(jobseekerProfile);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [video, setVideo] = useState<VideoDescriptor>(NO_VIDEO);

  useEffect(() => {
    setForm(jobseekerProfile);
  }, [jobseekerProfile]);

  useEffect(() => {
    fetchMyVideo().then(setVideo);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthdate.trim())) {
      setError("La date de naissance doit être au format JJ/MM/AAAA.");
      return;
    }
    const birth = parseIsoDateLocal(form.birthdate);
    if (!birth || !isOfLegalWorkAge(birth)) {
      setError(UNDERAGE_MESSAGE);
      return;
    }
    if (!form.location.trim()) {
      setError("Choisissez un code postal dans la liste proposée.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      await updateJobseekerProfile({
        ...form,
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        name: form.name.trim(),
        birthdate: form.birthdate.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "L'enregistrement a échoué. Réessayez dans un instant.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <RequireRole allowed={["jobseeker"]}>
          <CandidateDisclaimerBanner />
          <HeaderBar className="pointer-events-none relative z-30 flex items-center justify-end gap-3 px-4 py-3 lg:px-8" />
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
            <ContentCard className="w-full max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-title text-2xl font-bold text-institutional">Profil</h1>
                {jobseekerProfile.certified && <CertifiedBadge />}
                {isPendingValidation(video) && <PendingValidationBadge />}
              </div>

              <p className="mt-2 text-sm text-institutional/80">
                Modifiez vos informations et consultez vos statistiques.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Compteur « Likes reçus » retiré (instruction cabinet) — like conservé sans affichage public */}
                <div className="rounded-xl border-2 border-border bg-content-bg p-4">
                  <p className="font-title text-xs font-bold uppercase tracking-wide text-institutional/60">
                    Mises en favori
                  </p>
                  <p className="font-title mt-2 text-3xl font-bold text-action">
                    {jobseekerProfile.favorites}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="font-title block text-sm font-bold">
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email ?? ""}
                    disabled
                    className={`${inputClassName} opacity-70`}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstname" className="font-title block text-sm font-bold">
                      Prénom
                    </label>
                    <input
                      id="firstname"
                      name="firstname"
                      autoComplete="given-name"
                      value={form.firstname}
                      onChange={(event) =>
                        setForm({ ...form, firstname: event.target.value })
                      }
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
                      autoComplete="family-name"
                      value={form.lastname}
                      onChange={(event) =>
                        setForm({ ...form, lastname: event.target.value })
                      }
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="font-title block text-sm font-bold">
                    Nom d&apos;utilisateur
                  </label>
                  <input
                    id="name"
                    name="name"
                    autoComplete="username"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className={inputClassName}
                    placeholder="Ex. : amine.benali"
                  />
                  <p className="mt-1.5 text-xs text-institutional/65">
                    Identifiant affiché (indépendant du prénom et du nom).
                  </p>
                </div>

                <div>
                  <label htmlFor="birthdate" className="font-title block text-sm font-bold">
                    Date de naissance
                  </label>
                  <FrenchDateInput
                    id="birthdate"
                    name="birthdate"
                    autoComplete="bday"
                    required
                    value={form.birthdate}
                    onChange={(birthdate) => setForm({ ...form, birthdate })}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="sector" className="font-title block text-sm font-bold">
                    Secteur
                  </label>
                  <select
                    id="sector"
                    name="sector"
                    required
                    value={form.sector}
                    onChange={(event) => setForm({ ...form, sector: event.target.value })}
                    className={inputClassName}
                  >
                    <option value="">Choisir un secteur</option>
                    {form.sector && !isProfileSector(form.sector) && (
                      <option value={form.sector}>{form.sector} (valeur actuelle)</option>
                    )}
                    {PROFILE_SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="font-title block text-sm font-bold">
                    Localisation (code postal)
                  </label>
                  <PostalCodeAutocomplete
                    id="location"
                    name="location"
                    required
                    value={form.location}
                    onChange={(location) => setForm({ ...form, location })}
                    className={inputClassName}
                  />
                </div>

                {saved && (
                  <p role="status" className="rounded-lg bg-institutional/10 px-3 py-2 text-sm text-institutional">
                    Profil enregistré.
                  </p>
                )}

                {error && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="font-title rounded-lg bg-action px-4 py-3 text-sm font-bold text-white transition hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Enregistrement…" : "Enregistrer le profil"}
                </button>
              </form>

              <CguConsent />
            </ContentCard>
          </div>
        </RequireRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
