const express=require('express')
const router=express.Router()
const checkauth=require("../middleware/Checkauth")
const jwt=require("jsonwebtoken")
const cloudinary= require('cloudinary').v2
const video=require("../Modules/video")
const mongoose=require('mongoose');
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});
router.post('/upload',checkauth,async(req,res)=>{
  try{
    const token=req.headers.authorization.split(" ")[1];
    const user=await jwt.verify(token,'sbs online classes 123');

  const uploadvideo=await cloudinary.uploader.upload(req.files.video.tempFilePath,{resource_type:"video",format:'mp4',allowed_formats: ['mp4', 'webm', 'og']})
  const uploadthumbnail=await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
const newvideo = new video({
  _id: new mongoose.Types.ObjectId(),
  title: req.body.title,
  description: req.body.description,
  user_id: user._id,
  videourl: uploadvideo.secure_url,
  videoid: uploadvideo.public_id,
  thumbnailurl: uploadthumbnail.secure_url,
  thumbnailid: uploadthumbnail.public_id,
  category: req.body.category,
  tags: req.body.tags ? req.body.tags.split(",") : []
});
  const newuploadedvideodata=await newvideo.save();
  res.status(200).json({
    newvideo:newuploadedvideodata
  })
  console.log(uploadvideo)
  }
  catch(err){
    return res.status(500).json({
      error:err.message
    })
  }
})
router.put("/:videoId",checkauth,async(req,res)=>{
  try{
    const token=req.headers.authorization.split(" ")[1];
    const verifieduser=await jwt.verify(token,'sbs online classes 123')
    const Video=await video.findById(req.params.videoId)
    if (!Video) {
     return res.status(404).json({ error: "Video not found" });
     }
    console.log(Video)
    if(Video.user_id==verifieduser._id){
      console.log("you have permission to edit")
      if(req.files){
        await cloudinary.uploader.destroy(Video.thumbnailid)
        const updatedthumbnail=await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
        const updateddata={
          title: req.body.title,
          description: req.body.description,
          thumbnailurl: updatedthumbnail.secure_url,
          thumbnailid: updatedthumbnail.public_id,
          category: req.body.category,
          tags: req.body.tags ? req.body.tags.split(",") : []
        }
        const updatedvideodetail=await video.findByIdAndUpdate(req.params.videoId,updateddata,{new:true})
        res.status(200).json({
          updatedvideo:updatedvideodetail
        })
      }
      else{
        const updateddata={
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          tags: req.body.tags ? req.body.tags.split(",") : []
        }
        const updatedvideodetail=await video.findByIdAndUpdate(req.params.videoId,updateddata,{new:true})
        res.status(200).json({
          updatedvideo:updatedvideodetail
        })
      }
    }
    else{
      res.status(500).json({
        error:"you have no permissions"
      })
    }
  }
  catch(err){
    console.log(err)
    res.status(500).json({
      error:err.message
    })
  }
  
})
router.delete("/:videoId",checkauth,async(req,res)=>{
  
  //console.log("Video ID:", req.params.videoId);
  try{
    const token=req.headers.authorization.split(" ")[1];
    const verifieduser=await jwt.verify(token,'sbs online classes 123')
    console.log(verifieduser)
   
    const Video= await video.findById(req.params.videoId)
    console.log(Video)
    if (!Video) {
     return res.status(404).json({ error: "Video not found" });
     }
      if(Video.user_id==verifieduser._id){
      //delete
      await cloudinary.uploader.destroy(Video.videoid,{resource_type:'video'})
      await cloudinary.uploader.destroy(Video.thumbnailid)
      const deleteresponse=await video.findByIdAndDelete(req.params.videoId)
      res.status(200).json({
        deletedresponse:deleteresponse
      })
      }
      else{
        return res.status(500).json({
        err:"out of reach"
      }
      )
    }
  }
  catch(err){
    console.log(err)
    res.status(500).json({
      err:err.message
    })
  }
})
router.put('/like/:videoId',checkauth,async(req,res)=>{
  try{
    const token=req.headers.authorization.split(" ")[1];
    const verifieduser=await jwt.verify(token,'sbs online classes 123')
    console.log(verifieduser)
    const Video= await video.findById(req.params.videoId)
    console.log(Video)
    if(Video.likedby.includes(verifieduser._id)){
      return res.status(500).json({
        error:'already liked'
      })
    }
    if(Video.dislikedby.includes(verifieduser._id)){
      Video.dislike-=1;
      Video.dislikedby=Video.dislikedby.filter(userid=>userid.toString()!=verifieduser._id)
    }
    Video.likes+=1;
    Video.likedby.push(verifieduser._id)
    await Video.save()
    res.status(200).json({
      msg:'liked'
    })
  }
  catch(err){
    console.log(err)
    res.status(500).json({
      err:err.message
    })
  }
})
router.put('/dislike/:videoId',checkauth,async(req,res)=>{
  try{
    const token=req.headers.authorization.split(" ")[1];
    const verifieduser=await jwt.verify(token,'sbs online classes 123')
    console.log(verifieduser)
    const Video= await video.findById(req.params.videoId)
    console.log(Video)
    if(Video.dislikedby.includes(verifieduser._id)){
      return res.status(500).json({
        error:'already disliked'
      })
    }
    if(Video.likedby.includes(verifieduser._id)){
      Video.likes-=1;
      Video.likedby=Video.likedby.filter(userid=>userid.toString()!=verifieduser._id)
    }
    Video.dislike+=1;
    Video.dislikedby.push(verifieduser._id)
    await Video.save()
    res.status(200).json({
      msg:'disliked'
    })
  }
  catch(err){
    console.log(err)
    res.status(500).json({
      err:err.message
    })
  }
})

router.put("/views/:videoid",async(req,res)=>{
  try{
    const Video=await video.findById(req.params.videoid)
    console.log(Video)
    Video.views+=1
    await Video.save()
    res.status(200).json({
      message:"increased view count by one"
    })
  }
  catch(err){
    console.log(err)
    res.stsatus(500).json({
      error:err.message
    })
  }
})

module.exports=router