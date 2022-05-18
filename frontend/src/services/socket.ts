import { GameEvent } from "@models/game_events";
import { io, Socket } from "socket.io-client";

interface InitSocketProps {
	// Will be invoked when the socket is connected
	onConnect: (socket: Socket) => void;

	// Will be invoked when receiving game events
	onGameEvent: (gameEvent: GameEvent) => void;
}

export function initSocket({ onConnect, onGameEvent }: InitSocketProps) {
	const socket = io("ws://localhost:8888");
	socket.on("connect", (...args) => {
		onConnect(socket);
	});

	socket.on("game event", (gameEvent) => {
		onGameEvent(gameEvent);
	});
	return socket;
}
