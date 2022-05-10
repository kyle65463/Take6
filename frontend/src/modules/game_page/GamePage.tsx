import Button from "@common/components/Button";
import DisplayCard from "@common/components/DisplayCard";
import { randomCard } from "@models/card";
import { GameStartEvent } from "@models/game_events";
import { randomPlayer, randomSelfPlayer } from "@models/player";
import { EventsContext, SocketContext } from "@utils/context";
import { generateUid } from "@utils/utils";
import { useContext, useEffect } from "react";
import { useGame } from "./useGame";

function GamePage() {
	const { game, selectedHandCardId, playedCardInfo, inRowSelectionMode, selectRow, selectHandCard, playCard } =
		useGame();
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
			{/* <p>{connecting && <span>Connecting...</span>}</p> */}
			{game && (
				<main className='flex-1 flex flex-col justify-between mb-12'>
					<div className='flex justify-between'>
						{/* Field cards */}
						<section className='mt-12'>
							{game.fieldCards.map((row, i) => (
								<div className='flex items-center'>
									<>
										{row.map((card) => (
											<DisplayCard size='sm' card={card} />
										))}
										{inRowSelectionMode && (
											<div className='ml-8'>
												<Button style='primary' onClick={() => selectRow(i)}>
													Clear
												</Button>
											</div>
										)}
									</>
								</div>
							))}
						</section>

						<div className='flex items-center mt-16'>
							{/* Played cards */}
							<section className='flex mr-16'>
								{playedCardInfo?.map(({ playerName, card }) => (
									<div className=''>
										<p className='mb-2'>{playerName}</p>
										<DisplayCard size='sm' card={card} />
									</div>
								))}
							</section>

							{/* Players info */}
							<section>
								{game.otherPlayers.map((player) => (
									<p key={player.name}>{player.name}</p>
								))}
							</section>
						</div>
					</div>

					<section className='mt-12'>
						<div className='px-16 w-full flex justify-between items-end mb-4'>
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
								<DisplayCard
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
