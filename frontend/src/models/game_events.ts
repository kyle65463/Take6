import { Card } from "./card";
import { Player, SelfPlayer } from "./player";

export type GameEventType = "game start" | "all player played" | "row update";

export interface GameEvent {
	id: string;
	type: GameEventType;
}

export interface GameStartEvent extends GameEvent {
	player: SelfPlayer;
	otherPlayers: Player[];
	initialFieldCards: Card[]; // length === 4
}

export interface AllPlayerPlayedEvent extends GameEvent {
	// The list of players and the card they played for this round
	playedCardInfo: { playerName: string; card: Card }[]; // length === numPlayer
}

export interface RowUpdateEvent extends GameEvent {
	card: Card; // The played card
	rowIdx: number; // The target row of the played card
}
