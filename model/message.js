const { default: mongoose } = require("mongoose");
// const  User= require("/user.js")
const Schema=mongoose.Schema;
let message =new Schema({
    chat:[
        {message:String,
         from:{type:Schema.Types.ObjectId,ref:"User"}
        }
        ]
   
})
module.exports=mongoose.model("message",message);

// yaha pe ham aru bhi constraiin jod sakte hai 