const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()
const Order = require('../Schemas/order.js')

const userOrders = async(req,res) => {

    try {
        const walletAddress = req.body.walletAddress;
    
        if (!walletAddress) {
          return res.status(400).json({ error: "Wallet address is required." });
        }

        const userInfo = await gpuMarketplaceContract.users(walletAddress);
        const UID = parseInt(userInfo[1])
    
        const info = await Order.find({
          renterId: UID,
        });
    
        res.json({ success: true, message: info });
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Something went wrong." });
    }

}

module.exports = userOrders