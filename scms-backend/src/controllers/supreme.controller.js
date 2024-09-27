import { principalModel } from "../models/principalprofile.schema.js";
import { supremeModel } from "../models/supremeprofile.schema.js";
import { generatePassword, generateUserId } from "../utils/generate.js";

const registersupreme = async (req, res) => {
    try {
        const { userid, password } = req.body;
        if(!userid || !password){
            return res.status(400).json({
                message: "userid and password are required"
            })
        }
        console.log("reached")
        const newUser = await supremeModel.create({
            userid:userid,
            password:password
        })
        res.status(200).json({
            message: "user created successfully",newUser
        })
    } catch (error) {
        console.log(error)
        res.send(500, error)
    }
}
const loginsupreme = async (req, res) => {
    try {
        const { userid, password } = req.body;
        if(!userid || !password){
            return res.status(401).json({
                message: "userid and password are required"
            })
        }
        const checkUser = await supremeModel.findOne({
            userid:userid,
            password:password
        })
        if(!checkUser){
            return res.status(401).json({
                message: "user not found"
            })
        }
        return res.status(200).json({
            message: "user logged in successfully",checkUser
        })
    } catch (error) {
        console.log(error)
        res.send(500, error)
    }
}
const principalcreate = async (req, res) => {
    try {
        const { email } = req.body;
        if(!email){
            return res.status(400).json({
                message: "email is required"
            })
        }
        const checkUser = await principalModel.findOne({
            email:email
        })
        if(checkUser){
            return res.status(400).json({
                message: "principal already exists"
            })
        }
        const newUser = await principalModel.create({
            email:email,
            userid:generateUserId(8),
            password:generatePassword(16)
        })
        res.status(200).json({
            message: "user created successfully",newUser
        })
}catch{
    console.log(error)
    res.send(500, error)
}
}

export { registersupreme,loginsupreme,principalcreate }