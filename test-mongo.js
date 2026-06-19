const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');

async function test() {
    const mongoServer = await MongoMemoryServer.create({
        instance: {
            dbPath: './data',
        }
    });

    await mongoose.connect(mongoServer.getUri());
    const m = mongoose.model('Test', new mongoose.Schema({ name: String }));
    // Removed create
    const docs = await m.find();
    console.log("Documents:", docs);
    await mongoose.disconnect();
    await mongoServer.stop();
}

test();
