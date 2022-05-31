import Button from "@common/components/Button";
import { NameContext, SocketContext } from "@utils/context";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useRef } from "react";

function HomePage() {
	const { connectServer } = useContext(SocketContext);
	const nameRef = useRef<HTMLInputElement | null>(null);
	const { onSetName, room } = useContext(NameContext);
	const router = useRouter();

	const name = "";
	const onCreateRoom = useCallback(() => {
		connectServer(name);
	}, []);

	const onJoinRoom = useCallback(() => {
		connectServer(name, "1234");
	}, []);

	useEffect(() => {
		if (room) {
			router.push("room");
		}
	}, [room]);

	return (
		<div className='layout flex'>
			<div className='flex flex-1 h-full flex-col w-full justify-center items-center'>
				<h1 className='text-5xl'>誰是牛頭王</h1>
				<div className='flex flex-row justify-center mt-20 mb-20'>
					<button onClick={onCreateRoom} className='btn btn-primary w-56 h-36 text-2xl'>
						Create room
					</button>
					<div className='w-20' />
					<button onClick={onJoinRoom} className='btn btn-primary w-56 h-36 text-2xl'>
						Join room
					</button>
				</div>
			</div>
		</div>
	);
}

export default HomePage;
