import { Context } from 'koishi';
import type { Config } from '../config';
declare function ensureDirs(): void;
/**
 * 生成彩色和灰度缩略图
 * @param {Object} options - 配置选项
 * @param {string} options.inputDir - 输入目录路径
 * @param {string} options.colorDir - 彩色缩略图输出目录
 * @param {string} options.grayDir - 灰度缩略图输出目录
 * @param {number} options.width - 缩略图宽度
 * @param {number} options.height - 缩略图高度
 * @returns {Promise<void>}
 */
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
/**
 * 生成带背景混合图
 * @param {string[]} colorImageNames - 需要使用彩色版本的图片名称数组
 * @param {Object} options - 配置选项
 * @param {string} options.backgroundPath - 背景图片路径
 * @param {string} options.colorDir - 彩色图片目录
 * @param {string} options.grayDir - 灰度图片目录
 * @param {number} options.imageSize - 图片大小
 * @param {number} options.gridWidth - 网格宽度
 * @param {number} options.padding - 图片间距
 * @returns {Promise<Buffer>} 输出图片的Buffer
 */
declare function generateMixedBackgroundImage(ctx: Context, config: Config, colorImageNames: any, options?: {
    backgroundPath?: string;
    colorDir?: string;
    grayDir?: string;
    imageSize?: number;
    gridWidth?: number;
    padding?: number;
}): Promise<Buffer<ArrayBufferLike>>;
declare const _default: {
    /**
     * 初始化目录
     */
    ensureDirs: typeof ensureDirs;
    /**
     * 生成缩略图
     */
    generateThumbnails: typeof generateThumbnails;
    /**
     * 生成带背景混合图
     */
    generateMixedBackgroundImage: typeof generateMixedBackgroundImage;
};
export default _default;
