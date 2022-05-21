import { Card } from "./card";
import { Player, SelfPlayer } from "./player";

export interface Game {
	player: SelfPlayer;
	otherPlayers: Player[];
	fieldCards: Card[][];

	// The list of players and the card they played for this round
	playedCardInfo: { playerName: string; card: Card }[];
}
