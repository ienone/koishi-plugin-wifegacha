# 好感文案设计记录

## 当前实现状态

好感互动文案由 `src/utils/affectionEvents.ts` 管理，当前只接入 `日老婆`、`亲老婆/亲亲`、`约会` 三类互动。

一次互动会先由 `rollAffectionDelta()` 计算基础好感变化，再由 `rollAffectionEvent()` 决定是否触发彩蛋事件。若触发彩蛋，事件会替换展示文案，并按事件配置调整本次好感变化。若未触发彩蛋，当前固定显示 `无特殊事件。`，不再从普通文案池随机抽取。

## 当前彩蛋配置

Koishi 设置页已经提供以下彩蛋相关配置：

- `affectionEventSwitchgear`：是否启用好感互动彩蛋。
- `affectionEventProbability`：每次互动触发彩蛋的概率。
- `affectionEventHeavyProbability`：重事件进入候选池的概率。
- `customAffectionEvents`：自定义彩蛋事件表，可配置适用指令、权重、好感变化方式、文案和特殊效果。

内置彩蛋事件目前仍写在代码里的 `presetRules` 中；自定义事件会与内置事件合并后按权重抽取。

## 待设计：普通反馈文案池

普通反馈文案池暂不实现，后续需要单独构思。目标是在没有触发彩蛋事件时，也能展示轻量气氛文案，但不影响好感数值、不触发失败、不清空好感、不失去老婆。

建议后续把普通反馈池独立于彩蛋事件池维护，并允许在 Koishi 设置页调整。候选字段：

- `id`：文案 ID。
- `enabled`：是否启用。
- `actions`：适用指令，可选 `fuck`、`kiss`、`date`。
- `mood`：文案倾向，可选 `positive`、`neutral`、`negative`。
- `category`：来源类别，例如 `anime`、`cs`、`daily`、`custom`。
- `weight`：抽取权重。
- `message`：展示文案。

## 待设计：文案来源方向

后续可考虑维护多类预置文案池：

- 二次元经典台词变体：使用致敬式改写，避免直接大段照搬原句。
- CS 赛事梗：残局、eco、强起、timing、空枪、软脚、保枪等方向。
- 约会日常：餐厅、电影、谷子、天气、迟到、雷区话题等方向。
- 群聊自定义：允许服主在设置页按本群语境添加文案。

普通反馈池和事件彩蛋池应分开：普通反馈只负责“说什么”，彩蛋事件同时负责“说什么”和“改变什么”。

## 当前用户可见输出

`src/command/rlp.ts` 会在互动成功后输出：

```text
{老婆名} 好感度 +N
事件：{event.message}
当前好感度：{history.affection}
好感等级：{formatAffectionLevel(history.affectionLevel)}
```

如果触发清零或失去老婆类事件，会输出：

```text
{event.message}
{老婆名} 好感清零，并暂时离开了你。禁抽提示时长：N 秒。
```

当前默认未触发彩蛋时，`event.message` 为 `无特殊事件。`。
