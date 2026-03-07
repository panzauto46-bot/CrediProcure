// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract InvoiceNFT is ERC721, ERC721Enumerable, Ownable {
    uint256 private _tokenIdCounter;

    enum InvoiceStatus {
        Minted,
        Funded,
        Repaid
    }

    struct InvoiceData {
        uint256 id;
        address vendor;
        uint256 amount;
        uint256 dueDate;
        uint256 yieldRate; // Basis points (500 = 5%)
        InvoiceStatus status;
    }

    mapping(uint256 => InvoiceData) public invoices;
    address public lendingPool;

    event InvoiceMinted(
        uint256 indexed tokenId,
        address indexed vendor,
        uint256 amount,
        uint256 dueDate,
        uint256 yieldRate
    );
    event InvoiceStatusUpdated(uint256 indexed tokenId, InvoiceStatus status);

    constructor(address initialOwner) ERC721("CrediProcure Invoice RWA", "INV") Ownable(initialOwner) {}

    modifier onlyPool() {
        require(msg.sender == lendingPool, "Caller is not the lending pool");
        _;
    }

    function setLendingPool(address _lendingPool) external onlyOwner {
        lendingPool = _lendingPool;
    }

    function mintInvoice(uint256 amount, uint256 dueDate, uint256 yieldRate) external returns (uint256) {
        return _mintInvoice(msg.sender, amount, dueDate, yieldRate);
    }

    function adminMintInvoice(
        address to,
        uint256 amount,
        uint256 dueDate,
        uint256 yieldRate
    ) external onlyOwner returns (uint256) {
        return _mintInvoice(to, amount, dueDate, yieldRate);
    }

    function getInvoice(uint256 tokenId) external view returns (InvoiceData memory) {
        return invoices[tokenId];
    }

    function markFunded(uint256 tokenId) external onlyPool {
        require(_ownerOf(tokenId) != address(0), "Invoice does not exist");
        require(invoices[tokenId].status == InvoiceStatus.Minted, "Invoice is not mint-ready");

        invoices[tokenId].status = InvoiceStatus.Funded;
        emit InvoiceStatusUpdated(tokenId, InvoiceStatus.Funded);
    }

    function markRepaid(uint256 tokenId) external onlyPool {
        require(_ownerOf(tokenId) != address(0), "Invoice does not exist");
        require(invoices[tokenId].status == InvoiceStatus.Funded, "Invoice is not funded");

        invoices[tokenId].status = InvoiceStatus.Repaid;
        emit InvoiceStatusUpdated(tokenId, InvoiceStatus.Repaid);
    }

    function _mintInvoice(
        address to,
        uint256 amount,
        uint256 dueDate,
        uint256 yieldRate
    ) internal returns (uint256) {
        require(to != address(0), "Invalid vendor");
        require(amount > 0, "Amount must be > 0");
        require(dueDate > block.timestamp, "Due date must be in the future");
        require(yieldRate <= 5000, "Yield rate too high");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        invoices[tokenId] = InvoiceData({
            id: tokenId,
            vendor: to,
            amount: amount,
            dueDate: dueDate,
            yieldRate: yieldRate,
            status: InvoiceStatus.Minted
        });

        emit InvoiceMinted(tokenId, to, amount, dueDate, yieldRate);
        emit InvoiceStatusUpdated(tokenId, InvoiceStatus.Minted);
        return tokenId;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
