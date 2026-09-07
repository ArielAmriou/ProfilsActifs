import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";
import { prisma } from "../lib/prisma";

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
    },
  },
});
