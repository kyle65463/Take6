import Button from "@common/components/Button";
import { SocketContext } from "@utils/context";
import Link from "next/link";
import { useContext } from "react";

function HomePage() {
	const { connectServer } = useContext(SocketContext);

	return (
		<div className='layout'>
			<h1 className='text-4xl'>HOME</h1>

			<div>
				<Link href='/play'>
					<Button style='primary' onClick={connectServer}>
						Play
					</Button>
				</Link>
			</div>
		</div>
	);
}

export default HomePage;
