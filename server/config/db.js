import mongoose from "mongoose";
import dotenv from'dotenv'
dotenv.config()
const connectDb =async()=>{
try {  
    mongoose.connection.on('connected',()=>console.log('DataBase Connected'));
       await mongoose.connect(process.env.MONGO_URI)

} catch (error) {
    console.log(error.message)
}   
}
export default connectDb