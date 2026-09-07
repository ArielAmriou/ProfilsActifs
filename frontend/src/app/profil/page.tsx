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

const inputClassName =
  "mt-1.5 w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional outline-none focus:border-action focus:ring-2 focus:ring-action/30";

export default function ProfilPage() {
  const { jobseekerProfile, updateJobseekerProfile, email } = useAuth();
  const [form, setForm] = useState(jobseekerProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(jobseekerProfile);
  }, [jobseekerProfile]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.birthdate.trim()) {
      return;
    }
    updateJobseekerProfile({
      ...form,
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      name: form.name.trim(),
      birthdate: form.birthdate.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <RequireRole allowed={["jobseeker"]}>
          <HeaderBar />
          <CandidateDisclaimerBanner />
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
            <ContentCard className="w-full max-w-2xl">
              <div className="flex items-center gap-3">
                <h1 className="font-title text-2xl font-bold text-institutional">Profil</h1>
                {jobseekerProfile.certified && <CertifiedBadge />}
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
                  <input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    autoComplete="bday"
                    required
                    value={form.birthdate}
                    onChange={(event) =>
                      setForm({ ...form, birthdate: event.target.value })
                    }
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="title" className="font-title block text-sm font-bold">
                    Intitulé du poste recherché
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="sector" className="font-title block text-sm font-bold">
                    Secteur
                  </label>
                  <input
                    id="sector"
                    name="sector"
                    value={form.sector}
                    onChange={(event) => setForm({ ...form, sector: event.target.value })}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="location" className="font-title block text-sm font-bold">
                    Localisation
                  </label>
                  <input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="skills" className="font-title block text-sm font-bold">
                    Compétences
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    rows={3}
                    value={form.skills}
                    onChange={(event) => setForm({ ...form, skills: event.target.value })}
                    className={inputClassName}
                    placeholder="Ex. : Soudure TIG, Automatisme, Lecture de plans"
                  />
                </div>

                {saved && (
                  <p role="status" className="rounded-lg bg-institutional/10 px-3 py-2 text-sm text-institutional">
                    Profil enregistré.
                  </p>
                )}

                <button
                  type="submit"
                  className="font-title rounded-lg bg-action px-4 py-3 text-sm font-bold text-white transition hover:bg-action-hover"
                >
                  Enregistrer le profil
                </button>
              </form>
            </ContentCard>
          </div>
        </RequireRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
