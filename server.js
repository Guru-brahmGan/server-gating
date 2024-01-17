const express = require("express");
const cors = require("cors");
require('dotenv').config()
const bodyParser = require("body-parser");
const stripe = require("stripe")(`${process.env.STRIPE_PRIVATE_KEY}`);
// const AvailableMachine = require('./models/AvailableMachine');
// const PreBookedMachine = require('./models/PreBookedMachine');
const {gpuMarketplaceContractInstance} = require('./Contract/contract.js')
const {provider} = gpuMarketplaceContractInstance()
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()

const stripeSchema = require("./models/stripePayments.js")

const orderTimeoutFunction = require('./Utils/orderTimeout.js')
const databaseConnection = require('./Utils/databaseInit.js');
const eventLogs = require('./Utils/eventLogs.js')

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

app.use(bodyParser.json());
app.use("/api", serverRoutes);

app.use((_, res) =>{
    res.send({
        message: 'Not found!'
    })
});
app.use(cors());



databaseConnection()
eventLogs()
setInterval(orderTimeoutFunction, 10 * 1000);



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
