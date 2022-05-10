import Button from "@common/components/Button";
import HandCard from "@common/components/HandCard";
import { randomCard } from "@models/card";
import { GameStartEvent } from "@models/game_events";
import { randomPlayer, randomSelfPlayer } from "@models/player";
import { EventsContext, SocketContext } from "@utils/context";
import { generateUid } from "@utils/utils";
import { useContext, useEffect } from "react";
import { useGame } from "./useGame";

function GamePage() {
	const { game, selectedHandCardId, selectHandCard, playCard } = useGame();
	const { socket } = useContext(SocketContext);
	const { onGameEvent } = useContext(EventsContext); // ! Used for mocked server
	const connecting = socket === undefined;

	// ! Used for mocked server
	useEffect(() => {
		const mockedGameStartEvent: GameStartEvent = {
			type: "game start",
			id: generateUid(),
			player: randomSelfPlayer(),
			otherPlayers: [...Array.from(Array(4).keys()).map((i) => randomPlayer(i + 1))], // 4 random other players
			initialFieldCards: [...Array.from(Array(4).keys()).map(() => randomCard())], // 4 random initial field cards
		};
		onGameEvent(mockedGameStartEvent);
	}, []);

	return (
		<div className='layout'>
			<h1 className='text-4xl'>GAME</h1>
			{/* <p>{connecting && <span>Connecting...</span>}</p> */}
			{game && (
				<main className='flex-1 flex flex-col justify-between mb-24'>
					<div className='flex justify-between'>
						<section className='mt-12'>
							{game.fieldCards.map((row) => (
								<div>
									{row.map((card) => (
										<span className='mr-4'>{card.number}</span>
									))}
								</div>
							))}
						</section>
						<section className='mt-12'>
							{game.otherPlayers.map((player) => (
								<p key={player.name}>{player.name}</p>
							))}
						</section>
					</div>

					<section className='mt-12'>
						<div className='px-16 w-full flex justify-between items-center mb-6'>
							<p className='text-xl font-bold'>{game.player.name}</p>
							{selectedHandCardId !== undefined ? (
								<Button style='primary' onClick={() => playCard(selectedHandCardId)}>
									Confirm
								</Button>
							) : (
								<Button style='invisible' />
							)}
						</div>

						<div className='flex justify-center'>
							{game.player.cards.map((card, i) => (
								<HandCard
									onClick={() => selectHandCard(i)}
									card={card}
									selected={i === selectedHandCardId}
								/>
							))}
						</div>
					</section>
				</main>
			)}
		</div>
	);
}

export default GamePage;
