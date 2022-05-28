import { ChatEvent } from "@models/chat_events";
import { GameEvent } from "@models/game_events";
import { PlayerEvent } from "@models/player_events";
import { createContext } from "react";
import { Socket } from "socket.io-client";

interface SocketContextProps {
	socket?: Socket;
	connectServer: (name: string) => void;
}

export const SocketContext = createContext<SocketContextProps>({
	connectServer: () => {},
});

interface EventsContextProps {
	gameEvents: GameEvent[];
	clearGameEvents: () => void;
	sendPlayerEvent: (playerEvent: PlayerEvent) => void;
	onGameEvent: (gameEvent: GameEvent) => void;
	chatEvents: ChatEvent[];
	clearChatEvents: () => void;
	sendChatEvent: (chatEvent: ChatEvent) => void;
	onChatEvent: (chatEvent: ChatEvent) => void;
}

export const EventsContext = createContext<EventsContextProps>({
	gameEvents: [],
	sendPlayerEvent: (playerEvent: PlayerEvent) => {},
	clearGameEvents: () => {},
	onGameEvent: (gameEvent: GameEvent) => {},
	chatEvents: [],
	clearChatEvents: () => {},
	sendChatEvent: (chatEvent: ChatEvent) => {},
	onChatEvent: (chatEvent: ChatEvent) => {},
});
