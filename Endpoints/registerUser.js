const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()

const registerUser = async(req,res) => {

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

}

module.exports = registerUser