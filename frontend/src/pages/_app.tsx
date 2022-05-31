import { ChatEvent } from "@models/chat_events";
import { GameEvent } from "@models/game_events";
import { PlayerEvent } from "@models/player_events";
import { Room } from "@models/room";
import { RoomEvent } from "@models/room_event";
import { initSocket } from "@services/socket";
import "@styles/globals.css";
import { EventsContext, NameContext, SocketContext } from "@utils/context";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { Socket } from "socket.io-client";

function MyApp({ Component, pageProps }: AppProps) {
	const [socket, setSocket] = useState<Socket | undefined>();
	const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
	const [chatEvents, setChatEvents] = useState<ChatEvent[]>([]);
	const [name, setName] = useState<string>("");
	const [room, setRoom] = useState<Room | undefined>();
	const router = useRouter();

	// Triggered when receiving new game event from server
	const onGameEvent = useCallback((gameEvent: GameEvent) => {
		if (gameEvent.type === "game start") {
			router.push("play");
		}
		// Append the new event to the gameEvents array
		setGameEvents((oldGameEvents) => {
			return [...oldGameEvents, gameEvent];
		});
	}, []);

	// Triggered when receiving new chat event from server
	const onChatEvent = useCallback((chatEvent: ChatEvent) => {
		// Append the new event to the chatEvents array
		setChatEvents((oldChatEvents) => {
			return [...oldChatEvents, chatEvent];
		});
	}, []);

	// Triggered when receiving new room event from server
	const onRoomEvent = useCallback((roomEvent: RoomEvent) => {
		setRoom({ ...roomEvent });
	}, []);

	const clearGameEvents = useCallback(() => {
		setGameEvents([]);
	}, []);

	const clearChatEvents = useCallback(() => {
		setChatEvents([]);
	}, []);

	// Init the socket and add it to the socket context when connected
	// Note: only update the state when the socket is connected
	const connectServer = useCallback(
		(name: string, roomId?: string) => {
			if (!socket) {
				const onConnect = (newSocket: Socket) => {
					setSocket(newSocket);
				};
				initSocket({ onConnect, onGameEvent, onChatEvent, onRoomEvent, name, roomId });
			}
		},
		[socket]
	);

	// Send the player's event to server
	// e.g. the player played a card
	const sendPlayerEvent = useCallback(
		(playerEvent: PlayerEvent) => {
			if (socket) {
				socket.emit("player event", playerEvent);
			}
		},
		[socket]
	);

	// Send the chat event to server
	// e.g. the player send a message
	const sendChatEvent = useCallback(
		(chatEvent: ChatEvent) => {
			if (socket) {
				socket.emit("chat event", chatEvent);
			}
		},
		[socket]
	);

	const onSetName = useCallback(
		(name: string) => {
			setName(name);
		},
		[name]
	);

	return (
		<NameContext.Provider value={{ name, room, onSetName }}>
			<SocketContext.Provider value={{ socket, connectServer }}>
				<EventsContext.Provider
					value={{
						gameEvents,
						sendPlayerEvent,
						onGameEvent,
						clearGameEvents,
						chatEvents,
						sendChatEvent,
						onChatEvent,
						clearChatEvents,
					}}
				>
					<Head>
						<title>Take6</title>
						<link rel='icon' href='/favicon.ico' />
					</Head>
					<div className='bg-base-200 min-h-screen'>
						<Component {...pageProps} />
					</div>
				</EventsContext.Provider>
			</SocketContext.Provider>
		</NameContext.Provider>
	);
}

export default MyApp;
