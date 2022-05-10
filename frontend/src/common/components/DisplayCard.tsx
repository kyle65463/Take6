import { Card } from "@models/card";
import clsx from "clsx";
import React from "react";

type CardSize = "base" | "sm";

interface HandCardProps {
	card: Card;
	selected?: boolean;
	onClick?: () => void;
	size?: CardSize;
}

function DisplayCard({ card, selected, onClick, size = "base" }: HandCardProps) {
	const { number, score } = card;
	return (
		<div
			onClick={onClick}
			className={clsx("card rounded-md bg-base-100 shadow-sm mx-2 my-2 cursor-pointer duration-75 select-none", {
				// Base size
				"h-40": size === "base",
				"w-28": size === "base",
				// Small size
				"h-28": size === "sm",
				"w-20": size === "sm",
				"selected-card": selected,
			})}
		>
			<div className='card-body flex justify-center items-center'>
				<span className='text-2xl font-bold'>{number}</span>
				<span className='mt-3'>x{score}</span>
			</div>
		</div>
	);
}

export default DisplayCard;
