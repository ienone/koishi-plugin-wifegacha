"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecallSender = createRecallSender;
exports.sendWithRecall = sendWithRecall;
exports.setupMessageRecall = setupMessageRecall;
function shouldEnableRecall(config, actionKey) {
    if (!config?.enabled)
        return false;
    if (!actionKey)
        return true;
    if (config[actionKey] === false)
        return false;
    return true;
}
function scheduleMessageRecall(ctx, session, config, actionKey, sendResult) {
    if (!sendResult) {
        ctx.logger.info("[wifegacha][recall] no send result to schedule", {
            actionKey,
            sessionId: session.messageId,
        });
        return;
    }
    const delaySeconds = Number(config?.delay ?? 60);
    const delay = Number.isFinite(delaySeconds) ? Math.max(0, delaySeconds) * 1000 : 60_000;
    const ids = Array.isArray(sendResult) ? sendResult : [sendResult];
    for (const id of ids) {
        if (!id)
            continue;
        ctx.logger.info("[wifegacha][recall] schedule delete", {
            actionKey,
            messageId: id,
            delay,
        });
        setTimeout(() => {
            session.bot
                ?.deleteMessage(session.channelId, id)
                .then(() => {
                ctx.logger.info("[wifegacha][recall] delete success", { actionKey, messageId: id });
            })
                .catch((error) => ctx.logger.warn(`撤回 wifegacha 消息失败: ${error.message}`, {
                actionKey,
                messageId: id,
            }));
        }, delay);
    }
}
async function invokeSendWithRecall(session, ctx, recallConfig, actionKey, sendFn, args) {
    if (!shouldEnableRecall(recallConfig, actionKey)) {
        return sendFn(...args);
    }
    const result = await sendFn(...args);
    ctx.logger.info("[wifegacha][recall] send result", {
        actionKey,
        hasResult: Boolean(result),
    });
    scheduleMessageRecall(ctx, session, recallConfig, actionKey, result);
    return result;
}
function createRecallSender(session, ctx, config, actionKey, baseSend) {
    const recallConfig = config.messageRecall;
    const sender = baseSend ?? session.send.bind(session);
    if (!shouldEnableRecall(recallConfig, actionKey)) {
        return (...args) => sender(...args);
    }
    return (...args) => invokeSendWithRecall(session, ctx, recallConfig, actionKey, sender, args);
}
function sendWithRecall(session, ctx, config, actionKey, ...args) {
    return createRecallSender(session, ctx, config, actionKey)(...args);
}
function setupMessageRecall(session, ctx, config, actionKey) {
    const recallSession = session;
    const recallConfig = config.messageRecall;
    if (!shouldEnableRecall(recallConfig, actionKey)) {
        ctx.logger.info("[wifegacha][recall] setup skipped", {
            actionKey,
            enabled: false,
        });
        if (recallSession.__wifegachaOriginalSend) {
            session.send = recallSession.__wifegachaOriginalSend;
            recallSession.__wifegachaOriginalSend = undefined;
        }
        return;
    }
    if (!recallSession.__wifegachaOriginalSend) {
        recallSession.__wifegachaOriginalSend = session.send.bind(session);
    }
    ctx.logger.info("[wifegacha][recall] setup applied", {
        actionKey,
        enabled: true,
    });
    session.send = createRecallSender(session, ctx, config, actionKey, recallSession.__wifegachaOriginalSend);
}
