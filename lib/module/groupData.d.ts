import { Context } from "koishi";
import type { Config } from "../config";
export interface GroupData {
    id: number;
    groupId: string;
    drawCount: number;
    ntrTotalCount: number;
    ntrSuccessCount: number;
    exchangeCount: number;
    divorceTotalCount: number;
    fuckTotalCount: number;
}
declare module "koishi" {
    interface Tables {
        groupData: GroupData;
    }
}
export declare function groupData(ctx: Context, config: Config): void;
