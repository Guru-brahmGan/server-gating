const { ethers } = require("ethers");
const gpuMarketplaceABI = require("./gpuMarketplaceABI.json");
require('dotenv').config()

const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
const gpuMarketplaceAddress = "0xc22425f7D0382DeCF4A98C8088612107459A64e7";


const gpuMarketplaceContract = () => {

    const provider = new ethers.providers.JsonRpcProvider(
        `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`
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
        `wss://polygon-mainnet.infura.io/ws/v3/${process.env.INFURA_KEY}`
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