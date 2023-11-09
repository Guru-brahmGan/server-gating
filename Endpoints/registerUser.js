const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()

const registerUser = async(req,res) => {

    try {
        // Extract info from the request body
        const name = req.body.name;
        const orgName = req.body.organization;
        const referrerId = req.body.referrerId;
        const userAddress = req.body.userAddress;
    
        // Check if the everything is provided
        if (!name && !referrerId && !signature && !messageHash && !userAddress) {
          return res
            .status(400)
            .json({ error: "Not all the required details are provided." });
        }
        console.log('Data is validated')
        const register = await gpuMarketplaceContract.registerUser(
          name,
          referrerId,
          orgName,
          userAddress
        );
        // await register.wait;
        // console.log(register)
        console.log("Tx Sent")
        
        res.json({ success: true, message: "Registered user successfully" });
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

}

module.exports = registerUser