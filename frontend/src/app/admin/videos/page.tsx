"use client";

import { useEffect, useState } from "react";
import { ContentCard } from "@/components/layout/ContentCard";
import { fetchPendingVideos, validateVideo, rejectVideo, type AdminVideoRecord } from "@/lib/admin-api";
import { VideoPlayer } from "@/components/video/VideoPlayer";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<AdminVideoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingVideos();
  }, []);

  const loadPendingVideos = async () => {
    try {
      const data = await fetchPendingVideos();
      setVideos(data);
    } catch (error) {
      console.error("Erreur chargement vidéos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      await validateVideo(id);
      setVideos(videos.filter(v => v.id !== id));
    } catch (error) {
      alert("Erreur lors de la validation.");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Refuser et supprimer cette vidéo ?")) return;
    try {
      await rejectVideo(id);
      setVideos(videos.filter(v => v.id !== id));
    } catch (error) {
      alert("Erreur lors du refus de la vidéo.");
    }
  };

  return (
    <ContentCard className="max-w-5xl">
      <h1 className="font-title text-2xl font-bold text-institutional">Vidéos en attente</h1>
      <p className="mt-2 text-sm text-institutional/80">
        Modération a priori : visionnez et validez les vidéos avant leur publication publique.
      </p>

      {loading ? (
        <p className="mt-8 text-sm">Chargement en cours...</p>
      ) : videos.length === 0 ? (
        <div className="mt-8 rounded-xl border-2 border-dashed border-border bg-content-bg p-8 text-center">
          <p className="text-sm text-institutional/70">Aucune vidéo en attente de validation.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((record) => (
            <div key={record.id} className="overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-sm">
              <div className="aspect-9/16 bg-black">
                <VideoPlayer
                  video={record.video}
                  label={`Vidéo de ${record.userName}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-title font-bold text-institutional">{record.userName}</h3>
                <p className="mt-1 text-xs opacity-70">Déposée le {new Date(record.createdAt).toLocaleDateString()}</p>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleValidate(record.id)}
                    className="font-title flex-1 rounded-lg bg-green-600 py-2 text-xs font-bold text-white transition hover:bg-green-700"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => handleReject(record.id)}
                    className="font-title flex-1 rounded-lg border-2 border-red-200 bg-red-50 py-2 text-xs font-bold text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ContentCard>
  );
}