const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const checkauth=require("../middleware/Checkauth")
const user = require("../Modules/user");
const mongoose = require("mongoose");
require('dotenv').config();
const fs = require("fs");
const jwt = require('jsonwebtoken')
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

router.post('/signup', async (req, res) => {
  try {
    const users=await user.find({email:req.body.email})
    if(users.length>0){
      return res.status(500).json({
        error:"email alreday registered"
      })
    }
    const hashcode = await bcrypt.hash(req.body.password, 10);
    const uploadimage = await cloudinary.uploader.upload(req.files.logo.tempFilePath);
    
    const newuser = new user({
      _id: new mongoose.Types.ObjectId(),
      channelname: req.body.channelname,
      email:req.body.email,
      phone: req.body.phone,
      password: hashcode,
      logourl: uploadimage.secure_url,
      logoid: uploadimage.public_id
    });

    const savedUser = await newuser.save();
    res.status(200).json({
      newuser: savedUser
    });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
});
  router.post("/login",async(req,res)=>{
    try{
      console.log(req.body)
      const users=await user.find({email:req.body.email})
      console.log(users)
      if(users.length == 0){
        return res.status(500).json({
          error:"email not registered"
        })
      }
      const isvalid=await bcrypt.compare(req.body.password,users[0].password)
      console.log(isvalid)
      if(!isvalid){
        return res.status(500).json({
          error:"invalid password"
        })
      }
      const token=jwt.sign({
        _id:users[0]._id,
        channelname:users[0].channelname,
        email:users[0].email,
        phone:users[0].phone,
        logoid:users[0].logoid
      },
      'sbs online classes 123',
      {
        expiresIn:"365d"
      }
      )
      res.status(200).json({
        _id:users[0]._id,
        channelname:users[0].channelname,
        email:users[0].email,
        phone:users[0].phone,
        logoid:users[0].logoid,
        logourl:users[0].logourl,
        token:token,
        subscribers:users[0].subscribers,
        subscribedchannels:users[0].subscribedchannels
      })
    }
    catch(err){
      
    }
  })
  router.put('/subscribe/:userbid',checkauth,async(req,res)=>{
    try{
      const token=req.headers.authorization.split(" ")[1];
    const userA=await jwt.verify(token,'sbs online classes 123')
    console.log(userA)
    const userB=await user.findById(req.params.userbid)
    console.log(userB)
    if(userB.subscribedby.includes(userA._id)){
      return res.status(500).json({
        error:"already subscribed"
      })
  
    }
    //console.log("not subscribed")
    userB.subscribers += 1;
    userB.subscribedby.push(userA._id)
    await userB.save()
    const userAfullinfo=await user.findById(userA._id)
    userAfullinfo.subscribedchannels.push(userB._id)
    userAfullinfo.save()
    res.status(200).json({
      msg:"subscribed"
    })
    }
    catch(err){
      return res.status(500).json({
        error:err.message
      })
    }
  })
  router.put("/unsubscribe/:userbid",checkauth,async(req,res)=>{
  try{
    const token=req.headers.authorization.split(" ")[1];
    const userA=await jwt.verify(token,'sbs online classes 123')
    const userB=await user.findById(req.params.userbid)
   console.log(userA)
    //console.log(userB)
    if(userB.subscribedby.includes(userA._id)){
      userB.subscribers-=1;
    userB.subscribedby=userB.subscribedby.filter(userid=>userid.toString()!=userA._id)
      await userB.save()
      const userAfullinfo=await user.findById(userA._id)
    userAfullinfo.subscribedchannels=userAfullinfo.subscribedchannels.filter(userid=>userid.toString()!=userB._id)
      await userAfullinfo.save()
      res.status(200).json({
        msg:"unsubscribed"
      })
    }
    else{
      return res.status(500).json({
        error:"not subscribed"
      })
    }
  }
  catch(err){
    console.log(err)
    res.status(500).json({
      err:err.message
    })
  }
})

module.exports = router;