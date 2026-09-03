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
  DEFAULT_DEMANDEUR_PROFILE,
  DEMANDEUR_PROFILE_KEY,
  EMAIL_KEY,
  ROLE_KEY,
  type DemandeurProfile,
  type UserRole,
} from "@/types/auth";

interface AuthContextValue {
  isAuthenticated: boolean;
  role: UserRole | null;
  email: string | null;
  demandeurProfile: DemandeurProfile;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  updateDemandeurProfile: (patch: Partial<DemandeurProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readDemandeurProfile(): DemandeurProfile {
  if (typeof window === "undefined") {
    return DEFAULT_DEMANDEUR_PROFILE;
  }
  try {
    const stored = localStorage.getItem(DEMANDEUR_PROFILE_KEY);
    if (!stored) {
      return DEFAULT_DEMANDEUR_PROFILE;
    }
    return { ...DEFAULT_DEMANDEUR_PROFILE, ...JSON.parse(stored) } as DemandeurProfile;
  } catch {
    return DEFAULT_DEMANDEUR_PROFILE;
  }
}

function writeDemandeurProfile(profile: DemandeurProfile) {
  localStorage.setItem(DEMANDEUR_PROFILE_KEY, JSON.stringify(profile));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [demandeurProfile, setDemandeurProfile] = useState<DemandeurProfile>(
    DEFAULT_DEMANDEUR_PROFILE,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem(AUTH_KEY) === "true");
    const storedRole = localStorage.getItem(ROLE_KEY);
    setRole(storedRole === "recruteur" || storedRole === "demandeur" ? storedRole : null);
    setEmail(localStorage.getItem(EMAIL_KEY));
    setDemandeurProfile(readDemandeurProfile());
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
      const nextRole: UserRole =
        storedRole === "recruteur" || storedRole === "demandeur" ? storedRole : "recruteur";

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

      if (nextRole === "demandeur") {
        const profile = { ...DEFAULT_DEMANDEUR_PROFILE };
        writeDemandeurProfile(profile);
        setDemandeurProfile(profile);
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

  const updateDemandeurProfile = useCallback((patch: Partial<DemandeurProfile>) => {
    setDemandeurProfile((current) => {
      const next = { ...current, ...patch };
      writeDemandeurProfile(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: hydrated && isAuthenticated,
      role: hydrated ? role : null,
      email: hydrated ? email : null,
      demandeurProfile: hydrated ? demandeurProfile : DEFAULT_DEMANDEUR_PROFILE,
      login,
      register,
      logout,
      updateDemandeurProfile,
    }),
    [
      hydrated,
      isAuthenticated,
      role,
      email,
      demandeurProfile,
      login,
      register,
      logout,
      updateDemandeurProfile,
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
