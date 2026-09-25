
// module.exports=class Home{

//     constructor(housename,location,price,rating,imageUrl,_id){
//         this.houseName=housename;
//         this.location=location;
//         this.price=price;
//         this.rating=rating;
//         this.imageUrl=imageUrl;
//         if(_id){
//             this._id=new ObjectId(String(_id));
//         }
//     }


const mongoose =require('mongoose');

const homeSchema =new mongoose.Schema({
    houseName:{type: String,required:true},

    location:{type: String,required:true},
    price:{type:Number,required:true},
    rating:{type: Number,required:true},
    imageUrl:{type: String}
   

});

module.exports=mongoose.model("Home",homeSchema);
  