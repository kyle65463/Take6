import { ChatEvent } from "@models/chat_events";
import { GameEvent } from "@models/game_events";
import { PlayerEvent } from "@models/player_events";
import { initSocket } from "@services/socket";
import "@styles/globals.css";
import { EventsContext, SocketContext } from "@utils/context";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useCallback, useState } from "react";
import { Socket } from "socket.io-client";

function MyApp({ Component, pageProps }: AppProps) {
	const [socket, setSocket] = useState<Socket | undefined>();
	const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
	const [chatEvents, setChatEvents] = useState<ChatEvent[]>([]);

	// Triggered when receiving new game event from server
	const onGameEvent = useCallback((gameEvent: GameEvent) => {
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

	const clearGameEvents = useCallback(() => {
		setGameEvents([]);
	}, []);

	const clearChatEvents = useCallback(() => {
		setChatEvents([]);
	}, []);

	// Init the socket and add it to the socket context when connected
	// Note: only update the state when the socket is connected
	const connectServer = useCallback(
		(name: string) => {
			if (!socket) {
				const onConnect = (newSocket: Socket) => {
					setSocket(newSocket);
				};

				initSocket({ onConnect, onGameEvent, onChatEvent, name });
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

	return (
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
	);
}

export default MyApp;
