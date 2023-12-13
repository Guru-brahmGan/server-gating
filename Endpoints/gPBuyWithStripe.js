const stripe = require("stripe")(`${process.env.STRIPE_PRIVATE_KEY}`);
const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()
const stripeSchema = require("../Schemas/stripePayments.js")

const storeItems = new Map([
    [1, {priceInCents: 1000, bundleName: '100 GPoints',gPAmount:100}],
    [2, {priceInCents: 9500, bundleName: '1000 GPoints',gPAmount:1000}],
    [3, {priceInCents: 90000, bundleName: '10000 GPoints',gPAmount:10000}],
    [4, {priceInCents: 8500000, bundleName: '1Mn GPoints',gPAmount:1000000}],
])

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
    
        let registeredWallets = [];
        let walletGpoints = [];
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
        res.status(500).json({
          error: e.message
        })
      }

}

module.exports = gPBuyWithStripe