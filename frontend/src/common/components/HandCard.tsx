import { Card } from "@models/card";
import clsx from "clsx";
import React from "react";

interface HandCardProps {
	card: Card;
	selected: boolean;
	onClick: () => void;
}

function HandCard({ card, selected, onClick }: HandCardProps) {
	const { number, score } = card;
	return (
		<div
			onClick={onClick}
			className={clsx(
				"card h-40 w-28 rounded-md bg-base-100 shadow-sm mx-2 cursor-pointer duration-75 select-none",
				{
					"selected-card": selected,
				}
			)}
		>
			<div className='card-body flex justify-center items-center'>
				<span className='text-2xl font-bold'>{number}</span>
				<span className='mt-3'>x{score}</span>
			</div>
		</div>
	);
}

export default HandCard;
