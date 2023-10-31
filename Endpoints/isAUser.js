const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()

const isAUser = async(req,res) => {

    const walletAddress = req.body.walletAddress;
    const userBool = await gpuMarketplaceContract.isRegistered(walletAddress);

    return res.json({
        userBool: userBool,
    })


}

module.exports = isAUser