import { initSocket } from "@services/socket";
import "@styles/globals.css";
import { SocketContext } from "@utils/context";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useCallback, useState } from "react";
import { Socket } from "socket.io-client";

function MyApp({ Component, pageProps }: AppProps) {
	const [socket, setSocket] = useState<Socket | undefined>();

	// Init the socket and add it to the socket context when connected
	// Note: only update the state when the socket is connected
	const connectServer = useCallback(() => {
		if (!socket) {
			const onConnect = (newSocket: Socket) => {
				setSocket(newSocket);
			};
			initSocket({ onConnect });
		}
	}, [socket]);

	return (
		<SocketContext.Provider value={{ socket, connectServer }}>
			<Head>
				<title>Take6</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<Component {...pageProps} />
		</SocketContext.Provider>
	);
}

export default MyApp;
