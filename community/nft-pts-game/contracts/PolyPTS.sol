//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import './base/UniversalChanIbcApp.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract PolyPTS is UniversalChanIbcApp, ERC20 {
    event TokenMint(address indexed receiver, uint256 amount);
    event TokenBurn(address indexed receiver, uint256 amount);
    event TransferSuccess();
    event TransferFailure();

    address public destAddr;

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

    constructor(address _middleware) UniversalChanIbcApp(_middleware) ERC20('point', 'PTS') {}

    function mint(address account, uint256 amount) public virtual onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public virtual onlyOwner {
        _burn(account, amount);
    }

    function setAddr(address addr) public onlyOwner {
        destAddr = addr;
    }

    // IBC logic

    /**
     * @dev Sends a packet with the caller's address over the universal channel.
     * @param destPortAddr The address of the destination application.
     * @param channelId The ID of the channel to send the packet to.
     * @param timeoutSeconds The timeout in seconds (relative).
     */
    function sendUniversalPacket(address destPortAddr, bytes32 channelId, uint64 timeoutSeconds) external {
        bytes memory payload = abi.encode(msg.sender, 5124);

        uint64 timeoutTimestamp = uint64((block.timestamp + timeoutSeconds) * 1000000000);

        IbcUniversalPacketSender(mw).sendUniversalPacket(
            channelId, IbcUtils.toBytes32(destPortAddr), payload, timeoutTimestamp
        );
    }

    function onRecvUniversalPacket(bytes32 channelId, UniversalPacket calldata packet)
        external
        override
        onlyIbcMw
        returns (AckPacket memory ackPacket)
    {
        recvedPackets.push(UcPacketWithChannel(channelId, packet));

        (address sender, Operation op, uint256 amount, NFTType pType, uint256 tokenId) = abi.decode(packet.appData, (address, Operation, uint256, NFTType, uint256));
                
        if (op == Operation.mint) {
            _burn(sender, amount*10**18);
            return AckPacket(true, abi.encode(sender, op, pType, tokenId));
        } else if (op == Operation.burn) {
            _mint(sender, amount*10**18);
            return AckPacket(true, abi.encode(sender, op, pType, tokenId));
        }

        return AckPacket(false, abi.encode(0));
    }

    /**
     * @dev Packet lifecycle callback that implements packet acknowledgment logic.
     *      MUST be overriden by the inheriting contract.
     *
     * @param channelId the ID of the channel (locally) the ack was received on.
     * @param packet the Universal packet encoded by the source and relayed by the relayer.
     * @param ack the acknowledgment packet encoded by the destination and relayed by the relayer.
     */
    function onUniversalAcknowledgement(bytes32 channelId, UniversalPacket memory packet, AckPacket calldata ack)
        external
        override
        onlyIbcMw
    {
        ackPackets.push(UcAckWithChannel(channelId, packet, ack));

        // decode the counter from the ack packet
        (uint64 _counter) = abi.decode(ack.data, (uint64));

    }


    function onTimeoutUniversalPacket(bytes32 channelId, UniversalPacket calldata packet) external override onlyIbcMw {
        timeoutPackets.push(UcPacketWithChannel(channelId, packet));
        // do logic
    }
}
