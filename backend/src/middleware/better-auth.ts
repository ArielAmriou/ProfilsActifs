import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import { prisma } from "../lib/prisma";
import { CGU_VERSION } from "../config/cgu";
import { isOfLegalWorkAge, UNDERAGE_MESSAGE } from "../lib/age";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Requis pour les appels navigateur depuis le front (CORS / cookies cross-origin).
  trustedOrigins: [process.env.FRONTEND_URL ?? "http://localhost:3000"],
  advanced: {
    database: {
      generateId: "uuid",
    },
    defaultCookieAttributes: {
      // localhost:3000 ↔ localhost:8081 = sites différents : cookies session cross-port.
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [openAPI()],
  user: {
    modelName: "users",
    additionalFields: {
      firstname: { type: "string", required: true, returned: true },
      lastname: { type: "string", required: true, returned: true },
      role: { type: "string", required: true, returned: true },
      birthdate: { type: "date", required: true, returned: true },
      organization: { type: "string", required: false, returned: true },
      cguAcceptedAt: { type: "date", required: false, returned: true },
      cguVersion: { type: "string", required: false, returned: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.cguAcceptedAt) {
            return false;
          }

          const birthdate =
            user.birthdate instanceof Date
              ? user.birthdate
              : user.birthdate
                ? new Date(String(user.birthdate))
                : null;

          if (!birthdate || Number.isNaN(birthdate.getTime())) {
            throw new APIError("BAD_REQUEST", {
              message: "La date de naissance est obligatoire.",
            });
          }

          if (!isOfLegalWorkAge(birthdate)) {
            throw new APIError("BAD_REQUEST", { message: UNDERAGE_MESSAGE });
          }

          const role = String(user.role ?? "");
          const organization =
            typeof user.organization === "string" ? user.organization.trim() : "";

          if (role === "recruiter" && !organization) {
            throw new APIError("BAD_REQUEST", {
              message: "L'organisation est obligatoire pour un compte recruteur.",
            });
          }

          return {
            data: {
              ...user,
              organization: role === "recruiter" ? organization : null,
              cguAcceptedAt: new Date(),
              cguVersion: CGU_VERSION,
            },
          };
        },
      },
    },
  },
});
