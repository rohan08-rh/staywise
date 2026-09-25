const { ObjectId } = require('mongodb');
const Favourites = require('../models/Favourites');
const  Home = require('../models/Home');
// const { ObjectId } = require('mongodb');

exports.getHome=(req,res,next)=>{
       Home.find().then((registeredHomes)=> {
              res.render('store/index',{homes:registeredHomes,isLoggedIn:req.session.isLoggedIn});
       }).catch(next);

};

exports.getHomes = (req, res, next) => {
       Home.find().then((registeredHomes) => {
              res.render('store/Homes', { homes: registeredHomes,isLoggedIn:req.session.isLoggedIn });
       }).catch(next);
};

exports.getHomeDetails = (req, res,next) => {
       const homeId=req.params.homeId;
       Home.findById(homeId)
         .then(home=>{
              if(!home){
                     console.log("home not found");
                     console.log("Requested ID:", homeId);
                     return res.redirect("/Homes");
              }
              res.render("store/HomeDetails",{home:home,isLoggedIn:req.session.isLoggedIn});
       })
       .catch(next);
};



exports.getFav=(req,res,next)=>{
      Favourites.find().populate("homeId").then((favouritesIdHomes)=>{
       const homes = favouritesIdHomes
         .filter((fav) => fav.homeId)
         .map((fav) => fav.homeId);

       res.render("store/favou", { homes, isLoggedIn: req.session.isLoggedIn });
      }).catch(next);

};
exports.postGetFav = (req, res, next) => {

    const homeId = req.body.id;
    const fav=new Favourites({homeId});
    fav.save().then(()=>{
       res.redirect("/favou");
    }).catch(err=>{
       console.log("error while adding fav",err);
       res.redirect("/favou");
    })
};

