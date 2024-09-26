import { principalModel } from "../models/principalprofile.schema.js";
import { generateTokens } from "../utils/generate.js";

const principallogin = async (req, res) => {
    try {
        const { userid, password } = req.body;  
        if(!userid || !password){
            return res.status(400).json({
                message: "userid and password are required"
            })
        }
        const checkUser = await principalModel.findOne({
            userid:userid,
            password:password
        })
        if(!checkUser){
            return res.status(400).json({
                message: "user not found"
            })
        }
        const { accessToken, refreshToken } = generateTokens(
            userid,
            '15m',  
            '7d'   
          );
        return res.status(200).cookie("refreshToken", refreshToken, { httpOnly: true }).cookie("accessToken", accessToken, { httpOnly: true }).json({
            message: "user logged in successfully",
            checkUser,accessToken,refreshToken
        })
    } catch (error) {
        console.log(error)
        res.send(500, error)
    }
}


  
export { principallogin }