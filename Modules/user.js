const mongoose=require('mongoose')
const userschema=new mongoose.Schema({
  _id:mongoose.Schema.Types.ObjectId,
  channelname:{type:String,required:true},
  email:{type:String,required:true},
  phone:{type:String,required:true},
  password:{type:String,required:true},
  logourl:{type:String,required:true},
  logoid:{type:String,required:true},
  subscribers: {type:Number,default:0},
  subscribedby:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
  subscribedchannels:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}]
},{timestamps:true})
module.exports=mongoose.model('user',userschema)