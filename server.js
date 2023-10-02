const express = require('express');
const { ethers } = require("ethers");
const bodyParser = require('body-parser')

const app =  express();
const port = 3000;

const provider = new ethers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/c426541689964368a260a33d25bc7772`);
console.log(provider);

const SERVER_PRIVATE_KEY = "b76c042ef1476b7d8bbfa75290f270c943aae819053a3ba3334bd621d0034b6b"; 

const wallet = new ethers.Wallet(SERVER_PRIVATE_KEY);

app.use(bodyParser.json());

const connectedWallet = wallet.connect(provider);

// ABI for the gpuMarketplace contract
const gpuMarketplaceABI = require('./gpuMarketplaceABI.json');

// Address of the deployed gpuMarketplace contract
const gpuMarketplaceAddress = '0x443E65Ead70aA0A6f38FF73a9a4Ef22CD68A9d41';

const gpuMarketplaceContract = new ethers.Contract(gpuMarketplaceAddress, gpuMarketplaceABI, connectedWallet);

app.get('/getBlock', async (req, res) => {
    const currentBlock = await provider.getBlockNumber();
    res.json({
        currentBlock: currentBlock
    })
    console.log(currentBlock);
})

// app.get('/generateSignature', (req, res) => {
//     // Extract the wallet address from the request body
//     const walletAddress = '0x8CDCe246A852cee0Ad89D0B9A0B29415f1D89D9A';

//     // Check if the wallet address is provided
//     if (!walletAddress) {
//         return res.status(400).json({ error: 'Wallet address is required.' });
//     }

//     // Generate the message to be signed: wallet address + current timestamp
//     const message = `${walletAddress}:${Date.now()}`;

//     // Calculate message hash
//     const mesHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));

//     // Sign the message hash
//     const sigHash = wallet.signMessage(ethers.utils.arrayify(mesHash));

//     res.json({
//         mesHash: mesHash,
//         sigHash: sigHash
//     });
// });

app.get('/isAUser', async (req,res) => {
    const userBool = await gpuMarketplaceContract.isRegistered('0x8CDCe246A852cee0Ad89D0B9A0B29415f1D89D9A');
    res.json ( {
        userBool : userBool
    })
})


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
            machineData.walletAddress
        );

        const receipt = await tx.wait();
        
        console.log(receipt.transactionHash);

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
