import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'StakeVault',
  projectId: 'a5e1cd1176e882ddecae8ead3c0adcab', // Get this from WalletConnect Cloud
  chains: [base],
  ssr: false, // If your dApp uses server side rendering (SSR)
});