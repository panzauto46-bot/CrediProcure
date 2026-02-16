
import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // 1. Deploy MockStablecoin (only for testnet/local, use real USDC on mainnet)
    const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
    const stablecoin = await MockStablecoin.deploy();
    await stablecoin.waitForDeployment();
    console.log(`MockStablecoin deployed to: ${stablecoin.target}`);

    // 2. Deploy InvoiceNFT
    const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
    const invoiceNft = await InvoiceNFT.deploy(deployer.address);
    await invoiceNft.waitForDeployment();
    console.log(`InvoiceNFT deployed to: ${invoiceNft.target}`);

    // 3. Deploy LendingPool
    const LendingPool = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPool.deploy(stablecoin.target, invoiceNft.target, deployer.address);
    await lendingPool.waitForDeployment();
    console.log(`LendingPool deployed to: ${lendingPool.target}`);

    // 4. Set LendingPool in InvoiceNFT
    await invoiceNft.setLendingPool(lendingPool.target);
    console.log("LendingPool address set in InvoiceNFT");

    // Verify contracts (if on live network)
    // ...
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
