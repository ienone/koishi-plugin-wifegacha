"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeWifeUser = normalizeWifeUser;
exports.persistWifeUser = persistWifeUser;
exports.findWifeHistory = findWifeHistory;
exports.ensureWifeHistory = ensureWifeHistory;
exports.setCurrentWife = setCurrentWife;
exports.clearCurrentWife = clearCurrentWife;
exports.syncCurrentAffection = syncCurrentAffection;
exports.addAffection = addAffection;
exports.settleAffectionDecay = settleAffectionDecay;
exports.affectionLevel = affectionLevel;
exports.formatAffectionLevel = formatAffectionLevel;
exports.rollAffectionDelta = rollAffectionDelta;
exports.randomAffectionEvent = randomAffectionEvent;
exports.calculateNtrProbability = calculateNtrProbability;
exports.formatCooldown = formatCooldown;
const DAY_MS = 24 * 60 * 60 * 1000;
function toDate(value, fallback) {
    if (value instanceof Date && !Number.isNaN(value.getTime()))
        return value;
    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime()))
            return date;
    }
    return fallback;
}
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function normalizeWifeUser(user, now = new Date()) {
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
    for (const history of user.wifeHistories) {
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
async function persistWifeUser(ctx, user) {
    await ctx.database.set("wifeUser", { userId: user.userId, groupId: user.groupId }, {
        wifeName: user.wifeName,
        wifeHistories: user.wifeHistories,
        currentWifeAffection: user.currentWifeAffection,
        maxAffection: user.maxAffection,
        totalAffection: user.totalAffection,
        affectionDecayDate: user.affectionDecayDate,
        drawBanUntil: user.drawBanUntil,
    });
}
function findWifeHistory(user, wifeName) {
    return user.wifeHistories.find((item) => item.wifeName === wifeName);
}
function ensureWifeHistory(user, wifeName, defaults = {}) {
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
        user.wifeHistories.push(history);
    }
    history.interactionLogs ??= [];
    history.affectionLevel = affectionLevel(history.affection ?? 0);
    return history;
}
function setCurrentWife(user, wifeName) {
    const now = new Date();
    if (user.wifeName && user.wifeName !== wifeName) {
        const oldHistory = findWifeHistory(user, user.wifeName);
        if (oldHistory)
            oldHistory.leftCurrentAt = now;
    }
    user.wifeName = wifeName;
    if (wifeName) {
        const history = ensureWifeHistory(user, wifeName);
        history.lastCurrentAt = now;
        delete history.leftCurrentAt;
    }
    syncCurrentAffection(user);
}
function clearCurrentWife(user) {
    if (user.wifeName) {
        const history = findWifeHistory(user, user.wifeName);
        if (history)
            history.leftCurrentAt = new Date();
    }
    user.wifeName = "";
    user.currentWifeAffection = 0;
}
function syncCurrentAffection(user) {
    const current = user.wifeName ? findWifeHistory(user, user.wifeName) : undefined;
    user.currentWifeAffection = current?.affection ?? 0;
    user.maxAffection = Math.max(user.maxAffection ?? 0, ...user.wifeHistories.map((item) => item.affection ?? 0), 0);
    user.totalAffection = user.wifeHistories.reduce((sum, item) => sum + Math.max(0, item.affection ?? 0), 0);
}
function addAffection(user, wifeName, delta, action, event) {
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
function settleAffectionDecay(user, now = new Date()) {
    normalizeWifeUser(user, now);
    const last = toDate(user.affectionDecayDate, new Date(now.getTime() - DAY_MS));
    const elapsedDays = Math.floor((now.getTime() - last.getTime()) / DAY_MS);
    if (elapsedDays <= 0)
        return false;
    let changed = false;
    for (const history of user.wifeHistories) {
        if (!history.wifeName || history.wifeName === user.wifeName || (history.affection ?? 0) <= 0)
            continue;
        const leftAt = toDate(history.leftCurrentAt, history.getWifeDate);
        const daysAfterLeave = Math.floor((now.getTime() - leftAt.getTime()) / DAY_MS);
        const decayDays = Math.max(0, Math.min(elapsedDays, daysAfterLeave - 3));
        if (decayDays <= 0)
            continue;
        history.affection = Math.max(0, history.affection - decayDays);
        history.affectionLevel = affectionLevel(history.affection);
        changed = true;
    }
    user.affectionDecayDate = now;
    syncCurrentAffection(user);
    return changed || elapsedDays > 0;
}
function affectionLevel(affection) {
    return clamp(Math.floor(Math.max(0, affection) / 10), 0, 9);
}
function formatAffectionLevel(level) {
    const names = ["陌生", "眼熟", "熟悉", "亲近", "暧昧", "心动", "依赖", "热恋", "挚爱", "命定"];
    return `${level}（${names[clamp(level, 0, names.length - 1)]}）`;
}
function recentLogs(user, wifeName, windowMs, now = new Date()) {
    const history = findWifeHistory(user, wifeName);
    return (history?.interactionLogs ?? []).filter((log) => now.getTime() - new Date(log.time).getTime() <= windowMs);
}
function isAffectionInteraction(action) {
    return action === "fuck" || action === "kiss" || action === "date";
}
function isAffectionInteractionLog(log) {
    return isAffectionInteraction(log.action);
}
function interactionPressure(logs, now, halfLifeMs) {
    return logs.reduce((total, log) => {
        const elapsed = Math.max(0, now.getTime() - new Date(log.time).getTime());
        return total + Math.pow(0.5, elapsed / halfLifeMs);
    }, 0);
}
function sigmoid(value) {
    return 1 / (1 + Math.exp(-value));
}
function smoothFrequencyFactor(pressure) {
    return 1.12 - 1.55 * sigmoid((pressure - 0.85) / 0.35);
}
function smoothSwitchFactor(switchCount) {
    return 0.7 + 0.3 * Math.exp(-Math.max(0, switchCount - 1) / 5);
}
function smoothAffectionGainFactor(affection) {
    return 0.45 + 0.55 * Math.exp(-Math.max(0, affection) / 35);
}
function rollAffectionDelta(user, wifeName, action, cooldownSeconds = 0) {
    const now = new Date();
    const base = action === "date" ? 4 : action === "kiss" ? 1.2 : 2;
    const pressureHalfLifeMs = Math.max(cooldownSeconds * 2 * 1000, 60 * 1000);
    const pressureWindowMs = Math.max(cooldownSeconds * 6 * 1000, 5 * 60 * 1000);
    const logs = recentLogs(user, wifeName, pressureWindowMs, now).filter(isAffectionInteractionLog);
    const actionPressure = interactionPressure(logs.filter((log) => log.action === action), now, pressureHalfLifeMs);
    const totalPressure = interactionPressure(logs, now, pressureHalfLifeMs);
    const frequencyFactor = smoothFrequencyFactor(actionPressure * 0.7 + totalPressure * 0.3);
    const switchCount = user.wifeHistories.filter((item) => now.getTime() - toDate(item.getWifeDate, now).getTime() <= 7 * DAY_MS).length;
    const switchFactor = smoothSwitchFactor(switchCount);
    const currentAffection = findWifeHistory(user, wifeName)?.affection ?? 0;
    const gainFactor = smoothAffectionGainFactor(currentAffection);
    const eventMultiplier = action === "date" ? 0.7 + Math.random() * 1.1 : 0.85 + Math.random() * 0.45;
    const jitter = action === "date" ? Math.floor(Math.random() * 5) - 2 : Math.floor(Math.random() * 3) - 1;
    const positiveFactor = frequencyFactor > 0 ? gainFactor : 1;
    let delta = Math.round(base * frequencyFactor * switchFactor * positiveFactor * eventMultiplier + jitter);
    return clamp(delta, action === "date" ? -6 : -3, action === "date" ? 10 : 5);
}
function randomAffectionEvent(action, delta) {
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
function calculateNtrProbability(attacker, defender, wifeName) {
    normalizeWifeUser(attacker);
    normalizeWifeUser(defender);
    const attackerAffection = findWifeHistory(attacker, wifeName)?.affection ?? 0;
    const defenderAffection = defender.currentWifeAffection ?? findWifeHistory(defender, wifeName)?.affection ?? 0;
    const rawExperience = (attacker.ntrSuccessCount ?? 0) * 2 + (attacker.ntrTotalCount ?? 0) * 0.25;
    const attackerExperience = 18 * (1 - Math.exp(-rawExperience / 18));
    const affectionBonus = 14 * (1 - Math.exp(-Math.max(0, attackerAffection) / 50));
    const recentNtrPenalty = 12 * (1 - Math.exp(-Math.max(0, defender.ntrCount ?? 0) / 4));
    const defenderProtection = Math.max(0, defenderAffection) * 0.925;
    const risk = attackerExperience + affectionBonus + recentNtrPenalty - defenderProtection;
    return clamp(100 / (1 + Math.exp(-risk / 16)), 0, 100);
}
function formatCooldown(last, seconds) {
    if (!last || !seconds)
        return "可用";
    const remain = seconds - Math.floor((Date.now() - last.getTime()) / 1000);
    if (remain <= 0)
        return "可用";
    const minutes = Math.floor(remain / 60);
    const sec = remain % 60;
    return `${minutes}分${sec}秒`;
}
