import { Context } from "koishi";
import type { Config } from "../config";
export interface WifeData {
    id: number;
    name: string;
    comeFrom: string;
    filepath: string;
    createdAt: Date;
    updatedAt: Date;
    groupData: Array<{
        groupId: string;
        drawCount: number;
        ntrCount: number;
        fuckCount: number;
        divorceCount: number;
        ntrFailCount: number;
    }>;
}
declare module "koishi" {
    interface Tables {
        wifeData: WifeData;
    }
}
export declare function wifeData(ctx: Context, config: Config): void;
