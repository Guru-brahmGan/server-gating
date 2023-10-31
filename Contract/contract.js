const { ethers } = require("ethers");
const gpuMarketplaceABI = require("./gpuMarketplaceABI.json");
require('dotenv').config()

const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
const gpuMarketplaceAddress = "0xb937659FAd15E55E24BBC159A7f7D4D6Ce8cfb2B";


const gpuMarketplaceContract = () => {

    const provider = new ethers.providers.JsonRpcProvider(
        `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_KEY}`
    );

    const wallet = new ethers.Wallet(SERVER_PRIVATE_KEY);
    const connectedWallet = wallet.connect(provider);

    const gpuMarketplaceContract = new ethers.Contract(
        gpuMarketplaceAddress,
        gpuMarketplaceABI,
        connectedWallet
      );

    return {gpuMarketplaceContract,provider,wallet};

}

const gpuMarketplaceContractWS = () => {

    const websocketProvider = new ethers.providers.WebSocketProvider(
        `wss://polygon-mumbai.infura.io/ws/v3/${process.env.INFURA_KEY}`
    );

    const wallet = new ethers.Wallet(SERVER_PRIVATE_KEY);
    const connectedWalletWS = wallet.connect(websocketProvider);

    const gpuMarketplaceContractWS = new ethers.Contract(
        gpuMarketplaceAddress,
        gpuMarketplaceABI,
        connectedWalletWS
    );

    return {gpuMarketplaceContractWS};

}

module.exports = {
    gpuMarketplaceContractInstance:gpuMarketplaceContract,
    gpuMarketplaceContractWSInstance:gpuMarketplaceContractWS,
}