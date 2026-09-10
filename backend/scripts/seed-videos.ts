import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { prisma } from "../src/lib/prisma";
import { videoFileSize } from "../src/module/video/storage";
import { replaceUserVideo } from "../src/module/video/service";

const TARGET = Number(process.env.SEED_VIDEO_TARGET ?? 300);
const CACHE_DIR = resolve(process.env.SEED_VIDEO_CACHE ?? "var/seed-sources");

const SOURCES = [
  "https://assets.mixkit.co/active_storage/video_items/100018/1718919251/100018-video-720.mp4",
  "https://assets.mixkit.co/active_storage/video_items/100343/1723061803/100343-video-720.mp4",
  "https://assets.mixkit.co/active_storage/video_items/100344/1723061858/100344-video-720.mp4",
  "https://assets.mixkit.co/active_storage/video_items/100355/1723572868/100355-video-720.mp4",
  "https://assets.mixkit.co/active_storage/video_items/100513/1725310200/100513-video-720.mp4",
  "https://assets.mixkit.co/active_storage/video_items/100607/1730159956/100607-video-720.mp4",
];

async function fileSize(path: string): Promise<number> {
  try {
    return (await stat(path)).size;
  } catch {
    return 0;
  }
}

async function loadSources(): Promise<Buffer[]> {
  await mkdir(CACHE_DIR, { recursive: true });
  const buffers: Buffer[] = [];

  for (const url of SOURCES) {
    const path = join(CACHE_DIR, url.split("/").pop()!);

    if ((await fileSize(path)) === 0) {
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`  source indisponible, ignorée: ${url}`);
        continue;
      }
      await writeFile(path, Buffer.from(await response.arrayBuffer()));
    }

    buffers.push(await readFile(path));
  }

  return buffers;
}

async function hasPayload(userId: string): Promise<boolean> {
  const video = await prisma.videos.findUnique({ where: { userId } });
  if (!video || video.providerName !== "local") {
    return false;
  }
  return (await videoFileSize(video.providerId)) !== null;
}

async function main(): Promise<void> {
  console.log(`Seed vidéo via VideoProvider (cible: ${TARGET})`);

  const jobseekers = await prisma.users.findMany({
    where: { role: "jobseeker" },
    select: { id: true, email: true },
    orderBy: { email: "asc" },
    take: TARGET,
  });

  console.log(`  candidats retenus: ${jobseekers.length}`);

  const sources = await loadSources();
  if (sources.length === 0) {
    throw new Error("Aucune vidéo source n'a pu être récupérée.");
  }
  console.log(`  sources chargées: ${sources.length}`);

  let stored = 0;
  let skipped = 0;

  for (const [index, jobseeker] of jobseekers.entries()) {
    if (await hasPayload(jobseeker.id)) {
      skipped += 1;
      continue;
    }

    await replaceUserVideo(jobseeker.id, {
      filename: `presentation-${index + 1}.mp4`,
      mimeType: "video/mp4",
      data: sources[index % sources.length]!,
    });

    stored += 1;
    if (stored % 50 === 0) {
      console.log(`  ${stored} vidéos déposées`);
    }
  }

  const ready = await prisma.videos.count({ where: { status: "READY" } });
  console.log(`\nDéposées: ${stored} | déjà présentes: ${skipped} | total READY en base: ${ready}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
