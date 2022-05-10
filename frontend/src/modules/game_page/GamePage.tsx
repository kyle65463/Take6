import { SocketContext } from "@utils/context";
import { useContext, useEffect } from "react";

function GamePage() {
	const { socket } = useContext(SocketContext);
	const connecting = socket === undefined;

	// Socket connected
	useEffect(() => {
		console.log(socket);
	}, [socket]);

	return (
		<div className='layout'>
			<h1 className='text-4xl'>GAME</h1>
			<p>{connecting && <span>Connecting...</span>}</p>
		</div>
	);
}

export default GamePage;
