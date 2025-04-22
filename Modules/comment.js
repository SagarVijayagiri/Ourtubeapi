const mongoose=require('mongoose')
const commentschema=new mongoose.Schema({
  _id:mongoose.Schema.Types.ObjectId,
  userid:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"user"},
  videoid:{type:String,required:true},
  commenttext:{type:String,required:true}
},{timestamps:true})
module.exports=mongoose.model('comment',commentschema)