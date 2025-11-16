const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');

router.get('/', async (req, res) => {
  const db = dbo.getDb();
  const products = await db.collection('products').find({}).toArray();
  res.json(products);
});

module.exports = router;
