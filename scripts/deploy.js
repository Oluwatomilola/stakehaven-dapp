// Deployment script for Celo mainnet
// This script can be run in Remix IDE or similar web-based Solidity IDE

const deployStakeHavenToken = async (deployer, initialSupply, treasury) => {
    console.log('Deploying StakeHavenToken...');
    
    const StakeHavenToken = await ethers.getContractFactory('StakeHavenToken');
    const token = await StakeHavenToken.deploy(initialSupply, treasury);
    
    await token.deployed();
    console.log('StakeHavenToken deployed to:', token.address);
    
    return token.address;
};

const deployStakingContract = async (deployer, stakingTokenAddress, initialApr, minLockDuration, aprReductionPerThousand, emergencyWithdrawPenalty) => {
    console.log('Deploying StakingContract...');
    
    const StakingContract = await ethers.getContractFactory('StakingContract');
    const staking = await StakingContract.deploy(
        stakingTokenAddress,
        initialApr,
        minLockDuration,
        aprReductionPerThousand,
        emergencyWithdrawPenalty
    );
    
    await staking.deployed();
    console.log('StakingContract deployed to:', staking.address);
    
    return staking.address;
};

const main = async () => {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with account:', deployer.address);
    
    // Contract parameters
    const INITIAL_SUPPLY = ethers.utils.parseEther('1000000'); // 1M tokens
    const TREASURY_ADDRESS = deployer.address; // Deployer address as treasury
    const INITIAL_APR = ethers.utils.parseEther('0.1'); // 10% APR
    const MIN_LOCK_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
    const APR_REDUCTION_PER_THOUSAND = 1; // 0.1% reduction per 1000 tokens
    const EMERGENCY_WITHDRAW_PENALTY = 50; // 5% penalty
    
    try {
        // Deploy token first
        const tokenAddress = await deployStakeHavenToken(deployer, INITIAL_SUPPLY, TREASURY_ADDRESS);
        
        // Deploy staking contract with token address
        const stakingAddress = await deployStakingContract(
            deployer,
            tokenAddress,
            INITIAL_APR,
            MIN_LOCK_DURATION,
            APR_REDUCTION_PER_THOUSAND,
            EMERGENCY_WITHDRAW_PENALTY
        );
        
        console.log('\n=== DEPLOYMENT COMPLETE ===');
        console.log('Token Contract Address:', tokenAddress);
        console.log('Staking Contract Address:', stakingAddress);
        console.log('\nUpdate your frontend contract addresses with these values:');
        console.log('TOKEN_CONTRACT_ADDRESS =', `"${tokenAddress}"`);
        console.log('STAKING_CONTRACT_ADDRESS =', `"${stakingAddress}"`);
        
    } catch (error) {
        console.error('Deployment failed:', error);
    }
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });