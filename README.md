# Stakehaven – Web3 Staking & Rewards DApp

Stakehaven is a lightweight, user-friendly Web3 staking dApp that lets users stake ERC‑20 tokens, earn on‑chain rewards, and track leaderboards — all with simple wallet integration and transparent smart contracts.

📱 Overview

Stakehaven is designed to make staking accessible and engaging:

- Seamless Web3 wallet integration (MetaMask, Coinbase Wallet, WalletConnect)
- Fast L2 support (configurable RPC)
- On‑chain reward distribution (no centralized backend for payouts)
- Simple UX for staking, unstaking, and claiming rewards
- Secure contracts with standard OpenZeppelin protections

Primary user flows:

- Connect a Web3 wallet
- Deposit (stake) an ERC‑20 token
- Earn rewards proportionally to stake and time
- Withdraw (unstake) and claim rewards on‑chain

No complicated onboarding. Connect → stake → earn → claim.

🚀 Status

- Branch: dev‑updates
- Deployment: (Add your production addresses below after deploy)

Production Contracts (placeholders — update after deploy)

- StakingPool: 0x... (update)
- RewardToken (ERC‑20): 0x... (update)
- Network: (e.g. Base Mainnet) Chain ID: ...
- Compiler: Solidity v0.8.20
- Optimization: 200 runs

Contract Details (example)

Property | Value
---|---
Deployer | 0x...
Gas Used | ~1,200,000
Deploy Cost | ~0.03 ETH
Initial Reward Pool | 100 ETH (or token amount)
Reward Model | Proportional to stake + time

Quick Links

- Explorer: (your chain explorer link)
- Frontend: (deployed frontend URL)
- Contracts: /contracts/src/

🧠 Features

Wallet Integration

- Works with MetaMask, Coinbase Wallet, and WalletConnect
- Instant balance and allowance updates
- Connect, disconnect, and switch networks with clear UI prompts

Staking & Rewards

- Stake any supported ERC‑20 token (configured in contracts)
- Flexible staking: stake, top‑up, partial withdraw
- Rewards accrue on‑chain and can be claimed anytime
- Optional lock periods (configurable per pool)
- Reward distribution handled by the StakingPool contract — no off‑chain payout needed

Stake UI

- Stake amount input with balance check and approve flow
- Stake history and current active stakes
- Real‑time APY / reward rate display
- Claim rewards button with gas estimation and descriptive toast

Admin Tools (onlyOwner)

- Create or retire staking pools
- Top up reward pools
- Set reward rates and lock parameters
- Emergency withdraw (admin only) for migration or upgrades

🏆 Leaderboard (Optional)

- Track top stakers by total staked value or rewards earned
- Weekly snapshots for rewarding top participants
- Username registration for social features

🧩 Architecture

High‑level flow

Wallet → Frontend (Next.js) → StakingPool.sol (contracts) → ERC‑20 Reward Token

System Diagram

+------------------+    +------------------+    +------------------+
|  Frontend (Next) | <-> |  StakingPool.sol | <-> |  RewardToken (ERC20) |
+------------------+    +------------------+    +------------------+

The smart contracts are the single source of truth: stakes, rewards, and claims all executed on‑chain.

🧰 Tech Stack

Smart Contracts

- Solidity 0.8.20
- Foundry (Forge) for testing & deployment
- OpenZeppelin Contracts
- Optional: Chainlink Keepers / Timers for scheduled tasks

Frontend

- Next.js (App Router)
- React 18 + TypeScript
- Wagmi v2 + Viem for wallet & RPC interactions
- TailwindCSS for styling
- React‑Hot‑Toast / Radix UI for notifications & components

Backend

- On‑chain first. Minimal off‑chain services if necessary (indexer for enhanced analytics)

📦 Project Structure (example)

Stakehaven/
  ├── contracts/               # Smart contracts (Foundry)
  │    ├── src/
  │    │    ├── StakingPool.sol
  │    │    ├── RewardToken.sol
  │    │    └── Migrations/*.sol
  │    ├── script/            # Deployment scripts
  │    │    ├── Deploy.s.sol
  │    │    └── FundRewards.s.sol
  │    ├── test/              # Contract tests
  │    └── foundry.toml       # Foundry config
  ├── frontend/
  │    ├── src/
  │    │    ├── app/          # Next.js pages
  │    │    ├── components/   # React components
  │    │    ├── hooks/        # Custom hooks
  │    │    ├── config/       # Contract ABIs & addresses
  │    │    └── contexts/     # React contexts
  │    ├── public/
  │    └── package.json
  ├── scripts/                # Convenience scripts
  └── README.md

🔐 Smart Contracts

StakingPool.sol (Main Contract)

Manages staking, reward accrual, and claim logic. Key features:

- Deposit (stake) ERC‑20 tokens
- Withdraw (unstake) with optional lock period
- Claim rewards calculated pro rata by stake and time
- Admin controls to fund/unfund reward pools

Key functions (examples):

- function stake(uint256 amount) external;
- function withdraw(uint256 amount) external;
- function claimRewards() external;
- function addRewardFunds(uint256 amount) external onlyOwner;
- function createPool(... ) external onlyOwner;

RewardToken.sol (ERC‑20)

- Standard OpenZeppelin ERC‑20 token (if using a native reward token)
- Mintable by deployer/owner for initial pools (if applicable)

🔧 Setup & Installation

1) Clone the repo

git clone https://github.com/Oluwatomilola/stakehaven-dapp.git
cd stakehaven-dapp

2) Install dependencies

Smart Contracts (Foundry)

cd contracts
forge install

Frontend

cd frontend
npm install

⚙ Environment Variables

Create a .env.local file in /frontend and set the following:

# Contract Addresses (update after deployment)
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0x...
NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=0xD1b4aEefda0e5A3ba66168BfBc5b898b085179d7

# Network Configuration
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Deployer Private Key (for deployment only)
PRIVATE_KEY=your_private_key_here

🧪 Testing Smart Contracts

Run Foundry tests:

cd contracts
forge test
forge test -vvv # Verbose

🚀 Deploy Contracts (example using Foundry)

cd contracts

# Deploy to network (update RPC & chain details)
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY

# Fund contract with native token (if required)
cast send $STAKING_POOL_ADDRESS --value 0.5ether --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# Fund reward token / top up pool
forge script script/FundRewards.s.sol:FundRewards --rpc-url $RPC_URL --broadcast

🖥 Run Frontend Locally

npm run dev

Visit http://localhost:3000

🌐 Deploy Frontend

- Deploy using Vercel or any static hosting provider
- Add environment variables in production environment

📄 Smart Contract Events (examples)

event Staked(address indexed user, uint256 amount);
event Withdrawn(address indexed user, uint256 amount);
event RewardPaid(address indexed user, uint256 reward);
event PoolFunded(uint256 amount);
event PoolCreated(uint256 poolId);

🛡 Security

- ReentrancyGuard on mutating functions
- Access control using Ownable
- Input validation for user-provided values
- Emergency functions for admin in case of upgrade/migration
- Comprehensive test coverage in contracts/test

🔐 Input Sanitization (Frontend)

- All user inputs sanitized and validated on client before sending transactions
- Use zod for schema validation and sanitize strings where appropriate

🆘 Support & Contact

If you run into issues or have questions:

- Open an issue on GitHub
- Check contracts/ and scripts/ for deployment details
- Reach out via GitHub discussions or open an issue

🤝 Contributing

Contributions are welcome — please fork, open issues, or send PRs. Follow the code style and run tests before submitting.

📜 License

MIT License © 2025

🔗 Important Links

- Base Documentation: https://docs.base.org (if using Base)
- Foundry: https://book.getfoundry.sh/
- OpenZeppelin: https://docs.openzeppelin.com/

Notes

- Replace placeholder addresses and network details after deployment.
- If you want a version of this README focused on a specific network (Base mainnet, Sepolia, etc.), I can generate that and include deployed addresses and explorer links.
