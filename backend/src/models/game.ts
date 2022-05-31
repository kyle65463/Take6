import { Card } from "./card";
import { Client, Player } from "./player";

export type ModeType = "card selection" | "row selection" | "none";

export type Games = { [key: string]: Game };

export interface Game {
	clients: Client[];
	fieldCards: Card[][];
	mode: ModeType;
	round: number;
	playerReadyCount: number;
	usedCards: number[];

	// The list of players and the card they played for this round
	playedCardInfo: { playerName: string; playerId: string, card: Card }[];
	selectRowPlayer?: Player;
}
