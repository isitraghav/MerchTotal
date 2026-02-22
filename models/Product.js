const mongoose = require('mongoose');
const slugify = require('slugify');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true
  },

  description: {
    type: String,
    trim: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  discountPrice: {
    type: Number,
    min: 0
  },

  brand: {
    type: String,
    trim: true
  },

  category: {
    type: String,
    trim: true,
    index: true
  },

  images: [
    {
      type: String
    }
  ],

  stock: {
    type: Number,
    default: 0,
    min: 0
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  reviews: [reviewSchema],

  averageRating: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});


// Create slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});


// Virtual field: Check stock availability
productSchema.virtual('isInStock').get(function() {
  return this.stock > 0;
});


// Calculate average rating before save
productSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = total / this.reviews.length;
  }
  next();
});


const Product = mongoose.model('Product', productSchema);
module.exports = Product;