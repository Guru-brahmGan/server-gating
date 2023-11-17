const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require('dotenv').config()
const stripe = require("stripe")(`${process.env.STRIPE_PRIVATE_KEY}`);
const SshLinksUpdate = require('./Schemas/sshLink.js')

const {gpuMarketplaceContractInstance, gpuMarketplaceContractWSInstance} = require('./Contract/contract.js')
const {provider} = gpuMarketplaceContractInstance()
const {gpuMarketplaceContractWS} = gpuMarketplaceContractWSInstance()
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()

const MachineRented = require("./Schemas/machineRented");
const MachineListed = require("./Schemas/machineListed");
const gPointsUpdate = require("./Schemas/gPointsUpdate");

const isAUser = require('./Endpoints/isAUser.js')
const generateSignature = require('./Endpoints/generateSignature.js')
const registerUser = require('./Endpoints/registerUser.js')
const availableMachines = require('./Endpoints/availableMachines.js')
const topGpointHolders = require('./Endpoints/topGpointHolders.js')
const userOrders = require('./Endpoints/userOrders.js')
const getMachineDetails = require('./Endpoints/getMachineDetails.js');
const registerMachine = require("./Endpoints/registerMachine.js");
const rentMachine = require("./Endpoints/rentMachine.js");
const getUserInfo = require("./Endpoints/getUserInfo.js")
const dummyMachinesUpdate = require("./Endpoints/dummyMachinesUpdate.js")
const initSSH = require("./Endpoints/initSSH.js")

const app = express();
const port = 3000;

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(bodyParser.json());
app.use(cors());

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

gpuMarketplaceContractWS.on("MachineRented",(_orderId, _machineId, _renter) => {
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
    timestamp: Math.floor(Date.now() / 1000)
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
});

app.get("/healthCheck", async(req,res)=>{
  res.status(200).json({
    status: "Server is working fine."
  });
});

app.post("/generateSignature", async (req, res) => {
  await generateSignature(req,res)
});

app.post('/get_ssh', async (req, res) => {
  try {
      const orderId  = req.body.orderId;

      // Find the SSH link for the given orderId
      const sshLinkEntry = await SshLinksUpdate.findOne({ orderId: orderId });

      if (!sshLinkEntry) {
          return res.status(404).json({ success: false, message: 'SSH link not found for the given orderId' });
      }

      res.json({
          success: true,
          sshLink: sshLinkEntry.sshLink
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


app.post("/registerUser", async (req, res) => {
  await registerUser(req,res)
});

app.post("/verifyTweet", async(req, res) => {
  const userAddress = req.body.userAddress;
  try {
    const tweeted = await gpuMarketplaceContract.verifyTweet(userAddress);
    res.json({ success: true, message: "Verified successfully" });
  } catch (e) {
    console.error("Error registering user:", e);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to register user",
        error: e.message,
      });
  }
});

app.post("/init_ssh", async(req,res) => {
 await initSSH(req,res)
})

app.post("/isAUser", async (req, res) => {
  await isAUser(req,res)
});

app.post("/setBidPrice", async (req, res) => {
  const machineId = req.body.machineId;
  const newBidPrie = req.body.bidAmount;
  const setBid = await gpuMarketplaceContract.setBidPrice(machineId, newBidPrie);
  console.log(setBid)
  res.json({
    message: "Bid Price is set successfully",
    txHash: setBid.hash
  })
})

app.post("/listToggle", async (req, res) => {
  const machineId = req.body.machineId;
  const setToggle = await gpuMarketplaceContract.listMachineToggle(machineId);
  res.json({
    message: "Successful",
    txHash: setToggle.hash
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

app.post("/rentMachine", async (req, res) => {
  await rentMachine(req,res)
});

app.get("/availableMachines", async (req, res) => {
  await availableMachines(req,res)
});

app.get("/topGpointHolders", async (req, res) => {
  await topGpointHolders(req,res)
});

app.post("/userOrders", async (req, res) => {
  await userOrders(req,res)
});

app.post("/getUserInfo", async (req ,res) => {
  await getUserInfo(req,res)
})

app.get("rentedMachines", async (req, res) => {
  const userAddress = req.body.walletAddress;
  
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
  await getMachineDetails(req,res)
});

app.post("/dummyMachines", async (req, res) => {
  await dummyMachinesUpdate(req,res)
});

app.post("/registerMachine", async (req, res) => {
  await registerMachine(req,res)
});

const storeItems = new Map([[
  1, {priceInCents: 1000, bundleName: '100 GPoints'}],
  [2, {priceInCents: 9500, bundleName: '1000 GPoints'}],
  [3, {priceInCents: 90000, bundleName: '10000 GPoints'}],
  [4, {priceInCents: 8500000, bundleName: '1Mn GPoints'}],

])

app.post("/gPBuyWithStripe", async(req, res) => {
  try{
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id)
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: storeItem.bundleName
            },
            unit_amount: storeItem.priceInCents
          },
          quantity: 1
        }
      }),
      success_url: `https://app.gpu.net/success`,
      cancel_url: `https://app.gpu.net/payment-failure`
    })
    res.json({
      url: session.url
    })
  } catch (e) {
    res.status(500).json({
      error: e.message
    })
  }
})

app.get("/getBundleInfo", async(req, res) => {
  try{
    const firstBundle = parseInt(await gpuMarketplaceContract.bundleInfo(10));
    const secondBundle = parseInt(await gpuMarketplaceContract.bundleInfo(95));
    const thirdBundle = parseInt(await gpuMarketplaceContract.bundleInfo(900));
    const fourthBundle = parseInt(await gpuMarketplaceContract.bundleInfo(85000));
    res.json({
      bundles: [
        { usdAmount: 10, gPoints: firstBundle },
        { usdAmount: 95, gPoints: secondBundle },
        { usdAmount: 900, gPoints: thirdBundle },
        { usdAmount: 85000, gPoints: fourthBundle }
      ]
    })
  } catch (e) {
    res.status(500).json({
      error: e.message
    })
  }
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
