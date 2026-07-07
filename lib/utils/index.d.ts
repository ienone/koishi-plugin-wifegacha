import { createUserData } from "./createUserData";
import { createGroupData } from "./createGroupData";
import { createGroupWifeData } from "./createGroupWifeData";
import { createTarget } from "./createTarget";
import { checkGroupDate } from "./getWifeName";
import { affectionLevel } from "./affectionLevel";
import { getRandomWavFile } from "./getWavFlieName";
import { createWifeData } from "./createWifeData";
import { upWifeData } from "./upWifeData";
import { createInteraction } from "./createInteraction";
import readImageAsBinarySync from "./readImageAsBinarySync";
import { isSameDay } from "./isSameDay";
import { camelCase } from "./camelCase";
declare const _default: {
    createUserData: typeof createUserData;
    createGroupData: typeof createGroupData;
    createGroupWifeData: typeof createGroupWifeData;
    createTarget: typeof createTarget;
    checkGroupDate: typeof checkGroupDate;
    affectionLevel: typeof affectionLevel;
    getRandomWavFile: typeof getRandomWavFile;
    createWifeData: typeof createWifeData;
    upWifeData: typeof upWifeData;
    sprit: {
        ensureDirs: () => void;
        generateThumbnails: (ctx: import("koishi").Context, options?: {
            inputDir?: string;
            colorDir?: string;
            grayDir?: string;
            width?: number;
            height?: number;
        }) => Promise<{
            colorFiles: string[];
            colorDir: string;
            grayDir: string;
        }>;
        generateMixedBackgroundImage: (ctx: import("koishi").Context, config: import("../config").Config, colorImageNames: any, options?: {
            backgroundPath?: string;
            colorDir?: string;
            grayDir?: string;
            imageSize?: number;
            gridWidth?: number;
            padding?: number;
        }) => Promise<Buffer<ArrayBufferLike>>;
    };
    createInteraction: typeof createInteraction;
    readImageAsBinarySync: typeof readImageAsBinarySync;
    isSameDay: typeof isSameDay;
    camelCase: typeof camelCase;
};
export default _default;
