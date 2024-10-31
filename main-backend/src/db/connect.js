// src/db/connect.js
import mongoose from 'mongoose';
import { Dbname } from '../config/constants.js';

const connectDB = async () => {
    try {
        const uri = `${process.env.DATABASE_URI}/${Dbname}`;
        if (!uri) {
            throw new Error('DATABASE_URI is not defined');
        }
        const connectionInstant  = await mongoose.connect(uri);
        console.log(`MongoDB connected successfully. DB HOST: ${connectionInstant.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

export default connectDB;
