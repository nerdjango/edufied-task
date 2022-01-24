// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XYZToken is ERC20 {
    constructor() ERC20("XYZ Token", "XYZ") {
        _mint(msg.sender, 100000000 * 10 ** 18);
    }
}
