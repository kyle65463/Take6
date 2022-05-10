import "@styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<div>
			<Head>
				<title>Take6</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<Component {...pageProps} />
		</div>
	);
}

export default MyApp;
