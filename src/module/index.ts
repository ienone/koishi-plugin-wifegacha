import { Context } from "koishi";
import type { Config } from "../config";
import { wifeUser } from "./wifeUser";
import { wifeData } from "./wifeData";
import { groupData } from "./groupData";

export async function module(ctx: Context, config: Config) {
  wifeUser(ctx, config);
  wifeData(ctx, config);
  groupData(ctx, config);
}
