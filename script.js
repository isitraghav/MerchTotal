function getCart() {
  const cartData = localStorage.getItem('cart');
  if (cartData) {
    return JSON.parse(cartData);
  }
  return [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  
  const existingProduct = cart.find(item => item.name === product.name);
  
  if (existingProduct) {
    existingProduct.quantity = existingProduct.quantity + 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  
  saveCart(cart);
  updateCartCount();
  showNotification('Item added to cart!');
}

function removeFromCart(productName) {
  let cart = getCart();
  cart = cart.filter(item => item.name !== productName);
  saveCart(cart);
  updateCartCount();
  displayCart();
}

function updateQuantity(productName, change) {
  const cart = getCart();
  
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].name === productName) {
      cart[i].quantity = cart[i].quantity + change;
      
      if (cart[i].quantity < 1) {
        cart[i].quantity = 1;
      }
      
      break;
    }
  }
  
  saveCart(cart);
  updateCartCount();
  displayCart();
}

function updateCartCount() {
  const cart = getCart();
  let totalItems = 0;
  
  for (let i = 0; i < cart.length; i++) {
    totalItems = totalItems + cart[i].quantity;
  }
  
  const cartCountElements = document.querySelectorAll('.cart-count');
  for (let i = 0; i < cartCountElements.length; i++) {
    cartCountElements[i].textContent = totalItems;
  }
}

function showNotification(message) {
  alert(message);
}

function displayCart() {
  const cart = getCart();
  const cartItemsList = document.getElementById('cartItemsList');
  
  if (!cartItemsList) {
    return;
  }
  
  if (cart.length === 0) {
    cartItemsList.innerHTML = '<div class="empty-cart"><i class="fa-solid fa-cart-shopping"></i><h3>Your cart is empty</h3><p>Add some products to get started</p><a href="products.html" class="btn-primary">Browse Products</a></div>';
    document.getElementById('subtotal').textContent = '₹0';
    document.getElementById('shipping').textContent = '₹0';
    document.getElementById('tax').textContent = '₹0';
    document.getElementById('grandTotal').textContent = '₹0';
    return;
  }
  
  let html = '';
  let subtotal = 0;
  
  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const itemTotal = item.price * item.quantity;
    subtotal = subtotal + itemTotal;
    
    const tags = item.tags.split(',');
    let tagsHtml = '';
    for (let j = 0; j < tags.length; j++) {
      tagsHtml = tagsHtml + '<span class="cart-item-tag">' + tags[j] + '</span>';
    }
    
    html = html + '<div class="cart-item"><div class="cart-item-image"><img src="' + item.image + '" alt="' + item.name + '"></div><div class="cart-item-details"><h3>' + item.name + '</h3><div class="cart-item-tags">' + tagsHtml + '</div><div class="cart-item-quantity"><button class="quantity-btn" onclick="updateQuantity(\'' + item.name + '\', -1)">-</button><span class="quantity-number">' + item.quantity + '</span><button class="quantity-btn" onclick="updateQuantity(\'' + item.name + '\', 1)">+</button></div><div class="cart-item-price">₹' + itemTotal + '</div><button class="cart-item-remove" onclick="removeFromCart(\'' + item.name + '\')">Remove</button></div></div>';
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

document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  
  if (document.getElementById('cartItemsList')) {
    displayCart();
  }
  
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  for (let i = 0; i < addToCartButtons.length; i++) {
    addToCartButtons[i].addEventListener('click', function() {
      const button = this;
      const product = {
        name: button.getAttribute('data-name'),
        price: parseInt(button.getAttribute('data-price')),
        image: button.getAttribute('data-image'),
        tags: button.getAttribute('data-tags')
      };
      addToCart(product);
    });
  }
  
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      const cart = getCart();
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      alert('Proceeding to checkout...');
    });
  }
});
