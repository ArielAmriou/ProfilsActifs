import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";
import { prisma } from "../lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [openAPI()],
  user: {
    modelName: "users",
    additionalFields: {
      firstname: { type: "string", required: true },
      lastname: { type: "string", required: true },
      role: { type: "string", required: true },
      birthdate: { type: "date", required: true },
    },
  },
});
