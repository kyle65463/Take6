import ChatPage from "@modules/chat_page/ChatPage";
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
			<div className='flex flex-row justify-between'>
				<div>
					<div className='mb-6'>
						<p>Room number:</p>
						<p>{roomId}</p>
					</div>
					<div className='mb-6'>
						<p>Other players:</p>
						{otherPlayers.map((player) => (
							<p>{player.name}</p>
						))}
					</div>
					<div>
						<p>You: </p>
						<p>{player.name}</p>
					</div>
				</div>
				<div>
					<ChatPage />
				</div>
			</div>
		</div>
	);
}

export default RoomPage;
