import { io, Socket } from "socket.io-client";

interface InitSocketProps {
	// A callback function that will be invoked when the socket is connected
	onConnect: (socket: Socket) => void;
}

export function initSocket({ onConnect }: InitSocketProps) {
	const socket = io("ws://localhost:8888");
	socket.on("connect", (...args) => {
		onConnect(socket);
	});
	return socket;
}
