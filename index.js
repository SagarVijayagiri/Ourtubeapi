const http=require('http');
const express=require('express');
const app=require("./app");;
const port=3000
const server=http.createServer(app);
app.listen(port,(req,res)=>{
  console.log("sever running in port:",port)
})