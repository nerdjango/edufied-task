const Token = artifacts.require("XYZToken");
const VestingWallet = artifacts.require("TokenVesting");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(VestingWallet, Token.address, accounts);
};