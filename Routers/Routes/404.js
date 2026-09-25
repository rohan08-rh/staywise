const express=require('express');
//onst path=require('path');
const pageNotFound=express.Router();
//const rootDir=require('../../util/path-util');
pageNotFound.use((req,res,next)=>{
   res.status(404).render('404',{isLoggedIn:req.session.isLoggedIn});
});
module.exports=pageNotFound;