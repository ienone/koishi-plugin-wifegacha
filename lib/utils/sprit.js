"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
let inputDir = "";
if (path_1.default.join(__dirname).split("\\").pop() === "utils") {
    inputDir = path_1.default.join(__dirname, "../../../..", "data/assets/wifegacha");
}
else {
    inputDir = path_1.default.join(__dirname, "../../..", "data/assets/wifegacha");
}
let resizedDir = "";
if (path_1.default.join(__dirname).split("\\").pop() === "utils") {
    resizedDir = path_1.default.join(__dirname, "../../../..", "data/assets/resized");
}
else {
    resizedDir = path_1.default.join(__dirname, "../../..", "data/assets/resized");
}
const colorDir = path_1.default.join(resizedDir, "color");
const grayDir = path_1.default.join(resizedDir, "gray");
const manifestPath = path_1.default.join(resizedDir, "manifest.json");
let renderMixDir = "";
if (path_1.default.join(__dirname).split("\\").pop() === "utils") {
    renderMixDir = path_1.default.join(__dirname, "../../../..", "data/assets/render_mix");
}
else {
    renderMixDir = path_1.default.join(__dirname, "../../..", "data/assets/render_mix");
}
const backgroundImagePath = path_1.default.join(__dirname, "bj.png");
const tileWidth = 80;
const border = 2;
const padding = 3;
const gridWidth = 567;
function ensureDirs() {
    for (const dir of [resizedDir, colorDir, grayDir, renderMixDir]) {
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
    }
}
function readManifest() {
    try {
        return JSON.parse(fs_1.default.readFileSync(manifestPath, "utf8"));
    }
    catch {
        return {};
    }
}
function writeManifest(manifest) {
    fs_1.default.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
}
function outputName(file) {
    return `${path_1.default.parse(file).name}.png`;
}
function baseNameFromThumb(file, config) {
    return path_1.default.parse(file).name.split(config.wifeNameSeparator)[1] ?? path_1.default.parse(file).name;
}
async function writeThumbs(inputPath, colorOut, grayOut, width) {
    const base = (0, sharp_1.default)(inputPath).resize({ width, fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } });
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
async function generateThumbnails(ctx, options = {}) {
    const inDir = options.inputDir ?? inputDir;
    const colDir = options.colorDir ?? colorDir;
    const grayOutDir = options.grayDir ?? grayDir;
    const width = options.width ?? tileWidth;
    ensureDirs();
    const manifest = readManifest();
    const files = fs_1.default.existsSync(inDir) ? fs_1.default.readdirSync(inDir).filter((name) => /\.(png|jpe?g)$/i.test(name)).sort() : [];
    const live = new Set(files);
    let updated = 0;
    for (const oldFile of Object.keys(manifest)) {
        if (!live.has(oldFile)) {
            for (const dir of [colDir, grayOutDir]) {
                const target = path_1.default.join(dir, manifest[oldFile].outputName);
                if (fs_1.default.existsSync(target))
                    fs_1.default.unlinkSync(target);
            }
            delete manifest[oldFile];
            updated += 1;
        }
    }
    for (const file of files) {
        const inputPath = path_1.default.join(inDir, file);
        const stat = fs_1.default.statSync(inputPath);
        const out = outputName(file);
        const colorOut = path_1.default.join(colDir, out);
        const grayOut = path_1.default.join(grayOutDir, out);
        const cached = manifest[file];
        const stale = !cached || cached.mtimeMs !== stat.mtimeMs || cached.size !== stat.size || !fs_1.default.existsSync(colorOut) || !fs_1.default.existsSync(grayOut);
        if (!stale)
            continue;
        await writeThumbs(inputPath, colorOut, grayOut, width);
        manifest[file] = { mtimeMs: stat.mtimeMs, size: stat.size, outputName: out };
        updated += 1;
    }
    writeManifest(manifest);
    if (updated > 0)
        clearAlbumCache();
    ctx.logger.info(`[wifegacha] thumbnails ready, updated ${updated}`);
    return { colorFiles: files.map(outputName), colorDir: colDir, grayDir: grayOutDir };
}
function clearAlbumCache() {
    ensureDirs();
    for (const file of fs_1.default.readdirSync(renderMixDir)) {
        if (/^(album|gray-base)-.*\.(jpe?g|png|json)$/i.test(file))
            fs_1.default.unlinkSync(path_1.default.join(renderMixDir, file));
    }
}
function hash(value) {
    return crypto_1.default.createHash("sha1").update(value).digest("hex").slice(0, 20);
}
async function readThumb(file, useColor) {
    const imgPath = path_1.default.join(useColor ? colorDir : grayDir, file);
    const buffer = await (0, sharp_1.default)(imgPath)
        .resize({ width: tileWidth, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    const meta = await (0, sharp_1.default)(buffer).metadata();
    return { buffer, width: meta.width ?? tileWidth, height: meta.height ?? tileWidth };
}
async function makeTile(file, useColor, maxHeight) {
    const thumb = await readThumb(file, useColor);
    const topPad = Math.floor((maxHeight - thumb.height) / 2);
    let region = await (0, sharp_1.default)({
        create: {
            width: tileWidth,
            height: maxHeight,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
    }).png().toBuffer();
    region = await (0, sharp_1.default)(region)
        .composite([{ input: thumb.buffer, top: topPad, left: 0 }])
        .png()
        .toBuffer();
    return (0, sharp_1.default)(region)
        .extend({ top: border, bottom: border, left: border, right: border, background: { r: 0, g: 0, b: 0, alpha: 1 } })
        .png()
        .toBuffer();
}
async function createAlbumLayout(config, quality) {
    const grayFiles = fs_1.default.readdirSync(grayDir).filter((file) => /\.(png|jpe?g)$/i.test(file)).sort();
    const metas = await Promise.all(grayFiles.map(async (file) => ({ file, meta: await readThumb(file, false) })));
    const maxHeight = Math.max(...metas.map((item) => item.meta.height), tileWidth);
    const tileOuter = tileWidth + border * 2;
    const cols = Math.max(1, Math.floor(gridWidth / (tileOuter + padding)));
    const cells = [];
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
    const manifestVersion = fs_1.default.existsSync(manifestPath) ? fs_1.default.statSync(manifestPath).mtimeMs : 0;
    const baseKey = hash(`${manifestVersion}:${grayFiles.join("|")}:${quality}:${gridWidth}:${totalHeight}:${maxHeight}`);
    return { cells, maxHeight, totalHeight, baseKey };
}
async function ensureGrayBaseImage(ctx, config, layout, quality) {
    const basePath = path_1.default.join(renderMixDir, `gray-base-${layout.baseKey}.jpg`);
    const layoutPath = path_1.default.join(renderMixDir, `gray-base-${layout.baseKey}.json`);
    if (fs_1.default.existsSync(basePath) && fs_1.default.existsSync(layoutPath))
        return basePath;
    const composites = await Promise.all(layout.cells.map(async (cell) => ({
        input: await makeTile(cell.file, false, layout.maxHeight),
        top: cell.top,
        left: cell.left,
    })));
    const bgResized = await (0, sharp_1.default)(backgroundImagePath).resize({ width: gridWidth, height: layout.totalHeight }).toBuffer();
    const buffer = await (0, sharp_1.default)(bgResized).composite(composites).jpeg({ quality }).toBuffer();
    fs_1.default.writeFileSync(basePath, buffer);
    fs_1.default.writeFileSync(layoutPath, JSON.stringify(layout, null, 2), "utf8");
    ctx.logger.info("[wifegacha] gray base album generated", buffer.length);
    return basePath;
}
async function generateMixedBackgroundImage(ctx, config, colorImageNames, options = {}) {
    ensureDirs();
    await generateThumbnails(ctx);
    const normalized = new Set([...new Set(colorImageNames)].sort());
    const layout = await createAlbumLayout(config, config.wifeImageQuality);
    const key = options.cacheKey ?? hash(`${layout.baseKey}:${[...normalized].join("|")}:${config.wifeImageQuality}`);
    const outPath = path_1.default.join(renderMixDir, `album-${key}.jpg`);
    if (fs_1.default.existsSync(outPath))
        return fs_1.default.readFileSync(outPath);
    const basePath = await ensureGrayBaseImage(ctx, config, layout, config.wifeImageQuality);
    const overlays = await Promise.all(layout.cells
        .filter((cell) => normalized.has(cell.baseName))
        .map(async (cell) => ({
        input: await makeTile(cell.file, true, layout.maxHeight),
        top: cell.top,
        left: cell.left,
    })));
    const buffer = overlays.length
        ? await (0, sharp_1.default)(basePath).composite(overlays).jpeg({ quality: config.wifeImageQuality }).toBuffer()
        : fs_1.default.readFileSync(basePath);
    fs_1.default.writeFileSync(outPath, buffer);
    ctx.logger.info("[wifegacha] album generated from gray base", buffer.length);
    return buffer;
}
exports.default = {
    ensureDirs,
    generateThumbnails,
    generateMixedBackgroundImage,
    clearAlbumCache,
};
