// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./InvoiceNFT.sol";

contract LendingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum FundingType {
        None,
        Pool,
        Direct
    }

    struct FundingRecord {
        FundingType fundingType;
        address funder;
        uint256 principal;
        uint256 remainingPrincipal;
        uint256 totalDue;
        uint256 repaidAmount;
        bool settled;
    }

    IERC20 public stablecoin;
    InvoiceNFT public invoiceNft;

    uint256 public totalLiquidity;
    uint256 public liquidLiquidity;
    uint256 public totalPoolShares;

    mapping(address => uint256) public lpShares;
    mapping(uint256 => FundingRecord) public fundingRecords;

    event Deposit(address indexed user, uint256 amount, uint256 sharesMinted);
    event Withdraw(address indexed user, uint256 amount, uint256 sharesBurned);
    event InvoiceFunded(
        uint256 indexed tokenId,
        address indexed borrower,
        uint256 amount,
        address funder,
        bool viaPool
    );
    event LoanRepaid(
        uint256 indexed tokenId,
        uint256 amount,
        uint256 interest,
        address repayer,
        address recipient,
        bool viaPool
    );

    constructor(address _stablecoin, address _invoiceNft, address _initialOwner) Ownable(_initialOwner) {
        stablecoin = IERC20(_stablecoin);
        invoiceNft = InvoiceNFT(_invoiceNft);
    }

    function lpBalances(address user) public view returns (uint256) {
        if (totalPoolShares == 0 || totalLiquidity == 0) return 0;
        return Math.mulDiv(lpShares[user], totalLiquidity, totalPoolShares);
    }

    function getFundingRecord(uint256 tokenId) external view returns (FundingRecord memory) {
        return fundingRecords[tokenId];
    }

    function remainingDue(uint256 tokenId) public view returns (uint256) {
        FundingRecord memory record = fundingRecords[tokenId];
        if (record.fundingType == FundingType.None || record.settled) return 0;
        return record.totalDue - record.repaidAmount;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        uint256 sharesToMint = (totalPoolShares == 0 || totalLiquidity == 0)
            ? amount
            : Math.mulDiv(amount, totalPoolShares, totalLiquidity);
        require(sharesToMint > 0, "Deposit too small");

        stablecoin.safeTransferFrom(msg.sender, address(this), amount);

        lpShares[msg.sender] += sharesToMint;
        totalPoolShares += sharesToMint;
        totalLiquidity += amount;
        liquidLiquidity += amount;

        emit Deposit(msg.sender, amount, sharesToMint);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(totalLiquidity > 0 && totalPoolShares > 0, "Pool is empty");
        require(liquidLiquidity >= amount, "Pool liquid balance too low");

        uint256 userBalance = lpBalances(msg.sender);
        require(userBalance >= amount, "Insufficient LP balance");

        uint256 sharesToBurn = amount == userBalance
            ? lpShares[msg.sender]
            : Math.mulDiv(amount, totalPoolShares, totalLiquidity, Math.Rounding.Ceil);
        require(sharesToBurn > 0, "Withdraw too small");

        lpShares[msg.sender] -= sharesToBurn;
        totalPoolShares -= sharesToBurn;
        totalLiquidity -= amount;
        liquidLiquidity -= amount;

        stablecoin.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount, sharesToBurn);
    }

    function fundInvoice(uint256 tokenId) external onlyOwner nonReentrant {
        InvoiceNFT.InvoiceData memory invoice = invoiceNft.getInvoice(tokenId);
        require(invoice.status == InvoiceNFT.InvoiceStatus.Minted, "Invoice unavailable");
        require(fundingRecords[tokenId].fundingType == FundingType.None, "Invoice already funded");
        require(liquidLiquidity >= invoice.amount, "Insufficient liquid liquidity");

        uint256 totalDue = invoice.amount + Math.mulDiv(invoice.amount, invoice.yieldRate, 10_000);

        fundingRecords[tokenId] = FundingRecord({
            fundingType: FundingType.Pool,
            funder: address(this),
            principal: invoice.amount,
            remainingPrincipal: invoice.amount,
            totalDue: totalDue,
            repaidAmount: 0,
            settled: false
        });

        liquidLiquidity -= invoice.amount;
        invoiceNft.markFunded(tokenId);
        stablecoin.safeTransfer(invoice.vendor, invoice.amount);

        emit InvoiceFunded(tokenId, invoice.vendor, invoice.amount, address(this), true);
    }

    function fundInvoiceDirect(uint256 tokenId) external nonReentrant {
        InvoiceNFT.InvoiceData memory invoice = invoiceNft.getInvoice(tokenId);
        require(invoice.status == InvoiceNFT.InvoiceStatus.Minted, "Invoice unavailable");
        require(fundingRecords[tokenId].fundingType == FundingType.None, "Invoice already funded");

        uint256 totalDue = invoice.amount + Math.mulDiv(invoice.amount, invoice.yieldRate, 10_000);

        fundingRecords[tokenId] = FundingRecord({
            fundingType: FundingType.Direct,
            funder: msg.sender,
            principal: invoice.amount,
            remainingPrincipal: invoice.amount,
            totalDue: totalDue,
            repaidAmount: 0,
            settled: false
        });

        stablecoin.safeTransferFrom(msg.sender, invoice.vendor, invoice.amount);
        invoiceNft.markFunded(tokenId);

        emit InvoiceFunded(tokenId, invoice.vendor, invoice.amount, msg.sender, false);
    }

    function repay(uint256 tokenId, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        FundingRecord storage record = fundingRecords[tokenId];
        require(record.fundingType != FundingType.None, "Invoice not funded");
        require(!record.settled, "Invoice already settled");

        InvoiceNFT.InvoiceData memory invoice = invoiceNft.getInvoice(tokenId);
        require(invoice.vendor == msg.sender, "Only vendor can repay");

        uint256 dueLeft = record.totalDue - record.repaidAmount;
        require(amount <= dueLeft, "Repayment exceeds amount due");

        stablecoin.safeTransferFrom(msg.sender, address(this), amount);

        record.repaidAmount += amount;
        uint256 principalComponent = amount > record.remainingPrincipal ? record.remainingPrincipal : amount;
        record.remainingPrincipal -= principalComponent;
        uint256 interestComponent = amount - principalComponent;

        address payoutRecipient;
        bool viaPool = record.fundingType == FundingType.Pool;

        if (viaPool) {
            liquidLiquidity += amount;
            totalLiquidity += interestComponent;
            payoutRecipient = address(this);
        } else {
            payoutRecipient = record.funder;
            stablecoin.safeTransfer(record.funder, amount);
        }

        if (record.repaidAmount == record.totalDue) {
            record.settled = true;
            invoiceNft.markRepaid(tokenId);
        }

        emit LoanRepaid(tokenId, amount, interestComponent, msg.sender, payoutRecipient, viaPool);
    }
}
