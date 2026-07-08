import type { Config } from "../config";
import type { WifeAction } from "./affection";
type AffectionInteractionAction = Extract<WifeAction, "fuck" | "kiss" | "date">;
type DeltaMode = "add" | "multiply" | "set";
export interface AffectionEventEffect {
    failAction?: boolean;
    clearAffection?: boolean;
    loseCurrentWife?: boolean;
    drawBanSeconds?: number;
}
export interface AffectionEventRule {
    id: string;
    enabled?: boolean;
    actions: AffectionInteractionAction[];
    weight: number;
    deltaMode: DeltaMode;
    deltaValue: number;
    message: string;
    heavy?: boolean;
    effects?: AffectionEventEffect;
}
export interface RolledAffectionEvent {
    id: string;
    delta: number;
    message: string;
    effects: AffectionEventEffect;
    applied: boolean;
}
export declare function rollAffectionEvent(config: Config, action: AffectionInteractionAction, baseDelta: number): RolledAffectionEvent;
export {};
