const express=require('express');
const authController=require('../../controller/authController');
const authRouter=express.Router();

authRouter.get("/login",authController.getLogin);
authRouter.post("/login",authController.postLogin);
authRouter.get("/signin",authController.getSignin);
authRouter.get("/signup",authController.getSignin);
authRouter.get("/forgot-password", authController.getForgotPassword);
authRouter.post("/forgot-password", authController.postForgotPassword);
authRouter.post("/signin",authController.postSignin);
authRouter.post("/signup",authController.postSignin);
authRouter.post("/logout",authController.postLogout);
authRouter.get('/reset-password',authController.getResetPassword);
authRouter.post('/reset-password', authController.postResetPassword);
exports.authRouter=authRouter;