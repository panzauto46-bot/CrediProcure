
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
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

    const deployment = {
        network: network.name,
        chainId: Number(network.chainId),
        deployer: deployer.address,
        contracts: {
            MockStablecoin: stablecoin.target,
            InvoiceNFT: invoiceNft.target,
            LendingPool: lendingPool.target,
        },
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFileName = network.name === "creditcoinTestnet"
        ? "creditcoin-testnet.json"
        : `${network.name}.json`;
    const deploymentPath = path.join(deploymentsDir, deploymentFileName);
    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
    console.log(`Saved deployment metadata to: ${deploymentPath}`);

    // Copy ABIs to frontend (src/abis)
    const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
    const destDir = path.join(__dirname, "..", "..", "src", "abis");
    const frontendConfigDir = path.join(__dirname, "..", "..", "src", "config");

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    if (!fs.existsSync(frontendConfigDir)) {
        fs.mkdirSync(frontendConfigDir, { recursive: true });
    }

    const contracts = ["InvoiceNFT", "LendingPool", "MockStablecoin"];

    contracts.forEach(contract => {
        const artifactPath = path.join(artifactsDir, `${contract}.sol`, `${contract}.json`);
        const destPath = path.join(destDir, `${contract}.json`);

        if (fs.existsSync(artifactPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
            // We only need the ABI
            const abiData = { abi: artifact.abi };
            fs.writeFileSync(destPath, JSON.stringify(abiData, null, 2));
            console.log(`Copied ABI for ${contract}`);
        }
    });

    const frontendConfig = `export const CONTRACT_ADDRESSES = ${JSON.stringify(deployment.contracts, null, 2)} as const;\n`;
    fs.writeFileSync(path.join(frontendConfigDir, "contracts.ts"), frontendConfig);
    console.log("Updated frontend contract config");

    // Verify contracts (if on live network)
    // ...
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
