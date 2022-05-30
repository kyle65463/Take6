import { Player } from "@models/player";
import clsx from "clsx";

interface PlayerCardProps {
	player: Player;
}

function PlayerInfo({ player }: PlayerCardProps) {
	const { name, score } = player;
	return (
		<div className='mb-4'>
			<p className='font-bold mb-0.5'>{name}</p>
			<p className={clsx("text-sm text-gray-600")}>Score: {score}</p>
		</div>
	);
}

export default PlayerInfo;
