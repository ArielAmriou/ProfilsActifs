import type { FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./better-auth";

export interface SessionUser {
  id: string;
  role: string;
}

export async function getSessionUser(request: FastifyRequest): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });

  if (!session?.user) {
    return null;
  }

  return { id: session.user.id, role: String(session.user.role ?? "") };
}
