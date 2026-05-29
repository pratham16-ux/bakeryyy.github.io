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

  /* ── Badge update ── */
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

  /* ══════════════════════════════════════════
     DATA EXTRACTOR
     Works for BOTH page types:
       shop page  → closest .product-card  → .product-name / .product-price
       menu page  → closest .menu-item-card → .menu-item-name / .menu-price
     Chef special → data-name / data-price / data-img on the button itself
  ══════════════════════════════════════════ */
  function getItemData(btn) {
    /* Chef special — data attributes take priority */
    if (btn.dataset.name) {
      return {
        name:  btn.dataset.name.trim(),
        price: parseFloat(btn.dataset.price) || 0,
        img:   btn.dataset.img || ''
      };
    }

    /* Shop card */
    var shopCard = btn.closest('.product-card');
    if (shopCard) {
      var nameEl  = shopCard.querySelector('.product-name');
      var priceEl = shopCard.querySelector('.product-price');
      var imgEl   = shopCard.querySelector('.product-img img, img');
      return {
        name:  nameEl  ? nameEl.textContent.trim()  : '',
        price: priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) || 0 : 0,
        img:   imgEl   ? (imgEl.getAttribute('src') || '') : ''
      };
    }

    /* Menu card */
    var menuCard = btn.closest('.menu-item-card');
    if (menuCard) {
      var nameEl  = menuCard.querySelector('.menu-item-name');
      var priceEl = menuCard.querySelector('.menu-price');
      var imgEl   = menuCard.querySelector('.menu-item-img img, img');
      return {
        name:  nameEl  ? nameEl.textContent.trim()  : '',
        price: priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) || 0 : 0,
        img:   imgEl   ? (imgEl.getAttribute('src') || '') : ''
      };
    }

    return { name: '', price: 0, img: '' };
  }

  /* ── DOM ready ── */
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

    /* ── ALL add-to-cart buttons (shop + menu + chef special) ── */
    document.querySelectorAll('.btn-add-cart').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();

        var item = getItemData(this);
        if (!item.name) return;          /* safety guard */
        window.StacklyCart.add(item);

        /* Shop-style expand-button flash (✓ in btn-plus) */
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

        setTimeout(openCart, 260);
      });
    });

    /* Checkout button → redirect to order page (delegation so footer visibility doesn't matter) */
    document.addEventListener('click', function (e) {
      if (e.target.closest('.cart-checkout-btn')) {
        window.location.href = '404.html';
      }
    });

    /* Initial render & badge */
    renderCart();
    updateCountBadge();
  });

})();