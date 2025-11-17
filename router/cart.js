const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.productId');
    res.json(user.cart || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user._id);

    const productIndex = user.cart.findIndex(item => item.productId.toString() === productId);

    if (productIndex > -1) {
      user.cart[productIndex].quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();
    await user.populate('cart.productId');
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
});

// Remove item from cart
router.post('/remove', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    await user.save();
    await user.populate('cart.productId');

    res.json(user.cart || []);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
});

// Update item quantity
router.post('/update', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const user = await User.findById(req.user._id);
    const productIndex = user.cart.findIndex(item => item.productId.toString() === productId);

    if (productIndex > -1) {
      user.cart[productIndex].quantity = quantity;
      await user.save();
      await user.populate('cart.productId');
    }

    res.json(user.cart || []);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
});

module.exports = router;
