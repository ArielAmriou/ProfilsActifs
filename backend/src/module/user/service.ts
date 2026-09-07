import type { UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const PAGE_SIZE = 20;

export interface UserSummary {
  id: string;
  firstname: string;
  lastname: string;
  name: string;
  image: string | null;
  role: UserRole;
}

export interface UserFeed {
  items: UserSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function getUserFeed(page: number): Promise<UserFeed> {
  const [items, total] = await Promise.all([
    prisma.users.findMany({
      select: { id: true, firstname: true, lastname: true, name: true, image: true, role: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.users.count(),
  ]);

  return {
    items,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
