const stripe = require("stripe")(`${process.env.STRIPE_PRIVATE_KEY}`);
const {gpuMarketplaceContractInstance} = require('../contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()
const { ethers } = require("ethers");

const stripeSchema = require("../models/stripePayments.js")
const customRequestUpdate = require("../models/customRequest.js");
const sshLinksUpdate = require('../models/sshLink.js')

const storeItems = new Map(
    [
    [1, {priceInCents: 1000, bundleName: '100 GPoints',gPAmount:100}],
    [2, {priceInCents: 9500, bundleName: '1000 GPoints',gPAmount:1000}],
    [3, {priceInCents: 90000, bundleName: '10000 GPoints',gPAmount:10000}],
    [4, {priceInCents: 8500000, bundleName: '1Mn GPoints',gPAmount:1000000}],
    ]
)

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

const gPBuyWithStripe = async(req,res) => {

    try{

        const walletAddress = req.body.walletAddress;

        if(!walletAddress){
        }

        const userBool = await gpuMarketplaceContract.isRegistered(walletAddress);

        if(!userBool){
            return res.status(400).json({ error: "Wallet address is not registered." });
        }

        let gPAmount;

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: req.body.items.map(item => {
            const storeItem = storeItems.get(item.id)
            gPAmount = storeItem.gPAmount
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

        const userCount = await gpuMarketplaceContract.userIdCount();
        const totalUsers = userCount - 100;
    
        let loopCount = 0;
        let userId = 101;
    
        let userContractCall = [];
    
        while (loopCount < totalUsers) {
          userContractCall.push(gpuMarketplaceContract.UIDtoAddress(userId));
          userId++;
          loopCount++;
        }
    
        let responses = await Promise.all(userContractCall);
        let index;
        for (const responseIndex in responses) {
          if(responses[responseIndex]==req.body.walletAddress){
            index = parseInt(responseIndex)
          }
        }
       
        const UID = index+100+1
        
        const info = {
          wallet:req.body.walletAddress,
          UID:UID,
          gPAmount:gPAmount,
          link:session.url,
          id:session.id,
          completed:false
        }
        
        await stripeSchema.create(info)
    
        res.json({
          url: session.url
        })
      } catch (e) {
        console.log(e)
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }

}

const customGpuRequest = async(req, res) => {
  
    try {

      const username = req.body.username;  
      const GPUname = req.body.GPUname;
      const Quantity = req.body.Quantity;
  
        // Create a new custom request
        const newCustomRequest = new customRequestUpdate({
          username,
          GPUname,
          Quantity
        });
  
        // Save the request to the database
        await newCustomRequest.save();
  
        // Send a response back to the client
        res.status(201).json({
            message: 'Custom GPU request submitted successfully',
            data: newCustomRequest
        });

    }catch(error) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getOrderSSH = async(req, res) => {

    try {
  
      const orderId  = req.body.orderId;
  
        if (!orderId) {
            return res.status(400).json({ message: 'orderId is required' });
        }
  
        const sshLinkEntry = await sshLinksUpdate.findOne({ orderId: orderId });
  
        if (!sshLinkEntry) {
            return res.status(404).json({ message: 'SSH link not found for the given orderId' });
        }
  

        res.json({
            success: true,
            sshLink: sshLinkEntry.sshLink
        });

      } catch (error) {
        console.error('Error fetching SSH link:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


module.exports = {
    generateSignature,
    gPBuyWithStripe,
    customGpuRequest,
    getOrderSSH
}