import Button from "@common/components/Button";
import Link from "next/link";

function HomePage() {
	return (
		<div className="layout">
			<p className='text-4xl'>HOME</p>
			<Link href='/play'>
				<Button>Play</Button>
			</Link>
		</div>
	);
}

export default HomePage;
