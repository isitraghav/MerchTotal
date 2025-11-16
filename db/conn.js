const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'webdev';

let db;

const connectToServer = async () => {
  try {
    await client.connect();
    console.log('Connected successfully to server');
    db = client.db(dbName);
  } catch (err) {
    console.error(err);
  }
};

const getDb = () => {
  return db;
};

module.exports = {
  connectToServer,
  getDb,
};
