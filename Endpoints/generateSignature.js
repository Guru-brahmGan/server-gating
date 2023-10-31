const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {wallet} = gpuMarketplaceContractInstance()
const { ethers } = require("ethers");

const generateSignature = async(req ,res) => {

  // Extract the wallet address from the request body
  const walletAddress = req.body.walletAddress;

  // Check if the wallet address is provided
  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required." });
  }

  // Generate the message to be signed: wallet address + current timestamp
  const message = `${walletAddress}:${Date.now()}`;

  // Calculate message hash
  const mesHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));

  // Sign the message hash
  const sigHash = await wallet.signMessage(ethers.utils.arrayify(mesHash));

  return res.json({
    mesHash: mesHash,
    sigHash: sigHash,
  });
    
}

module.exports = generateSignature