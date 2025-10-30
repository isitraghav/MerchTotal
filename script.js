class Product {
  constructor(name, description, price, bulkPrice, image, badges, tags, shipping) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.bulkPrice = bulkPrice;
    this.image = image;
    this.badges = badges;
    this.tags = tags;
    this.shipping = shipping;
  }

  render() {
    let badgesHtml = '';
    for (let i = 0; i < this.badges.length; i++) {
      const badgeClass = this.badges[i].type === 'best-seller' ? 'badge best-seller' : this.badges[i].type === 'fast' ? 'badge fast' : 'badge';
      badgesHtml = badgesHtml + '<span class="' + badgeClass + '">' + this.badges[i].label + '</span>';
    }

    return '<div class="product-card"><div class="product-image"><img src="' + this.image + '" /><div class="product-badges">' + badgesHtml + '</div></div><div class="product-info"><h3>' + this.name + '</h3><p>' + this.description + '</p><div class="product-price"><span class="price">From ₹' + this.price + '</span><span class="bulk-price">Bulk from ₹' + this.bulkPrice + '</span></div><div class="product-delivery">' + this.shipping + '</div><div class="product-actions"><button class="btn-primary">Customize</button><button class="btn-secondary add-to-cart-btn" data-name="' + this.name + '" data-price="' + this.price + '" data-image="' + this.image + '" data-tags="' + this.tags + '">Add to Cart</button></div></div></div>';
  }
}

class ProductCatalog {
  constructor() {
    this.products = [];
  }

  async loadProducts() {
    try {
      const response = await fetch('products.json');
      if (!response.ok) {
        throw new Error('Failed to load products');
      }
      this.products = await response.json();
      return this.products;
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  getAll() {
    return this.products;
  }

  async renderProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) {
      return;
    }

    await this.loadProducts();

    let html = '';
    for (let i = 0; i < this.products.length; i++) {
      const productData = this.products[i];
      const product = new Product(
        productData.name,
        productData.description,
        productData.price,
        productData.bulkPrice,
        productData.image,
        productData.badges,
        productData.tags,
        productData.shipping
      );
      html = html + product.render();
    }

    productGrid.innerHTML = html;
  }
}

class Cart {
  constructor() {
    this.storageKey = 'cart';
  }

  getItems() {
    const cartData = localStorage.getItem(this.storageKey);
    if (cartData) {
      return JSON.parse(cartData);
    }
    return [];
  }

  save(items) {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  addItem(product) {
    const items = this.getItems();

    const existingProduct = items.find(item => item.name === product.name);

    if (existingProduct) {
      existingProduct.quantity = existingProduct.quantity + 1;
    } else {
      product.quantity = 1;
      items.push(product);
    }

    this.save(items);
    this.updateCount();
    this.showNotification('Item added to cart!');
  }

  removeItem(productName) {
    let items = this.getItems();
    items = items.filter(item => item.name !== productName);
    this.save(items);
    this.updateCount();
    this.display();
  }

  changeQuantity(productName, change) {
    const items = this.getItems();

    for (let i = 0; i < items.length; i++) {
      if (items[i].name === productName) {
        items[i].quantity = items[i].quantity + change;

        if (items[i].quantity < 1) {
          items[i].quantity = 1;
        }

        break;
      }
    }

    this.save(items);
    this.updateCount();
    this.display();
  }

  getTotalItems() {
    const items = this.getItems();
    let totalItems = 0;

    for (let i = 0; i < items.length; i++) {
      totalItems = totalItems + items[i].quantity;
    }

    return totalItems;
  }

  updateCount() {
    const totalItems = this.getTotalItems();
    const cartCountElements = document.querySelectorAll('.cart-count');

    for (let i = 0; i < cartCountElements.length; i++) {
      cartCountElements[i].textContent = totalItems;
    }
  }

  showNotification(message) {
    alert(message);
  }

  display() {
    const items = this.getItems();
    const cartItemsList = document.getElementById('cartItemsList');

    if (!cartItemsList) {
      return;
    }

    if (items.length === 0) {
      cartItemsList.innerHTML = '<div class="empty-cart"><i class="fa-solid fa-cart-shopping"></i><h3>Your cart is empty</h3><p>Add some products to get started</p><a href="products.html" class="btn-primary">Browse Products</a></div>';
      document.getElementById('subtotal').textContent = '₹0';
      document.getElementById('shipping').textContent = '₹0';
      document.getElementById('tax').textContent = '₹0';
      document.getElementById('grandTotal').textContent = '₹0';
      return;
    }

    let html = '';
    let subtotal = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemTotal = item.price * item.quantity;
      subtotal = subtotal + itemTotal;

      const tags = item.tags.split(',');
      let tagsHtml = '';
      for (let j = 0; j < tags.length; j++) {
        tagsHtml = tagsHtml + '<span class="cart-item-tag">' + tags[j] + '</span>';
      }

      html = html + '<div class="cart-item"><div class="cart-item-image"><img src="' + item.image + '" alt="' + item.name + '"></div><div class="cart-item-details"><h3>' + item.name + '</h3><div class="cart-item-tags">' + tagsHtml + '</div><div class="cart-item-quantity"><button class="quantity-btn" onclick="shoppingCart.changeQuantity(\'' + item.name + '\', -1)">-</button><span class="quantity-number">' + item.quantity + '</span><button class="quantity-btn" onclick="shoppingCart.changeQuantity(\'' + item.name + '\', 1)">+</button></div><div class="cart-item-price">₹' + itemTotal + '</div><button class="cart-item-remove" onclick="shoppingCart.removeItem(\'' + item.name + '\')">Remove</button></div></div>';
    }

    cartItemsList.innerHTML = html;

    const shipping = subtotal > 500 ? 0 : 50;
    const tax = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = '₹' + subtotal;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : '₹' + shipping;
    document.getElementById('tax').textContent = '₹' + tax;
    document.getElementById('grandTotal').textContent = '₹' + grandTotal;
  }

  checkout() {
    const items = this.getItems();
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    alert('Proceeding to checkout...');
  }
}

const shoppingCart = new Cart();
const productCatalog = new ProductCatalog();

document.addEventListener('DOMContentLoaded', async function () {
  await productCatalog.renderProducts();

  shoppingCart.updateCount();

  if (document.getElementById('cartItemsList')) {
    shoppingCart.display();
  }

  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  for (let i = 0; i < addToCartButtons.length; i++) {
    addToCartButtons[i].addEventListener('click', function () {
      const button = this;
      const product = {
        name: button.getAttribute('data-name'),
        price: parseInt(button.getAttribute('data-price')),
        image: button.getAttribute('data-image'),
        tags: button.getAttribute('data-tags')
      };
      shoppingCart.addItem(product);
    });
  }

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      shoppingCart.checkout();
    });
  }
});
