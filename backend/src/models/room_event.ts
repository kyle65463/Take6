import { Player } from "./player";

export interface RoomEvent {
	roomId: string;
	player: Omit<Player, "cards">;
	otherPlayers: Omit<Player, "cards">[];
}
