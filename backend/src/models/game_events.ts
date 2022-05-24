import { Card } from "./card";
import { Player, SelfPlayer } from "./player";

export type GameEventType =
	| "game start"
	| "game over"
	| "game status update"

export type ModeType =
	| "card selection"
	| "row selection"
 	| "none";

export interface GameEvent {
	type: GameEventType;
}

export interface UpdateGameStatusEvent extends GameEvent {
    player: SelfPlayer;
    otherPlayers: Player[];
    fieldCards: Card[][];
    mode: ModeType;

    // The list of players and the card they played for this round
    playedCardInfo: { playerName: string; card: Card }[]; // minus one per round
}


