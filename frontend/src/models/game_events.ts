import { Card } from "./card";
import { Player, SelfPlayer } from "./player";

export type GameEventType = "game start" | "all player played" | "append row" | "clear row" | "start row selection";

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

export interface AppendRowEvent extends GameEvent {
	playerName: string; // The player played the card
	card: Card; // The played card
	rowIdx: number; // The target row of the played card
}

export interface ClearRowEvent extends GameEvent {
	playerName: string; // The player played the card
	card: Card; // The new leftmost card of the row
	rowIdx: number; // The target row to clear
}

export interface StartRowSelectionEvent extends GameEvent {}
