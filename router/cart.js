const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const auth = require('../middleware/auth');
const { ObjectId } = require('mongodb');

// Get user's cart
router.get('/', auth, async (req, res) => {
    const db = dbo.getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });
    res.json(user.cart || []);
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
    const db = dbo.getDb();
    const { productId, quantity } = req.body;
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });

    let cart = user.cart || [];
    const productIndex = cart.findIndex(item => item.productId.toString() === productId);

    if (productIndex > -1) {
        cart[productIndex].quantity += quantity;
    } else {
        cart.push({ productId: new ObjectId(productId), quantity });
    }

    await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart } });
    res.json(cart);
});

// Remove item from cart
router.post('/remove', auth, async (req, res) => {
    const db = dbo.getDb();
    const { productId } = req.body;
    
    await db.collection('users').updateOne(
        { _id: new ObjectId(req.user._id) },
        { $pull: { cart: { productId: new ObjectId(productId) } } }
    );

    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });
    res.json(user.cart || []);
});

// Update item quantity
router.post('/update', auth, async (req, res) => {
    const db = dbo.getDb();
    const { productId, quantity } = req.body;

    await db.collection('users').updateOne(
        { _id: new ObjectId(req.user._id), 'cart.productId': new ObjectId(productId) },
        { $set: { 'cart.$.quantity': quantity } }
    );

    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });
    res.json(user.cart || []);
});

module.exports = router;
