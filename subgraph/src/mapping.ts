import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import {
  Staked,
  Withdrawn,
  RewardsClaimed,
  EmergencyWithdrawn,
  RewardRateUpdated,
  StakingInitialized
} from "../generated/StakingContract/StakingContract"
import {
  User,
  StakingPosition,
  RewardClaim,
  Withdrawal,
  EmergencyWithdrawal,
  ProtocolStats,
  RewardRateUpdate,
  DailyProtocolSnapshot,
  UserDailySnapshot
} from "../generated/schema"

const PROTOCOL_STATS_ID = "PROTOCOL_STATS"
const ZERO_BI = BigInt.fromI32(0)
const ONE_BI = BigInt.fromI32(1)
const SECONDS_PER_DAY = BigInt.fromI32(86400)

function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHexString())
  if (user == null) {
    user = new User(address.toHexString())
    user.totalStaked = ZERO_BI
    user.totalClaimed = ZERO_BI
    user.totalEmergencyWithdrawn = ZERO_BI
    user.firstStakeTime = null
    user.lastActivityTime = ZERO_BI
    user.isActive = false
    user.save()
  }
  return user
}

function getOrCreateProtocolStats(): ProtocolStats {
  let stats = ProtocolStats.load(PROTOCOL_STATS_ID)
  if (stats == null) {
    stats = new ProtocolStats(PROTOCOL_STATS_ID)
    stats.totalStaked = ZERO_BI
    stats.totalUsers = ZERO_BI
    stats.totalRewardsClaimed = ZERO_BI
    stats.totalEmergencyWithdrawals = ZERO_BI
    stats.currentRewardRate = ZERO_BI
    stats.lastUpdated = ZERO_BI
    stats.totalStakingPositions = ZERO_BI
    stats.totalWithdrawals = ZERO_BI
    stats.save()
  }
  return stats
}

function getDayTimestamp(timestamp: BigInt): BigInt {
  return timestamp.div(SECONDS_PER_DAY).times(SECONDS_PER_DAY)
}

function getOrCreateDailySnapshot(dayTimestamp: BigInt): DailyProtocolSnapshot {
  let snapshot = DailyProtocolSnapshot.load(dayTimestamp.toString())
  if (snapshot == null) {
    snapshot = new DailyProtocolSnapshot(dayTimestamp.toString())
    snapshot.date = dayTimestamp
    snapshot.totalStaked = ZERO_BI
    snapshot.totalUsers = ZERO_BI
    snapshot.dailyStaked = ZERO_BI
    snapshot.dailyWithdrawn = ZERO_BI
    snapshot.dailyRewardsClaimed = ZERO_BI
    snapshot.dailyEmergencyWithdrawals = ZERO_BI
    snapshot.newUsersCount = ZERO_BI
    snapshot.currentRewardRate = ZERO_BI
    snapshot.save()
  }
  return snapshot
}

function getOrCreateUserDailySnapshot(userAddress: string, dayTimestamp: BigInt): UserDailySnapshot {
  let id = userAddress + "-" + dayTimestamp.toString()
  let snapshot = UserDailySnapshot.load(id)
  if (snapshot == null) {
    snapshot = new UserDailySnapshot(id)
    snapshot.user = userAddress
    snapshot.date = dayTimestamp
    snapshot.totalStaked = ZERO_BI
    snapshot.pendingRewards = ZERO_BI
    snapshot.dailyStaked = ZERO_BI
    snapshot.dailyWithdrawn = ZERO_BI
    snapshot.dailyRewardsClaimed = ZERO_BI
    snapshot.save()
  }
  return snapshot
}

export function handleStaked(event: Staked): void {
  let user = getOrCreateUser(event.params.user)
  let stats = getOrCreateProtocolStats()
  
  // Check if this is the user's first stake
  let isNewUser = user.firstStakeTime == null
  
  // Update user
  user.totalStaked = user.totalStaked.plus(event.params.amount)
  user.lastActivityTime = event.block.timestamp
  user.isActive = true
  if (isNewUser) {
    user.firstStakeTime = event.block.timestamp
  }
  
  // Create staking position
  let positionId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let position = new StakingPosition(positionId)
  position.user = user.id
  position.amount = event.params.amount
  position.timestamp = event.block.timestamp
  position.blockNumber = event.block.number
  position.transactionHash = event.transaction.hash.toHexString()
  position.newTotalStaked = event.params.newTotalStaked
  position.currentRewardRate = event.params.currentRewardRate
  position.isActive = true
  position.save()
  
  // Update protocol stats
  stats.totalStaked = event.params.newTotalStaked
  stats.currentRewardRate = event.params.currentRewardRate
  stats.lastUpdated = event.block.timestamp
  stats.totalStakingPositions = stats.totalStakingPositions.plus(ONE_BI)
  if (isNewUser) {
    stats.totalUsers = stats.totalUsers.plus(ONE_BI)
  }
  stats.save()
  
  // Update daily snapshots
  let dayTimestamp = getDayTimestamp(event.block.timestamp)
  let dailySnapshot = getOrCreateDailySnapshot(dayTimestamp)
  dailySnapshot.totalStaked = event.params.newTotalStaked
  dailySnapshot.totalUsers = stats.totalUsers
  dailySnapshot.dailyStaked = dailySnapshot.dailyStaked.plus(event.params.amount)
  dailySnapshot.currentRewardRate = event.params.currentRewardRate
  if (isNewUser) {
    dailySnapshot.newUsersCount = dailySnapshot.newUsersCount.plus(ONE_BI)
  }
  dailySnapshot.save()
  
  // Update user daily snapshot
  let userDailySnapshot = getOrCreateUserDailySnapshot(user.id, dayTimestamp)
  userDailySnapshot.totalStaked = user.totalStaked
  userDailySnapshot.dailyStaked = userDailySnapshot.dailyStaked.plus(event.params.amount)
  userDailySnapshot.save()
  
  user.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let user = getOrCreateUser(event.params.user)
  let stats = getOrCreateProtocolStats()
  
  // Update user
  user.totalStaked = user.totalStaked.minus(event.params.amount)
  user.lastActivityTime = event.block.timestamp
  user.isActive = user.totalStaked.gt(ZERO_BI)
  
  // Create withdrawal record
  let withdrawalId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let withdrawal = new Withdrawal(withdrawalId)
  withdrawal.user = user.id
  withdrawal.amount = event.params.amount
  withdrawal.timestamp = event.block.timestamp
  withdrawal.blockNumber = event.block.number
  withdrawal.transactionHash = event.transaction.hash.toHexString()
  withdrawal.newTotalStaked = event.params.newTotalStaked
  withdrawal.currentRewardRate = event.params.currentRewardRate
  withdrawal.rewardsAccrued = event.params.rewardsAccrued
  withdrawal.save()
  
  // Update protocol stats
  stats.totalStaked = event.params.newTotalStaked
  stats.currentRewardRate = event.params.currentRewardRate
  stats.lastUpdated = event.block.timestamp
  stats.totalWithdrawals = stats.totalWithdrawals.plus(ONE_BI)
  stats.save()
  
  // Update daily snapshots
  let dayTimestamp = getDayTimestamp(event.block.timestamp)
  let dailySnapshot = getOrCreateDailySnapshot(dayTimestamp)
  dailySnapshot.totalStaked = event.params.newTotalStaked
  dailySnapshot.dailyWithdrawn = dailySnapshot.dailyWithdrawn.plus(event.params.amount)
  dailySnapshot.currentRewardRate = event.params.currentRewardRate
  dailySnapshot.save()
  
  // Update user daily snapshot
  let userDailySnapshot = getOrCreateUserDailySnapshot(user.id, dayTimestamp)
  userDailySnapshot.totalStaked = user.totalStaked
  userDailySnapshot.dailyWithdrawn = userDailySnapshot.dailyWithdrawn.plus(event.params.amount)
  userDailySnapshot.save()
  
  user.save()
}

export function handleRewardsClaimed(event: RewardsClaimed): void {
  let user = getOrCreateUser(event.params.user)
  let stats = getOrCreateProtocolStats()
  
  // Update user
  user.totalClaimed = user.totalClaimed.plus(event.params.amount)
  user.lastActivityTime = event.block.timestamp
  
  // Create reward claim record
  let claimId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let claim = new RewardClaim(claimId)
  claim.user = user.id
  claim.amount = event.params.amount
  claim.timestamp = event.block.timestamp
  claim.blockNumber = event.block.number
  claim.transactionHash = event.transaction.hash.toHexString()
  claim.newPendingRewards = event.params.newPendingRewards
  claim.totalStaked = event.params.totalStaked
  claim.save()
  
  // Update protocol stats
  stats.totalRewardsClaimed = stats.totalRewardsClaimed.plus(event.params.amount)
  stats.lastUpdated = event.block.timestamp
  stats.save()
  
  // Update daily snapshots
  let dayTimestamp = getDayTimestamp(event.block.timestamp)
  let dailySnapshot = getOrCreateDailySnapshot(dayTimestamp)
  dailySnapshot.dailyRewardsClaimed = dailySnapshot.dailyRewardsClaimed.plus(event.params.amount)
  dailySnapshot.save()
  
  // Update user daily snapshot
  let userDailySnapshot = getOrCreateUserDailySnapshot(user.id, dayTimestamp)
  userDailySnapshot.dailyRewardsClaimed = userDailySnapshot.dailyRewardsClaimed.plus(event.params.amount)
  userDailySnapshot.save()
  
  user.save()
}

export function handleEmergencyWithdrawn(event: EmergencyWithdrawn): void {
  let user = getOrCreateUser(event.params.user)
  let stats = getOrCreateProtocolStats()
  
  // Update user
  user.totalStaked = ZERO_BI // Emergency withdrawal removes all staked tokens
  user.totalEmergencyWithdrawn = user.totalEmergencyWithdrawn.plus(event.params.amount)
  user.lastActivityTime = event.block.timestamp
  user.isActive = false
  
  // Create emergency withdrawal record
  let emergencyId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let emergency = new EmergencyWithdrawal(emergencyId)
  emergency.user = user.id
  emergency.amount = event.params.amount
  emergency.penalty = event.params.penalty
  emergency.timestamp = event.block.timestamp
  emergency.blockNumber = event.block.number
  emergency.transactionHash = event.transaction.hash.toHexString()
  emergency.newTotalStaked = event.params.newTotalStaked
  emergency.save()
  
  // Update protocol stats
  stats.totalStaked = event.params.newTotalStaked
  stats.totalEmergencyWithdrawals = stats.totalEmergencyWithdrawals.plus(ONE_BI)
  stats.lastUpdated = event.block.timestamp
  stats.save()
  
  // Update daily snapshots
  let dayTimestamp = getDayTimestamp(event.block.timestamp)
  let dailySnapshot = getOrCreateDailySnapshot(dayTimestamp)
  dailySnapshot.totalStaked = event.params.newTotalStaked
  dailySnapshot.dailyEmergencyWithdrawals = dailySnapshot.dailyEmergencyWithdrawals.plus(event.params.amount)
  dailySnapshot.save()
  
  user.save()
}

export function handleRewardRateUpdated(event: RewardRateUpdated): void {
  let stats = getOrCreateProtocolStats()
  
  // Create reward rate update record
  let updateId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let update = new RewardRateUpdate(updateId)
  update.oldRate = event.params.oldRate
  update.newRate = event.params.newRate
  update.timestamp = event.block.timestamp
  update.blockNumber = event.block.number
  update.transactionHash = event.transaction.hash.toHexString()
  update.totalStaked = event.params.totalStaked
  update.save()
  
  // Update protocol stats
  stats.currentRewardRate = event.params.newRate
  stats.lastUpdated = event.block.timestamp
  stats.save()
}

export function handleStakingInitialized(event: StakingInitialized): void {
  let stats = getOrCreateProtocolStats()
  
  // Initialize protocol stats
  stats.currentRewardRate = event.params.initialRewardRate
  stats.lastUpdated = event.block.timestamp
  stats.save()
}