const CART_KEY = 'yendo_cart_v1';

function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderMiniCart();
}

function addToCart(item){
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id);
  if(existing){ existing.qty += 1; }
  else { cart.push({ id:item.id, name:item.name, price:item.price, img:item.img, qty:1 }); }
  saveCart(cart);
}

function removeFromCart(id){
  saveCart(getCart().filter(i => i.id !== id));
}

function setQty(id, qty){
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if(item){
    item.qty = Math.max(1, parseInt(qty) || 1);
    saveCart(cart);
  }
}

function clearCart(){
  saveCart([]);
}

function cartCount(){
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function cartTotal(){
  return getCart().reduce((sum, i) => sum + (parseFloat(i.price) || 0) * i.qty, 0);
}

function updateCartBadge(){
  const badge = document.getElementById('cartBadge');
  if(!badge) return;
  const n = cartCount();
  badge.textContent = n;
  badge.style.display = n > 0 ? 'inline-flex' : 'none';
}

function renderMiniCart(){
  const panel = document.getElementById('miniCart');
  if(!panel) return;
  const cart = getCart();

  const countLabel = document.getElementById('miniCartCount');
  const totalLabel = document.getElementById('miniCartTotal');
  if(countLabel) countLabel.textContent = `${cartCount()} item${cartCount()===1?'':'s'}`;
  if(totalLabel) totalLabel.textContent = `S/${cartTotal().toFixed(0)}`;

  const itemsEl = document.getElementById('miniCartItems');
  if(!itemsEl) return;

  if(cart.length === 0){
    itemsEl.innerHTML = '<div class="mini-cart-empty">Tu carrito está vacío.</div>';
    return;
  }

  itemsEl.innerHTML = cart.map(i => `
    <div class="mini-cart-row">
      <img src="${i.img}" alt="${i.name}" onerror="this.style.opacity=0">
      <div class="mc-info">
        <div class="mc-name">${i.name}</div>
        <div class="mc-price">S/${i.price}</div>
        <div class="mc-qty-controls">
          <button type="button" class="mc-qty-minus" data-id="${i.id}" aria-label="Restar">−</button>
          <span class="mc-qty-value">${i.qty}</span>
          <button type="button" class="mc-qty-plus" data-id="${i.id}" aria-label="Sumar">+</button>
        </div>
      </div>
      <button type="button" class="mini-cart-remove" data-id="${i.id}" aria-label="Quitar">✕</button>
    </div>
  `).join('');

  itemsEl.querySelectorAll('.mini-cart-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromCart(btn.dataset.id);
    });
  });

  itemsEl.querySelectorAll('.mc-qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = getCart().find(i => i.id === btn.dataset.id);
      if(!item) return;
      if(item.qty <= 1){ removeFromCart(item.id); }
      else { setQty(item.id, item.qty - 1); }
    });
  });

  itemsEl.querySelectorAll('.mc-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = getCart().find(i => i.id === btn.dataset.id);
      if(!item) return;
      setQty(item.id, item.qty + 1);
    });
  });
}

function toggleMiniCart(){
  const panel = document.getElementById('miniCart');
  if(!panel) return;
  const willOpen = !panel.classList.contains('open');
  panel.classList.toggle('open', willOpen);
  if(willOpen) renderMiniCart();
}

function closeMiniCart(){
  const panel = document.getElementById('miniCart');
  if(panel) panel.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderMiniCart();

  const toggle = document.getElementById('cartToggle');
  if(toggle){
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMiniCart();
    });
  }

  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('cartWrap');
    if(wrap && !wrap.contains(e.target)) closeMiniCart();
  });
});
