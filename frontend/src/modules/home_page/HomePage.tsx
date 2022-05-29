import Button from "@common/components/Button";
import { NameContext, SocketContext } from "@utils/context";
import Link from "next/link";
import { useContext, useRef } from "react";

function HomePage() {
	const { connectServer } = useContext(SocketContext);
	const nameRef = useRef<HTMLInputElement | null>(null);
	const { onSetName } = useContext(NameContext);

	return (
		<div className='layout'>
			<h1 className='text-4xl'>HOME</h1>

			<div>
				<input ref={nameRef} type='text' />
				<Link href='/play'>
					<Button
						style='primary'
						onClick={() => {
							connectServer(nameRef.current?.value ?? "");
							onSetName(nameRef.current?.value ?? "");
						}}
					>
						Play
					</Button>
				</Link>
			</div>
		</div>
	);
}

export default HomePage;
