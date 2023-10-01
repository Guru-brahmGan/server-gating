const express = require('express');
const ethers = require('ethers');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Your server's private key (WARNING: Never expose this in production or commit to version control!)
const SERVER_PRIVATE_KEY = "b76c042ef1476b7d8bbfa75290f270c943aae819053a3ba3334bd621d0034b6b"; 

const wallet = new ethers.Wallet(SERVER_PRIVATE_KEY);

app.use(bodyParser.json());

const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/c426541689964368a260a33d25bc7772');

const connectedWallet = wallet.connect(provider);

// ABI for the gpuMarketplace contract
const gpuMarketplaceABI = require('./gpuMarketplaceABI.json');

// Address of the deployed gpuMarketplace contract
const gpuMarketplaceAddress = '0x443E65Ead70aA0A6f38FF73a9a4Ef22CD68A9d41';

const gpuMarketplaceContract = new ethers.Contract(gpuMarketplaceAddress, gpuMarketplaceABI, connectedWallet);


app.post('/generateSignature', (req, res) => {
    // Extract the wallet address from the request body
    const walletAddress = req.body.walletAddress;

    // Check if the wallet address is provided
    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required.' });
    }

    // Generate the message to be signed: wallet address + current timestamp
    const message = `${walletAddress}:${Date.now()}`;

    // Calculate message hash
    const mesHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));

    // Sign the message hash
    const sigHash = wallet.signMessage(ethers.utils.arrayify(mesHash));

    res.json({
        mesHash: mesHash,
        sigHash: sigHash
    });
});


app.post('/registerMachine', async (req, res) => {
    const machineData = req.body;
    const walletAddress = req.body.walletAddress;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required.' });
    }

    try {

        const isUserRegistered = await gpuMarketplaceContract.isRegistered(walletAddress);
        
        if (!isUserRegistered) {
            return res.status(400).json({ error: 'Wallet address is not a registered user.' });
        }
        
        const tx = await gpuMarketplaceContract.registerMachines(
            machineData.cpuname,
            machineData.gpuname,
            machineData.spuVRam,
            machineData.totalRam,
            machineData.memorySize,
            machineData.coreCount,
            machineData.ipAddr,
            machineData.openedPorts,
            machineData.region,
            machineData.bidprice,
            machineData.provider
        );

        const receipt = await tx.wait();

        res.json({
            success: true,
            transactionHash: receipt.transactionHash
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
