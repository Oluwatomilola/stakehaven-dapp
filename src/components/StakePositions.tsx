import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, ArrowDownCircle, Gift } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface StakePosition {
  id: string;
  amount: string;
  rewards: string;
  unlockTime: Date;
  isUnlocked: boolean;
  apy: string;
}

interface StakePositionsProps {
  positions: StakePosition[];
  onWithdraw: (positionId: string) => void;
  onClaimRewards: (positionId: string) => void;
}

export const StakePositions = ({ positions, onWithdraw, onClaimRewards }: StakePositionsProps) => {
  const [loadingActions, setLoadingActions] = useState<{[key: string]: string}>({});

  const handleWithdraw = async (positionId: string, amount: string) => {
    setLoadingActions(prev => ({...prev, [positionId]: 'withdraw'}));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onWithdraw(positionId);
      
      toast({
        title: "Withdrawal Successful",
        description: `Successfully withdrew ${amount} tokens`,
      });
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Failed to withdraw tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingActions(prev => {
        const newState = {...prev};
        delete newState[positionId];
        return newState;
      });
    }
  };

  const handleClaimRewards = async (positionId: string, rewards: string) => {
    setLoadingActions(prev => ({...prev, [positionId]: 'claim'}));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClaimRewards(positionId);
      
      toast({
        title: "Rewards Claimed",
        description: `Successfully claimed ${rewards} tokens`,
      });
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Failed to claim rewards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingActions(prev => {
        const newState = {...prev};
        delete newState[positionId];
        return newState;
      });
    }
  };

  const formatTimeRemaining = (unlockTime: Date) => {
    const now = new Date();
    const diff = unlockTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Unlocked";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (positions.length === 0) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Stake Positions</h3>
          <p className="text-muted-foreground">
            You don't have any active stake positions yet. Start staking to earn rewards!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>Your Stake Positions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {positions.map((position) => (
          <div
            key={position.id}
            className="p-4 bg-muted/30 rounded-lg border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-lg font-semibold">
                  {position.amount} STAKE
                </div>
                <Badge variant={position.isUnlocked ? "default" : "secondary"}>
                  {position.apy} APY
                </Badge>
              </div>
              <Badge 
                variant={position.isUnlocked ? "default" : "secondary"}
                className={position.isUnlocked ? "bg-success" : ""}
              >
                {position.isUnlocked ? "Unlocked" : formatTimeRemaining(position.unlockTime)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Gift className="h-4 w-4 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Rewards</p>
                  <p className="font-medium text-success">{position.rewards} STAKE</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Unlock Date</p>
                  <p className="font-medium">{position.unlockTime.toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClaimRewards(position.id, position.rewards)}
                disabled={loadingActions[position.id] === 'claim' || parseFloat(position.rewards) === 0}
                className="flex-1"
              >
                {loadingActions[position.id] === 'claim' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Claim Rewards
                  </>
                )}
              </Button>
              
              <Button
                variant={position.isUnlocked ? "default" : "outline"}
                size="sm"
                onClick={() => handleWithdraw(position.id, position.amount)}
                disabled={!position.isUnlocked || loadingActions[position.id] === 'withdraw'}
                className={position.isUnlocked ? "bg-gradient-primary flex-1" : "flex-1"}
              >
                {loadingActions[position.id] === 'withdraw' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2" />
                    Withdrawing...
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    {position.isUnlocked ? "Withdraw" : "Locked"}
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};