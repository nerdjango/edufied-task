//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./Token.sol";
import "./OZ/VestingWalletUpdated.sol"; // VestingWallet adapted for multiple beneficiaries and Token Only vesting.

contract TokenVesting is VestingWalletUpdated {
    constructor(
        address _tokenAddress,
        address[] memory beneficiariesAddress
        ) VestingWalletUpdated(beneficiariesAddress, uint64(block.timestamp), uint64(365 days)) {
        require(_tokenAddress != address(0));
        TokenAddress = _tokenAddress;
    }
    address public TokenAddress;
    uint scheduleTime = 1 minutes;
    uint64 nextReleaseTime;

    function release() external onlyOwner whenNotPaused {
        if (nextReleaseTime == 0){
            uint64 timestamp = uint64(block.timestamp);
            uint64 releaseTime = uint64(start() + scheduleTime);
            require(timestamp >= releaseTime, "TokenVesting: Wait for 1 minute, you'll be allowed to release more tokens");
        }
        require(uint64(block.timestamp)>=nextReleaseTime, "TokenVesting: After 1 minute you'll be allowed to release more tokens");
        _release(TokenAddress);
        nextReleaseTime = uint64(block.timestamp + scheduleTime);
    }

    function getVestedAmount() external view returns(uint) {
        return vestedAmount(TokenAddress, uint64(block.timestamp));
    }
}