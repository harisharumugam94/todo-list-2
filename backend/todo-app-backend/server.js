const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./src/app');

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('💥 Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});