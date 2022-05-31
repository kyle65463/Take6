import { Card } from "./card";
import { Player } from "./player";

export type PlayerEventType = "play card" | "select row" | "player info" | "player ready";;

export interface PlayerEvent {
    type: PlayerEventType;
}

export interface PlayCardEvent extends PlayerEvent {
    player: Player;
    card: Card;
}

export interface SelectRowEvent extends PlayerEvent {
    player: Player;
    rowIdx: number;
}

export interface PlayerInfoEvent extends PlayerEvent {
    playerName: string;
    photoURL: string;
    roomId?: string;
}

export interface PlayerReadyEvent extends PlayerEvent {}
