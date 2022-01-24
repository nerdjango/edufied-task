const Token = artifacts.require("XYZToken");

module.exports = function(deployer) {
    deployer.deploy(Token);
};