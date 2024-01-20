'use client'

import { WagmiConfig, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig,
} from 'connectkit'

const config = createConfig(
  getDefaultConfig({
    alchemyId: process.env.ALCHEMY_ID!,
    walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID!,

    // Required
    appName: 'ESPRIT',

    // Optional
    appDescription: 'G(H)O PAY!',
    appUrl: 'https://gho.xyz',
    appIcon: 'https://family.co/logo.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
    chains: [sepolia],
  }),
)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider theme={'soft'} mode={'light'}>
        {children}
        <ConnectKitButton />
      </ConnectKitProvider>
    </WagmiConfig>
  )
}
