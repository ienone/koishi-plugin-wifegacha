import { Context, Session } from "koishi";

export type MessageRecallAction =
  | "draw"
  | "ntr"
  | "query"
  | "album"
  | "divorce"
  | "exchange"
  | "affection"
  | "add"
  | "remove"
  | "update"
  | "archive"
  | "userArchive"
  | "sync"
  | "rename";

export interface MessageRecallSettings {
  enabled: boolean;
  delay: number;
  draw: boolean;
  ntr: boolean;
  query: boolean;
  album: boolean;
  divorce: boolean;
  exchange: boolean;
  affection: boolean;
  add: boolean;
  remove: boolean;
  update: boolean;
  archive: boolean;
  userArchive: boolean;
  sync: boolean;
  rename: boolean;
}

type ConfigLike = {
  messageRecall?: MessageRecallSettings;
};

type RecallSession = Session & {
  __wifegachaOriginalSend?: Session["send"];
};

type SendArgs = Parameters<Session["send"]>;
type SendFn = (...args: SendArgs) => ReturnType<Session["send"]>;

function shouldEnableRecall(config: MessageRecallSettings | undefined, actionKey?: MessageRecallAction) {
  if (!config?.enabled) return false;
  if (!actionKey) return true;
  if (config[actionKey] === false) return false;
  return true;
}

function scheduleMessageRecall(
  ctx: Context,
  session: Session,
  config: MessageRecallSettings | undefined,
  actionKey: MessageRecallAction,
  sendResult: Awaited<ReturnType<Session["send"]>>,
) {
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
    if (!id) continue;
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
        .catch((error) =>
          ctx.logger.warn(`撤回 wifegacha 消息失败: ${error.message}`, {
            actionKey,
            messageId: id,
          }),
        );
    }, delay);
  }
}

async function invokeSendWithRecall(
  session: Session,
  ctx: Context,
  recallConfig: MessageRecallSettings | undefined,
  actionKey: MessageRecallAction,
  sendFn: SendFn,
  args: SendArgs,
) {
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

export function createRecallSender(
  session: Session,
  ctx: Context,
  config: ConfigLike,
  actionKey: MessageRecallAction,
  baseSend?: SendFn,
) {
  const recallConfig = config.messageRecall;
  const sender = baseSend ?? session.send.bind(session);

  if (!shouldEnableRecall(recallConfig, actionKey)) {
    return (...args: SendArgs) => sender(...args);
  }

  return (...args: SendArgs) => invokeSendWithRecall(session, ctx, recallConfig, actionKey, sender, args);
}

export function sendWithRecall(
  session: Session,
  ctx: Context,
  config: ConfigLike,
  actionKey: MessageRecallAction,
  ...args: SendArgs
) {
  return createRecallSender(session, ctx, config, actionKey)(...args);
}

export function setupMessageRecall(
  session: Session,
  ctx: Context,
  config: ConfigLike,
  actionKey: MessageRecallAction,
) {
  const recallSession = session as RecallSession;
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