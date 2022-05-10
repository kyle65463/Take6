import { Card } from "./card";
import { Player, SelfPlayer } from "./player";

export type GameEventType = "game start" | "game update";

export interface GameEvent {
	id: string;
	type: string;
}

export interface GameStartEvent extends GameEvent {
	player: SelfPlayer;
	otherPlayers: Player[];
	initialFieldCards: Card[]; // length === 4
}

export interface GameUpdateEvent extends GameEvent {}
