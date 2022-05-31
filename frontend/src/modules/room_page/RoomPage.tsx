import { NameContext, SocketContext } from "@utils/context";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useRef } from "react";

function RoomPage() {
	const { room } = useContext(NameContext);
	const router = useRouter();

	useEffect(() => {
		console.log("hi");
		if (!room) {
			console.log("hi2");
			router.push("/");
		}
	}, []);

	if (!room) {
		return <div></div>;
	}

	const { player, otherPlayers, roomId } = room;

	return (
		<div className='layout flex'>
			<div>
				<p>Room number:</p>
				<p>{roomId}</p>
			</div>
			<div>{otherPlayers.map((player) => player.name)}</div>
			<div>You: {player.name}</div>
		</div>
	);
}

export default RoomPage;
