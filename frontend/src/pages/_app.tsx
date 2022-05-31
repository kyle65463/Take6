import { ChatEvent } from "@models/chat_events";
import { useAuthState } from "react-firebase-hooks/auth";
import { GameEvent } from "@models/game_events";
import { PlayerEvent } from "@models/player_events";
import { Room } from "@models/room";
import { RoomEvent } from "@models/room_event";
import { initSocket } from "@services/socket";
import "@styles/globals.css";
import { EventsContext, UserContext, SocketContext } from "@utils/context";
import { auth } from "@utils/firebase";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { Socket } from "socket.io-client";
import { User } from "firebase/auth";

function MyApp({ Component, pageProps }: AppProps) {
	const [user, loading, error] = useAuthState(auth);
	const [socket, setSocket] = useState<Socket | undefined>();
	const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
	const [chatEvents, setChatEvents] = useState<ChatEvent[]>([]);
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

	const clearRoom = useCallback(() => {
		setRoom(undefined);
	}, []);

	const clearSocket = useCallback(() => {
		setSocket(undefined);
	}, []);

	// Init the socket and add it to the socket context when connected
	// Note: only update the state when the socket is connected
	const connectServer = useCallback(
		(user: User, roomId?: string) => {
			if (!socket) {
				const onConnect = (newSocket: Socket) => {
					setSocket(newSocket);
				};
				initSocket({
					onConnect,
					onGameEvent,
					onChatEvent,
					onRoomEvent,
					name: user.displayName ?? "no name",
					photoURL: user.photoURL ?? "",
					roomId,
				});
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
		<UserContext.Provider value={{ room, user, clearRoom }}>
			<SocketContext.Provider
				value={{ socket, connectServer, clearSocket }}
			>
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
		</UserContext.Provider>
	);
}

export default MyApp;
