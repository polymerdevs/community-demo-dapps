// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract SpinWheelGame is Ownable {
    IERC20 public token;
    uint256 public constant COOLDOWN_TIME = 5 minutes;

    mapping(address => uint256) public lastSpinTime;

    event Spun(address indexed user, uint256 reward);

    constructor() {}

    function setTokenAddr(IERC20 _token) public onlyOwner(){
        token = _token;
    }

    function spinTheWheel() public {
        require(block.timestamp - lastSpinTime[msg.sender] >= COOLDOWN_TIME, 'Cooldown period has not passed');
        
        uint256 reward = _getRandomReward();
        require(token.balanceOf(address(this)) >= reward, 'Insufficient tokens in contract for reward');

        lastSpinTime[msg.sender] = block.timestamp;

        // Transfer the reward to the user
        token.transfer(msg.sender, reward*10**18);

        emit Spun(msg.sender, reward);
    }

    function _getRandomReward() internal view returns (uint256) {
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 10 + 1; // reward between 1 to 10
        return random;
    }
}