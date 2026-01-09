const mongoose = require('mongoose');
let memoryServer;

const connectDB = async () => {
    const mongoUri =
        process.env.MONGODB_URI ||
        process.env.MONGODB_URL ||
        process.env.MONGO_URL ||
        'mongodb://127.0.0.1:27017/findx';

    // Note: useNewUrlParser and useUnifiedTopology are deprecated in Mongoose 7+
    // These options are now the default behavior
    const connectionOptions = {};

    try {
        const conn = await mongoose.connect(mongoUri, connectionOptions);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`💾 Data will persist between restarts`);
    } catch (error) {
        console.error('❌ Database connection error:', error.message);

        if (process.env.NODE_ENV === 'production') {
            throw error;
        }

        console.warn('\n⚠️  WARNING: Could not connect to MongoDB!');
        console.warn('⚠️  Using in-memory database - DATA WILL NOT PERSIST!');
        console.warn('⚠️  Please set up MongoDB to save your data.');
        console.warn('⚠️  See MONGODB_SETUP.md for instructions.\n');
        
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri();

        const conn = await mongoose.connect(memoryUri, connectionOptions);
        console.log('🔄 MongoDB (In-Memory) Connected:', conn.connection.host);
        console.log('⚠️  All data will be lost when server restarts!\n');
    }
};

const disconnectDB = async () => {
    await mongoose.connection.close();

    if (memoryServer) {
        await memoryServer.stop();
    }
};

module.exports = {
    connectDB,
    disconnectDB
};