"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RequireRole } from "@/components/RequireRole";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import {
  deleteMyVideo,
  fetchMyVideo,
  hasNoVideo,
  uploadMyVideo,
  NO_VIDEO,
  type VideoDescriptor,
} from "@/lib/videos";

const buttonClassName =
  "font-title rounded-lg px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

export default function MaVideoPage() {
  const [video, setVideo] = useState<VideoDescriptor>(NO_VIDEO);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyVideo().then(setVideo);
  }, []);

  const handleUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setPending(true);
    setNotice(null);
    setError(null);

    try {
      setVideo(await uploadMyVideo(file));
      setNotice("Vidéo enregistrée.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Impossible d'envoyer la vidéo pour le moment.",
      );
    } finally {
      setPending(false);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    setPending(true);
    setNotice(null);
    setError(null);

    try {
      await deleteMyVideo();
      setVideo(NO_VIDEO);
      setNotice("Vidéo supprimée. Le fichier a été effacé de nos serveurs.");
    } catch {
      setError("La suppression a échoué. Réessayez dans un instant.");
    } finally {
      setPending(false);
    }
  }, []);

  return (
    <>
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <RequireRole allowed={["jobseeker"]}>
          <HeaderBar />
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
            <ContentCard className="w-full max-w-2xl">
              <h1 className="font-title text-2xl font-bold text-institutional">Ma vidéo</h1>
              <p className="mt-2 text-sm text-institutional/80">
                Déposez votre vidéo de présentation. Elle est conservée sur nos serveurs et
                diffusée uniquement par l&apos;application.
              </p>

              <div className="mt-8 space-y-5">
                <div>
                  <label htmlFor="videoFile" className="font-title block text-sm font-bold">
                    Fichier vidéo
                  </label>
                  <input
                    id="videoFile"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/ogg"
                    onChange={handleUpload}
                    disabled={pending}
                    className="mt-1.5 w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional outline-none focus:border-action focus:ring-2 focus:ring-action/30"
                  />
                  <p className="mt-2 text-xs text-institutional/65">
                    Formats acceptés : MP4, WebM, MOV, OGG. 100 Mo maximum.
                  </p>
                </div>

                {notice && (
                  <p role="status" className="rounded-lg bg-institutional/10 px-3 py-2 text-sm text-institutional">
                    {notice}
                  </p>
                )}

                {error && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                    {error}
                  </p>
                )}

                {!hasNoVideo(video) && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={pending}
                    className={`${buttonClassName} border-2 border-border bg-surface text-institutional hover:bg-content-bg`}
                  >
                    Supprimer ma vidéo
                  </button>
                )}
              </div>

              <div className="mt-8">
                <h2 className="font-title text-sm font-bold text-institutional">Aperçu</h2>
                <div className="mt-3 w-fit overflow-hidden rounded-2xl border-2 border-border bg-institutional">
                  <VideoPlayer
                    video={video}
                    label="Aperçu de ma vidéo de présentation"
                    className="aspect-[9/16] h-auto w-48 object-cover sm:w-56"
                  />
                </div>
              </div>
            </ContentCard>
          </div>
        </RequireRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
