
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CrediProcure System", function () {
    let invoiceNft: any;
    let stablecoin: any;
    let lendingPool: any;
    let owner: any;
    let investor: any;
    let vendor: any;

    beforeEach(async function () {
        [owner, investor, vendor] = await ethers.getSigners();

        // Deploy MockStablecoin
        const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
        stablecoin = await MockStablecoin.deploy();
        await stablecoin.waitForDeployment();

        // Deploy InvoiceNFT
        const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
        invoiceNft = await InvoiceNFT.deploy(owner.address);
        await invoiceNft.waitForDeployment();

        // Deploy LendingPool
        const LendingPool = await ethers.getContractFactory("LendingPool");
        lendingPool = await LendingPool.deploy(stablecoin.target, invoiceNft.target, owner.address);
        await lendingPool.waitForDeployment();

        // Setup: Set LendingPool in InvoiceNFT
        await invoiceNft.setLendingPool(lendingPool.target);

        // Setup: Mint stablecoin to investor
        await stablecoin.mint(investor.address, ethers.parseUnits("1000", 18));
        await stablecoin.connect(investor).approve(lendingPool.target, ethers.parseUnits("1000", 18));
    });

    it("Should allow investor to deposit funds", async function () {
        await lendingPool.connect(investor).deposit(ethers.parseUnits("100", 18));
        expect(await lendingPool.lpBalances(investor.address)).to.equal(ethers.parseUnits("100", 18));
    });

    it("Should allow vendor to mint invoice and get funded", async function () {
        // 1. Investor deposits
        await lendingPool.connect(investor).deposit(ethers.parseUnits("500", 18));

        // 2. Vendor mints invoice
        await invoiceNft.connect(owner).mintInvoice(vendor.address, ethers.parseUnits("100", 18), 1234567890, 500);
        const tokenId = 0; // First token

        // 3. Admin funds invoice
        await lendingPool.connect(owner).fundInvoice(tokenId);

        // Check vendor balance
        expect(await stablecoin.balanceOf(vendor.address)).to.equal(ethers.parseUnits("100", 18));

        // Check invoice status
        const invoice = await invoiceNft.getInvoice(tokenId);
        expect(invoice.isFunded).to.equal(true);
    });
});
