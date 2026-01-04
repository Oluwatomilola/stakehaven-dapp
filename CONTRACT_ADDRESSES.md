# Contract Addresses Update Instructions

After deploying your contracts to Celo mainnet, you'll need to update the contract addresses in your frontend application.

## Deployment Results Template

Once you've deployed your contracts using the provided guide, you'll receive output like this:

```
=== DEPLOYMENT COMPLETE ===
Token Contract Address: 0x1234567890123456789012345678901234567890
Staking Contract Address: 0x0987654321098765432109876543210987654321

Update your frontend contract addresses with these values:
TOKEN_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"
STAKING_CONTRACT_ADDRESS = "0x0987654321098765432109876543210987654321"
```

## Updating Frontend Contract Addresses

### 1. Update Token Contract Address

In `src/contracts/tokenContract.ts`, replace the current address:

**Current (Line 2):**
```typescript
export const TOKEN_CONTRACT_ADDRESS = "0x188203c31eE000303e9dFA3EfC9f4671c7375E61" as const;
```

**Replace with your deployed address:**
```typescript
export const TOKEN_CONTRACT_ADDRESS = "YOUR_DEPLOYED_TOKEN_ADDRESS" as const;
```

### 2. Update Staking Contract Address

In `src/contracts/stakingContract.ts`, replace the current address:

**Current (Line 1):**
```typescript
export const STAKING_CONTRACT_ADDRESS = "0xf7f38c111d9e6fa0c388edd4409bde988571782a" as const;
```

**Replace with your deployed address:**
```typescript
export const STAKING_CONTRACT_ADDRESS = "YOUR_DEPLOYED_STAKING_ADDRESS" as const;
```

## Quick Update Commands

After getting your deployed addresses, you can use these commands to update the files:

### For Token Contract:
```bash
# Replace TOKEN_ADDRESS with your actual deployed token address
sed -i '' 's/export const TOKEN_CONTRACT_ADDRESS = ".*"/export const TOKEN_CONTRACT_ADDRESS = "TOKEN_ADDRESS"/' src/contracts/tokenContract.ts
```

### For Staking Contract:
```bash
# Replace STAKING_ADDRESS with your actual deployed staking contract address
sed -i '' 's/export const STAKING_CONTRACT_ADDRESS = ".*"/export const STAKING_CONTRACT_ADDRESS = "STAKING_ADDRESS"/' src/contracts/stakingContract.ts
```

## Verification Steps

1. **Check Contract Deployment**: Verify both contracts are deployed on [CeloScan](https://celoscan.io/)
2. **Update Frontend Files**: Replace the addresses in both TypeScript files
3. **Test Connection**: Verify your frontend can connect to the deployed contracts
4. **Build Application**: Run `npm run build` to ensure no compilation errors
5. **Deploy Frontend**: Deploy your updated frontend to production

## Environment Variables (Optional)

For additional security, you can also use environment variables:

### Create `.env.local`:
```
VITE_TOKEN_CONTRACT_ADDRESS=YOUR_TOKEN_ADDRESS
VITE_STAKING_CONTRACT_ADDRESS=YOUR_STAKING_ADDRESS
```

### Update TypeScript files to use environment variables:
```typescript
export const TOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS as const;
export const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT_ADDRESS as const;
```

## Important Notes

- **Never commit real private keys or sensitive deployment information**
- **Always test on Celo testnet (Alfajores) before mainnet deployment**
- **Verify contract source code on CeloScan for transparency**
- **Consider using a multisig wallet for contract ownership**
- **Keep deployment transaction hashes for records**

## Troubleshooting

If your frontend doesn't connect to the contracts:

1. Verify contract addresses are correct
2. Check that contracts are verified on CeloScan
3. Ensure Celo network is properly configured in your wallet
4. Check browser console for any connection errors
5. Verify ABI compatibility (the contracts match your frontend expectations)