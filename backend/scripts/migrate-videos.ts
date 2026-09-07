import { randomUUID } from "node:crypto";
import { LEGACY_PROVIDER_NAME, videoConfig } from "../src/config/video";
import { prisma } from "../src/lib/prisma";
import { legacyMimeType, readLegacyFile, removeLegacyFile, resolveLegacyPath } from "../src/module/video/legacy";
import { writeVideoFile } from "../src/module/video/storage";
import { collectCounts, printCounts } from "./video-migration-report";

const LOCAL_PROVIDER_NAME = "local";

interface Outcome {
  migrated: number;
  missing: number;
  skipped: number;
}

async function migrateRow(id: string, legacyLink: string): Promise<keyof Outcome> {
  const legacyPath = resolveLegacyPath(legacyLink);

  if (!legacyPath) {
    console.log(`  ${id}  ${legacyLink}  -> skipped (not a local file)`);
    await prisma.videos.update({ where: { id }, data: { status: "ERROR" } });
    return "skipped";
  }

  const data = await readLegacyFile(legacyPath);

  if (!data) {
    console.log(`  ${id}  ${legacyLink}  -> missing bytes on disk`);
    await prisma.videos.update({ where: { id }, data: { status: "ERROR" } });
    return "missing";
  }

  const providerId = randomUUID();
  await writeVideoFile(providerId, data, legacyMimeType(legacyLink));

  await prisma.videos.update({
    where: { id },
    data: { providerName: LOCAL_PROVIDER_NAME, providerId, status: "READY" },
  });

  await removeLegacyFile(legacyPath);
  console.log(`  ${id}  ${legacyLink}  -> ${LOCAL_PROVIDER_NAME}/${providerId}  READY  (${data.byteLength} bytes)`);
  return "migrated";
}

async function main(): Promise<void> {
  console.log("Video migration: legacy file paths -> opaque provider identifiers");
  console.log(`  storage : ${videoConfig.storagePath}`);
  console.log(`  legacy  : ${videoConfig.legacyRoot}`);
  console.log("");

  printCounts("Before", await collectCounts());

  const pending = await prisma.videos.findMany({
    where: { providerName: LEGACY_PROVIDER_NAME },
    select: { id: true, providerId: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Legacy rows to process: ${pending.length}`);

  const outcome: Outcome = { migrated: 0, missing: 0, skipped: 0 };

  for (const row of pending) {
    outcome[await migrateRow(row.id, row.providerId)] += 1;
  }

  console.log("");
  printCounts("After", await collectCounts());

  console.log(
    `Processed ${pending.length} row(s): ${outcome.migrated} migrated, ${outcome.missing} missing bytes, ${outcome.skipped} skipped`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
