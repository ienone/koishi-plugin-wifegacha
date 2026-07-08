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
export declare function normalizeWifeUser(user: WifeUser, now?: Date): WifeUser;
export declare function persistWifeUser(ctx: Context, user: WifeUser): Promise<void>;
export declare function findWifeHistory(user: WifeUser, wifeName: string): WifeHistory;
export declare function ensureWifeHistory(user: WifeUser, wifeName: string, defaults?: Partial<WifeHistory>): WifeHistory;
export declare function setCurrentWife(user: WifeUser, wifeName: string): void;
export declare function clearCurrentWife(user: WifeUser): void;
export declare function syncCurrentAffection(user: WifeUser): void;
export declare function addAffection(user: WifeUser, wifeName: string, delta: number, action: WifeAction, event: string): WifeHistory;
export declare function settleAffectionDecay(user: WifeUser, now?: Date): boolean;
export declare function affectionLevel(affection: number): number;
export declare function formatAffectionLevel(level: number): string;
export declare function rollAffectionDelta(user: WifeUser, wifeName: string, action: WifeAction): number;
export declare function randomAffectionEvent(action: WifeAction, delta: number): string;
export declare function calculateNtrProbability(attacker: WifeUser, defender: WifeUser, wifeName: string): number;
export declare function formatCooldown(last: Date | undefined, seconds: number): string;
export {};
