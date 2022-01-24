//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./Token.sol";
import "./OZ/VestingWalletUpdated.sol"; // VestingWallet adapted for multiple beneficiaries and Token Only vesting.

contract TokenVesting is VestingWalletUpdated {
    constructor(
        address _tokenAddress,
        address[] memory beneficiariesAddress, 
        uint64 startTimestamp,
        uint64 durationSeconds
        ) VestingWalletUpdated(beneficiariesAddress, startTimestamp, durationSeconds) {
        require(_tokenAddress != address(0));
        TokenAddress = _tokenAddress;
    }
    address public TokenAddress;
}