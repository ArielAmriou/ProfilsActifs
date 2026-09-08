import { apiFetch, ApiError } from "@/lib/api";
import { isUserRole, type UserRole } from "@/types/auth";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firstname?: string;
  lastname?: string;
  birthdate?: string;
}

interface ApiUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  firstname?: string;
  lastname?: string;
  birthdate?: string | Date;
}

function mapUser(user: ApiUser): AuthUser {
  const firstname = user.firstname ?? "";
  const lastname = user.lastname ?? "";
  const name =
    user.name?.trim() ||
    `${firstname} ${lastname}`.trim() ||
    user.email;

  const role = isUserRole(user.role) ? user.role : "jobseeker";
  const birthdate =
    typeof user.birthdate === "string"
      ? user.birthdate
      : user.birthdate instanceof Date
        ? user.birthdate.toISOString()
        : undefined;

  return {
    id: user.id,
    email: user.email,
    name,
    role,
    firstname: user.firstname,
    lastname: user.lastname,
    birthdate,
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
  profile: {
    firstname: string;
    lastname: string;
    name?: string;
    birthdate: string;
    cguAccepted: boolean;
  },
): Promise<AuthUser> {
  const firstname = profile.firstname.trim();
  const lastname = profile.lastname.trim();
  if (!firstname || !lastname) {
    throw new Error("Le prénom et le nom sont obligatoires.");
  }

  if (!profile.cguAccepted) {
    throw new Error(
      "Vous devez accepter les Conditions Générales d'Utilisation pour créer un compte.",
    );
  }

  const localPart = email.split("@")[0]?.trim() || "utilisateur";
  const name = profile.name?.trim() || `${firstname} ${lastname}`.trim() || localPart;
  const birthdateRaw = profile.birthdate.trim();
  if (!birthdateRaw) {
    throw new Error("La date de naissance est obligatoire.");
  }

  const birthdateDate = new Date(`${birthdateRaw}T00:00:00.000Z`);
  if (Number.isNaN(birthdateDate.getTime())) {
    throw new Error("La date de naissance est invalide.");
  }

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
        birthdate: birthdateDate.toISOString(),
        cguAcceptedAt: new Date().toISOString(),
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
