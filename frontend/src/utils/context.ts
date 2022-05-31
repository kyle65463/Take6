import { ChatEvent } from "@models/chat_events";
import { GameEvent } from "@models/game_events";
import { PlayerEvent } from "@models/player_events";
import { Room } from "@models/room";
import { User } from "firebase/auth";
import { createContext } from "react";
import { Socket } from "socket.io-client";

interface SocketContextProps {
	socket?: Socket;
	connectServer: (user: User, roomId?: string) => void;
	clearSocket: () => void;
}

export const SocketContext = createContext<SocketContextProps>({
	connectServer: () => {},
	clearSocket: () => {},
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

interface UserContextProps {
	user?: User | null;
	room?: Room;
	clearRoom: () => void;
}

export const UserContext = createContext<UserContextProps>({
	user: null,
	clearRoom: () => {},
});
