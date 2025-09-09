import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, CheckCircle } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';

interface WalletConnectProps {
  onConnectionChange: (connected: boolean, address?: string) => void;
}

export const WalletConnect = ({ onConnectionChange }: WalletConnectProps) => {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    onConnectionChange(isConnected, address);
  }, [isConnected, address, onConnectionChange]);

  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {isConnected ? "Wallet Connected" : "Connect Wallet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isConnected && address
                  ? formatAddress(address)
                  : "Connect your wallet to start staking"
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isConnected && (
              <CheckCircle className="h-5 w-5 text-success" />
            )}
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="bg-gradient-primary hover:opacity-90 shadow-glow-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-smooth"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            className="bg-destructive hover:bg-destructive/80 text-destructive-foreground px-4 py-2 rounded-md font-medium transition-smooth"
                          >
                            Wrong Network
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={openAccountModal}
                          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md font-medium transition-smooth"
                        >
                          {account.displayName}
                        </button>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};