import { apiFetch, ApiError } from "@/lib/api";
import { isUserRole, type UserRole } from "@/types/auth";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firstname?: string;
  lastname?: string;
}

interface ApiUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  firstname?: string;
  lastname?: string;
}

function mapUser(user: ApiUser): AuthUser {
  const firstname = user.firstname ?? "";
  const lastname = user.lastname ?? "";
  const name =
    user.name?.trim() ||
    `${firstname} ${lastname}`.trim() ||
    user.email;

  const role = isUserRole(user.role) ? user.role : "jobseeker";

  return {
    id: user.id,
    email: user.email,
    name,
    role,
    firstname: user.firstname,
    lastname: user.lastname,
  };
}

function extractUserPayload(data: unknown): ApiUser | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const record = data as Record<string, unknown>;
  if (record.user && typeof record.user === "object") {
    return record.user as ApiUser;
  }
  if (typeof record.id === "string" && typeof record.email === "string") {
    return record as unknown as ApiUser;
  }
  return null;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const data = await apiFetch<{ user: ApiUser }>("/api/me");
    return mapUser(data.user);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    return null;
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthUser> {
  const data = await apiFetch<unknown>("/api/auth/sign-in/email", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const fromBody = extractUserPayload(data);
  if (fromBody?.id && fromBody.email && isUserRole(fromBody.role)) {
    return mapUser(fromBody);
  }

  const user = await fetchCurrentUser();
  if (!user) {
    throw new Error(
      "Connexion réussie mais session introuvable. Vérifiez que le backend tourne sur :8081.",
    );
  }
  return user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  role: UserRole,
  profile?: { firstname?: string; lastname?: string; name?: string },
): Promise<AuthUser> {
  const localPart = email.split("@")[0]?.trim() || "utilisateur";
  const firstname = profile?.firstname?.trim() || localPart;
  const lastname =
    profile?.lastname?.trim() || (role === "recruiter" ? "Recruiter" : "Jobseeker");
  const name = profile?.name?.trim() || localPart;

  try {
    const data = await apiFetch<unknown>("/api/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name,
        firstname,
        lastname,
        role,
        birthdate: "2000-01-01T00:00:00.000Z",
      }),
    });

    const fromBody = extractUserPayload(data);
    if (fromBody?.id && fromBody.email && isUserRole(fromBody.role)) {
      return mapUser(fromBody);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || "Impossible de créer le compte.");
    }
    throw error;
  }

  let user = await fetchCurrentUser();
  if (!user) {
    user = await signInWithEmail(email, password);
  }
  return user;
}

export async function signOut(): Promise<void> {
  try {
    await apiFetch("/api/auth/sign-out", {
      method: "POST",
      body: JSON.stringify({}),
    });
  } catch {
    // On nettoie l'état UI même si l'API échoue
  }
}
