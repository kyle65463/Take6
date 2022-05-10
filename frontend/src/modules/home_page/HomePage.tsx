import Button from "@common/components/Button";
import { SocketContext } from "@utils/context";
import Link from "next/link";
import { useContext } from "react";

function HomePage() {
	const { connectServer } = useContext(SocketContext);

	return (
		<div className='layout'>
			<p className='text-4xl'>HOME</p>
			<Link href='/play'>
				<Button onClick={connectServer}>Play</Button>
			</Link>
		</div>
	);
}

export default HomePage;
