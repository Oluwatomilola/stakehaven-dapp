import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { celo } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'StakeVault',
  projectId: 'a5e1cd1176e882ddecae8ead3c0adcab', // Get this from WalletConnect Cloud
  chains: [celo],
  ssr: false, // If your dApp uses server side rendering (SSR)
});