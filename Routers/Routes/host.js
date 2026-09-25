const express=require('express');
const hostRouter=express.Router();
const hostController=require('../../controller/hostController');

const requireLogin=(req,res,next)=>{
	if(!req.session.isLoggedIn){
		return res.redirect('/login');
	}
	next();
};

hostRouter.get('/add-home', requireLogin, hostController.getAddHome);
hostRouter.post('/add-home', requireLogin, hostController.postAddHome);
hostRouter.get('/host/host-home', requireLogin, hostController.getHosthomes);
hostRouter.get('/host-home', requireLogin, hostController.getHosthomes);
hostRouter.get('/host/edit-home/:homeId', requireLogin, hostController.getEditHome);
hostRouter.post('/host/edit-home', requireLogin, hostController.postEditHome);
hostRouter.post('/host/delete-home/:homeId', requireLogin, hostController.postDeleteHome);
module.exports=hostRouter;