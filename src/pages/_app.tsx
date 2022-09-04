import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import MetaTags from "@/components/MetaTags";

const metaData = {
    title: "Green-bot - Web dashboard",
    description: "This is the place where you can manage Green-bot's music easyly",
    url: "https://www.dash.green-bot.app.com",
    image: "https://www.example.com/image.jpg",
    themeColor: "#ffffff",
    keywords: "green, music, bot, cool, free music, discord",
    author: "green",
    charSet: "utf-8",
    language: "English",
    icons: [
        {
            src: "https://cdn.discordapp.com/attachments/892498825611202640/960106891529289748/green-bot-cropped.png",
            sizes: "32x32",
            type: "image/ico",
        },
    ],
};

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <>
            <Head>
                <title>{metaData.title}</title>
                <MetaTags metaData={metaData} />
            </Head>

            <Component {...pageProps} />
        </>
    );
};

export default App;
