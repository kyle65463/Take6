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

	// Triggered when receiving new game event from server
	const onGameEvent = useCallback((gameEvent: GameEvent) => {
		// Append the new event to the gameEvents array
		setGameEvents((oldGameEvents) => {
			return [...oldGameEvents, gameEvent];
		});
	}, []);

	// Init the socket and add it to the socket context when connected
	// Note: only update the state when the socket is connected
	const connectServer = useCallback(() => {
		if (!socket) {
			const onConnect = (newSocket: Socket) => {
				setSocket(newSocket);
			};

			initSocket({ onConnect, onGameEvent });
		}
	}, [socket]);

	// Send the player's event to server
	// e.g. the player played a card
	const sendPlayerEvent = useCallback(
		(playerEvent: PlayerEvent) => {
			if (socket) {
				// socket.emit()
			}
		},
		[socket]
	);

	return (
		<SocketContext.Provider value={{ socket, connectServer }}>
			<EventsContext.Provider value={{ gameEvents, sendPlayerEvent, onGameEvent }}>
				<Head>
					<title>Take6</title>
					<link rel='icon' href='/favicon.ico' />
				</Head>
				<Component {...pageProps} />
			</EventsContext.Provider>
		</SocketContext.Provider>
	);
}

export default MyApp;
