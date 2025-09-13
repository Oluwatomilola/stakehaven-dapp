import { request, gql } from 'graphql-request'

// Update this URL when you deploy your subgraph
const SUBGRAPH_URL = 'YOUR_SUBGRAPH_URL_HERE' // Replace with your actual subgraph URL

// GraphQL queries
export const GET_USER_DATA = gql`
  query GetUserData($userAddress: String!) {
    user(id: $userAddress) {
      id
      totalStaked
      totalClaimed
      totalEmergencyWithdrawn
      firstStakeTime
      lastActivityTime
      isActive
      stakingPositions(orderBy: timestamp, orderDirection: desc) {
        id
        amount
        timestamp
        blockNumber
        transactionHash
        newTotalStaked
        currentRewardRate
        isActive
      }
      rewardsClaimed(orderBy: timestamp, orderDirection: desc) {
        id
        amount
        timestamp
        blockNumber
        transactionHash
        newPendingRewards
        totalStaked
      }
      withdrawals(orderBy: timestamp, orderDirection: desc) {
        id
        amount
        timestamp
        blockNumber
        transactionHash
        newTotalStaked
        currentRewardRate
        rewardsAccrued
      }
      emergencyWithdrawals(orderBy: timestamp, orderDirection: desc) {
        id
        amount
        penalty
        timestamp
        blockNumber
        transactionHash
        newTotalStaked
      }
    }
  }
`

export const GET_PROTOCOL_STATS = gql`
  query GetProtocolStats {
    protocolStats(id: "PROTOCOL_STATS") {
      id
      totalStaked
      totalUsers
      totalRewardsClaimed
      totalEmergencyWithdrawals
      currentRewardRate
      lastUpdated
      totalStakingPositions
      totalWithdrawals
    }
  }
`

export const GET_DAILY_SNAPSHOTS = gql`
  query GetDailySnapshots($first: Int = 30, $orderDirection: OrderDirection = desc) {
    dailyProtocolSnapshots(first: $first, orderBy: date, orderDirection: $orderDirection) {
      id
      date
      totalStaked
      totalUsers
      dailyStaked
      dailyWithdrawn
      dailyRewardsClaimed
      dailyEmergencyWithdrawals
      newUsersCount
      currentRewardRate
    }
  }
`

export const GET_USER_DAILY_SNAPSHOTS = gql`
  query GetUserDailySnapshots($userAddress: String!, $first: Int = 30) {
    userDailySnapshots(
      where: { user: $userAddress }
      first: $first
      orderBy: date
      orderDirection: desc
    ) {
      id
      date
      totalStaked
      pendingRewards
      dailyStaked
      dailyWithdrawn
      dailyRewardsClaimed
    }
  }
`

export const GET_RECENT_ACTIVITIES = gql`
  query GetRecentActivities($first: Int = 50) {
    stakingPositions(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      user {
        id
      }
      amount
      timestamp
      transactionHash
      currentRewardRate
    }
    withdrawals(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      user {
        id
      }
      amount
      timestamp
      transactionHash
      rewardsAccrued
    }
    rewardsClaimed(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      user {
        id
      }
      amount
      timestamp
      transactionHash
    }
    emergencyWithdrawals(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      user {
        id
      }
      amount
      penalty
      timestamp
      transactionHash
    }
  }
`

export const GET_TOP_STAKERS = gql`
  query GetTopStakers($first: Int = 10) {
    users(
      first: $first
      orderBy: totalStaked
      orderDirection: desc
      where: { isActive: true }
    ) {
      id
      totalStaked
      totalClaimed
      firstStakeTime
      lastActivityTime
      stakingPositions(first: 1, orderBy: timestamp, orderDirection: desc) {
        amount
        timestamp
      }
    }
  }
`

export const GET_REWARD_RATE_HISTORY = gql`
  query GetRewardRateHistory($first: Int = 100) {
    rewardRateUpdates(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      oldRate
      newRate
      timestamp
      blockNumber
      transactionHash
      totalStaked
    }
  }
`

// Helper functions for making requests
export async function getUserData(userAddress: string) {
  try {
    return await request(SUBGRAPH_URL, GET_USER_DATA, { userAddress: userAddress.toLowerCase() })
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}

export async function getProtocolStats() {
  try {
    return await request(SUBGRAPH_URL, GET_PROTOCOL_STATS)
  } catch (error) {
    console.error('Error fetching protocol stats:', error)
    throw error
  }
}

export async function getDailySnapshots(days: number = 30) {
  try {
    return await request(SUBGRAPH_URL, GET_DAILY_SNAPSHOTS, { first: days })
  } catch (error) {
    console.error('Error fetching daily snapshots:', error)
    throw error
  }
}

export async function getUserDailySnapshots(userAddress: string, days: number = 30) {
  try {
    return await request(SUBGRAPH_URL, GET_USER_DAILY_SNAPSHOTS, { 
      userAddress: userAddress.toLowerCase(), 
      first: days 
    })
  } catch (error) {
    console.error('Error fetching user daily snapshots:', error)
    throw error
  }
}

export async function getRecentActivities(limit: number = 50) {
  try {
    return await request(SUBGRAPH_URL, GET_RECENT_ACTIVITIES, { first: limit })
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    throw error
  }
}

export async function getTopStakers(limit: number = 10) {
  try {
    return await request(SUBGRAPH_URL, GET_TOP_STAKERS, { first: limit })
  } catch (error) {
    console.error('Error fetching top stakers:', error)
    throw error
  }
}

export async function getRewardRateHistory(limit: number = 100) {
  try {
    return await request(SUBGRAPH_URL, GET_REWARD_RATE_HISTORY, { first: limit })
  } catch (error) {
    console.error('Error fetching reward rate history:', error)
    throw error
  }
}