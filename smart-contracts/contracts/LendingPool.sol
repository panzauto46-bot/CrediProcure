// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./InvoiceNFT.sol";

contract LendingPool is Ownable, ReentrancyGuard {
    IERC20 public stablecoin;
    InvoiceNFT public invoiceNft;

    // LP related
    uint256 public totalLiquidity;
    mapping(address => uint256) public lpBalances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event InvoiceFunded(uint256 indexed tokenId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed tokenId, uint256 amount, uint256 interest);

    constructor(address _stablecoin, address _invoiceNft, address _initialOwner) Ownable(_initialOwner) {
        stablecoin = IERC20(_stablecoin);
        invoiceNft = InvoiceNFT(_invoiceNft);
    }

    // LPs deposit stablecoin to the pool
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        stablecoin.transferFrom(msg.sender, address(this), amount);
        lpBalances[msg.sender] += amount;
        totalLiquidity += amount;
        emit Deposit(msg.sender, amount);
    }

    // LPs withdraw stablecoin
    function withdraw(uint256 amount) external nonReentrant {
        require(lpBalances[msg.sender] >= amount, "Insufficient balance");
        require(totalLiquidity >= amount, "Pool liquidity too low"); // partial reserve in real apps

        lpBalances[msg.sender] -= amount;
        totalLiquidity -= amount;
        stablecoin.transfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }

    // Admin funds an invoice from the pool 
    // In a real DAO, this would be voted or algorithmic based on RWA verification
    function fundInvoice(uint256 tokenId) external onlyOwner nonReentrant {
        InvoiceNFT.InvoiceData memory invoice = invoiceNft.getInvoice(tokenId);
        require(!invoice.isFunded, "Already funded");
        require(totalLiquidity >= invoice.amount, "Insufficient liquidity in pool");

        // Mark as funded
        invoiceNft.setFunded(tokenId, true);
        
        // Transfer funds to vendor/borrower
        stablecoin.transfer(invoice.vendor, invoice.amount);
        
        emit InvoiceFunded(tokenId, invoice.vendor, invoice.amount);
    }

    // P2P Funding: Investor funds specific invoice directly
    function fundInvoiceDirect(uint256 tokenId) external nonReentrant {
        InvoiceNFT.InvoiceData memory invoice = invoiceNft.getInvoice(tokenId);
        require(!invoice.isFunded, "Already funded");
        
        // Transfer funds from investor to vendor
        stablecoin.transferFrom(msg.sender, invoice.vendor, invoice.amount);
        
        // Mark as funded
        invoiceNft.setFunded(tokenId, true);

        emit InvoiceFunded(tokenId, invoice.vendor, invoice.amount);
    }
    
    // Borrower repays
    function repay(uint256 tokenId, uint256 amount) external nonReentrant {
        // Validation logic...
        stablecoin.transferFrom(msg.sender, address(this), amount);
        
        // Distribute interest to LPs (simplified: just increases totalLiquidity)
        totalLiquidity += amount; 
        
        emit LoanRepaid(tokenId, amount, 0);
    }
}
