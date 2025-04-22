const express = require("express");
const router = express.Router();
const comment = require("../Modules/comment")
const checkauth=require("../middleware/Checkauth")
const jwt=require("jsonwebtoken")
const mongoose=require('mongoose');
router.post("/new-comment/:videoid",checkauth, async(req, res) => {
  try {
    const token=req.headers.authorization.split(" ")[1];
    const verifieduser=await jwt.verify(token,'sbs online classes 123');
    console.log(verifieduser)
    const newcomment = new comment({
      _id:new mongoose.Types.ObjectId(),
      videoid:req.params.videoid,
      userid:verifieduser._id,
      commenttext:req.body.commenttext
    })
    const Comment=await newcomment.save()
    res.status(200).json({
      NewComment:Comment
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message
    });
  }
});
router.get("/:videoid",async(req,res)=>{
  try{
    const comments = await comment.find({videoid:req.params.videoid}).populate('userid','channelname logourl')
    res.status(200).json({
      commentlist:comments
    })
  }
  catch(err){
    console.log(err)
    res.status(500).json({
      error:err.message
    })
  }
})
router.put("/:commentid",checkauth,async(req,res)=>{
  try{
    const token=req.headers.authorization.split(" ")[1];
    const verifieduser=await jwt.verify(token,'sbs online classes 123');
    console.log(verifieduser)
    const Comment = await comment.findById(req.params.commentid)
    console.log(Comment)
    if(Comment.userid!=verifieduser._id){
      res.status(500).json({
        err:"you have no access"
      })
    }
    Comment.commenttext = await req.body.commenttext;
    const updatedcomment=await Comment.save()
    res.status(200).json({
      updatedcomment:updatedcomment
    })
  }
  catch(err){
    console.log(err)
    res.status(500).json({
      error:err.message
    })
  }
})

router.delete("/:commentid",checkauth,async(req,res)=>{
  try{
    const token=req.headers.authorization.split(" ")[1];
    const verifieduser=await jwt.verify(token,'sbs online classes 123');
    console.log(verifieduser)
    const Comment = await comment.findById(req.params.commentid)
    console.log(Comment)
    if(!Comment){
      return res.status(500).json({
        err:"comment not found"
      })
    }
    if(Comment.userid!=verifieduser._id){
      res.status(500).json({
        err:"you have no access"
      })
    }
    await comment.findByIdAndDelete(req.params.commentid)

    res.status(200).json({
     deleteddata : "success"
    })
  }
  catch(err){
    console.log(err)
    res.status(500).json({
      error:err.message
    })
  }
})

module.exports = router;