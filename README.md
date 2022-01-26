# edufied-task
A contract (vesting + token) with a token (XYZ token, 18 decimal ) supply of 100 Million. Admin/token deployer can enter upto ten addresses where the token will disperse evenly for 12 months. Token release schedule will be per min.

Hosted on Pythonanywhere: https://vestingwallet.pythonanywhere.com/

## Contracts
Deployed on BSC Testnet

XYZ Token: https://testnet.bscscan.com//address/0x2F3DF634F29DFa994E05c936f29E419113c1b212

Vesting Wallet: https://testnet.bscscan.com//address/0x4D71BE3B0C4b59f478Ee2cE4C0b3731ddFC80677

## Tech Stack
Contracts: solidity, truffle, ganache

Front End: Html, CSS, javascript, Bootstrap, web3.js, web3modal

Testing: mocha, chai, truffle-assertions

## Usage
1. Requires an wallet like MetaMask (Connect MetaMask to BSC: https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain)

2. You'll need some test BNB on the BSC Testnet network. Visit a faucet to get some free test BNB. Make sure you've set your wallet network to BSC Testnet.

3. Visit the website link above.

4. Make sure your wallet is on the BSC Testnet. Press the "Connect" button. This will connect the wallet to the app so it can interact with the smart contract. Sadly only the contract owner can release tokens so you'll have to redeploy this contract to get full access.
