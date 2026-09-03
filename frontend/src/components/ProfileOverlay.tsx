import type { Profile } from "@/data/profiles";

interface ProfileOverlayProps {
  profile: Profile;
}

export function ProfileOverlay({ profile }: ProfileOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-institutional/90 via-institutional/30 to-transparent px-4 pb-12 pr-28 pt-4">
      <div>
        <h2 className="font-title text-lg font-bold text-white">{profile.name}</h2>
        <p className="font-title mt-0.5 text-sm font-semibold text-white/85">
          {profile.title}
        </p>
      </div>
    </div>
  );
}
