import { Player } from "@models/player";
import clsx from "clsx";

interface PlayerCardProps {
	player: Player;
}

function PlayerInfo({ player }: PlayerCardProps) {
	const { name, score } = player;
	return (
		<div className='flex items-center mb-4'>
			<img src={player.photoURL} alt='' className='w-10 h-10 mr-2 avatar mask mask-circle' />
			<div>
				<p className='font-bold mb-0.5'>{name}</p>
				<p className={clsx("text-sm text-gray-600")}>Score: {score}</p>
			</div>
		</div>
	);
}

export default PlayerInfo;
