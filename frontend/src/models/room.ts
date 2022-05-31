import { RoomPlayer } from "./room_event";

export interface Room {
	roomId: string;
	player: RoomPlayer;
	otherPlayers: RoomPlayer[];
}
