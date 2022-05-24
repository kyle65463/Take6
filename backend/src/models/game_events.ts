import { Card } from "./card";
import { ModeType } from "./game";
import { Player, SelfPlayer } from "./player";

export type GameEventType =
	| "game start"
	| "game over"
	| "game status update";

export interface GameEvent {
	id: string;
	type: GameEventType;
}

export interface GameStartEvent extends GameEvent {
	player: SelfPlayer;
	otherPlayers: Player[];
	initialFieldCards: Card[]; // length === 4
}

export interface GameOverEvent extends GameEvent {
	winners: (Player | SelfPlayer)[];
}

export interface UpdateGameStatusEvent extends GameEvent {
	player: SelfPlayer;
	otherPlayers: Player[];
	fieldCards: Card[][];
	mode: ModeType;

	// The list of players and the card they played for this round
	playedCardInfo: { playerName: string; card: Card }[]; // minus one per round
}