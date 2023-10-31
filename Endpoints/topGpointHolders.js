const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()

const topGpointHolders = async(req,res) => {

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

}

module.exports = topGpointHolders