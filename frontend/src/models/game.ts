import { Card } from "./card";
import { Player, SelfPlayer } from "./player";

export interface Game {
	player: SelfPlayer;
	otherPlayers: Player[];
	fieldCards: Card[][];
}
