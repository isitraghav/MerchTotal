const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/webdev';

const connectToServer = async () => {
  try {
    await mongoose.connect(url);
    console.log('Connected successfully to MongoDB using Mongoose');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

module.exports = {
  connectToServer,
};
