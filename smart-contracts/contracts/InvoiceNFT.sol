// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InvoiceNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    struct InvoiceData {
        uint256 amount;
        uint256 dueDate;
        uint256 interestRate; // e.g. 500 = 5% basis points
        address vendor;
        bool isFunded;
    }

    mapping(uint256 => InvoiceData) public invoices;

    event InvoiceMinted(uint256 indexed tokenId, address indexed vendor, uint256 amount);

    constructor(address initialOwner) ERC721("CrediProcure Invoice", "CPI") Ownable(initialOwner) {}

    address public lendingPool;
    
    modifier onlyPool() {
        require(msg.sender == lendingPool || msg.sender == owner(), "Caller is not the lending pool or owner");
        _;
    }

    function setLendingPool(address _pool) external onlyOwner {
        lendingPool = _pool;
    }

    function setFunded(uint256 tokenId, bool status) external onlyPool {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        invoices[tokenId].isFunded = status;
    }

    function mintInvoice(
        address to,
        uint256 amount,
        uint256 dueDate,
        uint256 interestRate
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);

        invoices[tokenId] = InvoiceData({
            amount: amount,
            dueDate: dueDate,
            interestRate: interestRate,
            vendor: to,
            isFunded: false
        });

        emit InvoiceMinted(tokenId, to, amount);
        return tokenId;
    }

    function getInvoice(uint256 tokenId) public view returns (InvoiceData memory) {
        return invoices[tokenId];
    }
}
