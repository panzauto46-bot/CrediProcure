// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InvoiceNFT is ERC721, ERC721Enumerable, Ownable {
    uint256 private _tokenIdCounter;

    struct InvoiceData {
        uint256 id;
        address vendor;
        uint256 amount;
        uint256 dueDate;
        uint256 yieldRate; // Basis points (500 = 5%)
        bool isFunded;
    }

    mapping(uint256 => InvoiceData) public invoices; // tokenId => Data
    address public lendingPool;

    event InvoiceMinted(uint256 indexed tokenId, address indexed vendor, uint256 amount);
    event InvoiceFunded(uint256 indexed tokenId);

    constructor(address initialOwner) ERC721("CrediProcure Invoice RWA", "INV") Ownable(initialOwner) {}

    modifier onlyPool() {
        require(msg.sender == lendingPool, "Caller is not the lending pool");
        _;
    }

    function setLendingPool(address _lendingPool) external onlyOwner {
        lendingPool = _lendingPool;
    }

    function mintInvoice(
        address to,
        uint256 amount,
        uint256 dueDate,
        uint256 yieldRate
    ) public onlyOwner returns (uint256) {
        // We use onlyOwner for hackathon (Platform mints for Vendor). 
        // In prod, could optionally allow public minting via 'to = msg.sender'
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);

        invoices[tokenId] = InvoiceData({
            id: tokenId,
            vendor: to,
            amount: amount,
            dueDate: dueDate,
            yieldRate: yieldRate,
            isFunded: false
        });

        emit InvoiceMinted(tokenId, to, amount);
        return tokenId;
    }

    function getInvoice(uint256 tokenId) external view returns (InvoiceData memory) {
        return invoices[tokenId];
    }

    function setFunded(uint256 tokenId, bool status) external onlyPool {
        require(_ownerOf(tokenId) != address(0), "Invoice does not exist");
        invoices[tokenId].isFunded = status;
        emit InvoiceFunded(tokenId);
    }

    // Required overrides for ERC721Enumerable
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
