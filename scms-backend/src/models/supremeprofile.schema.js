import mongoose from "mongoose";

const supremeschema = new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String
    },
    role:{
        type:String,
        default:"supreme"
    }
})
export const supremeModel = mongoose.model("supremeprofile",supremeschema)