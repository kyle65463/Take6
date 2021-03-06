import Button from "@common/components/Button";
import { signOut } from "@firebase/auth";
import { UserContext, SocketContext } from "@utils/context";
import { auth } from "@utils/firebase";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSignInWithFacebook, useSignInWithGoogle } from "react-firebase-hooks/auth";

type HomePageMode = "enter room number" | "choose room type" | "enter name";

function HomePage() {
	const { connectServer } = useContext(SocketContext);
	const roomNumberRef = useRef<HTMLInputElement | null>(null);
	const { user, room } = useContext(UserContext);
	const [mode, setMode] = useState<HomePageMode>("enter name");
	const [signInWithGoogle] = useSignInWithGoogle(auth);
	const router = useRouter();

	const onCreateRoom = useCallback(() => {
		if (!user) return;
		connectServer(user);
	}, [user]);

	const onGoogleLogin = useCallback(() => {
		signInWithGoogle();
	}, []);

	const onLogOut = useCallback(() => {
		setMode("enter name");
		signOut(auth);
	}, []);

	const onJoinRoom = useCallback(() => {
		const roomNumber = roomNumberRef.current?.value ?? "";
		if (roomNumber.length === 0) return;
		if (!user) return;
		connectServer(user, roomNumber);
	}, [user]);

	useEffect(() => {
		if (room) {
			router.push("room");
		}
	}, [room]);

	useEffect(() => {
		if (user && mode === "enter name") {
			setMode("choose room type");
		}
	}, [user]);

	return (
		<div className='layout flex'>
			<div className='flex flex-1 h-full flex-col w-full justify-center items-center'>
				<p className="text-6xl">誰是<span className="text-9xl text-rose-500 font-bold">牛</span><span className="text-9xl text-amber-500 font-bold">頭</span><span className="text-9xl text-sky-500 font-bold">王</span></p>
				<div className='flex flex-row justify-center mt-16 mb-32 h-36'>
					{mode === "choose room type" && (
						<div>
							<div className='flex flex-row justify-center'>
								<button onClick={onCreateRoom} className='btn btn-primary w-56 h-32 text-2xl'>
									Create room
								</button>
								<div className='w-20' />
								<button
									onClick={() => setMode("enter room number")}
									className='btn btn-primary w-56 h-32 text-2xl'
								>
									Join room
								</button>
							</div>
							<div className='mt-12 flex justify-center items-center'>
								<p>
									<img
										src={user?.photoURL ?? ""}
										alt=''
										className='w-12 h-12 avatar mask mask-circle'
									/>
									<span className='ml-2 mr-12 text-xl'>{user?.displayName}</span>
								</p>
								<Button onClick={onLogOut}>Log out</Button>
							</div>
						</div>
					)}
					{mode === "enter room number" && user && (
						<div>
							<h2 className='mb-1.5 text-xl'>Room number</h2>
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
						<div className='flex flex-col mt-12'>
							<Button style='outline' onClick={onGoogleLogin}>
								<>
									<img src='google.svg' alt='' className='h-6 w-6 mr-2' />
									使用 Google 帳號登入
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
