import { Context, Session } from "koishi";
export type MessageRecallAction = "draw" | "ntr" | "query" | "album" | "divorce" | "exchange" | "affection" | "add" | "remove" | "update" | "archive" | "userArchive" | "sync" | "rename";
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
type SendArgs = Parameters<Session["send"]>;
type SendFn = (...args: SendArgs) => ReturnType<Session["send"]>;
export declare function createRecallSender(session: Session, ctx: Context, config: ConfigLike, actionKey: MessageRecallAction, baseSend?: SendFn): (fragment: import("@satorijs/element").Fragment, options?: import("@satorijs/protocol").SendOptions) => any;
export declare function sendWithRecall(session: Session, ctx: Context, config: ConfigLike, actionKey: MessageRecallAction, ...args: SendArgs): any;
export declare function setupMessageRecall(session: Session, ctx: Context, config: ConfigLike, actionKey: MessageRecallAction): void;
export {};
