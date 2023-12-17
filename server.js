const express = require("express");
const cors = require("cors");
require('dotenv').config()
const bodyParser = require("body-parser");
const stripe = require("stripe")(`${process.env.STRIPE_PRIVATE_KEY}`);

const {gpuMarketplaceContractInstance} = require('./Contract/contract.js')
const {provider} = gpuMarketplaceContractInstance()
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()

const stripeSchema = require("./models/stripePayments.js")

const orderTimeoutFunction = require('./utils/orderTimeout.js')
const databaseConnection = require('./utils/databaseInit.js');
const eventLogs = require('./utils/eventLogs.js')

const serverRoutes = require('./routes');

const app = express();
const port = 3000;

app.use(cors());

app.post('/api/other/stripeWebhook', express.raw({ type: 'application/json' }), async(req, res) => {

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const sig = req.headers['stripe-signature'];
  const payload = req.body

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  }catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {

    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful. Session ID:', session.id);

      const filter = {"id":session.id}
      const update = {"completed":true}

      const databaseInfo = await stripeSchema.findOne(filter)
      const gasPrice = await provider.getFeeData()
      
      const tx = await gpuMarketplaceContract.gPBuyWithStripe(
        databaseInfo.id,
        databaseInfo.gPAmount,
        databaseInfo.UID,
        {
          gasPrice: gasPrice.maxFeePerGas,
        }
      );      
      
      let receipt = await tx.wait()

      await stripeSchema.findOneAndUpdate(filter,update)

      break;

  }

  res.json({received: true});

});

app.use(express.json());
app.use("/api", serverRoutes);

app.use((_, res) =>{
    res.send({
        message: 'Not found!'
    })
});


databaseConnection()
eventLogs()
setInterval(orderTimeoutFunction, 10 * 1000);



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



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
