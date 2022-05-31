import Button from "@common/components/Button";
import { PlayerReadyEvent } from "@models/player_events";
import ChatPage from "@modules/chat_page/ChatPage";
import { EventsContext, UserContext } from "@utils/context";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect } from "react";

function RoomPage() {
	const { room } = useContext(UserContext);
	const router = useRouter();
	const { sendPlayerEvent } = useContext(EventsContext);

	useEffect(() => {
		if (!room) {
			router.push("/");
		}
	}, []);

	const onReady = useCallback(() => {
		const event: PlayerReadyEvent = { id: "", type: "player ready" };
		sendPlayerEvent(event);
	}, []);

	if (!room) {
		return <div></div>;
	}

	const { player, otherPlayers, roomId } = room;

	return (
		<div className='px-24 py-12'>
			<div className='flex flex-row justify-between'>
				<div>
					<div className='mb-6'>
						<p>Room number:</p>
						<p>{roomId}</p>
					</div>
					<div className='mb-6'>
						<p>Other players:</p>
						{otherPlayers.map((player) => (
							<p className='my-2'>
								<img src={player.photoURL} alt='' className='w-12 h-12 mr-2 avatar mask mask-circle' />
								<span className='mr-2 text-lg'>{player.name}</span>
								<span className='text-gray-400'> {player.isReady ? "ready" : "not ready"}</span>
							</p>
						))}
					</div>
					<div>
						<p>You: </p>
						<p className='mb-4 mt-2'>
							<img src={player.photoURL} alt='' className='w-12 h-12 mr-2 avatar mask mask-circle' />
							<span className='mr-2 text-lg'>{player.name}</span>
							<span className='text-gray-400'> {player.isReady ? "ready" : "not ready"}</span>
						</p>
						<Button
							style={player.isReady ? "disabled" : "primary"}
							onClick={player.isReady ? undefined : onReady}
						>
							Ready
						</Button>
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
