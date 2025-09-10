import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpCircle, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useStakingContract, useTokenAllowance, useTokenBalance } from "@/hooks/useStakingContract";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";

interface StakingFormProps {
  isConnected: boolean;
  tokenBalance: string;
  onStake: (amount: string) => void;
}

export const StakingForm = ({ isConnected, tokenBalance, onStake }: StakingFormProps) => {
  const [amount, setAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const { address } = useAccount();
  
  // Force browser refresh to clear cache
  
  const { approveToken, stake, isPending, isConfirmed } = useStakingContract();
  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(address);
  const { data: realTokenBalance } = useTokenBalance(address);

  // Check if user has sufficient allowance for the amount they want to stake
  const hasEnoughAllowance = () => {
    if (!amount || !allowance) return false;
    try {
      return BigInt(allowance.toString()) >= parseEther(amount);
    } catch {
      return false;
    }
  };

  const needsApproval = amount && !hasEnoughAllowance();

  useEffect(() => {
    if (isConfirmed) {
      refetchAllowance();
    }
  }, [isConfirmed, refetchAllowance]);

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to approve",
        variant: "destructive",
      });
      return;
    }

    setIsApproving(true);
    
    try {
      await approveToken(amount);
      toast({
        title: "Approval Submitted",
        description: "Please wait for the transaction to be confirmed",
      });
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error?.message || "Failed to approve tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid staking amount",
        variant: "destructive",
      });
      return;
    }

    const balance = realTokenBalance ? formatEther(realTokenBalance) : tokenBalance;
    if (parseFloat(amount) > parseFloat(balance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough tokens to stake this amount",
        variant: "destructive",
      });
      return;
    }

    if (!hasEnoughAllowance()) {
      toast({
        title: "Insufficient Allowance",
        description: "Please approve tokens first",
        variant: "destructive",
      });
      return;
    }

    try {
      await stake(amount);
      onStake(amount);
      setAmount("");
      
      toast({
        title: "Staking Submitted",
        description: "Please wait for the transaction to be confirmed",
      });
    } catch (error: any) {
      toast({
        title: "Staking Failed",
        description: error?.message || "Failed to stake tokens. Please try again.",
        variant: "destructive",
      });
    }
  };

  const setMaxAmount = () => {
    const balance = realTokenBalance ? formatEther(realTokenBalance) : tokenBalance;
    setAmount(balance);
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
              disabled={!isConnected || isPending || isApproving}
              className="pr-16"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 px-2 text-xs"
              onClick={setMaxAmount}
              disabled={!isConnected || isPending || isApproving}
            >
              MAX
            </Button>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Available Balance:</span>
          <span className="font-medium">
            {realTokenBalance ? `${parseFloat(formatEther(realTokenBalance)).toFixed(4)}` : tokenBalance} STAKE
          </span>
        </div>

        {needsApproval && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              You need to approve the staking contract to spend your tokens first.
            </p>
          </div>
        )}

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

        {needsApproval ? (
          <Button
            onClick={handleApprove}
            disabled={!isConnected || !amount || isApproving || isPending}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isApproving || isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Tokens
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleStake}
            disabled={!isConnected || !amount || isPending}
            className="w-full bg-gradient-primary hover:opacity-90 shadow-glow-primary"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Staking...
              </>
            ) : (
              "Stake Tokens"
            )}
          </Button>
        )}

        {!isConnected && (
          <p className="text-center text-sm text-muted-foreground">
            Connect your wallet to start staking
          </p>
        )}
      </CardContent>
    </Card>
  );
};