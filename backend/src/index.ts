import { start } from "./server";

if (import.meta.main) {
  await start();
}