// SPDX-License-Identifier: MIT
pragma solidity ^0.4.17;

import "./StakeHavenToken.sol";

/**
 * @title StakingContract
 * @dev Advanced staking contract with rewards, emergency withdrawal, and pause functionality
 * Based on the ABI structure from the frontend configuration
 */
contract StakingContract {
    using SafeMath for uint256;
    
    // Contract instances
    IERC20 public stakingToken;
    
    // Owner
    address public owner;
    
    // Staking parameters
    uint256 public initialApr;
    uint256 public minLockDuration;
    uint256 public aprReductionPerThousand;
    uint256 public emergencyWithdrawPenalty;
    
    // Rewards and staking tracking
    uint256 public totalStaked;
    uint256 public totalRewards;
    uint256 public rewardRate;
    uint256 public lastUpdateTime;
    uint256 public precision = 1e18;
    uint256 public rewardsPerMinutePrecision = 1e18;
    
    // User staking info
    struct UserInfo {
        uint256 stakedAmount;
        uint256 lastStakeTimestamp;
        uint256 rewardDebt;
        uint256 pendingRewards;
    }
    
    mapping(address => UserInfo) public userInfo;
    mapping(address => uint256) public userRewardPerTokenPaid;
    
    // Pausing
    bool public paused;
    bool public stakingPaused;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 timestamp, uint256 newTotalStaked, uint256 currentRewardRate);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp, uint256 newTotalStaked, uint256 currentRewardRate, uint256 rewardsAccrued);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp, uint256 newPendingRewards, uint256 totalStaked);
    event EmergencyWithdrawn(address indexed user, uint256 amount, uint256 penalty, uint256 timestamp, uint256 newTotalStaked);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate, uint256 timestamp, uint256 totalStaked);
    event Paused(address account);
    event Unpaused(address account);
    event StakingPaused(uint256 timestamp);
    event StakingUnpaused(uint256 timestamp);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event StakingInitialized(address indexed stakingToken, uint256 initialRewardRate, uint256 timestamp);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused);
        _;
    }
    
    modifier whenStakingNotPaused() {
        require(!stakingPaused);
        _;
    }
    
    // Constructor
    constructor(
        address _stakingToken,
        uint256 _initialApr,
        uint256 _minLockDuration,
        uint256 _aprReductionPerThousand,
        uint256 _emergencyWithdrawPenalty
    ) public {
        require(_stakingToken != address(0));
        require(_initialApr > 0);
        require(_minLockDuration > 0);
        
        stakingToken = IERC20(_stakingToken);
        owner = msg.sender;
        initialApr = _initialApr;
        minLockDuration = _minLockDuration;
        aprReductionPerThousand = _aprReductionPerThousand;
        emergencyWithdrawPenalty = _emergencyWithdrawPenalty;
        
        rewardRate = _initialApr;
        lastUpdateTime = block.timestamp;
        
        emit StakingInitialized(_stakingToken, _initialApr, block.timestamp);
    }
    
    // View functions
    function PRECISION() external pure returns (uint256) {
        return 1e18;
    }
    
    function REWARDS_PER_MINUTE_PRECISION() external pure returns (uint256) {
        return 1e18;
    }
    
    function currentRewardRate() external view returns (uint256) {
        return rewardRate;
    }
    
    function getPendingRewards(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        return user.pendingRewards;
    }
    
    function getTimeUntilUnlock(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        if (user.stakedAmount == 0) return 0;
        
        uint256 unlockTime = user.lastStakeTimestamp.add(minLockDuration);
        if (block.timestamp >= unlockTime) return 0;
        return unlockTime.sub(block.timestamp);
    }
    
    function getTotalRewards() external view returns (uint256) {
        return totalRewards;
    }
    
    function getUserDetails(address _user) external view returns (
        uint256 stakedAmount,
        uint256 lastStakeTimestamp,
        uint256 pendingRewards,
        uint256 timeUntilUnlock,
        bool canWithdraw
    ) {
        UserInfo storage user = userInfo[_user];
        stakedAmount = user.stakedAmount;
        lastStakeTimestamp = user.lastStakeTimestamp;
        pendingRewards = user.pendingRewards;
        timeUntilUnlock = getTimeUntilUnlock(_user);
        canWithdraw = (block.timestamp >= user.lastStakeTimestamp.add(minLockDuration)) && user.stakedAmount > 0;
    }
    
    // Core staking functions
    function stake(uint256 _amount) external whenNotPaused whenStakingNotPaused {
        require(_amount > 0);
        require(stakingToken.transferFrom(msg.sender, address(this), _amount));
        
        UserInfo storage user = userInfo[msg.sender];
        
        // Update rewards for existing stakes
        if (user.stakedAmount > 0) {
            updateReward(msg.sender);
        }
        
        // Add new stake
        user.stakedAmount = user.stakedAmount.add(_amount);
        user.lastStakeTimestamp = block.timestamp;
        
        totalStaked = totalStaked.add(_amount);
        
        emit Staked(msg.sender, _amount, block.timestamp, totalStaked, rewardRate);
    }
    
    function withdraw(uint256 _amount) external whenNotPaused {
        require(_amount > 0);
        
        UserInfo storage user = userInfo[msg.sender];
        require(user.stakedAmount >= _amount);
        require(block.timestamp >= user.lastStakeTimestamp.add(minLockDuration), "Still locked");
        
        // Update rewards
        updateReward(msg.sender);
        
        // Calculate rewards
        uint256 rewards = user.pendingRewards;
        
        // Reduce stake
        user.stakedAmount = user.stakedAmount.sub(_amount);
        totalStaked = totalStaked.sub(_amount);
        
        // Transfer staked amount and rewards
        require(stakingToken.transfer(msg.sender, _amount));
        if (rewards > 0) {
            require(stakingToken.transfer(msg.sender, rewards));
            user.pendingRewards = 0;
            totalRewards = totalRewards.sub(rewards);
        }
        
        emit Withdrawn(msg.sender, _amount, block.timestamp, totalStaked, rewardRate, rewards);
    }
    
    function claimRewards() external whenNotPaused {
        UserInfo storage user = userInfo[msg.sender];
        updateReward(msg.sender);
        
        uint256 rewards = user.pendingRewards;
        require(rewards > 0);
        
        user.pendingRewards = 0;
        require(stakingToken.transfer(msg.sender, rewards));
        totalRewards = totalRewards.sub(rewards);
        
        emit RewardsClaimed(msg.sender, rewards, block.timestamp, user.pendingRewards, totalStaked);
    }
    
    function emergencyWithdraw() external whenNotPaused {
        UserInfo storage user = userInfo[msg.sender];
        require(user.stakedAmount > 0);
        
        uint256 amount = user.stakedAmount;
        uint256 penalty = amount.mul(emergencyWithdrawPenalty).div(1000);
        uint256 amountToReturn = amount.sub(penalty);
        
        // Clear user info
        user.stakedAmount = 0;
        user.pendingRewards = 0;
        user.lastStakeTimestamp = 0;
        
        totalStaked = totalStaked.sub(amount);
        
        // Transfer back to user (penalty stays in contract)
        require(stakingToken.transfer(msg.sender, amountToReturn));
        
        emit EmergencyWithdrawn(msg.sender, amount, penalty, block.timestamp, totalStaked);
    }
    
    // Admin functions
    function setInitialApr(uint256 _newApr) external onlyOwner {
        require(_newApr > 0);
        uint256 oldRate = rewardRate;
        rewardRate = _newApr;
        lastUpdateTime = block.timestamp;
        
        emit RewardRateUpdated(oldRate, _newApr, block.timestamp, totalStaked);
    }
    
    function setMinLockDuration(uint256 _newDuration) external onlyOwner {
        require(_newDuration > 0);
        minLockDuration = _newDuration;
    }
    
    function setAprReductionPerThousand(uint256 _newReduction) external onlyOwner {
        aprReductionPerThousand = _newReduction;
    }
    
    function setEmergencyWithdrawPenalty(uint256 _newPenalty) external onlyOwner {
        emergencyWithdrawPenalty = _newPenalty;
    }
    
    function pause() external onlyOwner {
        require(!paused);
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external onlyOwner {
        require(paused);
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    function pauseStaking() external onlyOwner {
        require(!stakingPaused);
        stakingPaused = true;
        emit StakingPaused(block.timestamp);
    }
    
    function unpauseStaking() external onlyOwner {
        require(stakingPaused);
        stakingPaused = false;
        emit StakingUnpaused(block.timestamp);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    // Internal functions
    function updateReward(address _user) internal {
        UserInfo storage user = userInfo[_user];
        if (user.stakedAmount > 0) {
            uint256 reward = calculateReward(_user);
            user.pendingRewards = user.pendingRewards.add(reward);
            user.rewardDebt = rewardRate.mul(user.stakedAmount).div(precision);
        }
    }
    
    function calculateReward(address _user) internal view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 timeDelta = block.timestamp.sub(lastUpdateTime);
        uint256 reward = user.stakedAmount.mul(rewardRate).mul(timeDelta).div(precision).div(1 minutes);
        return reward;
    }
    
    // Utility functions
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        require(tokenAddress != address(stakingToken));
        IERC20(tokenAddress).transfer(owner, tokenAmount);
    }
}

// Minimal IERC20 interface
contract IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

// SafeMath library for older Solidity
library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }
    
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a / b;
        return c;
    }
    
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }
    
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}