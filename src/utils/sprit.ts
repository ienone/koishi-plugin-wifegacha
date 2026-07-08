import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { Context } from "koishi";
import type { Config } from "../config";

let inputDir = "";
if (path.join(__dirname).split("\\").pop() === "utils") {
  inputDir = path.join(__dirname, "../../../..", "data/assets/wifegacha");
} else {
  inputDir = path.join(__dirname, "../../..", "data/assets/wifegacha");
}

let resizedDir = "";
if (path.join(__dirname).split("\\").pop() === "utils") {
  resizedDir = path.join(__dirname, "../../../..", "data/assets/resized");
} else {
  resizedDir = path.join(__dirname, "../../..", "data/assets/resized");
}
const colorDir = path.join(resizedDir, "color");
const grayDir = path.join(resizedDir, "gray");
const manifestPath = path.join(resizedDir, "manifest.json");

let renderMixDir = "";
if (path.join(__dirname).split("\\").pop() === "utils") {
  renderMixDir = path.join(__dirname, "../../../..", "data/assets/render_mix");
} else {
  renderMixDir = path.join(__dirname, "../../..", "data/assets/render_mix");
}

const backgroundImagePath = path.join(__dirname, "bj.png");
const tileWidth = 80;
const border = 2;
const padding = 3;
const gridWidth = 567;

type Manifest = Record<string, { mtimeMs: number; size: number; outputName: string }>;
type AlbumCell = { file: string; baseName: string; top: number; left: number };
type AlbumLayout = { cells: AlbumCell[]; maxHeight: number; totalHeight: number; baseKey: string };

function ensureDirs() {
  for (const dir of [resizedDir, colorDir, grayDir, renderMixDir]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function readManifest(): Manifest {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return {};
  }
}

function writeManifest(manifest: Manifest) {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
}

function outputName(file: string) {
  return `${path.parse(file).name}.png`;
}

function pruneUntrackedThumbs(dirs: string[], liveOutputs: Set<string>) {
  let removed = 0;
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!/\.(png|jpe?g)$/i.test(file)) continue;
      if (liveOutputs.has(file)) continue;
      fs.unlinkSync(path.join(dir, file));
      removed += 1;
    }
  }
  return removed;
}

function baseNameFromThumb(file: string, config: Config) {
  return path.parse(file).name.split(config.wifeNameSeparator)[1] ?? path.parse(file).name;
}

async function writeThumbs(inputPath: string, colorOut: string, grayOut: string, width: number) {
  const base = sharp(inputPath).resize({ width, fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } });
  await base.clone()
    .extend({ top: 2, bottom: 2, left: 2, right: 2, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(colorOut);
  await base.clone()
    .grayscale()
    .extend({ top: 2, bottom: 2, left: 2, right: 2, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(grayOut);
}

async function generateThumbnails(ctx: Context, options: {
  inputDir?: string;
  colorDir?: string;
  grayDir?: string;
  width?: number;
  height?: number;
} = {}): Promise<{ colorFiles: string[]; colorDir: string; grayDir: string }> {
  const inDir = options.inputDir ?? inputDir;
  const colDir = options.colorDir ?? colorDir;
  const grayOutDir = options.grayDir ?? grayDir;
  const width = options.width ?? tileWidth;
  ensureDirs();

  const manifest = readManifest();
  const files = fs.existsSync(inDir) ? fs.readdirSync(inDir).filter((name) => /\.(png|jpe?g)$/i.test(name)).sort() : [];
  const live = new Set(files);
  const liveOutputs = new Set(files.map(outputName));
  let updated = 0;

  for (const oldFile of Object.keys(manifest)) {
    if (!live.has(oldFile)) {
      for (const dir of [colDir, grayOutDir]) {
        const target = path.join(dir, manifest[oldFile].outputName);
        if (fs.existsSync(target)) fs.unlinkSync(target);
      }
      delete manifest[oldFile];
      updated += 1;
    }
  }
  updated += pruneUntrackedThumbs([colDir, grayOutDir], liveOutputs);

  for (const file of files) {
    const inputPath = path.join(inDir, file);
    const stat = fs.statSync(inputPath);
    const out = outputName(file);
    const colorOut = path.join(colDir, out);
    const grayOut = path.join(grayOutDir, out);
    const cached = manifest[file];
    const stale = !cached || cached.mtimeMs !== stat.mtimeMs || cached.size !== stat.size || !fs.existsSync(colorOut) || !fs.existsSync(grayOut);
    if (!stale) continue;
    await writeThumbs(inputPath, colorOut, grayOut, width);
    manifest[file] = { mtimeMs: stat.mtimeMs, size: stat.size, outputName: out };
    updated += 1;
  }

  writeManifest(manifest);
  if (updated > 0) clearAlbumCache();
  ctx.logger.info(`[wifegacha] thumbnails ready, updated ${updated}`);
  return { colorFiles: files.map(outputName), colorDir: colDir, grayDir: grayOutDir };
}

function clearAlbumCache() {
  ensureDirs();
  for (const file of fs.readdirSync(renderMixDir)) {
    if (/^(album|gray-base)-.*\.(jpe?g|png|json)$/i.test(file)) fs.unlinkSync(path.join(renderMixDir, file));
  }
}

function hash(value: string) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 20);
}

async function readThumb(file: string, useColor: boolean) {
  const imgPath = path.join(useColor ? colorDir : grayDir, file);
  const buffer = await sharp(imgPath)
    .resize({ width: tileWidth, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const meta = await sharp(buffer).metadata();
  return { buffer, width: meta.width ?? tileWidth, height: meta.height ?? tileWidth };
}

async function makeTile(file: string, useColor: boolean, maxHeight: number) {
  const thumb = await readThumb(file, useColor);
  const topPad = Math.floor((maxHeight - thumb.height) / 2);
  let region = await sharp({
    create: {
      width: tileWidth,
      height: maxHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  }).png().toBuffer();
  region = await sharp(region)
    .composite([{ input: thumb.buffer, top: topPad, left: 0 }])
    .png()
    .toBuffer();
  return sharp(region)
    .extend({ top: border, bottom: border, left: border, right: border, background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toBuffer();
}

async function createAlbumLayout(config: Config, quality: number): Promise<AlbumLayout> {
  const grayFiles = fs.readdirSync(grayDir).filter((file) => /\.(png|jpe?g)$/i.test(file)).sort();
  const metas = await Promise.all(grayFiles.map(async (file) => ({ file, meta: await readThumb(file, false) })));
  const maxHeight = Math.max(...metas.map((item) => item.meta.height), tileWidth);
  const tileOuter = tileWidth + border * 2;
  const cols = Math.max(1, Math.floor(gridWidth / (tileOuter + padding)));
  const cells: AlbumCell[] = [];
  let y = 10;

  for (let row = 0; row < Math.ceil(metas.length / cols); row++) {
    const rowItems = metas.slice(row * cols, (row + 1) * cols);
    const rowWidth = rowItems.length * tileOuter + Math.max(0, rowItems.length - 1) * padding;
    let x = Math.floor((gridWidth - rowWidth) / 2);
    for (const item of rowItems) {
      cells.push({ file: item.file, baseName: baseNameFromThumb(item.file, config), top: y, left: x });
      x += tileOuter + padding;
    }
    y += maxHeight + border * 2 + padding;
  }

  const totalHeight = Math.max(120, y + 10 - padding);
  const manifestVersion = fs.existsSync(manifestPath) ? fs.statSync(manifestPath).mtimeMs : 0;
  const baseKey = hash(`${manifestVersion}:${grayFiles.join("|")}:${quality}:${gridWidth}:${totalHeight}:${maxHeight}`);
  return { cells, maxHeight, totalHeight, baseKey };
}

async function ensureGrayBaseImage(ctx: Context, config: Config, layout: AlbumLayout, quality: number) {
  const basePath = path.join(renderMixDir, `gray-base-${layout.baseKey}.jpg`);
  const layoutPath = path.join(renderMixDir, `gray-base-${layout.baseKey}.json`);
  if (fs.existsSync(basePath) && fs.existsSync(layoutPath)) return basePath;

  const composites = await Promise.all(layout.cells.map(async (cell) => ({
    input: await makeTile(cell.file, false, layout.maxHeight),
    top: cell.top,
    left: cell.left,
  })));
  const bgResized = await sharp(backgroundImagePath).resize({ width: gridWidth, height: layout.totalHeight }).toBuffer();
  const buffer = await sharp(bgResized).composite(composites).jpeg({ quality }).toBuffer();
  fs.writeFileSync(basePath, buffer);
  fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2), "utf8");
  ctx.logger.info("[wifegacha] gray base album generated", buffer.length);
  return basePath;
}

async function generateMixedBackgroundImage(ctx: Context, config: Config, colorImageNames: string[], options: { cacheKey?: string } = {}) {
  ensureDirs();
  await generateThumbnails(ctx);
  const normalized = new Set([...new Set(colorImageNames)].sort());
  const layout = await createAlbumLayout(config, config.wifeImageQuality);
  const key = options.cacheKey ?? hash(`${layout.baseKey}:${[...normalized].join("|")}:${config.wifeImageQuality}`);
  const outPath = path.join(renderMixDir, `album-${key}.jpg`);
  if (fs.existsSync(outPath)) return fs.readFileSync(outPath);

  const basePath = await ensureGrayBaseImage(ctx, config, layout, config.wifeImageQuality);
  const overlays = await Promise.all(layout.cells
    .filter((cell) => normalized.has(cell.baseName))
    .map(async (cell) => ({
      input: await makeTile(cell.file, true, layout.maxHeight),
      top: cell.top,
      left: cell.left,
    })));

  const buffer = overlays.length
    ? await sharp(basePath).composite(overlays).jpeg({ quality: config.wifeImageQuality }).toBuffer()
    : fs.readFileSync(basePath);
  fs.writeFileSync(outPath, buffer);
  ctx.logger.info("[wifegacha] album generated from gray base", buffer.length);
  return buffer;
}

export default {
  ensureDirs,
  generateThumbnails,
  generateMixedBackgroundImage,
  clearAlbumCache,
};