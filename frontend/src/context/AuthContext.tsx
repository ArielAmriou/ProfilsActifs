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
  AUTH_KEY,
  DEFAULT_JOBSEEKER_PROFILE,
  EMAIL_KEY,
  JOBSEEKER_PROFILE_KEY,
  ROLE_KEY,
  isUserRole,
  type JobseekerProfile,
  type UserRole,
} from "@/types/auth";

interface AuthContextValue {
  isAuthenticated: boolean;
  role: UserRole | null;
  email: string | null;
  jobseekerProfile: JobseekerProfile;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  updateJobseekerProfile: (patch: Partial<JobseekerProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readJobseekerProfile(): JobseekerProfile {
  if (typeof window === "undefined") {
    return DEFAULT_JOBSEEKER_PROFILE;
  }
  try {
    const stored = localStorage.getItem(JOBSEEKER_PROFILE_KEY);
    if (!stored) {
      return DEFAULT_JOBSEEKER_PROFILE;
    }
    return { ...DEFAULT_JOBSEEKER_PROFILE, ...JSON.parse(stored) } as JobseekerProfile;
  } catch {
    return DEFAULT_JOBSEEKER_PROFILE;
  }
}

function writeJobseekerProfile(profile: JobseekerProfile) {
  localStorage.setItem(JOBSEEKER_PROFILE_KEY, JSON.stringify(profile));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [jobseekerProfile, setJobseekerProfile] = useState<JobseekerProfile>(
    DEFAULT_JOBSEEKER_PROFILE,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem(AUTH_KEY) === "true");
    const storedRole = localStorage.getItem(ROLE_KEY);
    setRole(isUserRole(storedRole) ? storedRole : null);
    setEmail(localStorage.getItem(EMAIL_KEY));
    setJobseekerProfile(readJobseekerProfile());
    setHydrated(true);
  }, []);

  const persistSession = useCallback(
    (nextEmail: string, nextRole: UserRole) => {
      localStorage.setItem(AUTH_KEY, "true");
      localStorage.setItem(ROLE_KEY, nextRole);
      localStorage.setItem(EMAIL_KEY, nextEmail.trim());
      setIsAuthenticated(true);
      setRole(nextRole);
      setEmail(nextEmail.trim());
    },
    [],
  );

  const login = useCallback(
    (nextEmail: string, password: string) => {
      if (!nextEmail.trim() || !password.trim()) {
        return false;
      }

      const storedRole = localStorage.getItem(ROLE_KEY);
      const nextRole: UserRole = isUserRole(storedRole) ? storedRole : "recruiter";

      persistSession(nextEmail, nextRole);
      return true;
    },
    [persistSession],
  );

  const register = useCallback(
    (nextEmail: string, password: string, nextRole: UserRole) => {
      if (!nextEmail.trim() || !password.trim()) {
        return false;
      }

      persistSession(nextEmail, nextRole);

      if (nextRole === "jobseeker") {
        const profile = { ...DEFAULT_JOBSEEKER_PROFILE };
        writeJobseekerProfile(profile);
        setJobseekerProfile(profile);
      }

      return true;
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setIsAuthenticated(false);
    setRole(null);
    setEmail(null);
  }, []);

  const updateJobseekerProfile = useCallback((patch: Partial<JobseekerProfile>) => {
    setJobseekerProfile((current) => {
      const next = { ...current, ...patch };
      writeJobseekerProfile(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: hydrated && isAuthenticated,
      role: hydrated ? role : null,
      email: hydrated ? email : null,
      jobseekerProfile: hydrated ? jobseekerProfile : DEFAULT_JOBSEEKER_PROFILE,
      login,
      register,
      logout,
      updateJobseekerProfile,
    }),
    [
      hydrated,
      isAuthenticated,
      role,
      email,
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
