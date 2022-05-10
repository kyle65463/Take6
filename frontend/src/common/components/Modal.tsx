import React, { useEffect, useState } from "react";
import Button from "./Button";

export type TitleColor = "none" | "red" | "green" | "blue" | "yellow";

interface ModalProps {
	title: string;
	isShow: boolean;
	onConfirm?: () => void;
	buttonText?: string;
	closeModal: () => void;
	children: JSX.Element | string;
}

export default function Modal({
	title,
	isShow,
	children,
	onConfirm,
	closeModal: closeDialog,
	buttonText = "Confirm",
}: ModalProps) {
	const [style, setStyle] = useState("");
	useEffect(() => {
		// Only when `isShow` is true that the Dialog will be instantiated
		// If instantiate the dialog and play the open animation at the same time, the animation won't be seen
		// So we need a time gap after instantiating the dialog, then play the open animation
		setTimeout(() => setStyle(isShow ? "modal-open" : ""), 5);
	}, [isShow]);

	const onConfirmClicked = async () => {
		if (onConfirm) {
			onConfirm();
			closeDialog();
		}
	};

	return (
		<>
			{isShow && (
				<div className={`${style} modal`}>
					<div className={`overflow-y-auto max-h-3/4 modal-box`}>
						{/* Header */}
						<div className={`pb-4 flex flex-row justify-between items-center`}>
							{/* Title */}
							{title && <h2 className='text-2xl font-bold'>{title}</h2>}
						</div>

						{/* Body */}
						<div className='tracking-wide leading-6'>{children}</div>

						{/* Action buttons */}
						<div className='items-center pt-3 modal-action'>
							<Button style='primary' onClick={onConfirmClicked}>
								{buttonText}
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
