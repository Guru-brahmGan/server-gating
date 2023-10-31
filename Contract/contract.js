const { ethers } = require("ethers");

const gpuMarketplaceABI = require("./gpuMarketplaceABI.json");
const gpuMarketplaceAddress = "0xb937659FAd15E55E24BBC159A7f7D4D6Ce8cfb2B";
const SERVER_PRIVATE_KEY = "b76c042ef1476b7d8bbfa75290f270c943aae819053a3ba3334bd621d0034b6b";

const gpuMarketplaceContract = () => {

    const provider = new ethers.providers.JsonRpcProvider(
        `https://polygon-mumbai.infura.io/v3/c426541689964368a260a33d25bc7772`
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
        `wss://polygon-mumbai.infura.io/ws/v3/c426541689964368a260a33d25bc7772`
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