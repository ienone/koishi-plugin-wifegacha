import { Context } from "koishi";
import type { Config } from "./config";
import { ConfigSchema } from "./config";
export declare const name = "wifegacha";
export declare const inject: string[];
export { ConfigSchema as Config };
export declare function apply(ctx: Context, config: Config): Promise<void>;
