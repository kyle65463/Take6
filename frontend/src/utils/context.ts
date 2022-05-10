import { GameEvent } from "@models/game_events";
import { PlayerEvent } from "@models/player_events";
import { createContext } from "react";
import { Socket } from "socket.io-client";

interface SocketContextProps {
	socket?: Socket;
	connectServer: () => void;
}

export const SocketContext = createContext<SocketContextProps>({
	connectServer: () => {},
});

interface EventsContextProps {
	gameEvents: GameEvent[];
	sendPlayerEvent: (playerEvent: PlayerEvent) => void;
	onGameEvent: (gameEvent: GameEvent) => void;
}

export const EventsContext = createContext<EventsContextProps>({
	gameEvents: [],
	sendPlayerEvent: (playerEvent: PlayerEvent) => {},
	onGameEvent: (gameEvent: GameEvent) => {},
});
