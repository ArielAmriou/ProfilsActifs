import type { Profile } from "@/data/profiles";

interface ProfileOverlayProps {
  profile: Profile;
}

export function ProfileOverlay({ profile }: ProfileOverlayProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-institutional/90 via-institutional/30 to-transparent px-4 pb-12 pt-4">
        <div className="flex items-start gap-2">
          <div>
            <h2 className="font-title text-lg font-bold text-white">
              {profile.name}
            </h2>
            <p className="font-title mt-0.5 text-sm font-semibold text-white/85">
              {profile.title}
            </p>
          </div>
          {profile.certified && (
            <span
              className="font-title shrink-0 rounded-full bg-action px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              aria-label="Profil certifié"
            >
              Certifié
            </span>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-institutional/95 via-institutional/50 to-transparent px-4 pb-5 pt-20">
        <dl className="space-y-1 text-sm text-white">
          <div>
            <dt className="sr-only">Secteur</dt>
            <dd>
              <span className="font-title font-bold">Secteur : </span>
              {profile.sector}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Localisation</dt>
            <dd>
              <span className="font-title font-bold">Localisation : </span>
              {profile.location}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Compétences</dt>
            <dd>
              <span className="font-title font-bold">Compétences : </span>
              {profile.skills.join(", ")}
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
