import { prisma } from "../src/lib/prisma";

export interface ProviderCount {
  providerName: string;
  status: string;
  count: number;
}

export async function collectCounts(): Promise<ProviderCount[]> {
  const groups = await prisma.videos.groupBy({
    by: ["providerName", "status"],
    _count: { _all: true },
  });

  return groups
    .map((group) => ({
      providerName: group.providerName,
      status: String(group.status),
      count: group._count._all,
    }))
    .sort((a, b) => `${a.providerName}${a.status}`.localeCompare(`${b.providerName}${b.status}`));
}

export function printCounts(label: string, counts: ProviderCount[]): void {
  const total = counts.reduce((sum, entry) => sum + entry.count, 0);
  console.log(`${label}:`);
  console.log(`  ${"total".padEnd(28)}${total}`);

  for (const entry of counts) {
    console.log(`  ${`${entry.providerName} / ${entry.status}`.padEnd(28)}${entry.count}`);
  }

  console.log("");
}
