import { expect } from "chai";
import { ethers } from "hardhat";

describe("CrediProcure System", function () {
    let invoiceNft: any;
    let stablecoin: any;
    let lendingPool: any;
    let owner: any;
    let investor: any;
    let vendor: any;

    const principal = ethers.parseUnits("100", 18);
    const yieldRate = 1000n; // 10%

    async function futureDueDate() {
        const block = await ethers.provider.getBlock("latest");
        return BigInt((block?.timestamp ?? 0) + 30 * 24 * 60 * 60);
    }

    beforeEach(async function () {
        [owner, investor, vendor] = await ethers.getSigners();

        const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
        stablecoin = await MockStablecoin.deploy();
        await stablecoin.waitForDeployment();

        const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
        invoiceNft = await InvoiceNFT.deploy(owner.address);
        await invoiceNft.waitForDeployment();

        const LendingPool = await ethers.getContractFactory("LendingPool");
        lendingPool = await LendingPool.deploy(stablecoin.target, invoiceNft.target, owner.address);
        await lendingPool.waitForDeployment();

        await invoiceNft.setLendingPool(lendingPool.target);

        await stablecoin.mint(investor.address, ethers.parseUnits("1000", 18));
        await stablecoin.connect(investor).approve(lendingPool.target, ethers.parseUnits("1000", 18));
    });

    it("allows LP deposits and withdrawals using share-based accounting", async function () {
        await lendingPool.connect(investor).deposit(ethers.parseUnits("250", 18));

        expect(await lendingPool.lpBalances(investor.address)).to.equal(ethers.parseUnits("250", 18));
        expect(await lendingPool.totalLiquidity()).to.equal(ethers.parseUnits("250", 18));
        expect(await lendingPool.liquidLiquidity()).to.equal(ethers.parseUnits("250", 18));

        await lendingPool.connect(investor).withdraw(ethers.parseUnits("50", 18));

        expect(await lendingPool.lpBalances(investor.address)).to.equal(ethers.parseUnits("200", 18));
        expect(await stablecoin.balanceOf(investor.address)).to.equal(ethers.parseUnits("800", 18));
    });

    it("allows vendors to self-mint invoices and receive direct repayment to the lender", async function () {
        const dueDate = await futureDueDate();
        await invoiceNft.connect(vendor).mintInvoice(principal, dueDate, yieldRate);

        await lendingPool.connect(investor).fundInvoiceDirect(0);

        let invoice = await invoiceNft.getInvoice(0);
        expect(invoice.status).to.equal(1n);
        expect(await stablecoin.balanceOf(vendor.address)).to.equal(principal);

        const totalDue = principal + (principal * yieldRate) / 10000n;
        await stablecoin.mint(vendor.address, totalDue);
        await stablecoin.connect(vendor).approve(lendingPool.target, totalDue);
        await lendingPool.connect(vendor).repay(0, totalDue);

        invoice = await invoiceNft.getInvoice(0);
        expect(invoice.status).to.equal(2n);

        const fundingRecord = await lendingPool.getFundingRecord(0);
        expect(fundingRecord.settled).to.equal(true);
        expect(await stablecoin.balanceOf(investor.address)).to.equal(ethers.parseUnits("1010", 18));
    });

    it("routes pool-funded repayment and interest back into LP liquidity", async function () {
        const dueDate = await futureDueDate();
        await lendingPool.connect(investor).deposit(ethers.parseUnits("500", 18));
        await invoiceNft.connect(vendor).mintInvoice(principal, dueDate, yieldRate);

        await lendingPool.connect(owner).fundInvoice(0);

        expect(await stablecoin.balanceOf(vendor.address)).to.equal(principal);
        expect(await lendingPool.totalLiquidity()).to.equal(ethers.parseUnits("500", 18));
        expect(await lendingPool.liquidLiquidity()).to.equal(ethers.parseUnits("400", 18));

        const totalDue = principal + (principal * yieldRate) / 10000n;
        await stablecoin.mint(vendor.address, totalDue);
        await stablecoin.connect(vendor).approve(lendingPool.target, totalDue);
        await lendingPool.connect(vendor).repay(0, totalDue);

        expect(await lendingPool.totalLiquidity()).to.equal(ethers.parseUnits("510", 18));
        expect(await lendingPool.liquidLiquidity()).to.equal(ethers.parseUnits("510", 18));
        expect(await lendingPool.lpBalances(investor.address)).to.equal(ethers.parseUnits("510", 18));

        const invoice = await invoiceNft.getInvoice(0);
        expect(invoice.status).to.equal(2n);
    });
});
