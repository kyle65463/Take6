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

	const onGoogleLogin = useCallback(() => {}, []);

	const onFacebookLogin = useCallback(() => {}, []);

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
						<div className='flex flex-col'>
							<Button style='outline' onClick={onGoogleLogin}>
								<>
									<img src='google.svg' alt='' className='h-6 w-6 mr-2' />
									使用 Google 帳號登入
								</>
							</Button>
							<div className='h-4' />
							<Button style='outline' onClick={onGoogleLogin}>
								<>
									<img src='facebook.svg' alt='' className='h-6 w-6 mr-2' />
									使用 Facebook 帳號登入
								</>
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default HomePage;
