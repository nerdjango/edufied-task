const Token = artifacts.require("XYZToken");
const VestingWallet = artifacts.require("TokenVesting");
const truffleAssert = require("truffle-assertions")

const Web3 = require("web3")
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"))

const timeTravel = function(time) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [time], // 86400 is the number of seconds in a day
            id: new Date().getTime()
        }, (err, result) => {
            if (err) { return reject(err) }
            return resolve(result)
        })
    })
}

contract("Vesting", accounts => {
    it("should succeffully transfer tokens to VestingWallet", async() => {
        let token = await Token.deployed();
        let wallet = await VestingWallet.deployed();

        let accountTokenBalance = (await token.balanceOf(accounts[0])).toString();

        await token.transfer(wallet.address, accountTokenBalance, { from: accounts[0] });
        let vestingTokenBalance = await token.balanceOf(wallet.address);

        let newAccountTokenBalance = await token.balanceOf(accounts[0]);
        let total = parseInt(newAccountTokenBalance.toString()) + parseInt(vestingTokenBalance)

        assert.equal(vestingTokenBalance, accountTokenBalance)

        assert.equal(parseInt(accountTokenBalance.toString()), total)
    })
    it("should allow owner to release token if all the right conditions are met", async() => {
        let wallet = await VestingWallet.deployed();

        await truffleAssert.reverts(wallet.release({ from: accounts[0] })) // wait for 1 minute
        await truffleAssert.reverts(wallet.release({ from: accounts[1] })) // user not owner

        await timeTravel(57); // travel 1 minute ahead (works with ganache)
        await truffleAssert.passes(wallet.release({ from: accounts[0] }))
    })
    it("should ensure that the released amount per minute is accurate", async() => {
        let token = await Token.deployed();
        let wallet = await VestingWallet.deployed();

        let tokenTotalSupply = 100000000
        let releaseablePerMinute = tokenTotalSupply / (365 * 24 * 60) // Minimum releasable amount per minute

        let tokenReleased = await wallet.released(token.address)
        tokenReleased = Web3.utils.fromWei(tokenReleased.toString(), "ether")

        assert(tokenReleased >= releaseablePerMinute) // considering that the release was made some seconds over a minute so it won't be exact.

        let accountTokenBalance = (await token.balanceOf(accounts[0])).toString();
        accountTokenBalance = Web3.utils.fromWei(accountTokenBalance.toString(), "ether")

        assert(accountTokenBalance == tokenReleased / 10)

        await timeTravel(10); // travel 10 seconds
        await truffleAssert.reverts(wallet.release({ from: accounts[0] }))
        await timeTravel(50); // travel 50 seconds to complete 1 minute
        await truffleAssert.passes(wallet.release({ from: accounts[0] }))
    })
})