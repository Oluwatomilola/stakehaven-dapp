import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WalletConnectProps {
  onConnectionChange: (connected: boolean, address?: string) => void;
}

export const WalletConnect = ({ onConnectionChange }: WalletConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  const connectWallet = async () => {
    if (isConnected) {
      // Disconnect
      setIsConnected(false);
      setWalletAddress("");
      onConnectionChange(false);
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Mock wallet connection for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate wallet connection
      const mockAddress = "0x742d35Cc61C09F4f8A5D7a0fC04B5F4E3e2B8e4A";
      setWalletAddress(mockAddress);
      setIsConnected(true);
      onConnectionChange(true, mockAddress);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

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
                {isConnected 
                  ? formatAddress(walletAddress)
                  : "Connect your wallet to start staking"
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isConnected && (
              <CheckCircle className="h-5 w-5 text-success" />
            )}
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              variant={isConnected ? "secondary" : "primary"}
              className={
                isConnected 
                  ? "bg-secondary hover:bg-secondary/80"
                  : "bg-gradient-primary hover:opacity-90 shadow-glow-primary"
              }
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2" />
                  Connecting...
                </>
              ) : isConnected ? (
                "Disconnect"
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};