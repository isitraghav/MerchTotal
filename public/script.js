class Product {
  constructor(id, name, description, price, bulkPrice, image, badges, tags, shipping) {
    this.id = id;
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
    badgesHtml = (this.badges || []).map(b => {
      const cls = 'badge' + (b.type === 'best-seller' ? ' best-seller' : b.type === 'fast' ? ' fast' : '');
      return '<span class="' + cls + '">' + b.label + '</span>';
    }).join('');

    return `<div class="product-card">
              <div class="product-image">
                <img src="${this.image}" />
                <div class="product-badges">${badgesHtml}</div>
              </div>
              <div class="product-info">
                <h3>${this.name}</h3>
                <p>${this.description}</p>
                <div class="product-price">
                  <span class="price">From ₹${this.price}</span>
                  <span class="bulk-price">Bulk from ₹${this.bulkPrice}</span>
                </div>
                <div class="product-delivery">${this.shipping}</div>
                <div class="product-actions">
                  <button class="btn-secondary add-to-cart-btn" data-id="${this.id}" data-name="${this.name}" data-price="${this.price}" data-image="${this.image}" data-tags="${this.tags}">Add to Cart</button>
                </div>
              </div>
            </div>`;
  }
}

class ProductCatalog {
  constructor() {
    this.products = [];
  }

  async loadProducts() {
    try {
      const response = await fetch('/api/products');
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
        productData._id,
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
    this.token = localStorage.getItem('token');
  }

  async getItems() {
    if (this.token) {
      const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const cart = await response.json();
      
      // Get all products once
      const productsResponse = await fetch('/api/products');
      const products = await productsResponse.json();
      
      // Map cart items with product details
      const detailedCart = cart.map(item => {
        const product = products.find(p => p._id === (item.productId._id || item.productId));
        if (product) {
          return {
            ...product,
            productId: item.productId._id || item.productId,
            quantity: item.quantity,
            id: product._id
          };
        }
        return null;
      }).filter(item => item !== null);
      
      return detailedCart;
    } else {
      const cartData = localStorage.getItem(this.storageKey);
      return cartData ? JSON.parse(cartData) : [];
    }
  }

  async addItem(product) {
    if (this.token) {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
    } else {
      const items = await this.getItems();
      const existingProduct = items.find(item => item.id === product.id);
      if (existingProduct) {
        existingProduct.quantity++;
      } else {
        product.quantity = 1;
        items.push(product);
      }
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
    this.updateCount();
    this.showNotification('Item added to cart!');
  }

  async removeItem(productId) {
    if (this.token) {
      await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ productId })
      });
    } else {
      let items = await this.getItems();
      items = items.filter(item => item.id !== productId);
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
    this.updateCount();
    this.display();
  }

  async changeQuantity(productId, change) {
    if (this.token) {
        const items = await this.getItems();
        const item = items.find(i => i.productId === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity > 0) {
                await fetch('/api/cart/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify({ productId, quantity: newQuantity })
                });
            }
        }
    } else {
        const items = await this.getItems();
        const item = items.find(i => i.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity < 1) {
                item.quantity = 1;
            }
        }
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
    this.updateCount();
    this.display();
  }

  async getTotalItems() {
    const items = await this.getItems();
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  async updateCount() {
    const totalItems = await this.getTotalItems();
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => el.textContent = totalItems);
  }

  showNotification(message) {
    alert(message);
  }

  async display() {
    const items = await this.getItems();
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
      subtotal += itemTotal;

      const tags = Array.isArray(item.tags) ? item.tags.join(',') : item.tags;
      let tagsHtml = tags.split(',').map(tag => `<span class="cart-item-tag">${tag}</span>`).join('');

      html += `<div class="cart-item">
                 <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
                 <div class="cart-item-details">
                   <h3>${item.name}</h3>
                   <div class="cart-item-tags">${tagsHtml}</div>
                   <div class="cart-item-quantity">
                     <button class="quantity-btn" onclick="shoppingCart.changeQuantity('${item.productId || item.id}', -1)">-</button>
                     <span class="quantity-number">${item.quantity}</span>
                     <button class="quantity-btn" onclick="shoppingCart.changeQuantity('${item.productId || item.id}', 1)">+</button>
                   </div>
                   <div class="cart-item-price">₹${itemTotal}</div>
                   <button class="cart-item-remove" onclick="shoppingCart.removeItem('${item.productId || item.id}')">Remove</button>
                 </div>
               </div>`;
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

  async checkout() {
    const items = await this.getItems();
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    alert('Proceeding to checkout...');
  }
}

const shoppingCart = new Cart();
const productCatalog = new ProductCatalog();

async function updateNav() {
    const token = localStorage.getItem('token');
    const navMenu = document.querySelector('.nav-menu');

    if (token) {
        try {
            const response = await fetch('/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const user = await response.json();
                navMenu.innerHTML = `
                    <a href="index.html" class="nav-link">Home</a>
                    <a href="about.html" class="nav-link">About</a>
                    <a href="products.html" class="nav-link">Products</a>
                    <a href="cart.html" class="nav-link cart-link">
                        <i class="fa-solid fa-cart-shopping"></i>
                        <span class="cart-count">0</span>
                    </a>
                    <span class="nav-link">Welcome, ${user.email}</span>
                    <a href="#" class="nav-link" id="logout-btn">Logout</a>
                `;
                document.getElementById('logout-btn').addEventListener('click', () => {
                    localStorage.removeItem('token');
                    window.location.reload();
                });
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            localStorage.removeItem('token');
        }
    }
}


document.addEventListener('DOMContentLoaded', async function () {
  await updateNav();
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
        id: button.getAttribute('data-id'),
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
    checkoutBtn.addEventListener('click', async function () {
      await shoppingCart.checkout();
    });
  }
});


const btn = document.getElementById("topBtn");

// show button when user scrolls down
window.onscroll = function () {
  if (window.scrollY > 200) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
};

// go to top when clicked
btn.onclick = function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};