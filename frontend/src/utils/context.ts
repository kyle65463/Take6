import { createContext } from "react";
import { Socket } from "socket.io-client";

export interface SocketContextProps {
	socket?: Socket;
	connectServer: () => void;
}

export const SocketContext = createContext<SocketContextProps>({ connectServer: () => {} });
