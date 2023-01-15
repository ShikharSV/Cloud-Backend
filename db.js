const mongoose=require('mongoose');
const mongoURI="mongodb://localhost:27017/cloudDB";
const connectToMongo=()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connected To Mongo");
    })
}
module.exports=connectToMongo;