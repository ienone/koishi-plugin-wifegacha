import { Context } from "koishi";
import type { WifeUser } from "../module/wifeUser";

export type WifeAction = "fuck" | "kiss" | "date" | "draw" | "exchange" | "ntr" | "divorce";

export interface AffectionEvent {
  action: WifeAction;
  delta: number;
  event: string;
  time: string;
}

type WifeHistory = WifeUser["wifeHistories"][number] & {
  interactionLogs?: AffectionEvent[];
  lastCurrentAt?: Date | string;
  leftCurrentAt?: Date | string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function toDate(value: unknown, fallback: Date) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeWifeUser(user: WifeUser, now = new Date()) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  user.wifeName ??= "";
  user.wifeHistories ??= [];
  user.interactionWithOtherUser ??= [];
  user.currentWifeAffection ??= 0;
  user.maxAffection ??= 0;
  user.totalAffection ??= 0;
  user.ntrOrdinal ??= 0;
  user.ntrCount ??= 0;
  user.ntrTotalCount ??= 0;
  user.ntrSuccessCount ??= 0;
  user.drawCount ??= 0;
  user.exchangeCount ??= 0;
  user.divorceCount ??= 0;
  user.targetNtrCount ??= 0;
  user.targetNtrSuccessCount ??= 0;
  user.operationDate = toDate(user.operationDate, yesterday);
  user.fuckWifeDate = toDate(user.fuckWifeDate, yesterday);
  user.kissWifeDate = toDate(user.kissWifeDate, yesterday);
  user.dateWifeDate = toDate(user.dateWifeDate, yesterday);
  user.lpdaDate = toDate(user.lpdaDate, yesterday);
  user.divorceDate = toDate(user.divorceDate, yesterday);
  user.affectionDecayDate = toDate(user.affectionDecayDate, yesterday);
  user.drawBanUntil = toDate(user.drawBanUntil, yesterday);

  for (const history of user.wifeHistories as WifeHistory[]) {
    history.getNum ??= 0;
    history.isNtr ??= false;
    history.ntrGetCount ??= 0;
    history.exchangeGetCount ??= 0;
    history.divorceCount ??= 0;
    history.affection ??= 0;
    history.affectionLevel = affectionLevel(history.affection);
    history.getWifeDate = toDate(history.getWifeDate, now);
    history.interactionLogs ??= [];
    history.lastCurrentAt = toDate(history.lastCurrentAt, history.getWifeDate);
    if (history.wifeName !== user.wifeName) {
      history.leftCurrentAt = toDate(history.leftCurrentAt, history.getWifeDate);
    }
  }

  syncCurrentAffection(user);
  return user;
}

export async function persistWifeUser(ctx: Context, user: WifeUser) {
  await ctx.database.set(
    "wifeUser",
    { userId: user.userId, groupId: user.groupId },
    {
      wifeName: user.wifeName,
      wifeHistories: user.wifeHistories,
      currentWifeAffection: user.currentWifeAffection,
      maxAffection: user.maxAffection,
      totalAffection: user.totalAffection,
      affectionDecayDate: user.affectionDecayDate,
      drawBanUntil: user.drawBanUntil,
    },
  );
}

export function findWifeHistory(user: WifeUser, wifeName: string) {
  return (user.wifeHistories as WifeHistory[]).find((item) => item.wifeName === wifeName);
}

export function ensureWifeHistory(user: WifeUser, wifeName: string, defaults: Partial<WifeHistory> = {}) {
  let history = findWifeHistory(user, wifeName);
  if (!history) {
    history = {
      wifeName,
      getWifeDate: new Date(),
      getNum: 0,
      isNtr: false,
      ntrGetCount: 0,
      exchangeGetCount: 0,
      divorceCount: 0,
      affection: 0,
      affectionLevel: 0,
      interactionLogs: [],
      ...defaults,
    };
    (user.wifeHistories as WifeHistory[]).push(history);
  }
  history.interactionLogs ??= [];
  history.affectionLevel = affectionLevel(history.affection ?? 0);
  return history;
}

export function setCurrentWife(user: WifeUser, wifeName: string) {
  const now = new Date();
  if (user.wifeName && user.wifeName !== wifeName) {
    const oldHistory = findWifeHistory(user, user.wifeName);
    if (oldHistory) oldHistory.leftCurrentAt = now;
  }
  user.wifeName = wifeName;
  if (wifeName) {
    const history = ensureWifeHistory(user, wifeName);
    history.lastCurrentAt = now;
    delete history.leftCurrentAt;
  }
  syncCurrentAffection(user);
}

export function clearCurrentWife(user: WifeUser) {
  if (user.wifeName) {
    const history = findWifeHistory(user, user.wifeName);
    if (history) history.leftCurrentAt = new Date();
  }
  user.wifeName = "";
  user.currentWifeAffection = 0;
}

export function syncCurrentAffection(user: WifeUser) {
  const current = user.wifeName ? findWifeHistory(user, user.wifeName) : undefined;
  user.currentWifeAffection = current?.affection ?? 0;
  user.maxAffection = Math.max(user.maxAffection ?? 0, ...user.wifeHistories.map((item) => item.affection ?? 0), 0);
  user.totalAffection = user.wifeHistories.reduce((sum, item) => sum + Math.max(0, item.affection ?? 0), 0);
}

export function addAffection(user: WifeUser, wifeName: string, delta: number, action: WifeAction, event: string) {
  const history = ensureWifeHistory(user, wifeName);
  history.affection = Math.max(0, (history.affection ?? 0) + delta);
  history.affectionLevel = affectionLevel(history.affection);
  history.interactionLogs = [
    ...(history.interactionLogs ?? []),
    { action, delta, event, time: new Date().toISOString() },
  ].slice(-20);
  if (user.wifeName === wifeName) {
    history.lastCurrentAt = new Date();
  }
  syncCurrentAffection(user);
  return history;
}

export function settleAffectionDecay(user: WifeUser, now = new Date()) {
  normalizeWifeUser(user, now);
  const last = toDate(user.affectionDecayDate, new Date(now.getTime() - DAY_MS));
  const elapsedDays = Math.floor((now.getTime() - last.getTime()) / DAY_MS);
  if (elapsedDays <= 0) return false;

  let changed = false;
  for (const history of user.wifeHistories as WifeHistory[]) {
    if (!history.wifeName || history.wifeName === user.wifeName || (history.affection ?? 0) <= 0) continue;
    const leftAt = toDate(history.leftCurrentAt, history.getWifeDate);
    const daysAfterLeave = Math.floor((now.getTime() - leftAt.getTime()) / DAY_MS);
    const decayDays = Math.max(0, Math.min(elapsedDays, daysAfterLeave - 3));
    if (decayDays <= 0) continue;
    history.affection = Math.max(0, history.affection - decayDays);
    history.affectionLevel = affectionLevel(history.affection);
    changed = true;
  }
  user.affectionDecayDate = now;
  syncCurrentAffection(user);
  return changed;
}

export function affectionLevel(affection: number) {
  return clamp(Math.floor(Math.max(0, affection) / 10), 0, 9);
}

export function formatAffectionLevel(level: number) {
  const names = ["陌生", "眼熟", "熟悉", "亲近", "暧昧", "心动", "依赖", "热恋", "挚爱", "命定"];
  return `${level}（${names[clamp(level, 0, names.length - 1)]}）`;
}

function recentLogs(user: WifeUser, wifeName: string, windowMs: number, now = new Date()) {
  const history = findWifeHistory(user, wifeName);
  return (history?.interactionLogs ?? []).filter((log) => now.getTime() - new Date(log.time).getTime() <= windowMs);
}

export function rollAffectionDelta(user: WifeUser, wifeName: string, action: WifeAction) {
  const now = new Date();
  const base = action === "date" ? 5 : action === "kiss" ? 1.4 : 2.4;
  const dayCount = recentLogs(user, wifeName, DAY_MS, now).length;
  const hourCount = recentLogs(user, wifeName, 60 * 60 * 1000, now).length;
  const frequencyFactor = dayCount <= 1 ? 1.25 : dayCount <= 3 ? 1 : dayCount <= 5 ? 0.35 : -0.7;
  const coldFactor = dayCount === 0 ? 1.1 : 1;
  const switchCount = user.wifeHistories.filter((item) => now.getTime() - toDate(item.getWifeDate, now).getTime() <= 7 * DAY_MS).length;
  const switchFactor = switchCount >= 6 ? 0.7 : switchCount >= 4 ? 0.85 : 1;
  const eventMultiplier = action === "date" ? 0.6 + Math.random() * 1.4 : 0.8 + Math.random() * 0.6;
  const jitter = action === "date" ? Math.floor(Math.random() * 5) - 2 : Math.floor(Math.random() * 3) - 1;
  let delta = Math.round(base * frequencyFactor * coldFactor * switchFactor * eventMultiplier + jitter);

  if (hourCount >= 5) delta = Math.min(delta, -1);
  if (action === "date" && Math.random() < 0.08) delta -= 4;
  return clamp(delta, action === "date" ? -6 : -3, action === "date" ? 10 : 5);
}

export function randomAffectionEvent(action: WifeAction, delta: number) {
  const good = action === "date"
    ? ["餐厅很合口味", "电影选得不错", "一起买到了喜欢的谷", "路上遇到好天气", "偶遇明星让气氛升温"]
    : action === "kiss"
      ? ["她有点害羞", "轻轻回应了一下", "心情看起来不错"]
      : ["今天互动很顺利", "气氛比平时更亲近", "她记住了这次互动"];
  const bad = action === "date"
    ? ["迟到让她不太高兴", "天气突然变差", "踩到了雷区话题"]
    : action === "kiss"
      ? ["她觉得有点突然", "距离感还需要慢慢来"]
      : ["互动太频繁，她有点累了", "时机不太好"];
  const pool = delta >= 0 ? good : bad;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function calculateNtrProbability(attacker: WifeUser, defender: WifeUser, wifeName: string) {
  normalizeWifeUser(attacker);
  normalizeWifeUser(defender);
  const attackerAffection = findWifeHistory(attacker, wifeName)?.affection ?? 0;
  const defenderAffection = defender.currentWifeAffection ?? findWifeHistory(defender, wifeName)?.affection ?? 0;
  const attackerExperience = Math.min(24, (attacker.ntrSuccessCount ?? 0) * 2 + (attacker.ntrTotalCount ?? 0) * 0.25);
  const affectionBonus = Math.min(24, attackerAffection / 4);
  const recentNtrPenalty = Math.min(20, (defender.ntrCount ?? 0) * 2);
  const risk = attackerExperience + affectionBonus + recentNtrPenalty - defenderAffection;
  return clamp(100 / (1 + Math.exp(-risk / 8)), 0, 100);
}

export function formatCooldown(last: Date | undefined, seconds: number) {
  if (!last || !seconds) return "可用";
  const remain = seconds - Math.floor((Date.now() - last.getTime()) / 1000);
  if (remain <= 0) return "可用";
  const minutes = Math.floor(remain / 60);
  const sec = remain % 60;
  return `${minutes}分${sec}秒`;
}
