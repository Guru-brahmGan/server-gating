const express = require('express');
const { ethers } = require("ethers");
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const Order = require('./order');

const app =  express();
const port = 3000;

// mongoose.connect('mongodb+srv://mani:bBQyDZekv35y88eD@gpunet.35quzds.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });

// const db = mongoose.connection;

// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//     console.log('Connected to MongoDB');
// });

const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/c426541689964368a260a33d25bc7772`);

const websocketProvider = new ethers.providers.WebSocketProvider(`wss://polygon-mumbai.infura.io/ws/v3/c426541689964368a260a33d25bc7772`);

const SERVER_PRIVATE_KEY = "b76c042ef1476b7d8bbfa75290f270c943aae819053a3ba3334bd621d0034b6b"; 

const wallet = new ethers.Wallet(SERVER_PRIVATE_KEY);

app.use(bodyParser.json());

const connectedWallet = wallet.connect(provider);
const connectedWalletWS = wallet.connect(websocketProvider);


// ABI for the gpuMarketplace contract
const gpuMarketplaceABI = require('./gpuMarketplaceABI.json');

// Address of the deployed gpuMarketplace contract
const gpuMarketplaceAddress = '0xb937659FAd15E55E24BBC159A7f7D4D6Ce8cfb2B';

const gpuMarketplaceContract = new ethers.Contract(gpuMarketplaceAddress, gpuMarketplaceABI, connectedWallet);
const gpuMarketplaceContractWS = new ethers.Contract(gpuMarketplaceAddress, gpuMarketplaceABI, connectedWalletWS);

gpuMarketplaceContractWS.on("MachineListed", (_machineId, _name) => {

    const info = {
        "machineId":_machineId,
        "name":_name
    }
    
    console.log(info)
    
});


gpuMarketplaceContractWS.on("MachineRented", (_orderId, _machineId, _renter) => {

    const info = {
        "orderId":_orderId,
        "machineId":_machineId,
        "renter":_renter
    }
    
    console.log(info)
    
});

gpuMarketplaceContractWS.on("gPointsUpdate", (_user, _amount, _orderType) => {

    const info = {
        "user":_user,
        "amount":_amount,
        "orderType":_orderType
    }
    
    console.log(info)
    
});

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

// app.post('/rentMachine', async (req, res) => {
//     const orderDetails = req.body;

//     // Fetch order details from the Ethereum smart contract
//     // const orderDetails = await getOrderDetails(orderId);
    
//     // if (!orderDetails) {
//     //     return res.status(400).json({ error: 'Order details not found or invalid.' });
//     // }

//     // Verify the order details, ensuring they match the request
//     if (!verifyOrderDetails(orderDetails, orderData)) {
//         return res.status(400).json({ error: 'Invalid order details.' });
//     }

//     try {

//         const tx = await gpuMarketplaceContract.registerMachines(
//             orderDetails.machineid,
//             orderDetails.duration,
//             orderDetails.userUID
//         );

//         // const order = new Order({
//         //     orderId:  orderData.orderId,
//         //     machineId: orderData.machineId,
//         //     providerId: orderData.provider,
//         //     renterId: orderData.renter,
//         //     renterUsername: orderData.renterName,
//         //     gPointsPaid: orderData.gPointsValue,
//         //     hoursRented: orderData.duration,
//         // });
//         console.log('Sending oder details')
//         // await order.save();
//         console.log('details stored')
//         res.send('Stored successfully')
//         const receipt = await tx.wait();
            
//         console.log(receipt);

//         res.json({
//             success: true,
//             transactionHash: receipt.transactionHash
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });

// })

app.post('/rentMachine', async (req, res) => {
    try {
        // Extract required information from the request body
        const machineId = req.body.machineId;
        const rentalDuration = req.body.rentalDuration;
        const userId = req.body.userId; 

        // Call the rentMachine function in smart contract and get the orderId
        const order = await gpuMarketplaceContract.rentMachine(machineId, rentalDuration, userId);
        // const orderId = await gpuMarketplaceContract.orderId();
        // console.log(orderId);
        // Respond with the orderId
        res.json({ success: true, message: 'Machine rented successfully', SSH_Keys: "s23ghy4u2y3u2y4y32uy3u2y4gu3y24u"});
    } catch (error) {
        console.error('Error renting a machine:', error);
        res.status(500).json({ success: false, message: 'Failed to rent the machine', error: error.message });
    }
});

// async function getOrderDetails(orderId) {
//     try {
//         // Use the Ethereum contract function to fetch order details
//         // Replace this with the actual function in your smart contract to get order details
//         const orderDetails = await gpuMarketplaceContract.orders(orderId);
//         return orderDetails;
//     } catch (error) {
//         console.error('Error fetching order details from the smart contract:', error);
//         return null;
//     }
// }

// function verifyOrderDetails(orderDetails, orderData) {
//     // Adding the verification logic here to ensure that order details match the request
//     if (orderDetails.machineId !== orderData.machineId ||
//         orderDetails.renterId !== orderData.renter ||
//         orderDetails.gPointsValue !== orderData.gPointsValue ||
//         orderDetails.duration !== orderData.duration) {
//         return false;
//     }

//     return true;
// }

app.get('/getMachineDetails', async (req, res) => {
    const machineDetails = await gpuMarketplaceContract.machines(10001);
    console.log(machineDetails)
    res.json({
        "cpuName": machineDetails.cpuName 
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
