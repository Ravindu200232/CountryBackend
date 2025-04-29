import mongoose from "mongoose";

const userShema = new mongoose.Schema({

    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        required : true,
        default : "customer"
    },
    username : {
        type : String,
        required : true
    },
   
    image : {
        type : String,
        required : true,
        default : "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
    },
    emailVerified : {
        type : Boolean,
        required : true,
        default : false
    },

    
})

const User = mongoose.model("user",userShema);
export default User;