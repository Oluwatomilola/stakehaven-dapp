# Staking Protocol Subgraph

This subgraph indexes all events from your staking contract and provides a GraphQL API for querying staking data.

## Setup Instructions

### 1. Install Dependencies

```bash
cd subgraph
npm install
```

### 2. Configure Network and Contract

Edit `subgraph.yaml`:
- Update `network` field (e.g., "mainnet", "sepolia", "polygon", etc.)
- Update contract `address` to your deployed staking contract
- Update `startBlock` to the block number when your contract was deployed

### 3. Create Subgraph on The Graph Studio

1. Go to [The Graph Studio](https://thegraph.com/studio/)
2. Connect your wallet
3. Click "Create a Subgraph"
4. Enter subgraph name: `staking-subgraph`
5. Copy the deploy command shown

### 4. Generate Code and Build

```bash
npm run codegen
npm run build
```

### 5. Deploy to The Graph Studio

```bash
# Replace with your actual subgraph slug from Studio
graph auth --studio YOUR_DEPLOY_KEY
npm run deploy
```

### 6. Update dApp Configuration

After deployment, update `src/lib/subgraph.ts`:
```typescript
const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/[SUBGRAPH_ID]/[SUBGRAPH_NAME]/[VERSION]'
```

## Local Development (Optional)

### 1. Start Local Graph Node

```bash
# Clone graph node
git clone https://github.com/graphprotocol/graph-node/
cd graph-node/docker
docker-compose up
```

### 2. Create and Deploy Locally

```bash
npm run create-local
npm run deploy-local
```

## Queries Available

The subgraph provides these main entity types:

- **User**: Staker information and totals
- **StakingPosition**: Individual stake transactions
- **RewardClaim**: Reward claim events
- **Withdrawal**: Withdrawal events
- **EmergencyWithdrawal**: Emergency withdrawal events
- **ProtocolStats**: Overall protocol statistics
- **DailyProtocolSnapshot**: Daily aggregated data
- **UserDailySnapshot**: Daily user data

## Integration with dApp

The dApp includes React Query hooks that automatically:
- Fetch user staking data
- Display real-time protocol stats
- Show historical analytics
- Track all user activities
- Provide activity feeds

## Schema Highlights

### Comprehensive Data Tracking
- All staking events with transaction hashes
- Daily snapshots for historical analysis
- User-specific and protocol-wide metrics
- Top stakers leaderboard
- Reward rate history

### Optimized for Single Queries
- Related data is connected via entity relationships
- Derived fields for common calculations
- Efficient querying of large datasets

## Example Queries

### Get User Data
```graphql
query GetUser($address: String!) {
  user(id: $address) {
    totalStaked
    totalClaimed
    stakingPositions {
      amount
      timestamp
    }
  }
}
```

### Get Protocol Stats
```graphql
query GetProtocolStats {
  protocolStats(id: "PROTOCOL_STATS") {
    totalStaked
    totalUsers
    currentRewardRate
  }
}
```

## Monitoring and Maintenance

- Check subgraph health in The Graph Studio
- Monitor sync status and indexing errors
- Update subgraph when contract is upgraded
- Review query performance and optimize as needed

## Network Support

This subgraph can be deployed on any EVM-compatible network supported by The Graph:
- Ethereum Mainnet
- Polygon
- Arbitrum
- Optimism
- Sepolia (testnet)
- And more...