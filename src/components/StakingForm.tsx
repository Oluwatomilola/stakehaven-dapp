import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StakingFormProps {
  isConnected: boolean;
  tokenBalance: string;
  onStake: (amount: string) => void;
}

export const StakingForm = ({ isConnected, tokenBalance, onStake }: StakingFormProps) => {
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid staking amount",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > parseFloat(tokenBalance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough tokens to stake this amount",
        variant: "destructive",
      });
      return;
    }

    setIsStaking(true);
    
    try {
      // Simulate staking transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      onStake(amount);
      setAmount("");
      
      toast({
        title: "Staking Successful",
        description: `Successfully staked ${amount} tokens`,
      });
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: "Failed to stake tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };

  const setMaxAmount = () => {
    setAmount(tokenBalance);
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowUpCircle className="h-5 w-5 text-primary" />
          <span>Stake Tokens</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stakeAmount">Amount to Stake</Label>
          <div className="relative">
            <Input
              id="stakeAmount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isConnected || isStaking}
              className="pr-16"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 px-2 text-xs"
              onClick={setMaxAmount}
              disabled={!isConnected || isStaking}
            >
              MAX
            </Button>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Available Balance:</span>
          <span className="font-medium">{tokenBalance} STAKE</span>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current APR:</span>
            <span className="text-success font-medium">12.5%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lock Period:</span>
            <span>7 days</span>
          </div>
          {amount && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Daily Rewards:</span>
              <span className="text-success font-medium">
                {(parseFloat(amount) * 0.125 / 365).toFixed(4)} STAKE
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handleStake}
          disabled={!isConnected || !amount || isStaking}
          className="w-full bg-gradient-primary hover:opacity-90 shadow-glow-primary"
        >
          {isStaking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Staking...
            </>
          ) : (
            "Stake Tokens"
          )}
        </Button>

        {!isConnected && (
          <p className="text-center text-sm text-muted-foreground">
            Connect your wallet to start staking
          </p>
        )}
      </CardContent>
    </Card>
  );
};