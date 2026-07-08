import { Context } from "koishi";
import type { Config } from "../config";
declare function ensureDirs(): void;
declare function generateThumbnails(ctx: Context, options?: {
    inputDir?: string;
    colorDir?: string;
    grayDir?: string;
    width?: number;
    height?: number;
}): Promise<{
    colorFiles: string[];
    colorDir: string;
    grayDir: string;
}>;
declare function clearAlbumCache(): void;
declare function generateMixedBackgroundImage(ctx: Context, config: Config, colorImageNames: string[], options?: {
    cacheKey?: string;
}): Promise<Buffer<ArrayBufferLike>>;
declare const _default: {
    ensureDirs: typeof ensureDirs;
    generateThumbnails: typeof generateThumbnails;
    generateMixedBackgroundImage: typeof generateMixedBackgroundImage;
    clearAlbumCache: typeof clearAlbumCache;
};
export default _default;
