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
  DEFAULT_JOBSEEKER_PROFILE,
  JOBSEEKER_PROFILE_KEY,
  toDateInputValue,
  type JobseekerProfile,
  type UserRole,
} from "@/types/auth";

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
    },
  ) => Promise<UserRole>;
  logout: () => Promise<void>;
  updateJobseekerProfile: (patch: Partial<JobseekerProfile>) => void;
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
    (user: {
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

      if (user.role === "jobseeker") {
        const stored = readJobseekerProfile(user.id);
        const apiBirthdate = toDateInputValue(user.birthdate);
        const seeded: JobseekerProfile = {
          ...DEFAULT_JOBSEEKER_PROFILE,
          ...stored,
          firstname: stored.firstname || user.firstname || "",
          lastname: stored.lastname || user.lastname || "",
          name: stored.name || user.name || "",
          birthdate: stored.birthdate || apiBirthdate,
        };
        writeJobseekerProfile(user.id, seeded);
        setJobseekerProfile(seeded);
      } else {
        setJobseekerProfile(DEFAULT_JOBSEEKER_PROFILE);
      }
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
        applyUser(user);
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
      applyUser(user);
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
      const user = await signUpWithEmail(nextEmail.trim(), password, nextRole, {
        firstname,
        lastname,
        birthdate,
      });
      applyUser({
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
    (patch: Partial<JobseekerProfile>) => {
      setJobseekerProfile((current) => {
        const next = { ...current, ...patch };
        if (userId) {
          writeJobseekerProfile(userId, next);
        }
        return next;
      });
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
