const express = require("express");
const { ethers } = require("ethers");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");

const Order = require("./Schemas/order");
const MachineRented = require("./Schemas/machineRented");
const MachineListed = require("./Schemas/machineListed");
const gPointsUpdate = require("./Schemas/gPointsUpdate");
const RegisterMachine = require("./Schemas/registerMachine");

const app = express();
const port = 3000;

mongoose.connect(
  "mongodb+srv://mani:bBQyDZekv35y88eD@gpunet.35quzds.mongodb.net/",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/c426541689964368a260a33d25bc7772`
);

const websocketProvider = new ethers.providers.WebSocketProvider(
  `wss://polygon-mumbai.infura.io/ws/v3/c426541689964368a260a33d25bc7772`
);

const SERVER_PRIVATE_KEY =
  "b76c042ef1476b7d8bbfa75290f270c943aae819053a3ba3334bd621d0034b6b";

const wallet = new ethers.Wallet(SERVER_PRIVATE_KEY);

app.use(bodyParser.json());
app.use(cors());

const connectedWallet = wallet.connect(provider);
const connectedWalletWS = wallet.connect(websocketProvider);

// ABI for the gpuMarketplace contract
const gpuMarketplaceABI = require("./gpuMarketplaceABI.json");

// Address of the deployed gpuMarketplace contract
const gpuMarketplaceAddress = "0xb937659FAd15E55E24BBC159A7f7D4D6Ce8cfb2B";

const gpuMarketplaceContract = new ethers.Contract(
  gpuMarketplaceAddress,
  gpuMarketplaceABI,
  connectedWallet
);
const gpuMarketplaceContractWS = new ethers.Contract(
  gpuMarketplaceAddress,
  gpuMarketplaceABI,
  connectedWalletWS
);

gpuMarketplaceContractWS.on("MachineListed", (_machineId, _name) => {
  const info = {
    machineId: _machineId,
    name: _name,
  };

  const newMachineListed = new MachineListed(info);

  newMachineListed
    .save()
    .then(() => {
      console.log("New MachineListed Event Added!");
    })
    .catch((error) => {
      console.error("Error adding data to MachineListed Event", error);
    });
});

gpuMarketplaceContractWS.on(
  "MachineRented",
  (_orderId, _machineId, _renter) => {
    const info = {
      orderId: _orderId,
      machineId: _machineId,
      renter: _renter,
    };

    const newMachineRented = new MachineRented(info);

    newMachineRented
      .save()
      .then(() => {
        console.log("New MachineRented Event Added!");
      })
      .catch((error) => {
        console.error("Error adding data to MachineRented Event", error);
      });
  }
);

gpuMarketplaceContractWS.on("gPointsUpdate", (_user, _amount, _orderType) => {
  const info = {
    user: _user,
    amount: _amount,
    orderType: _orderType,
  };

  const newgPointsUpdate = new gPointsUpdate(info);

  newgPointsUpdate
    .save()
    .then(() => {
      console.log("New gPointsUpdate Event Added!");
    })
    .catch((error) => {
      console.error("Error adding data to gPointsUpdate Event", error);
    });
});

app.get("/getBlock", async (req, res) => {
  const currentBlock = await provider.getBlockNumber();
  res.json({
    currentBlock: currentBlock,
  });
  console.log(currentBlock);
});

app.post("/generateSignature", async (req, res) => {
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

  res.json({
    mesHash: mesHash,
    sigHash: sigHash,
  });
});

app.post("/registerUser", async (req, res) => {
  try {
    // Extract info from the request body
    const name = req.body.name;
    const referrerId = req.body.referrerId;
    const signature = req.body.signature;
    const messageHash = req.body.messageHash;
    const userAddress = req.body.userAddress;

    // Check if the everything is provided
    if (!name && !referrerId && !signature && !messageHash && !userAddress) {
      return res
        .status(400)
        .json({ error: "Not all the required details are provided." });
    }

    const register = await gpuMarketplaceContract.registerUser(
      name,
      referrerId,
      signature,
      messageHash,
      userAddress
    );

    res.json({ success: true, message: "Registered user successfully" });
  } catch (e) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to register user",
        error: error.message,
      });
  }
});

app.post("/isAUser", async (req, res) => {
  const walletAddress = req.body.walletAddress;
  const userBool = await gpuMarketplaceContract.isRegistered(walletAddress);
  res.json({
    userBool: userBool,
  });
});

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

app.post("/rentMachine", async (req, res) => {
  try {
    // Extract required information from the request body
    const machineId = req.body.machineId;
    const rentalDuration = req.body.rentalDuration;
    const userId = req.body.userId;

    // Call the rentMachine function in smart contract and get the orderId
    const order = await gpuMarketplaceContract.rentMachine(
      machineId,
      rentalDuration,
      userId
    );
    // const orderId = await gpuMarketplaceContract.orderId();
    // console.log(orderId);
    // Respond with the orderId
    // Calculate the timestamp when SSH access should be revoked
    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
    const revokeTime = currentTime + rentalDuration * 3600; // Convert hours to seconds

    // Initiate SSH access by calling the external endpoint
    const initSSHResponse = await axios.post(
      "http://3.220.122.237:8080/init_ssh",
      {}
    );
    // orderId: order, // Pass the orderId to identify the machine
    // revokeTime: revokeTime, // Pass the revoke time to set the timeout

    // Respond with the orderId and the response from the SSH initialization endpoint
    res.json({
      success: true,
      message: "Machine rented successfully",
      orderId: order,
      SSHInitiationResponse: initSSHResponse.data, // Include the response from SSH initiation
    });

    // Set a timeout to automatically call the revoke SSH access endpoint
    const timeoutInMilliseconds = rentalDuration * 3600 * 1000; // Convert hours to milliseconds
    setTimeout(async () => {
      try {
        // Call the revoke SSH access endpoint
        const revokeSSHResponse = await axios.post(
          "http://3.220.122.237:8080/revoke_ssh",
          {}
        );
        // orderId: order, // Pass the orderId to identify the machine
        console.log("SSH access revoked:", revokeSSHResponse.data);
      } catch (error) {
        console.error("Error revoking SSH access:", error.message);
      }
    }, timeoutInMilliseconds);
  } catch (error) {
    console.error("Error renting a machine:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to rent the machine",
        error: error.message,
      });
  }
});

app.get("/availableMachines", async (req, res) => {
  try {
    const maxMachineId = parseInt(await gpuMarketplaceContract.machineId());
    let allMachines = [];

    if (maxMachineId > 10000) {
      const allContractCall = [];
      let currentMachineId = 10001;

      while (maxMachineId >= currentMachineId) {
        allContractCall.push(gpuMarketplaceContract.machines(currentMachineId));
        currentMachineId++;
      }

      var responses = await Promise.all(allContractCall);

      for (const machineInfo of responses) {
        const info = {
          cpuName: machineInfo.cpuName,
          gpuName: machineInfo.gpuName,
          gpuVRAM: parseInt(machineInfo.gpuVRAM),
          totalRAM: parseInt(machineInfo.totalRAM),
          storageAvailable: parseInt(machineInfo.storageAvailable),
          coreCount: parseInt(machineInfo.coreCount),
          IPAddress: machineInfo.IPAddress,
          portsOpen: machineInfo.portsOpen,
          region: machineInfo.region,
          bidPrice: parseInt(machineInfo.bidPrice),
          isAvailable: machineInfo.isAvailable,
          isListed: machineInfo.isListed,
        };

        allMachines.push(info);
      }

      res.json({
        success: true,
        message: allMachines,
      });
    }
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: "Something went wrong." });
  }
});

app.get("/topGpointHolders", async (req, res) => {
  try {
    const userCount = await gpuMarketplaceContract.userIdCount();
    const totalUsers = userCount - 100;

    let loopCount = 0;
    let userId = 101;

    let registeredWallets = [];
    let walletGpoints = [];
    let userContractCall = [];

    while (loopCount < totalUsers) {
      userContractCall.push(gpuMarketplaceContract.UIDtoAddress(userId));
      userId++;
      loopCount++;
    }

    let responses = await Promise.all(userContractCall);
    for (const response of responses) {
      registeredWallets.push(response);
    }

    let gPointContractCall = [];
    for (const wallet of registeredWallets) {
      gPointContractCall.push(gpuMarketplaceContract.getUserGPoints(wallet));
    }

    responses = await Promise.all(gPointContractCall);

    for (const i in responses) {
      walletGpoints.push({
        wallet: registeredWallets[i],
        gPoint: parseInt(responses[i]),
      });
    }

    walletGpoints.sort(function (first, second) {
      return second.gPoint - first.gPoint;
    });

    res.json({
      success: true,
      message: walletGpoints.slice(0, 10),
    });
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: "Something went wrong." });
  }
});

app.post("/userOrders", async (req, res) => {
  try {
    const walletAddress = req.body.walletAddress;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required." });
    }

    const info = await Order.find({
      renterId: walletAddress,
    });

    res.json({ success: true, message: info });
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: "Something went wrong." });
  }
});

app.post("/getUserInfo", async (req ,res) => {

  try{

    const providerId = req.body.providerId;

    if (!providerId) {
      return res.status(400).json({ error: "Provider ID is required." });
    }

    const info = await Order.find({"providerId":providerId});
    const orderCount = info.length
    let totalHoursRented = 0
    let totalGpointsPaid = 0

    for(const order of info ){
      totalHoursRented += order.hoursRented
      totalGpointsPaid += order.gPointsPaid
    }

    const avgOrderValue = totalGpointsPaid/orderCount
    const avgHoursRented = totalHoursRented/orderCount

    const finalResponse = {
      "avgOrderValue":avgOrderValue,
      "avgHoursRented":avgHoursRented
    }

    res.json({ success: true, message: finalResponse });

  }catch(e){
    console.log(e)
    res.json({ success: false, message: "Something went wrong." });
  }

})

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

app.post("/getMachineDetails", async (req, res) => {
  const machineId = req.body.machineId;
  const machineDetails = await gpuMarketplaceContract.machines(machineId);
  console.log(machineDetails);
  res.json({
    cpuName: machineDetails.cpuName,
  });
});

app.post("/registerMachine", async (req, res) => {
  const machineData = req.body;
  const walletAddress = req.body.walletAddress;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required." });
  }

  try {
    const isUserRegistered = await gpuMarketplaceContract.isRegistered(
      walletAddress
    );

    if (!isUserRegistered) {
      return res
        .status(400)
        .json({ error: "Wallet address is not a registered user." });
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

    const info = {
      cpuname: machineData.cpuname,
      gpuname: machineData.gpuname,
      spuVRam: machineData.spuVRam,
      totalRam: machineData.totalRam,
      memorySize: machineData.memorySize,
      coreCount: machineData.coreCount,
      ipAddr: machineData.ipAddr,
      openedPorts: machineData.openedPorts,
      region: machineData.region,
      bidprice: machineData.bidprice,
      walletAddress: machineData.walletAddress,
    };

    const newRegisterMachine = new RegisterMachine(info);

    newRegisterMachine
      .save()
      .then(() => {
        console.log("New Machine Added!");
      })
      .catch((error) => {
        console.error("Error adding new Machine", error);
      });

    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
