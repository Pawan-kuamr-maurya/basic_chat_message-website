const bodyParser = require("body-parser");
const express= require("express");
const app=express();
const path =require("path")
const mongoose=require("mongoose");
const session =require("express-session");
const passport= require("passport")
const Localstartegy=require("passport-local");
const User=require("./model/user.js")
const Message =require("./model/message.js");
const islogin =require("./midleware/islogin.js");
const { log } = require("console");
async function main() {mongoose.connect("mongodb://127.0.0.1:27017/mywebsite");}
main().then(()=>{console.log("connect sussfull");
}).catch(()=>{console.log("database out of range");
})

app.use(session({secret:"printer12345",resave:false,saveUninitialized:true}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstartegy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static("public")); 
//app.use(express.static(path.join(__dirname,"public")))


app.get("/",(req,res)=>{
    res.render("resgestration.ejs");             // jab koi pahali bar  main page ko khole
})


app.post("/", async (req,res)=>{                 // main page pe post ki request aaye jo ki regestration ke kliye hia
    res.locals.currentUser = req.user;
    let new_user = new User({
    name:req.body.name,
    username:req.body.username
    });
  try{  let newregesteruser=await User.register(new_user,req.body.password);
   
    req.logIn(newregesteruser,(err)=>{
    if(err){ console.log(err);
        console.log("errorr aagara"); 
         res.redirect("/")
    }else{ res.redirect("/home") } })}
    catch{
     res.redirect("/")   
    }
})    
           


 app.get("/logout",(req,res)=>{              // person ko logout karvana ho
    req.logOut((err)=>{
    if(err){
        res.redirect("/home")
        console.log("error");  
    }else{
        console.log("noterror");
        res.redirect("/");
    }})
 })
 
 app.get("/login",(req,res)=>{              // person login karne ke liye click kare
       if(req.isAuthenticated()){
        res.redirect("/home");
       }else{
        res.render("loginpage.ejs")
       }
 })


app.post("/login",passport.authenticate("local",{failureRedirect:"/login"}),async(req,res)=>{ // jab vo apni id ,pass dal ke login kare
    res.locals.currentUser = req.user;
    res.redirect("/home");
})
   


app.get("/home",islogin,async (req,res)=>{                 // sussfull login hone pe main page openk arna
     let alluser= await User.find({}); 
     let selectuser=null;
     let  myself = req.user;
     let message=null;
console.log(message);

     res.render("manepage.ejs",{message:message,alluser:alluser,selectuser:selectuser,user:myself})
})


app.post("/selectperson",islogin, async (req,res)=>{             // kisi person ko select karna  aur uski information ko session me store karlena
   
  
    let alluser= await User.find({}); 
    let selectuser=await User.find({_id:req.body.messageuser},{name:true});
    let message="no previous message"
    let  myself = req.user;
    if( req.session.messageuser!=req.body.messageuser){
          req.session.messageuser=req.body.messageuser;
         try {
             const user = await User.findOne({
            _id: req.user._id,
            personformessage: {
                $elemMatch: {
                    personid: req.session.messageuser
                }
            }
        })
        .select('personformessage')
 
  
        if (!user || user.personformessage[0].messageid.length === 0) { console.log("no message found"); }
        else{
            console.log(user.personformessage);
            console.log(req.session.messageuser); 
            let message1 = user.personformessage.find((item) => item.personid==(req.session.messageuser));
            req.session.messageId=message1 ? message1.messageid : null;

            // const messageId = user.personformessage[0].messageid;
            // req.session.messageId=messageId;
            message =await Message.find({_id:req.session.messageId})}
            console.log(message);
            console.log(req.session.messageId);
            
            
       } catch (error) {
        console.error(error);
    }}else{
        message =await Message.find({_id: req.session.messageId});
 
    }
    res.render("manepage.ejs",{message:message,alluser:alluser,selectuser:selectuser[0].name,user:myself})
 
})






app.post("/message", islogin,async(req, res) => {                    // har ek message ko click pe bhejsna
    
if(!req.session.messageuser){ return res.redirect("/home")}
 if (!req.session.messageId) {
        let savemessage = new Message({
            chat: [{ message: req.body.current_maessage, from: req.user._id }]
        })
        let savedMessage = await savemessage.save();

        let messagerecever = await User.findOne({ _id: req.session.messageuser })
        messagerecever.personformessage.push({ personid: req.user._id, messageid: savedMessage._id })
        await messagerecever.save();
        let messagesender = await User.findOne({ _id: req.user._id })
        messagesender.personformessage.push({ personid: req.session.messageuser, messageid: savedMessage._id })
        await messagesender.save();

        req.session.messageId = savedMessage._id;
    } else {
        let add_message = await Message.findById(req.session.messageId)
        add_message.chat.push({ message: req.body.current_maessage, from: req.user._id })
        await add_message.save();
    }
    let  myself = req.user;
    let selectuser=await User.find({_id:req.session.messageuser},{name:true});
    let alluser= await User.find({});
    let message =await Message.find({_id:req.session.messageId})
    console.log(message);
   res.render("manepage.ejs",{message:message,alluser:alluser,selectuser:selectuser[0].name,user:myself})
})




app.get("/resume",(req,res)=>{
    res.sendFile('public/resume/pawanmaurya.html', { root: __dirname })
})

app.listen(3000,()=>{
    console.log("run sussfull");
    
})