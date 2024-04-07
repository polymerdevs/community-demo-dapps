//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import './base/UniversalChanIbcApp.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';

contract PolyNFT is UniversalChanIbcApp, ERC721Enumerable {
    uint256 public currentTokenId = 0;
    string public tokenURIC4 = 'https://emerald-uncertain-cattle-112.mypinata.cloud/ipfs/QmZu7WiiKyytxwwKSwr6iPT1wqCRdgpqQNhoKUyn1CkMD3';

    event MintAckReceived(address receiver, uint256 tokenId, string message);
    event NFTAckReceived(address voter, address recipient, uint256 voteId);

    enum NFTType {
        POLY1,
        POLY2,
        POLY3,
        POLY4,
        RAND
    }

    enum Operation {
        mint, burn
    }

    mapping(NFTType => string) public tokenURIs;
    mapping(NFTType => uint256) public tokenValues;
    mapping(uint256 => NFTType) public tokenTypeMap;
    mapping(NFTType => uint256[]) public typeTokenMap; 

    address public destPortAddr;
    bytes32 public channelId;

    constructor(address _middleware) UniversalChanIbcApp(_middleware) ERC721('PolymerC4NFT', 'POLY4') {
        tokenURIs[NFTType.POLY1] = 'https://aqua-worrying-boar-607.mypinata.cloud/ipfs/QmPW6ew5y7RCw9pc7u1Xis5Pq4W1YgeavTagMw9EfFQ4NH';
        tokenURIs[NFTType.POLY2] = 'https://aqua-worrying-boar-607.mypinata.cloud/ipfs/QmQV3T759hUzd5N5jnqYPPe5bvYF6XFAPk2wQhB52YqJ37';
        tokenURIs[NFTType.POLY3] = 'https://aqua-worrying-boar-607.mypinata.cloud/ipfs/QmPWaJte8tT65zm9QHexVRYgyb459BhvtGLnx5r12id57y';
        tokenURIs[NFTType.POLY4] = 'https://aqua-worrying-boar-607.mypinata.cloud/ipfs/Qmaje3cmMuqt7qSAXKVDWdYYehFcz39dNMpuYtk4qR16x9';
        tokenValues[NFTType.POLY1] = 10;
        tokenValues[NFTType.POLY2] = 50;
        tokenValues[NFTType.POLY3] = 150;
        tokenValues[NFTType.POLY4] = 500;
        tokenValues[NFTType.RAND] = 20;
    }

    function mint(address recipient, NFTType pType) internal returns (uint256) {
        require(pType != NFTType.RAND);
        currentTokenId += 1;
        uint256 tokenId = currentTokenId;
        tokenTypeMap[tokenId] = pType;
        typeTokenMap[pType].push(tokenId);
        _safeMint(recipient, tokenId);
        return tokenId;
    }

    function setDestPortAddr(address addr) public onlyOwner { 
        destPortAddr = addr;
    }
    
    function setChannelId(bytes32 id) public onlyOwner { 
        channelId = id;
    }

    function freeMint(address recipient, NFTType pType) public onlyOwner returns (uint256) {
        uint256 tokenId = mint(recipient, pType);
        return tokenId;
    }

    function randomMint(address recipient) internal returns (uint256) {
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100;
        NFTType pType;
        if (random < 40) {    //  && typeTokenMap[NFTType.POLY1].length <= 25
            pType = NFTType.POLY1;
        } else if (random >= 40 && random < 70 ) {
            pType = NFTType.POLY2;
        } else if (random >= 70 && random < 90 ) {
            pType = NFTType.POLY3;
        } else if (random >= 90 ) {
            pType = NFTType.POLY4;
        }
        uint256 tokenId = mint(recipient, pType);
        return tokenId;
    }

    function transferFrom() pure public {
        revert('Transfer not allowed');
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);
        return tokenURIs[tokenTypeMap[tokenId]];
    }

    function updateTokenURI(string memory _newTokenURI) public { 
        tokenURIC4 = _newTokenURI;
    }

    function getTokenId() public view returns (uint256) {
        return currentTokenId;
    }

    // IBC logic
    function _crossChainMint(address destportaddr, bytes32 channelid, uint64 timeoutSeconds, NFTType pType) internal {
        require(balanceOf(msg.sender) <= 4);
        
        uint256 fee = tokenValues[pType];
        bytes memory payload = abi.encode(msg.sender, Operation.mint, fee, pType, 0);

        uint64 timeoutTimestamp = uint64((block.timestamp + timeoutSeconds) * 1000000000);

        IbcUniversalPacketSender(mw).sendUniversalPacket(
            channelid, IbcUtils.toBytes32(destportaddr), payload, timeoutTimestamp
        );
    }

    function crossChainMint(uint64 timeoutSeconds, NFTType pType) public {
        _crossChainMint(destPortAddr, channelId, timeoutSeconds, pType);
    }

    function _crossChainBurn(address destportaddr, bytes32 channelid, uint64 timeoutSeconds, uint256 tokenIdforBurn) internal {
        require(msg.sender == ownerOf(tokenIdforBurn));
        
        NFTType pType = tokenTypeMap[tokenIdforBurn];
        uint256 refund = tokenValues[pType] / 5;
        bytes memory payload = abi.encode(msg.sender, Operation.burn, refund, pType, tokenIdforBurn);

        uint64 timeoutTimestamp = uint64((block.timestamp + timeoutSeconds) * 1000000000);

        IbcUniversalPacketSender(mw).sendUniversalPacket(
            channelid, IbcUtils.toBytes32(destportaddr), payload, timeoutTimestamp
        );
    }

    function crossChainBurn(uint64 timeoutSeconds, uint256 tokenIdforBurn) public {
        _crossChainBurn(destPortAddr, channelId, timeoutSeconds, tokenIdforBurn);
    }

    /**
     * @dev Packet lifecycle callback that implements packet receipt logic and returns and acknowledgement packet.
     *      MUST be overriden by the inheriting contract.
     *
     * @param channelid the ID of the channel (locally) the packet was received on.
     * @param packet the Universal packet encoded by the source and relayed by the relayer.
     */
    function onRecvUniversalPacket(bytes32 channelid, UniversalPacket calldata packet)
        external
        override
        onlyIbcMw
        returns (AckPacket memory ackPacket)
    {
        recvedPackets.push(UcPacketWithChannel(channelid, packet));

        (address payload, uint64 c) = abi.decode(packet.appData, (address, uint64));

        return AckPacket(true, abi.encode(256));
    }

    function onUniversalAcknowledgement(bytes32 channelid, UniversalPacket memory packet, AckPacket calldata ack)
        external
        override
        onlyIbcMw
    {
        ackPackets.push(UcAckWithChannel(channelid, packet, ack));

        if (ack.success) {
            (address sender, Operation op, NFTType pType, uint256 tokenId) = abi.decode(ack.data, (address, Operation, NFTType, uint256));
            if (op == Operation.mint) {
                uint256 tokenIdMinted;
                if (pType == NFTType.RAND) {
                    tokenIdMinted = randomMint(sender);
                } else {
                    tokenIdMinted = mint(sender, pType);
                } 
            } else if (op == Operation.burn) {
                _burn(tokenId);
            }
        } else {
            (uint64 aNumber) = abi.decode(ack.data, (uint64));
        }
    }


    function onTimeoutUniversalPacket(bytes32 channelid, UniversalPacket calldata packet) external override onlyIbcMw {
        timeoutPackets.push(UcPacketWithChannel(channelid, packet));
        // do logic
    }
}
