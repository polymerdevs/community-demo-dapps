//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "../base/CustomChanIbcApp.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

/**
 * @title nft-mint
 * @dev Implements minting process,
 * and ability to send cross-chain instruction to mint NFT on counterparty
 */
contract OptContract is ERC721, CustomChanIbcApp, ERC721Burnable {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private currentTokenId;

    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    // Base URI
    string private _baseURIextended;
    uint256 public tokenID;

    enum IbcPacketStatus {
        UNSENT,
        SENT,
        ACKED,
        TIMEOUT
    }

    address public chairperson;

    event AckNFTMint(
        bytes32 channelId,
        uint sequence,
        address indexed voter,
        uint voteNFTid
    );

    /**
     * @dev Create a new ballot to choose one of 'proposalNames' and make it IBC enabled to send proof of Vote to counterparty
     * @param _dispatcher vIBC dispatcher contract
     * @param proposalNames names of proposals
     */
    constructor(
        IbcDispatcher _dispatcher,
        bytes32[] memory proposalNames
    ) CustomChanIbcApp(_dispatcher) ERC721("JokeNFT", "JNFT") {
        chairperson = msg.sender;
    }

    // IBC methods

    /**
     * @dev Sends a packet with a greeting message over a specified channel.
     * @param channelId The ID of the channel to send the packet to.
     * @param timeoutSeconds The timeout in seconds (relative).
     * @param voterAddress the address of the voter
     * @param str recipient the address on the destination (Base) that will have NFT minted
     */
    function sendPacket(
        bytes32 channelId,
        uint64 timeoutSeconds,
        address voterAddress,
        string memory str
    ) external {
        string memory jokeFromId = _jokes[tokenID];
        address owner = _minter[tokenID];
        bytes memory payload = abi.encode(owner, jokeFromId);

        uint64 timeoutTimestamp = uint64(
            (block.timestamp + timeoutSeconds) * 1000000000
        );

        dispatcher.sendPacket(channelId, payload, timeoutTimestamp);
    }

    function onRecvPacket(
        IbcPacket memory
    )
        external
        view
        override
        onlyIbcDispatcher
        returns (AckPacket memory ackPacket)
    {
        require(false, "This function should not be called");

        return
            AckPacket(
                true,
                abi.encode("Error: This function should not be called")
            );
    }

    function onAcknowledgementPacket(
        IbcPacket calldata packet,
        AckPacket calldata ack
    ) external override onlyIbcDispatcher {
        ackPackets.push(ack);

        // decode the ack data, find the address of the voter the packet belongs to and set ibcNFTMinted true
        (address voterAddress, uint256 voteNFTid) = abi.decode(
            ack.data,
            (address, uint256)
        );

        emit AckNFTMint(
            packet.src.channelId,
            packet.sequence,
            voterAddress,
            voteNFTid
        );
    }

    function onTimeoutPacket(
        IbcPacket calldata packet
    ) external override onlyIbcDispatcher {
        timeoutPackets.push(packet);
        // do logic
    }

    function setBaseURI(string memory baseURI_) external {
        _baseURIextended = baseURI_;
    }

    function _setTokenURI(
        uint256 tokenId,
        string memory _tokenURI
    ) internal virtual {
        //require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        //require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
        return string(abi.encodePacked(base, tokenId.toString()));
    }

    mapping(uint256 => string) public _jokes;
    mapping(uint256 => address) public _minter;

    function mint(string memory tokenURI_) external {
        address _to = msg.sender;
        currentTokenId.increment();
        uint256 tokenId = currentTokenId.current();
        _mint(_to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        _jokes[tokenId] = tokenURI_;
        tokenID = tokenId;
        _minter[tokenId] = msg.sender;
    }

    mapping(uint256 => bool) private _activeTokens;

    // Функція для погашення NFT за його ID
    function burn(uint256 tokenId) public virtual override {
        address owner = ownerOf(tokenId);
        require(
            msg.sender == owner,
            "ERC721: caller is not owner nor approved"
        );

        _burn(tokenId);
        _activeTokens[tokenId] = false;
    }
}
