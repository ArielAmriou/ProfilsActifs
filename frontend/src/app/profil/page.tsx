"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RequireRole } from "@/components/RequireRole";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";

const inputClassName =
  "mt-1.5 w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional outline-none focus:border-action focus:ring-2 focus:ring-action/30";

export default function ProfilPage() {
  const { demandeurProfile, updateDemandeurProfile, email } = useAuth();
  const [form, setForm] = useState(demandeurProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(demandeurProfile);
  }, [demandeurProfile]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateDemandeurProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <RequireRole allowed={["demandeur"]}>
          <HeaderBar />
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
            <ContentCard className="w-full max-w-2xl">
              <h1 className="font-title text-2xl font-bold text-institutional">Profil</h1>
              <p className="mt-2 text-sm text-institutional/80">
                Modifiez vos informations et consultez vos statistiques.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border-2 border-border bg-content-bg p-4">
                  <p className="font-title text-xs font-bold uppercase tracking-wide text-institutional/60">
                    Likes reçus
                  </p>
                  <p className="font-title mt-2 text-3xl font-bold text-action">
                    {demandeurProfile.likes}
                  </p>
                </div>
                <div className="rounded-xl border-2 border-border bg-content-bg p-4">
                  <p className="font-title text-xs font-bold uppercase tracking-wide text-institutional/60">
                    Mises en favori
                  </p>
                  <p className="font-title mt-2 text-3xl font-bold text-action">
                    {demandeurProfile.favorites}
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

                <div>
                  <label htmlFor="name" className="font-title block text-sm font-bold">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="title" className="font-title block text-sm font-bold">
                    Intitulé du poste recherché
                  </label>
                  <input
                    id="title"
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
