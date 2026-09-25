const express=require('express');
const storeController=require('../../controller/storeController');
const storeRouter=express.Router();

const requireLogin=(req,res,next)=>{
	if(!req.session.isLoggedIn){
		return res.redirect('/login');
	}
	next();
};

storeRouter.get("/",storeController.getHome);
storeRouter.get("/homes",storeController.getHomes);
storeRouter.get("/homes/:homeId",storeController.getHomeDetails);
storeRouter.get("/favou",requireLogin,storeController.getFav);
storeRouter.post("/favou",requireLogin,storeController.postGetFav);
module.exports=storeRouter;
