const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        console.log(`Attempting to connect to MongoDB at: ${process.env.MONGO_URI}`);
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 2000 // Quick timeout to try memory server
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.warn(`Local MongoDB connection failed (${err.message}). Starting In-Memory MongoDB Server...`);

        try {
            const fs = require('fs');
            const path = require('path');
            const dataPath = path.join(__dirname, '../data');

            // Ensure data directory exists
            if (!fs.existsSync(dataPath)) {
                fs.mkdirSync(dataPath);
            }

            const mongoServer = await MongoMemoryServer.create({
                instance: {
                    dbPath: dataPath
                }
            });
            const memoryUri = mongoServer.getUri();

            const memoryConn = await mongoose.connect(memoryUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log(`Fallback Local MongoDB Connected: ${memoryConn.connection.host} (Persistent Database in /backend/data)`);
        } catch (memErr) {
            console.error(`Error starting Memory Server: ${memErr.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
