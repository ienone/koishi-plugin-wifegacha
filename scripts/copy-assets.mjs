import { cp, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const sourceRoot = path.resolve("src");
const targetRoot = path.resolve("lib");
const assetExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".wav"]);

async function copyAssets(sourceDir) {
  for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    if (entry.isDirectory()) {
      await copyAssets(sourcePath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!assetExtensions.has(ext)) continue;

    const relative = path.relative(sourceRoot, sourcePath);
    const targetPath = path.join(targetRoot, relative);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await cp(sourcePath, targetPath);
  }
}

await stat(sourceRoot);
await mkdir(targetRoot, { recursive: true });
await copyAssets(sourceRoot);