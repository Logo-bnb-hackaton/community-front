import '@/styles/globals.css'
import "@rainbow-me/rainbowkit/styles.css";
import type {AppProps} from 'next/app'
import {StyleProvider} from '@ant-design/cssinjs';

import {configureChains, createClient, WagmiConfig} from "wagmi";
import {bscTestnet} from "@wagmi/chains";
import {
    createAuthenticationAdapter,
    getDefaultWallets,
    RainbowKitAuthenticationProvider,
    RainbowKitProvider
} from '@rainbow-me/rainbowkit';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {publicProvider} from '@wagmi/core/providers/public'
import {SiweMessage} from 'siwe';
import {useState} from "react";
import {AuthenticationStatus} from "@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/AuthenticationContext";
import axios from "@/core/axios";

let chains = [bscTestnet];
const {provider} = configureChains(chains, [
    alchemyProvider({apiKey: process.env.ALCHEMY_ID!!}),
    publicProvider()
]);
// todo maybe add more wallets
// doc https://www.rainbowkit.com/docs/custom-wallet-list
const {connectors} = getDefaultWallets({
    appName: 'Nodde',
    chains
});
const wagmiClient = createClient({
    autoConnect: true,
    connectors: connectors,
    provider,
});


const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async function (): Promise<string> {
        const response = axios({
            method: 'get',
            url: '/api/nonce'
        })
        return (await response.then(res => {
            console.log('api/nonce response');
            console.log(res.data);
            return res;
        })).data.text()
    },
    createMessage: function (args: { nonce: string; address: string; chainId: number; }): unknown {
        return new SiweMessage({
            domain: window.location.host,
            address: args.address,
            statement: 'Sign in to Nodde',
            uri: window.location.origin,
            version: '1',
            chainId: args.chainId,
            nonce: args.nonce
        });
    },
    getMessageBody: function (args: { message: unknown; }): string {
        return (args.message as SiweMessage).prepareMessage();
    },
    verify: async function (args: { message: unknown; signature: string; }): Promise<boolean> {
        const signInResponse = await fetch('/api/sign-in', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({message: args.message, signature: args.signature}),
        });

        return Boolean(signInResponse.ok);
    },
    signOut: async function (): Promise<void> {
        await fetch('/api/sign-out');
    }
})

export default function App({Component, pageProps}: AppProps) {

    // loading | unathenticated | authenticated
    const [authStatus, setAuthStatus] = useState<AuthenticationStatus>('unauthenticated');

    return (
        <StyleProvider hashPriority="low">
            <WagmiConfig client={wagmiClient}>
                <RainbowKitAuthenticationProvider
                    adapter={authenticationAdapter}
                    status={authStatus}
                >
                    <RainbowKitProvider chains={chains}>
                        <Component {...pageProps} />
                    </RainbowKitProvider>
                </RainbowKitAuthenticationProvider>
            </WagmiConfig>
        </StyleProvider>
    )
}
