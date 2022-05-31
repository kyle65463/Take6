import Button from "@common/components/Button";
import { NameContext, SocketContext } from "@utils/context";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

type HomePageMode = "enter room number" | "choose room type" | "enter name";

function HomePage() {
	const { connectServer } = useContext(SocketContext);
	const [name, setName] = useState("");
	const roomNumberRef = useRef<HTMLInputElement | null>(null);
	const { onSetName, room } = useContext(NameContext);
	const [mode, setMode] = useState<HomePageMode>("enter name");
	const router = useRouter();

	const onCreateRoom = useCallback(() => {
		if (name.length === 0) return;
		connectServer(name);
	}, [name]);

	const onJoinRoom = useCallback(() => {
		const roomNumber = roomNumberRef.current?.value ?? "";
		if (roomNumber.length === 0) return;
		if (name.length === 0) return;
		connectServer(name, roomNumber);
	}, [name]);

	useEffect(() => {
		if (room) {
			router.push("room");
		}
	}, [room]);

	return (
		<div className='layout flex'>
			<div className='flex flex-1 h-full flex-col w-full justify-center items-center'>
				<h1 className='text-5xl'>誰是牛頭王</h1>
				<div className='flex flex-row justify-center mt-20 mb-20 h-36'>
					{mode === "choose room type" && (
						<>
							<button onClick={onCreateRoom} className='btn btn-primary w-56 h-36 text-2xl'>
								Create room
							</button>
							<div className='w-20' />
							<button
								onClick={() => setMode("enter room number")}
								className='btn btn-primary w-56 h-36 text-2xl'
							>
								Join room
							</button>
						</>
					)}
					{mode === "enter room number" && (
						<div>
							<h2 className='mb-1.5'>Room number</h2>
							<input type='text' className='input text-xl' ref={roomNumberRef} />
							<div className='flex justify-between mt-6'>
								<Button onClick={() => setMode("choose room type")}>Back</Button>
								<Button style='primary' onClick={onJoinRoom}>
									Join
								</Button>
							</div>
						</div>
					)}
					{mode === "enter name" && (
						<div>
							<h2 className='mb-1.5'>Name</h2>
							<input
								type='text'
								className='input text-xl'
								onChange={(event) => {
									setName(event.target.value);
									onSetName(event.target.value);
								}}
							/>
							<div className='flex justify-between mt-6'>
								<Button
									style='primary'
									onClick={() => {
										if (name.length > 0) {
											setMode("choose room type");
										}
									}}
								>
									Confirm
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default HomePage;
