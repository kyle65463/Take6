import { Player } from "./player";

export interface Room {
	roomId: string;
	player: Player;
	otherPlayers: Player[];
}
