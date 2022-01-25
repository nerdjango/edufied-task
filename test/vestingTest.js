const Token = artifacts.require("XYZToken");
const VestingWallet = artifacts.require("TokenVesting");
const truffleAssert = require("truffle-assertions")

const Web3 = require("web3")

contract("Vesting", accounts => {
    it("should succeffully transfer tokens to VestingWallet", async() => {
        let token = await Token.deployed();
        let wallet = await VestingWallet.deployed();

        let accountTokenBalance = (await token.balanceOf(accounts[0])).toString();
        console.log(accountTokenBalance)

        await token.transfer(wallet.address, accountTokenBalance, { from: accounts[0] });
        let vestingTokenBalance = await token.balanceOf(wallet.address);

        let newAccountTokenBalance = await token.balanceOf(accounts[0]);
        let total = parseInt(newAccountTokenBalance.toString()) + parseInt(vestingTokenBalance)

        assert.equal(vestingTokenBalance, accountTokenBalance)

        assert.equal(parseInt(accountTokenBalance.toString()), total)
    })
})