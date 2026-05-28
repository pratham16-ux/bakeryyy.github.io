/* ══════════════════════════════════════════
   STACKLY SHARED CART SYSTEM  (cart.js)
   Used by menu.html AND shop.html
   Cart state persisted in localStorage
══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Storage helpers ── */
  function loadCart() {
    try { return JSON.parse(localStorage.getItem('stackly_cart') || '[]'); }
    catch (e) { return []; }
  }
  function saveCart(c) {
    try { localStorage.setItem('stackly_cart', JSON.stringify(c)); } catch (e) {}
  }

  var cart = loadCart();

  /* ── Expose minimal API globally ── */
  window.StacklyCart = {
    get: function () { return cart; },
    add: function (item) {
      var idx = cart.findIndex(function (i) { return i.name === item.name; });
      if (idx > -1) { cart[idx].qty += 1; }
      else { cart.push({ name: item.name, price: item.price, img: item.img, qty: 1 }); }
      saveCart(cart);
      renderCart();
      updateCountBadge();
    },
    remove: function (idx) {
      cart.splice(idx, 1);
      saveCart(cart);
      renderCart();
      updateCountBadge();
    },
    changeQty: function (idx, delta) {
      cart[idx].qty += delta;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
      saveCart(cart);
      renderCart();
      updateCountBadge();
    }
  };

  /* ── Helpers ── */
  function formatPrice(n) { return '£' + n.toFixed(2); }

  /* ── Badge update (navbar cart icon count) ── */
  function updateCountBadge() {
    var total = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    document.querySelectorAll('.cart-badge, #cart-badge').forEach(function (el) {
      el.textContent = total;
    });
    document.querySelectorAll('#cart-count').forEach(function (el) {
      el.textContent = total;
      el.style.display = total > 0 ? 'flex' : 'none';
    });
  }

  /* ── Render cart drawer ── */
  function renderCart() {
    var listEl     = document.getElementById('cart-items-list');
    var emptyEl    = document.getElementById('cart-empty-state');
    var footerEl   = document.getElementById('cart-drawer-footer');
    var subtotalEl = document.getElementById('cart-subtotal');
    if (!listEl) return;

    listEl.innerHTML = '';

    if (cart.length === 0) {
      if (emptyEl)  emptyEl.style.display  = 'flex';
      if (footerEl) footerEl.classList.remove('visible');
      return;
    }

    if (emptyEl)  emptyEl.style.display = 'none';
    if (footerEl) footerEl.classList.add('visible');

    var total = 0;
    cart.forEach(function (item, idx) {
      total += item.price * item.qty;
      var div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML =
        '<div class="cart-item-img">' +
          (item.img ? '<img src="' + item.img + '" alt="' + item.name + '" />' : '') +
        '</div>' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + item.name + '</div>' +
          '<div class="cart-item-price">' + formatPrice(item.price) + ' each</div>' +
          '<div class="cart-item-controls">' +
            '<button class="cart-qty-btn" data-action="dec" data-idx="' + idx + '">−</button>' +
            '<span class="cart-qty-num">' + item.qty + '</span>' +
            '<button class="cart-qty-btn" data-action="inc" data-idx="' + idx + '">+</button>' +
          '</div>' +
        '</div>' +
        '<button class="cart-item-remove" data-idx="' + idx + '" title="Remove"><i class="fas fa-trash-alt"></i></button>';
      listEl.appendChild(div);
    });

    if (subtotalEl) subtotalEl.textContent = formatPrice(total);
    updateCountBadge();

    listEl.querySelectorAll('.cart-qty-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        window.StacklyCart.changeQty(parseInt(this.dataset.idx), this.dataset.action === 'inc' ? 1 : -1);
      });
    });
    listEl.querySelectorAll('.cart-item-remove').forEach(function (b) {
      b.addEventListener('click', function () {
        window.StacklyCart.remove(parseInt(this.dataset.idx));
      });
    });
  }

  /* ── Open / close drawer ── */
  function openCart() {
    var drawer  = document.getElementById('cart-drawer');
    var overlay = document.getElementById('cart-overlay');
    if (drawer)  drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    var drawer  = document.getElementById('cart-drawer');
    var overlay = document.getElementById('cart-overlay');
    if (drawer)  drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  window.StacklyCart.open  = openCart;
  window.StacklyCart.close = closeCart;

  /* ── DOM ready wiring ── */
  document.addEventListener('DOMContentLoaded', function () {

    /* Cart close */
    var closeBtn = document.getElementById('cart-close-btn');
    var overlay  = document.getElementById('cart-overlay');
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (overlay)  overlay.addEventListener('click', closeCart);

    /* Nav cart icon */
    document.querySelectorAll('#nav-cart-btn, .nav-cart-btn').forEach(function (btn) {
      btn.addEventListener('click', openCart);
    });

    /* ── Add-to-cart buttons (shop.html style: .product-add.btn-add-cart) ── */
    document.querySelectorAll('.btn-add-cart').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var product = getProductData(this);
        window.StacklyCart.add(product);

        /* flash feedback */
        var self = this;
        self.classList.add('added');
        var plus = self.querySelector('.btn-plus');
        if (plus) {
          var orig = plus.textContent;
          plus.textContent = '✓';
          setTimeout(function () {
            plus.textContent = orig;
            self.classList.remove('added');
          }, 900);
        }
        /* Also handle menu-style add buttons */
        var menuBtn = self.closest('.menu-item-add-btn') || (self.classList.contains('menu-item-add-btn') ? self : null);
        if (!plus && menuBtn) {
          var origHTML = self.innerHTML;
          self.innerHTML = '<i class="fas fa-check"></i> Added';
          self.style.background = 'var(--sage, #7a9e7e)';
          setTimeout(function () {
            self.innerHTML = origHTML;
            self.style.background = '';
          }, 900);
        }

        setTimeout(openCart, 260);
      });
    });

    /* ── Menu-style add buttons (.menu-item-add-btn) ── */
    document.querySelectorAll('.menu-item-add-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var product = getMenuItemData(this);
        window.StacklyCart.add(product);

        /* flash */
        var self = this;
        var origHTML = self.innerHTML;
        self.innerHTML = '<i class="fas fa-check"></i> Added!';
        self.style.background = 'var(--sage, #7a9e7e)';
        setTimeout(function () {
          self.innerHTML = origHTML;
          self.style.background = '';
        }, 950);

        setTimeout(openCart, 260);
      });
    });

    /* Also handle "Add to Cart" on chef special / btn-primary */
    document.querySelectorAll('.chef-special .btn-primary').forEach(function (btn) {
      if (btn.textContent.trim().toLowerCase().includes('add')) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var special = btn.closest('.chef-special');
          if (!special) return;
          var name  = (special.querySelector('.chef-special-title') || {}).textContent || 'Chef\'s Special';
          var priceStr = ((special.querySelector('.chef-special-price') || {}).textContent || '0').replace(/[^0-9.]/g, '');
          var price = parseFloat(priceStr) || 0;
          var imgEl = special.querySelector('img');
          var img   = imgEl ? imgEl.src : '';
          window.StacklyCart.add({ name: name.trim(), price: price, img: img });
          setTimeout(openCart, 260);
        });
      }
    });

    /* Initial render & badge */
    renderCart();
    updateCountBadge();
  });

  /* ── Data extractors ── */
  function getProductData(btn) {
    var card = btn.closest('.product-card');
    var name = (card.querySelector('.product-name') || {}).textContent || '';
    var priceStr = ((card.querySelector('.product-price') || {}).textContent || '0').replace(/[^0-9.]/g, '');
    var price = parseFloat(priceStr) || 0;
    var imgEl = card.querySelector('.product-img img, img');
    var img   = imgEl ? imgEl.getAttribute('src') : '';
    return { name: name.trim(), price: price, img: img };
  }

  function getMenuItemData(btn) {
    var card = btn.closest('.menu-item-card');
    var name = (card.querySelector('.menu-item-name') || {}).textContent || '';
    var priceStr = ((card.querySelector('.menu-price') || {}).textContent || '0').replace(/[^0-9.]/g, '');
    var price = parseFloat(priceStr) || 0;
    var imgEl = card.querySelector('.menu-item-img img, img');
    var img   = imgEl ? imgEl.getAttribute('src') : '';
    return { name: name.trim(), price: price, img: img };
  }

})();