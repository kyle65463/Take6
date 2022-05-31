import { Card } from "./card";
import { SelfPlayer } from "./player";

export type PlayerEventType = "play card" | "select row" | "player info";

export interface PlayerEvent {
    id: string;
    type: PlayerEventType;
}

export interface PlayCardEvent extends PlayerEvent {
    player: SelfPlayer;
    card: Card;
}

export interface SelectRowEvent extends PlayerEvent {
    player: SelfPlayer;
    rowIdx: number;
}

export interface PlayerInfoEvent extends PlayerEvent {
    playerName: string;
    roomId?: string;
}
