import { principalModel } from "../models/principalprofile.schema.js";
import { supremeModel } from "../models/supremeprofile.schema.js";


const findUserById = async (id) => {
    
    let user = await supremeModel.findOne({ userid: id });
    if (user) {
        return user;  
    }
    
    
    user = await principalModel.findOne({ userid: id });
    if (user) {
        return user;  
    }

    return null;  
};


const updateUser = async (id, data) => {
    const user = await findUserById(id);  
    if (user) {
        
        for (const key in data) {
            if (data.hasOwnProperty(key)) {  
                user[key] = data[key];  
            }
        }
        await user.save();  
        return user;  
    }
    return null;  
};

export { findUserById, updateUser };
