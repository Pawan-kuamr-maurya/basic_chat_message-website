const { default: mongoose } = require("mongoose");
// const  Message= require("/message.ejs");
const Schema=mongoose.Schema;
const Passportlocalmongoose=require("passport-local-mongoose")

const userschema= new Schema({
    name:{type:String},
    personformessage:[{
        personid:{
            type:Schema.Types.ObjectId,ref:"User"},
        messageid:{
            type:Schema.Types.ObjectId,ref:"Message"}
        }]
})
userschema.plugin(Passportlocalmongoose);
module.exports=mongoose.model("user",userschema);