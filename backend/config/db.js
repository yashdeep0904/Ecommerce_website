import mongoose from "mongoose";


const connectDB = async() =>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Exit process with failure if the database cannot connect
        process.exit(1); 
    }
}
export default connectDB