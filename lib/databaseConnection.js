import mongoose from "mongoose";
const MONGODB_URL = process.env.MONGODB_URI

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    }
}

export const connectDB = async () => {
    if (!MONGODB_URL) {
        throw new Error('MONGODB_URI is not defined in environment variables')
    }
    
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URL, {
            dbName: 'YT-NEXTJS-ECOMMERCE',
            bufferCommands: false
        }).catch((error) => {
            cached.promise = null
            throw error
        })
    }

    cached.conn = await cached.promise

    return cached.conn
}