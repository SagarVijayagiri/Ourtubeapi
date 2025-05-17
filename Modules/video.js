const mongoose=require('mongoose')
const videoschema=new mongoose.Schema({
  _id:mongoose.Schema.Types.ObjectId,
  title:{type:String,required:true},
  description:{type:String,required:true},
  //user_id:{type:String,required:true},
  user_id:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"user"},
  videourl:{type:String,required:true},
  videoid:{type:String,required:true},
  thumbnailurl:{type:String,required:true},
  thumbnailid:{type:String,required:true},
  category:{type:String,required:true},
  tags:{type:[String]},
  likes:{type:Number,default:0},
  dislike:{type:Number,default:0},
  views:{type:Number,default:0},
  likedby:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
  dislikedby:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
//  viewedby:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
},{timestamps:true})
module.exports=mongoose.model('video',videoschema)