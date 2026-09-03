"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RequireRole } from "@/components/RequireRole";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { EXAMPLE_VIDEO_URL } from "@/data/media";

const inputClassName =
  "mt-1.5 w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional outline-none focus:border-action focus:ring-2 focus:ring-action/30";

export default function MaVideoPage() {
  const { demandeurProfile, updateDemandeurProfile } = useAuth();
  const [videoUrl, setVideoUrl] = useState(demandeurProfile.videoUrl);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setVideoUrl(demandeurProfile.videoUrl);
  }, [demandeurProfile.videoUrl]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateDemandeurProfile({ videoUrl: videoUrl.trim() });
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
              <h1 className="font-title text-2xl font-bold text-institutional">Ma vidéo</h1>
              <p className="mt-2 text-sm text-institutional/80">
                Ajoutez ou modifiez votre vidéo de présentation professionnelle.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="videoUrl" className="font-title block text-sm font-bold">
                    URL de la vidéo
                  </label>
                  <input
                    id="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(event) => setVideoUrl(event.target.value)}
                    placeholder={EXAMPLE_VIDEO_URL}
                    className={inputClassName}
                  />
                  <p className="mt-2 text-xs text-institutional/65">
                    Collez un lien vers votre vidéo (MP4, hébergement externe, etc.).
                  </p>
                </div>

                {saved && (
                  <p role="status" className="rounded-lg bg-institutional/10 px-3 py-2 text-sm text-institutional">
                    Vidéo enregistrée.
                  </p>
                )}

                <button
                  type="submit"
                  className="font-title rounded-lg bg-action px-4 py-3 text-sm font-bold text-white transition hover:bg-action-hover"
                >
                  Enregistrer la vidéo
                </button>
              </form>

              <div className="mt-8">
                <h2 className="font-title text-sm font-bold text-institutional">Aperçu</h2>
                {videoUrl.trim() ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border-2 border-border bg-institutional">
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="aspect-[9/16] w-full max-w-sm object-cover"
                    >
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border-2 border-dashed border-border bg-content-bg px-6 py-12 text-center text-sm text-institutional/70">
                    Aucune vidéo ajoutée pour le moment.
                  </div>
                )}
              </div>
            </ContentCard>
          </div>
        </RequireRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
