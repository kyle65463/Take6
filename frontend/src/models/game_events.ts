import { Card } from "./card";
import { Player } from "./player";

export type GameEventType = "game start" | "game update";

export interface GameEvent {
	id: string;
	type: string;
}

export interface GameStartEvent extends GameEvent {
	players: Player[];
	initialFieldCards: Card[]; // length === 4
}

export interface GameUpdateEvent extends GameEvent {}
