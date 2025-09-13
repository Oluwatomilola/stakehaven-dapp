import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import {
  getUserData,
  getProtocolStats,
  getDailySnapshots,
  getUserDailySnapshots,
  getRecentActivities,
  getTopStakers,
  getRewardRateHistory
} from '@/lib/subgraph'

// Query keys
export const QUERY_KEYS = {
  USER_DATA: 'userData',
  PROTOCOL_STATS: 'protocolStats',
  DAILY_SNAPSHOTS: 'dailySnapshots',
  USER_DAILY_SNAPSHOTS: 'userDailySnapshots',
  RECENT_ACTIVITIES: 'recentActivities',
  TOP_STAKERS: 'topStakers',
  REWARD_RATE_HISTORY: 'rewardRateHistory'
} as const

// Hook to get user data from subgraph
export function useUserData() {
  const { address } = useAccount()
  
  return useQuery({
    queryKey: [QUERY_KEYS.USER_DATA, address],
    queryFn: () => getUserData(address!),
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  })
}

// Hook to get protocol statistics
export function useProtocolStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.PROTOCOL_STATS],
    queryFn: getProtocolStats,
    refetchInterval: 30000,
    staleTime: 15000,
  })
}

// Hook to get daily protocol snapshots for charts
export function useDailySnapshots(days: number = 30) {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_SNAPSHOTS, days],
    queryFn: () => getDailySnapshots(days),
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 240000, // Consider data stale after 4 minutes
  })
}

// Hook to get user daily snapshots
export function useUserDailySnapshots(days: number = 30) {
  const { address } = useAccount()
  
  return useQuery({
    queryKey: [QUERY_KEYS.USER_DAILY_SNAPSHOTS, address, days],
    queryFn: () => getUserDailySnapshots(address!, days),
    enabled: !!address,
    refetchInterval: 300000,
    staleTime: 240000,
  })
}

// Hook to get recent activities across the protocol
export function useRecentActivities(limit: number = 50) {
  return useQuery({
    queryKey: [QUERY_KEYS.RECENT_ACTIVITIES, limit],
    queryFn: () => getRecentActivities(limit),
    refetchInterval: 30000,
    staleTime: 15000,
  })
}

// Hook to get top stakers leaderboard
export function useTopStakers(limit: number = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.TOP_STAKERS, limit],
    queryFn: () => getTopStakers(limit),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 45000,
  })
}

// Hook to get reward rate history for analytics
export function useRewardRateHistory(limit: number = 100) {
  return useQuery({
    queryKey: [QUERY_KEYS.REWARD_RATE_HISTORY, limit],
    queryFn: () => getRewardRateHistory(limit),
    refetchInterval: 300000,
    staleTime: 240000,
  })
}

// Derived hook to get user stake positions with formatted data
export function useUserStakePositions() {
  const { data: userData, isLoading, error } = useUserData()
  
  const positions = (userData as any)?.user?.stakingPositions?.map((position: any) => ({
    id: position.id,
    amount: position.amount,
    timestamp: parseInt(position.timestamp),
    blockNumber: parseInt(position.blockNumber),
    transactionHash: position.transactionHash,
    currentRewardRate: position.currentRewardRate,
    isActive: position.isActive,
    // Calculate unlock time (assuming 30 days lock period)
    unlockTime: parseInt(position.timestamp) + (30 * 24 * 60 * 60),
    isUnlocked: (Date.now() / 1000) > (parseInt(position.timestamp) + (30 * 24 * 60 * 60)),
    // Calculate APY from reward rate
    apy: position.currentRewardRate ? (parseInt(position.currentRewardRate) / 100) : 0
  })) || []
  
  return {
    positions,
    isLoading,
    error,
    totalStaked: (userData as any)?.user?.totalStaked || '0',
    totalClaimed: (userData as any)?.user?.totalClaimed || '0'
  }
}

// Derived hook to get formatted protocol stats
export function useFormattedProtocolStats() {
  const { data, isLoading, error } = useProtocolStats()
  
  const stats = (data as any)?.protocolStats
  
  return {
    isLoading,
    error,
    totalStaked: stats?.totalStaked || '0',
    totalUsers: parseInt(stats?.totalUsers || '0'),
    rewardRate: parseFloat(stats?.currentRewardRate || '0') / 100,
    protocolAPR: parseFloat(stats?.currentRewardRate || '0') / 100,
    totalRewardsClaimed: stats?.totalRewardsClaimed || '0',
    totalStakingPositions: parseInt(stats?.totalStakingPositions || '0'),
    totalWithdrawals: parseInt(stats?.totalWithdrawals || '0'),
    lastUpdated: parseInt(stats?.lastUpdated || '0')
  }
}

// Hook to get comprehensive user dashboard data
export function useUserDashboard() {
  const { address } = useAccount()
  const userData = useUserData()
  const userSnapshots = useUserDailySnapshots(7) // Last 7 days
  
  return {
    isLoading: userData.isLoading || userSnapshots.isLoading,
    error: userData.error || userSnapshots.error,
    user: (userData.data as any)?.user,
    weeklySnapshots: (userSnapshots.data as any)?.userDailySnapshots || [],
    isConnected: !!address
  }
}