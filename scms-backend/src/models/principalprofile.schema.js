import mongoose from "mongoose"

const principalschema = new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String
    }
})
export const principalModel = mongoose.model("principalprofile",principalschema)