const Home = require('../models/Home')
exports.getAddHome = (req, res) => {
    res.render('host/temp',{isLoggedIn:req.session.isLoggedIn});
};


exports.postAddHome = (req, res, next) => {
    const houseName = req.body.name;
    const location = req.body.location;
    const price = req.body.price;
    const rating = req.body.rating;

    if (!req.file) {
        return res.status(400).send('no valid image provided');
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    console.log('req body', req.body);
    console.log('host photo', req.file);

    const newHome = new Home({ houseName, location, price, rating, imageUrl });
    newHome.save().then(() => {
        res.render('store/post-home', { isLoggedIn: req.session.isLoggedIn });
    }).catch(next);
};
    
exports.getHosthomes=(req,res,next)=>{
          Home.find().then((registeredHomes) => {
                     res.render('host/host-home', { homes: registeredHomes,isLoggedIn:req.session.isLoggedIn });
              }).catch(next);
    };


exports.getEditHome = (req, res, next) => {
        const homeId = req.params.homeId;
        const editing=req.query.editing=='true';
        if(!editing){
            console.log("editing flag not set properly");
            return res.redirect("/host/host-home")
        }
        Home.findById(homeId).then((home)=>{
         
            if (!home) {
                console.log('home not found');
                return res.redirect("/host/host-home");
            }
     console.log(homeId,editing,home);
            res.render('host/edit-home', { home:home,
                editing:editing,isLoggedIn:req.session.isLoggedIn
             });
        });
    };

    exports.postEditHome=(req,res,next)=>{
        console.log(req.body);
           const {houseName,price,location,rating,photoUrl,id}=req.body;
           Home.findById(id)
           .then((existingHome)=>{
                  if(!existingHome){
                         console.log("home not found uin editing");
                         return res.redirect("/host/host-home");
                  }
       existingHome.name=houseName;
       existingHome.price=price;
       existingHome.location=location;
       existingHome.rating=rating;
       existingHome.photoUrl=photoUrl;
       return existingHome.save();
                  
           })
           .finally(()=>{
            return res.redirect("/host/host-home");
           })
    };

    exports.postDeleteHome=(req,res,next)=>{
        const homeId=req.params.homeId;
        Home.findByIdAndDelete(homeId).then(()=>{
         res.redirect("/host/host-home");
            }).catch((error)=>{
                console.log("error while deleting",error);
            });
                
    };
       



