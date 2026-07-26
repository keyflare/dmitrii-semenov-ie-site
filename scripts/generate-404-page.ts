import { copyFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export async function generate404Page(source: string, destination: string) {
  try {
    await copyFile(source, destination);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Missing React Router SPA fallback: ${source}`, { cause: error });
    }

    throw error;
  }
}

const entrypoint = process.argv[1];

if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  await generate404Page("build/client/__spa-fallback.html", "build/client/404.html");
  console.log("Generated build/client/404.html.");
}
