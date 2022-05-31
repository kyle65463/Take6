import { Player } from "./player";

export interface RoomEvent {
    roomId: string;
    player: Player[];
}
