import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.VIDEO_STORAGE_PATH = mkdtempSync(join(tmpdir(), "profilsactifs-videos-"));
process.env.BETTER_AUTH_URL = "http://localhost:8081";
