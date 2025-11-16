const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'webdev';
const collectionName = 'products';
const jsonFilePath = path.join(__dirname, 'products.json');

async function uploadData() {
  try {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    await collection.deleteMany({});
    console.log('Cleared existing data in the collection.');

    const result = await collection.insertMany(data);
    console.log(`${result.insertedCount} documents were inserted`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

uploadData();
