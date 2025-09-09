import { useState, useEffect } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { StakingForm } from "@/components/StakingForm";
import { StakePositions } from "@/components/StakePositions";
import { ProtocolStats } from "@/components/ProtocolStats";
import { EmergencyWithdraw } from "@/components/EmergencyWithdraw";

interface StakePosition {
  id: string;
  amount: string;
  rewards: string;
  unlockTime: Date;
  isUnlocked: boolean;
  apy: string;
}

export default function StakingDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState("1000.0");
  const [stakePositions, setStakePositions] = useState<StakePosition[]>([]);

  // Mock protocol stats
  const protocolStats = {
    totalStaked: "2500000",
    totalUsers: 1247,
    rewardRate: "5000",
    protocolAPR: "12.5",
  };

  useEffect(() => {
    // Simulate loading user positions when connected
    if (isConnected) {
      // Mock some stake positions
      const mockPositions: StakePosition[] = [
        {
          id: "1",
          amount: "500.0",
          rewards: "15.67",
          unlockTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          isUnlocked: false,
          apy: "12.5%",
        },
        {
          id: "2",
          amount: "250.0",
          rewards: "31.24",
          unlockTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (unlocked)
          isUnlocked: true,
          apy: "12.5%",
        },
      ];
      setStakePositions(mockPositions);
    } else {
      setStakePositions([]);
    }
  }, [isConnected]);

  const handleConnectionChange = (connected: boolean, address?: string) => {
    setIsConnected(connected);
    setWalletAddress(address || "");
  };

  const handleStake = (amount: string) => {
    // Create new stake position
    const newPosition: StakePosition = {
      id: Date.now().toString(),
      amount,
      rewards: "0.0",
      unlockTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isUnlocked: false,
      apy: "12.5%",
    };

    setStakePositions(prev => [...prev, newPosition]);
    
    // Update balance
    const newBalance = (parseFloat(tokenBalance) - parseFloat(amount)).toString();
    setTokenBalance(newBalance);
  };

  const handleWithdraw = (positionId: string) => {
    const position = stakePositions.find(p => p.id === positionId);
    if (position) {
      // Return tokens to balance
      const newBalance = (parseFloat(tokenBalance) + parseFloat(position.amount)).toString();
      setTokenBalance(newBalance);
      
      // Remove position
      setStakePositions(prev => prev.filter(p => p.id !== positionId));
    }
  };

  const handleClaimRewards = (positionId: string) => {
    const position = stakePositions.find(p => p.id === positionId);
    if (position && parseFloat(position.rewards) > 0) {
      // Add rewards to balance
      const newBalance = (parseFloat(tokenBalance) + parseFloat(position.rewards)).toString();
      setTokenBalance(newBalance);
      
      // Reset rewards for this position
      setStakePositions(prev => 
        prev.map(p => 
          p.id === positionId 
            ? { ...p, rewards: "0.0" }
            : p
        )
      );
    }
  };

  const handleEmergencyWithdraw = () => {
    // Return all staked tokens to balance, forfeit rewards
    const totalStaked = stakePositions.reduce((total, pos) => total + parseFloat(pos.amount), 0);
    const newBalance = (parseFloat(tokenBalance) + totalStaked).toString();
    setTokenBalance(newBalance);
    setStakePositions([]);
  };

  const getTotalStaked = () => {
    return stakePositions.reduce((total, pos) => total + parseFloat(pos.amount), 0).toString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                StakeVault
              </h1>
              <p className="text-muted-foreground">Decentralized Staking Protocol</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Network</p>
              <p className="font-medium">Ethereum Mainnet</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Protocol Stats */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Protocol Overview</h2>
          <ProtocolStats {...protocolStats} />
        </section>

        {/* Wallet Connection */}
        <section>
          <WalletConnect onConnectionChange={handleConnectionChange} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-6">Stake Tokens</h2>
              <StakingForm
                isConnected={isConnected}
                tokenBalance={tokenBalance}
                onStake={handleStake}
              />
            </section>

            {isConnected && parseFloat(getTotalStaked()) > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6">Emergency Options</h2>
                <EmergencyWithdraw
                  totalStaked={getTotalStaked()}
                  isConnected={isConnected}
                  onEmergencyWithdraw={handleEmergencyWithdraw}
                />
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-6">Your Positions</h2>
              <StakePositions
                positions={stakePositions}
                onWithdraw={handleWithdraw}
                onClaimRewards={handleClaimRewards}
              />
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">StakeVault Protocol v1.0</p>
            <p className="text-sm">
              Secure, transparent, and decentralized staking infrastructure
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}