import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI } from '@/contracts/stakingContract';
import { TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI } from '@/contracts/tokenContract';
import { parseEther } from 'viem';

export const useStakingContract = () => {
  const { writeContract, isPending: isWritePending, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash,
    });

  // Write functions
  const stake = async (amount: string) => {
    return writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'stake',
      args: [parseEther(amount)],
    } as any);
  };

  const withdraw = async () => {
    return writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'withdraw',
    } as any);
  };

  const claimRewards = async () => {
    return writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'claimRewards',
    } as any);
  };

  const emergencyWithdraw = async () => {
    return writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'emergencyWithdraw',
    } as any);
  };

  // Token approve function
  const approveToken = async (amount: string) => {
    return writeContract({
      address: TOKEN_CONTRACT_ADDRESS,
      abi: TOKEN_CONTRACT_ABI,
      functionName: 'approve',
      args: [STAKING_CONTRACT_ADDRESS, parseEther(amount)],
    } as any);
  };

  return {
    stake,
    withdraw,
    claimRewards,
    emergencyWithdraw,
    approveToken,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    hash,
  };
};

// Read hooks
export const useUserStake = (address?: string) => {
  return useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getUserStake',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    }
  });
};

export const usePendingRewards = (address?: string) => {
  return useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getPendingRewards',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    }
  });
};

// Token allowance hook
export const useTokenAllowance = (ownerAddress?: string) => {
  return useReadContract({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: TOKEN_CONTRACT_ABI,
    functionName: 'allowance',
    args: ownerAddress ? [ownerAddress as `0x${string}`, STAKING_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!ownerAddress,
    }
  });
};

// Token balance hook
export const useTokenBalance = (address?: string) => {
  return useReadContract({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: TOKEN_CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    }
  });
};