"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollAffectionEvent = rollAffectionEvent;
const actionSet = new Set(["fuck", "kiss", "date"]);
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function pick(items) {
    const total = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
    if (total <= 0)
        return undefined;
    let roll = Math.random() * total;
    for (const item of items) {
        roll -= Math.max(0, item.weight);
        if (roll <= 0)
            return item;
    }
    return items[items.length - 1];
}
function defaultMessage(_action, _delta) {
    return "无特殊事件。";
}
const presetRules = [
    {
        id: "fuck_premature_finish",
        enabled: true,
        actions: ["fuck"],
        weight: 8,
        deltaMode: "add",
        deltaValue: -3,
        message: "你今天状态不太行，草草结束，她明显有点不满意。",
    },
    {
        id: "fuck_surprisingly_good",
        enabled: true,
        actions: ["fuck"],
        weight: 6,
        deltaMode: "multiply",
        deltaValue: 1.5,
        message: "虽然开局有点糟，但后面意外合拍，她心情变好了。",
    },
    {
        id: "fuck_not_in_the_mood",
        enabled: true,
        actions: ["fuck"],
        weight: 5,
        deltaMode: "set",
        deltaValue: 0,
        message: "她今天中途明确表示不想继续，你及时停下，什么都没有发生。",
        effects: { failAction: true },
    },
    {
        id: "catastrophe_refusal",
        enabled: true,
        actions: ["fuck"],
        weight: 1,
        deltaMode: "set",
        deltaValue: 0,
        message: "她撤回了一个同意…你完蛋了。",
        heavy: true,
        effects: { clearAffection: true, loseCurrentWife: true },
    },
    {
        id: "soft_legs_niko",
        enabled: true,
        actions: ["fuck", "kiss", "date"],
        weight: 4,
        deltaMode: "set",
        deltaValue: 0,
        message: "虾钳突然软糯，你怎么老是到关键时刻就爱发抖呢！",
        effects: { failAction: true },
    },
    {
        id: "kiss_shy_response",
        enabled: true,
        actions: ["kiss"],
        weight: 9,
        deltaMode: "add",
        deltaValue: 1,
        message: "她脸红了一下，小声说这次就算你过关。",
    },
    {
        id: "kiss_too_sudden",
        enabled: true,
        actions: ["kiss"],
        weight: 6,
        deltaMode: "add",
        deltaValue: -1,
        message: "你靠得太突然，她被吓了一跳。",
    },
    {
        id: "kiss_perfect_timing",
        enabled: true,
        actions: ["kiss"],
        weight: 5,
        deltaMode: "multiply",
        deltaValue: 1.8,
        message: "这个亲亲时机完美，她的心情一下子变好了。",
    },
    {
        id: "date_good_restaurant",
        enabled: true,
        actions: ["date"],
        weight: 8,
        deltaMode: "add",
        deltaValue: 3,
        message: "餐厅很好吃，她已经开始期待下次约会了。",
    },
    {
        id: "date_bad_restaurant",
        enabled: true,
        actions: ["date"],
        weight: 5,
        deltaMode: "add",
        deltaValue: -2,
        message: "餐厅踩雷了，她嘴上说没事，但明显有点失望。",
    },
    {
        id: "date_good_movie",
        enabled: true,
        actions: ["date"],
        weight: 7,
        deltaMode: "add",
        deltaValue: 2,
        message: "电影选得很好，你们散场后还聊了很久。",
    },
    {
        id: "date_boring_movie",
        enabled: true,
        actions: ["date"],
        weight: 4,
        deltaMode: "add",
        deltaValue: -2,
        message: "电影太无聊了，她中途看了好几次时间。",
    },
    {
        id: "date_favorite_merch",
        enabled: true,
        actions: ["date"],
        weight: 6,
        deltaMode: "add",
        deltaValue: 4,
        message: "你买到了她喜欢的谷子，她开心得眼睛都亮了。",
    },
    {
        id: "date_met_favorite_star",
        enabled: true,
        actions: ["date"],
        weight: 3,
        deltaMode: "multiply",
        deltaValue: 2,
        message: "约会时偶遇她推的爱豆，她一整天都心情很好，但是你怎么觉得有些不对劲🤔",
    },
    {
        id: "date_late_arrival",
        enabled: true,
        actions: ["date"],
        weight: 5,
        deltaMode: "add",
        deltaValue: -4,
        message: "你迟到了，她等得有点生气。",
    },
    {
        id: "date_rainy_day_rescue",
        enabled: true,
        actions: ["date"],
        weight: 5,
        deltaMode: "add",
        deltaValue: 2,
        message: "突然下雨，你及时撑伞，她对你的评价上升了。",
    },
    {
        id: "date_landmine_topic",
        enabled: true,
        actions: ["date"],
        weight: 4,
        deltaMode: "add",
        deltaValue: -5,
        message: "你聊到了****，气氛瞬间冷了下来。",
    },
];
function normalizeCustomRule(rule) {
    if (!rule?.id || !rule?.message)
        return undefined;
    const actions = (rule.actions ?? [])
        .filter((action) => actionSet.has(action));
    if (!actions.length)
        return undefined;
    return {
        id: rule.id,
        enabled: rule.enabled !== false,
        actions,
        weight: Number(rule.weight ?? 1),
        deltaMode: rule.deltaMode ?? "add",
        deltaValue: Number(rule.deltaValue ?? 0),
        message: rule.message,
        heavy: Boolean(rule.heavy),
        effects: {
            failAction: Boolean(rule.failAction),
            clearAffection: Boolean(rule.clearAffection),
            loseCurrentWife: Boolean(rule.loseCurrentWife),
            drawBanSeconds: Number(rule.drawBanSeconds ?? 0) || undefined,
        },
    };
}
function applyDelta(baseDelta, rule, action) {
    let next = baseDelta;
    if (rule.deltaMode === "add")
        next = baseDelta + rule.deltaValue;
    if (rule.deltaMode === "multiply")
        next = Math.round(baseDelta * rule.deltaValue);
    if (rule.deltaMode === "set")
        next = rule.deltaValue;
    if (rule.effects?.failAction)
        next = 0;
    return clamp(next, action === "date" ? -10 : -6, action === "date" ? 15 : 8);
}
function rollAffectionEvent(config, action, baseDelta) {
    const noEvent = {
        id: "default",
        delta: baseDelta,
        message: defaultMessage(action, baseDelta),
        effects: {},
        applied: false,
    };
    if (!config.affectionEventSwitchgear)
        return noEvent;
    const eventProbability = clamp(Number(config.affectionEventProbability ?? 0), 0, 100);
    if (Math.random() * 100 >= eventProbability)
        return noEvent;
    const preset = config.affectionEventPreset ?? "balanced";
    const heavyAllowed = preset === "chaos"
        || Math.random() * 100 < clamp(Number(config.affectionEventHeavyProbability ?? 0), 0, 100);
    const customRules = (config.customAffectionEvents ?? [])
        .map(normalizeCustomRule)
        .filter((rule) => Boolean(rule));
    const candidates = [...presetRules, ...customRules].filter((rule) => {
        if (rule.enabled === false)
            return false;
        if (!rule.actions.includes(action))
            return false;
        if (rule.heavy && !heavyAllowed)
            return false;
        if (preset === "light" && (rule.heavy || rule.deltaValue < -3 || rule.effects?.loseCurrentWife))
            return false;
        return true;
    });
    const rule = pick(candidates);
    if (!rule)
        return noEvent;
    return {
        id: rule.id,
        delta: applyDelta(baseDelta, rule, action),
        message: rule.message,
        effects: rule.effects ?? {},
        applied: true,
    };
}
