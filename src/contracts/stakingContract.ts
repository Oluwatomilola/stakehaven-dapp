// Contract configuration for the staking contract
export const STAKING_CONTRACT_ADDRESS = "0x..." as const; // Replace with your deployed contract address

// Replace this with your actual contract ABI
export const STAKING_CONTRACT_ABI = [
  // Add your contract ABI here
  // Example structure:
  {
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable", 
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyWithdraw", 
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Add read functions
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getUserStake",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getPendingRewards", 
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;