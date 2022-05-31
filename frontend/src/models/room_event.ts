import { Player } from "./player";

export interface RoomPlayer extends Player {
	isReady: boolean;
}

export interface RoomEvent {
	roomId: string;
	player: RoomPlayer;
	otherPlayers: RoomPlayer[];
}
