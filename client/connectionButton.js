"use strict";

const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

var user;
var tokenAddress = "0x2F3DF634F29DFa994E05c936f29E419113c1b212";
var vestingAddress = "0x4D71BE3B0C4b59f478Ee2cE4C0b3731ddFC80677";
var accounts;
var walletDisconnect;
var tokenSymbol;

// Contract Instances
let token;
let vesting;

// Unpkg imports
var web3;
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;


/**
 * Setup the orchestra
 */
function init() {

    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
    console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                rpc: {
                    97: "https://data-seed-prebsc-1-s1.binance.org:8545",
                },
                chainId: 97,
            }
        }
    };

    web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    console.log("Web3Modal instance is", web3Modal);
}


/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
    // Get a Web3 instance for the wallet
    const web3 = new Web3(provider);

    console.log("Web3 instance is", web3);

    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();
    // Load chain information over an HTTP API
    let chainData
    try {
        chainData = evmChains.getChain(chainId);
        document.querySelector("#network-name").textContent = chainData.name;
    } catch (e) {
        document.querySelector("#network-name").textContent = "Development Blockchain";
    }

    if (chainId != 97) {
        await alert(`You're currently connected to the ${chainData.name}. Please connect to the Binance Smart Chain Testnet to access full functionality of this dApp!`)
        onDisconnect()
        return;
    }

    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);

    try {
        token = new web3.eth.Contract(abi.Token, tokenAddress, { from: accounts[0] })
        vesting = new web3.eth.Contract(abi.Vesting, vestingAddress, { from: accounts[0] })

        user = accounts[0]

        console.log(token)
        console.log(vesting)
    } catch (e) {
        console.log("Could not get contract instance", e);
        return;
    }

    if (token && vesting) {
        vesting.events.ERC20Released().on("data", function(event) {
                console.log(event)
                let amount = event.returnValues.amount
                amount = web3.utils.fromWei(amount, "ether");
                amount = parseFloat(amount).toFixed(4);
                $("#releasedEventEmitted").css("display", "block")
                $("#releasedEventEmitted").text(`${amount} XYZ has been shared amongst the your vesting wallet beneficiaries!`)
            })
            .on("error", console.error)
    }

    let tokenSymbol = await token.methods.symbol().call()

    let releasedTokens = await vesting.methods.released(tokenAddress).call()
    let releasedXYZ = web3.utils.fromWei(releasedTokens, "ether");
    releasedXYZ = parseFloat(releasedXYZ).toFixed(4);

    let walletBalance = await token.methods.balanceOf(vestingAddress).call();
    let walletXYZBalance = web3.utils.fromWei(walletBalance, "ether");
    walletXYZBalance = parseFloat(walletXYZBalance).toFixed(4);

    selectedAccount = accounts[0];

    document.querySelector("#selected-account").textContent = selectedAccount;
    document.querySelector("#released-xyz").textContent = `${releasedXYZ} ${tokenSymbol}`;
    document.querySelector("#vesting-wallet").textContent = `${walletXYZBalance} ${tokenSymbol}`;

    // Get a handl
    const template = document.querySelector("#template-balance");
    const accountContainer = document.querySelector("#accounts");

    // Purge UI elements any previously loaded accounts
    accountContainer.innerHTML = '';

    // Go through all accounts and get their ETH balance
    const rowResolvers = accounts.map(async(address) => {
        const balance = await token.methods.balanceOf(address).call();
        // ethBalance is a BigNumber instance
        const xyzBalance = web3.utils.fromWei(balance, "ether");
        const humanFriendlyBalance = parseFloat(xyzBalance).toFixed(4);
        // Fill in the templated row and put in the document
        const clone = template.content.cloneNode(true);
        if (!isMobile) {
            clone.querySelector(".address").textContent = address;
        } else {
            let firstPart = address.substring(0, 5)
            let lastPart = address.substring(37)
            let finalAddress = `${firstPart}...${lastPart}`
            clone.querySelector(".address").textContent = finalAddress;
        }

        clone.querySelector(".balance").textContent = `${humanFriendlyBalance} ${tokenSymbol}`;
        accountContainer.appendChild(clone);
    });

    // Because rendering account does its own RPC commucation
    // with Ethereum node, we do not want to display any results
    // until data for all accounts is loaded
    await Promise.all(rowResolvers);

    // Display fully loaded UI for wallet data
    document.querySelector("#prepare").style.display = "none";
    document.querySelector("#connect-alert").style.display = "none";
    document.querySelector("#connected").style.display = "block";
    document.querySelector("#connected-alert").style.display = "block";

    let vestingWalletOwner = await vesting.methods.owner().call()
    if (user == vestingWalletOwner) {
        document.querySelector("#btn-release").style.display = "block";
    } else {
        document.querySelector("#btn-release").style.display = "none";
    }
}



/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

    // If any current data is displayed when
    // the user is switching acounts in the wallet
    // immediate hide this data
    document.querySelector("#connected").style.display = "none";
    document.querySelector("#connected-alert").style.display = "none";
    document.querySelector("#prepare").style.display = "block";
    document.querySelector("#connect-alert").style.display = "block";

    // Disable button while UI is loading.
    // fetchAccountData() will take a while as it communicates
    // with Ethereum node via JSON-RPC and loads chain data
    // over an API call.
    document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    await fetchAccountData(provider);
    document.querySelector("#btn-connect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {

    console.log("Opening a dialog", web3Modal);
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

    console.log("Killing the wallet connection", provider);

    // TODO: Which providers have close method?
    if (provider.close) {
        await provider.close();

        // If the cached provider is not cleared,
        // WalletConnect will default to the existing session
        // and does not allow to re-scan the QR code with a new wallet.
        // Depending on your use case you may want or want not his behavir.
        await web3Modal.clearCachedProvider();
    } else {
        await web3Modal.clearCachedProvider();
    }

    provider = null;
    web3 = null;
    selectedAccount = null;

    // Set the UI back to the initial state
    document.querySelector("#prepare").style.display = "block";
    document.querySelector("#connect-alert").style.display = "block";
    document.querySelector("#connected").style.display = "none";
    document.querySelector("#connected-alert").style.display = "none";
    document.querySelector("#btn-release").style.display = "none";
}

async function releaseTokens() {
    vesting.methods.release().send({}, function(err, txHash) {
        if (err) {
            console.log(err);
        } else {
            fetchAccountData()
            console.log(txHash);
        }
    })
}


/**
 * Main entry point.
 */
window.addEventListener('load', async() => {
    init();
    document.querySelector("#btn-connect").addEventListener("click", onConnect);
    document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
    document.querySelector("#btn-release").addEventListener("click", releaseTokens);

    if (web3Modal.cachedProvider) {
        onConnect()
    }
});