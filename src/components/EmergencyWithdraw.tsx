import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EmergencyWithdrawProps {
  totalStaked: string;
  isConnected: boolean;
  onEmergencyWithdraw: () => void;
}

export const EmergencyWithdraw = ({ totalStaked, isConnected, onEmergencyWithdraw }: EmergencyWithdrawProps) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleEmergencyWithdraw = async () => {
    setIsWithdrawing(true);
    
    try {
      // Simulate emergency withdrawal
      await new Promise(resolve => setTimeout(resolve, 2000));
      onEmergencyWithdraw();
      
      toast({
        title: "Emergency Withdrawal Complete",
        description: "All tokens have been withdrawn. You forfeited pending rewards.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Emergency Withdrawal Failed",
        description: "Failed to perform emergency withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (parseFloat(totalStaked) === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-card border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-destructive">
          <Shield className="h-5 w-5" />
          <span>Emergency Withdrawal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h4 className="font-medium text-destructive mb-1">Warning</h4>
              <p className="text-sm text-muted-foreground">
                Emergency withdrawal will forfeit all pending rewards and unstake all your tokens immediately. 
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Staked Amount:</span>
            <span className="font-medium">{totalStaked} STAKE</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rewards to Forfeit:</span>
            <span className="text-destructive font-medium">All pending rewards</span>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
              disabled={!isConnected || isWithdrawing}
            >
              {isWithdrawing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Withdraw
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span>Confirm Emergency Withdrawal</span>
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action will immediately withdraw all your staked tokens ({totalStaked} STAKE) 
                and forfeit all pending rewards. This cannot be undone.
                <br /><br />
                Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEmergencyWithdraw}
                className="bg-destructive hover:bg-destructive/90"
              >
                Yes, Emergency Withdraw
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!isConnected && (
          <p className="text-center text-sm text-muted-foreground">
            Connect your wallet to use emergency withdrawal
          </p>
        )}
      </CardContent>
    </Card>
  );
};