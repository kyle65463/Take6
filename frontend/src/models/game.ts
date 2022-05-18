import { Card } from "./card";
import { Player, SelfPlayer } from "./player";

export type ModeType = 
	| "card selection"
	| "row selection"
	| "none";

export interface Game {
	player: SelfPlayer;
	otherPlayers: Player[];
	fieldCards: Card[][];
	mode: ModeType;

	// The list of players and the card they played for this round
	playedCardInfo: { playerName: string; card: Card }[];
}
