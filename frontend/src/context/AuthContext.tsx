"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchCurrentUser,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from "@/lib/auth-api";
import {
  fetchMyProfile,
  updateMyProfile,
  type MyProfilePatch,
} from "@/lib/profiles-api";
import {
  DEFAULT_JOBSEEKER_PROFILE,
  JOBSEEKER_PROFILE_KEY,
  joinSkills,
  splitSkills,
  toDateInputValue,
  type JobseekerProfile,
  type UserRole,
} from "@/types/auth";

function toRemotePatch(patch: Partial<JobseekerProfile>): MyProfilePatch {
  const remote: MyProfilePatch = {};

  if (patch.firstname !== undefined) remote.firstname = patch.firstname;
  if (patch.lastname !== undefined) remote.lastname = patch.lastname;
  if (patch.name !== undefined) remote.name = patch.name;
  if (patch.birthdate !== undefined) remote.birthdate = patch.birthdate;
  if (patch.title !== undefined) remote.title = patch.title || null;
  if (patch.sector !== undefined) remote.sector = patch.sector || null;
  if (patch.location !== undefined) remote.location = patch.location || null;
  if (patch.availability !== undefined) remote.availability = patch.availability || null;
  if (patch.skills !== undefined) remote.skills = splitSkills(patch.skills);

  return remote;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  email: string | null;
  userId: string | null;
  jobseekerProfile: JobseekerProfile;
  login: (email: string, password: string) => Promise<UserRole>;
  register: (
    email: string,
    password: string,
    role: UserRole,
    profile: {
      firstname: string;
      lastname: string;
      birthdate: string;
      cguAccepted: boolean;
    },
  ) => Promise<UserRole>;
  logout: () => Promise<void>;
  updateJobseekerProfile: (patch: Partial<JobseekerProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function profileStorageKey(userId: string) {
  return `${JOBSEEKER_PROFILE_KEY}:${userId}`;
}

function readJobseekerProfile(userId: string | null): JobseekerProfile {
  if (typeof window === "undefined" || !userId) {
    return DEFAULT_JOBSEEKER_PROFILE;
  }
  try {
    const stored = localStorage.getItem(profileStorageKey(userId));
    if (!stored) {
      return DEFAULT_JOBSEEKER_PROFILE;
    }
    return { ...DEFAULT_JOBSEEKER_PROFILE, ...JSON.parse(stored) } as JobseekerProfile;
  } catch {
    return DEFAULT_JOBSEEKER_PROFILE;
  }
}

function writeJobseekerProfile(userId: string, profile: JobseekerProfile) {
  localStorage.setItem(profileStorageKey(userId), JSON.stringify(profile));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [jobseekerProfile, setJobseekerProfile] = useState<JobseekerProfile>(
    DEFAULT_JOBSEEKER_PROFILE,
  );

  const applyUser = useCallback(
    async (user: {
      id: string;
      email: string;
      role: UserRole;
      firstname?: string;
      lastname?: string;
      name?: string;
      birthdate?: string;
    }) => {
      setIsAuthenticated(true);
      setRole(user.role);
      setEmail(user.email);
      setUserId(user.id);

      if (user.role !== "jobseeker") {
        setJobseekerProfile(DEFAULT_JOBSEEKER_PROFILE);
        return;
      }

      const stored = readJobseekerProfile(user.id);
      const remote = await fetchMyProfile();

      const seeded: JobseekerProfile = {
        ...DEFAULT_JOBSEEKER_PROFILE,
        ...stored,
        firstname: remote?.firstname || user.firstname || "",
        lastname: remote?.lastname || user.lastname || "",
        name: remote?.name || user.name || "",
        birthdate: toDateInputValue(remote?.birthdate ?? user.birthdate),
        title: remote?.title ?? "",
        sector: remote?.sector ?? "",
        location: remote?.location ?? "",
        availability: remote?.availability ?? stored.availability ?? "",
        skills: joinSkills(remote?.skills ?? []),
        favorites: remote?.favorites ?? 0,
      };

      writeJobseekerProfile(user.id, seeded);
      setJobseekerProfile(seeded);
    },
    [],
  );

  const clearSession = useCallback(() => {
    setIsAuthenticated(false);
    setRole(null);
    setEmail(null);
    setUserId(null);
    setJobseekerProfile(DEFAULT_JOBSEEKER_PROFILE);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      const user = await fetchCurrentUser();
      if (cancelled) return;
      if (user) {
        await applyUser(user);
      } else {
        clearSession();
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [applyUser, clearSession]);

  const login = useCallback(
    async (nextEmail: string, password: string) => {
      if (!nextEmail.trim() || !password.trim()) {
        throw new Error("Veuillez renseigner votre adresse e-mail et votre mot de passe.");
      }
      const user = await signInWithEmail(nextEmail.trim(), password);
      await applyUser(user);
      return user.role;
    },
    [applyUser],
  );

  const register = useCallback(
    async (
      nextEmail: string,
      password: string,
      nextRole: UserRole,
      profile: {
        firstname: string;
        lastname: string;
        birthdate: string;
        cguAccepted: boolean;
      },
    ) => {
      if (!nextEmail.trim() || !password.trim()) {
        throw new Error("Veuillez renseigner votre adresse e-mail et votre mot de passe.");
      }
      const firstname = profile.firstname.trim();
      const lastname = profile.lastname.trim();
      const birthdate = profile.birthdate.trim();
      if (!firstname || !lastname) {
        throw new Error("Le prénom et le nom sont obligatoires.");
      }
      if (!birthdate) {
        throw new Error("La date de naissance est obligatoire.");
      }
      if (!profile.cguAccepted) {
        throw new Error(
          "Vous devez accepter les Conditions Générales d'Utilisation pour créer un compte.",
        );
      }
      const user = await signUpWithEmail(nextEmail.trim(), password, nextRole, {
        firstname,
        lastname,
        birthdate,
        cguAccepted: profile.cguAccepted,
      });
      await applyUser({
        ...user,
        firstname,
        lastname,
        birthdate,
      });
      return user.role;
    },
    [applyUser],
  );

  const logout = useCallback(async () => {
    await signOut();
    clearSession();
  }, [clearSession]);

  const updateJobseekerProfile = useCallback(
    async (patch: Partial<JobseekerProfile>) => {
      setJobseekerProfile((current) => {
        const next = { ...current, ...patch };
        if (userId) {
          writeJobseekerProfile(userId, next);
        }
        return next;
      });

      const remotePatch = toRemotePatch(patch);

      if (Object.keys(remotePatch).length > 0) {
        await updateMyProfile(remotePatch);
      }
    },
    [userId],
  );

  const value = useMemo(
    () => ({
      isAuthenticated: !isLoading && isAuthenticated,
      isLoading,
      role: isLoading ? null : role,
      email: isLoading ? null : email,
      userId: isLoading ? null : userId,
      jobseekerProfile: isLoading ? DEFAULT_JOBSEEKER_PROFILE : jobseekerProfile,
      login,
      register,
      logout,
      updateJobseekerProfile,
    }),
    [
      isLoading,
      isAuthenticated,
      role,
      email,
      userId,
      jobseekerProfile,
      login,
      register,
      logout,
      updateJobseekerProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
