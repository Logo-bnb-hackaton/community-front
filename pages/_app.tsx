import '@/styles/globals.css'
import "@rainbow-me/rainbowkit/styles.css";
import type {AppProps} from 'next/app'
import {StyleProvider} from '@ant-design/cssinjs';

import {configureChains, createClient, WagmiConfig} from "wagmi";
import {bscTestnet} from "@wagmi/chains";
import {getDefaultWallets, RainbowKitProvider} from '@rainbow-me/rainbowkit';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {publicProvider} from '@wagmi/core/providers/public'

let chains = [bscTestnet];
const {provider} = configureChains(
    chains,
    [
        alchemyProvider({apiKey: process.env.ALCHEMY_ID!!}),
        publicProvider()
    ]
);
// todo maybe add more wallets
// doc https://www.rainbowkit.com/docs/custom-wallet-list
const {connectors} = getDefaultWallets({
    appName: 'Community App', // TODO fix app name
    chains
});
const wagmiClient = createClient({
    autoConnect: true,
    connectors: connectors,
    provider,
});

export default function App({Component, pageProps}: AppProps) {
    return (
        <StyleProvider hashPriority="low">
            <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider chains={chains}>
                    <Component {...pageProps} />
                </RainbowKitProvider>
            </WagmiConfig>
        </StyleProvider>
    )
}
