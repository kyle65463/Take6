import { ChatEvent } from "@models/chat_events";
import { GameEvent } from "@models/game_events";
import { PlayerInfoEvent } from "@models/player_events";
import { RoomEvent } from "@models/room_event";
import { generateUid } from "@utils/utils";
import { io, Socket } from "socket.io-client";

interface InitSocketProps {
	// Will be invoked when the socket is connected
	onConnect: (socket: Socket) => void;

	// Will be invoked when receiving game events
	onGameEvent: (gameEvent: GameEvent) => void;

	// Will be invoked when receiving chat events
	onChatEvent: (chatEvent: ChatEvent) => void;

	onRoomEvent: (roomEvent: RoomEvent) => void;

	// Will send player name to server
	name: string;
	roomId?: string;
}

export function initSocket({
	onConnect,
	onGameEvent,
	onChatEvent,
	onRoomEvent,
	name,
	roomId,
}: InitSocketProps) {
	const socket = io("ws://localhost:8888");
	socket.on("connect", (...args) => {
		onConnect(socket);
		const playerInfoEvent: PlayerInfoEvent = {
			id: generateUid(),
			type: "player info",
			playerName: name,
			roomId,
		};
		socket.emit("player event", playerInfoEvent);
	});

	socket.on("game event", (gameEvent) => {
		onGameEvent(gameEvent);
	});

	socket.on("chat event", (chatEvent) => {
		onChatEvent(chatEvent);
	});

	socket.on("room event", (chatEvent) => {
		onChatEvent(chatEvent);
	});
	return socket;
}
