import { Context } from "koishi";
import type { Config } from "../config";

export interface WifeUser {
  id: number;
  userId: string;
  groupId: string;
  wifeName: string;
  operationDate: Date;
  ntrOrdinal: number;
  fuckWifeDate: Date;
  kissWifeDate: Date;
  dateWifeDate: Date;
  lpdaDate: Date;
  divorceDate: Date;
  affectionDecayDate: Date;
  drawBanUntil: Date;
  wifeHistories: Array<{
    wifeName: string;
    getWifeDate: Date;
    getNum: number;
    isNtr: boolean;
    ntrGetCount: number;
    exchangeGetCount: number;
    divorceCount: number;
    affection: number;
    affectionLevel: number;
    interactionLogs?: Array<{ action: string; delta: number; event: string; time: string }>;
    lastCurrentAt?: Date;
    leftCurrentAt?: Date;
  }>;
  interactionWithOtherUser: Array<{
    otherUserId: string;
    groupId: string;
    ntrCount: number;
    ntrSuccessCount: number;
    exchangeCount: number;
  }>;
  createdAt: Date;
  ntrCount: number;
  ntrTotalCount: number;
  ntrSuccessCount: number;
  drawCount: number;
  exchangeCount: number;
  divorceCount: number;
  totalAffection: number;
  currentWifeAffection: number;
  maxAffection: number;
  targetNtrCount: number;
  targetNtrSuccessCount: number;
}

declare module "koishi" {
  interface Tables {
    wifeUser: WifeUser;
  }
}

export function wifeUser(ctx: Context, config: Config) {
  ctx.model.extend("wifeUser", {
    id: "unsigned",
    userId: "string",
    groupId: "string",
    wifeName: "string",
    operationDate: "timestamp",
    ntrOrdinal: "integer",
    fuckWifeDate: "timestamp",
    kissWifeDate: "timestamp",
    dateWifeDate: "timestamp",
    lpdaDate: "timestamp",
    divorceDate: "timestamp",
    affectionDecayDate: "timestamp",
    drawBanUntil: "timestamp",
    wifeHistories: "json",
    interactionWithOtherUser: "json",
    createdAt: "timestamp",
    ntrCount: "integer",
    ntrTotalCount: "integer",
    ntrSuccessCount: "integer",
    drawCount: "integer",
    exchangeCount: "integer",
    divorceCount: "integer",
    totalAffection: "integer",
    currentWifeAffection: "integer",
    maxAffection: "integer",
    targetNtrCount: "integer",
    targetNtrSuccessCount: "integer",
  }, {
    autoInc: true,
  });
  ctx.logger.info("wifeUser 表初始化完成");
}