# Celo Mainnet Deployment Guide

This guide provides step-by-step instructions to deploy the StakeHaven contracts to Celo mainnet.

## Prerequisites

1. **Celo Wallet**: Set up a Celo wallet (e.g., MetaMask) with Celo mainnet
2. **CELO Tokens**: Ensure you have sufficient CELO tokens for gas fees
3. **Contract Files**: The following Solidity files are ready for deployment:
   - `contracts/StakeHavenToken.sol` - ERC20 token contract
   - `contracts/StakingContract.sol` - Staking contract

## Deployment Methods

### Method 1: Remix IDE (Recommended for beginners)

1. **Open Remix IDE**: Go to [remix.ethereum.org](https://remix.ethereum.org)

2. **Create New Workspace**:
   - Create a new folder called `stakehaven-contracts`
   - Upload both Solidity files

3. **Configure Celo Network**:
   - Install Celo Extension in MetaMask
   - Add Celo mainnet RPC: `https://forno.celo.org`
   - Chain ID: `42220`

4. **Deploy Token Contract**:
   ```
   Compiler: 0.4.17+commit.bdeb9e52.Emscripten.clang
   Gas Limit: 3,000,000
   Value: 0 CELO
   
   Constructor Parameters:
   - initialSupply: 1000000000000000000000000 (1M tokens with 18 decimals)
   - treasury: [Your wallet address]
   ```

5. **Deploy Staking Contract**:
   ```
   Compiler: 0.4.17+commit.bdeb9e52.Emscripten.clang
   Gas Limit: 5,000,000
   Value: 0 CELO
   
   Constructor Parameters:
   - _stakingToken: [Token contract address from step 4]
   - _initialApr: 100000000000000000 (10% APR with 18 decimals)
   - _minLockDuration: 2592000 (30 days in seconds)
   - _aprReductionPerThousand: 1 (0.1% reduction per 1000 tokens)
   - _emergencyWithdrawPenalty: 50 (5% penalty)
   ```

### Method 2: Hardhat/Truffle (Advanced users)

1. **Install Dependencies**:
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   npm install @openzeppelin/contracts
   ```

2. **Configure Network** (hardhat.config.js):
   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   
   module.exports = {
     solidity: "0.4.17",
     networks: {
       celo: {
         url: "https://forno.celo.org",
         accounts: [process.env.PRIVATE_KEY],
       },
     },
   };
   ```

3. **Deploy Script**:
   ```javascript
   async function main() {
     const [deployer] = await ethers.getSigners();
     
     // Deploy token
     const Token = await ethers.getContractFactory("StakeHavenToken");
     const token = await Token.deploy(
       ethers.utils.parseEther("1000000"),
       deployer.address
     );
     await token.deployed();
     
     // Deploy staking
     const Staking = await ethers.getContractFactory("StakingContract");
     const staking = await Staking.deploy(
       token.address,
       ethers.utils.parseEther("0.1"),
       30 * 24 * 60 * 60, // 30 days
       1, // 0.1% reduction
       50 // 5% penalty
     );
     await staking.deployed();
     
     console.log("Token:", token.address);
     console.log("Staking:", staking.address);
   }
   ```

## Contract Parameters

### Token Contract
- **Name**: "StakeHaven Token"
- **Symbol**: "SHToken"
- **Decimals**: 18
- **Initial Supply**: 1,000,000 SHToken
- **Treasury**: Your wallet address

### Staking Contract
- **Initial APR**: 10% (0.1 with 18 decimals)
- **Min Lock Duration**: 30 days (2,592,000 seconds)
- **APR Reduction**: 0.1% per 1000 tokens staked
- **Emergency Withdrawal Penalty**: 5%

## Deployment Verification

After deployment, verify your contracts on [CeloScan](https://celoscan.io/):

1. Search for your contract addresses
2. Verify contract source code
3. Check that events are emitted correctly

## Frontend Integration

Once deployed, update your frontend contract addresses:

### In `src/contracts/tokenContract.ts`:
```typescript
export const TOKEN_CONTRACT_ADDRESS = "YOUR_DEPLOYED_TOKEN_ADDRESS" as const;
```

### In `src/contracts/stakingContract.ts`:
```typescript
export const STAKING_CONTRACT_ADDRESS = "YOUR_DEPLOYED_STAKING_ADDRESS" as const;
```

## Security Checklist

- [ ] Contracts verified on CeloScan
- [ ] Private keys secured and never committed
- [ ] Gas fees estimated and funded
- [ ] Contract ownership transferred to multisig (recommended)
- [ ] Emergency functions tested on testnet first
- [ ] Initial token distribution planned

## Troubleshooting

### Common Issues:

1. **Out of Gas**: Increase gas limit in deployment transaction
2. **Network Not Supported**: Ensure Celo network is properly configured
3. **Constructor Arguments**: Verify all parameters are correctly encoded
4. **Insufficient Balance**: Ensure sufficient CELO for gas fees

### Gas Estimates:
- Token Contract: ~2,000,000 gas
- Staking Contract: ~4,000,000 gas
- Total Estimated Cost: ~0.1-0.5 CELO

## Next Steps

1. Deploy to Celo testnet (Alfajores) first
2. Test all contract functions
3. Verify contracts on CeloScan
4. Update frontend addresses
5. Conduct security audit
6. Plan token distribution
7. Launch staking program

## Support

For deployment issues:
- Celo Documentation: [docs.celo.org](https://docs.celo.org)
- Remix Support: [Remix Discord](https://discord.gg/AXB8bw3)
- Celo Discord: [discord.gg/celo](https://discord.gg/celo)