/* ============================================================
   STACKLY BAKERY — dashboard.js
   Shared logic for customer-dashboard.html and owner-dashboard.html
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ── 1. Read user from session ──────────────────────────
  var userName  = sessionStorage.getItem('sb_user_name')  || 'Guest User';
  var userEmail = sessionStorage.getItem('sb_user_email') || 'guest@stacklybakery.com';
  var userRole  = sessionStorage.getItem('sb_user_role')  || 'customer';

  // helper: first initial(s) for avatar
  function getInitials(name) {
    var parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }

  var initials = getInitials(userName);

  // ── 2. Inject user info into DOM ───────────────────────
  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  setText('dash-user-name',  userName);
  setText('dash-user-email', userEmail);
  setText('dash-avatar',     initials);
  setText('topbar-avatar',   initials);

  // Settings fields pre-fill
  var setNameEl  = document.getElementById('set-name');
  var setEmailEl = document.getElementById('set-email');
  if (setNameEl)  setNameEl.value  = userName;
  if (setEmailEl) setEmailEl.value = userEmail;

  // greeting
  var hour = new Date().getHours();
  var greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  var greeting = greet + ', ' + userName.split(' ')[0] + ' 👋';
  setText('topbar-greeting', greeting);

  // today's date for owner panel
  var todayEl = document.getElementById('today-date');
  if (todayEl) {
    var opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    todayEl.textContent = new Date().toLocaleDateString('en-GB', opts);
  }

  // ── 3. Sidebar navigation ──────────────────────────────
  var navItems = document.querySelectorAll('.dash-nav-item');
  var sections = document.querySelectorAll('.dash-section');

  function switchSection(sectionId) {
    // hide all
    sections.forEach(function (s) { s.classList.remove('active'); });
    navItems.forEach(function (n) { n.classList.remove('active'); });

    // show target
    var target = document.getElementById('section-' + sectionId);
    if (target) {
      target.classList.add('active');
      // trigger reveal animations
      setTimeout(function () {
        target.querySelectorAll('.reveal-up, .dash-stat-card, .dash-card, .promo-banner, .stock-alert-bar').forEach(function (el) {
          el.classList.add('revealed');
        });
      }, 50);
    }

    // mark nav active
    navItems.forEach(function (n) {
      if (n.getAttribute('data-section') === sectionId) {
        n.classList.add('active');
      }
    });
  }

  navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var section = item.getAttribute('data-section');
      if (section) switchSection(section);

      // close sidebar on mobile
      closeSidebar();
    });
  });

  // card "view all" links
  document.querySelectorAll('[data-section-link]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      switchSection(el.getAttribute('data-section-link'));
    });
  });

  // trigger initial section reveals
  setTimeout(function () {
    var activeSection = document.querySelector('.dash-section.active');
    if (activeSection) {
      activeSection.querySelectorAll('.reveal-up, .dash-stat-card, .dash-card, .promo-banner, .stock-alert-bar').forEach(function (el) {
        el.classList.add('revealed');
      });
    }
  }, 200);

  // ── 4. Sidebar toggle (mobile) ─────────────────────────
  var sidebar   = document.getElementById('dash-sidebar');
  var toggleBtn = document.getElementById('sidebar-toggle');

  // create backdrop
  var backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  document.body.appendChild(backdrop);

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
  backdrop.addEventListener('click', closeSidebar);

  // ── 5. Logout ──────────────────────────────────────────
  var logoutBtn = document.getElementById('dash-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      sessionStorage.removeItem('sb_user_name');
      sessionStorage.removeItem('sb_user_email');
      sessionStorage.removeItem('sb_user_role');
      var overlay = document.getElementById('page-overlay');
      if (overlay) {
        overlay.classList.add('active');
        setTimeout(function () { window.location.href = 'login.html'; }, 550);
      } else {
        window.location.href = 'login.html';
      }
    });
  }

  // ── 6. Settings save ──────────────────────────────────
  var settingsSave = document.getElementById('settings-save');
  if (settingsSave) {
    settingsSave.addEventListener('click', function () {
      var newName  = document.getElementById('set-name');
      var newEmail = document.getElementById('set-email');
      if (newName && newName.value.trim()) {
        sessionStorage.setItem('sb_user_name', newName.value.trim());
        setText('dash-user-name', newName.value.trim());
        setText('dash-avatar',    getInitials(newName.value.trim()));
        setText('topbar-avatar',  getInitials(newName.value.trim()));
      }
      if (newEmail && newEmail.value.trim()) {
        sessionStorage.setItem('sb_user_email', newEmail.value.trim());
        setText('dash-user-email', newEmail.value.trim());
      }
      showToast('Changes saved!');
    });
  }

  // ── 7. Toast helper ────────────────────────────────────
  function showToast(msg) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        t.classList.add('show');
      });
    });

    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 350);
    }, 2800);
  }

  // ── 8. Customer: fill orders list ─────────────────────
  var ordersFullList = document.getElementById('orders-full-list');
  if (ordersFullList) {
    var sampleOrders = [
      { img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=80&q=80&fit=crop', name: 'Sourdough Loaf × 2', date: '22 May 2026', status: 'delivered', price: '£9.00' },
      { img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=80&q=80&fit=crop', name: 'Butter Croissants × 6', date: '19 May 2026', status: 'processing', price: '£12.50' },
      { img: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=80&q=80&fit=crop', name: 'Lemon Tart × 1', date: '14 May 2026', status: 'delivered', price: '£5.50' },
      { img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=80&q=80&fit=crop', name: 'Rye Loaf × 1', date: '10 May 2026', status: 'delivered', price: '£4.50' },
      { img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=80&q=80&fit=crop', name: 'Birthday Cake × 1', date: '02 May 2026', status: 'delivered', price: '£32.00' },
      { img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=80&q=80&fit=crop', name: 'Bagels × 4', date: '28 Apr 2026', status: 'cancelled', price: '£8.00' },
    ];

    function renderCustomerOrders(filter) {
      ordersFullList.innerHTML = '';
      var filtered = filter === 'all' ? sampleOrders : sampleOrders.filter(function (o) { return o.status === filter; });
      if (filtered.length === 0) {
        ordersFullList.innerHTML = '<p style="font-family:var(--font-body);color:var(--caramel-d);opacity:.6;padding:1rem 0;">No orders found.</p>';
        return;
      }
      filtered.forEach(function (o) {
        var card = document.createElement('div');
        card.className = 'order-card-full';
        card.innerHTML = [
          '<div class="ocf-img"><img src="' + o.img + '" alt="' + o.name + '" loading="lazy"></div>',
          '<div class="ocf-info">',
          '  <div class="ocf-name">' + o.name + '</div>',
          '  <div class="ocf-meta">' + o.date + '</div>',
          '</div>',
          '<div class="ocf-right">',
          '  <span class="order-status ' + o.status + '">' + o.status.charAt(0).toUpperCase() + o.status.slice(1) + '</span>',
          '  <span class="ocf-price">' + o.price + '</span>',
          '</div>'
        ].join('');
        ordersFullList.appendChild(card);
      });
    }

    renderCustomerOrders('all');

    // filter buttons
    var filterBtns = document.querySelectorAll('#section-orders .ofbtn');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderCustomerOrders(btn.getAttribute('data-filter'));
      });
    });
  }

  // ── 9. Customer: favourites ────────────────────────────
  var favGrid = document.getElementById('fav-grid');
  if (favGrid) {
    var favItems = [
      { img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80&fit=crop', name: 'Sourdough Loaf',    price: '£4.50' },
      { img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80&fit=crop', name: 'Butter Croissant', price: '£2.10' },
      { img: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=400&q=80&fit=crop', name: 'Lemon Tart',    price: '£5.50' },
      { img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80&fit=crop', name: 'Rye Loaf',      price: '£4.00' },
      { img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80&fit=crop', name: 'Custom Cake',   price: '£28.00' },
      { img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&q=80&fit=crop', name: 'Almond Danish', price: '£2.80' },
      { img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80&fit=crop', name: 'Sesame Bagel',  price: '£1.80' },
    ];

    favItems.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'fav-card';
      card.innerHTML = [
        '<div class="fav-img"><img src="' + item.img + '" alt="' + item.name + '" loading="lazy"></div>',
        '<div class="fav-body">',
        '  <div class="fav-name">' + item.name + '</div>',
        '  <div class="fav-price">' + item.price + '</div>',
        '  <button class="fav-remove">Remove ♥</button>',
        '</div>'
      ].join('');

      card.querySelector('.fav-remove').addEventListener('click', function () {
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.92)';
        setTimeout(function () { card.remove(); }, 320);
        showToast('Removed from favourites');
      });

      favGrid.appendChild(card);
    });
  }

  // ── 10. Address edit/remove ─────────────────────────────
  document.querySelectorAll('.edit-addr').forEach(function (btn) {
    btn.addEventListener('click', function () { showToast('Address editing coming soon!'); });
  });

  document.querySelectorAll('.del-addr').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.address-card');
      if (card) {
        card.style.transition = 'opacity 0.3s';
        card.style.opacity = '0';
        setTimeout(function () { card.remove(); showToast('Address removed'); }, 300);
      }
    });
  });

  var addAddrBtn = document.getElementById('add-address-btn');
  if (addAddrBtn) {
    addAddrBtn.addEventListener('click', function () { showToast('Add address form coming soon!'); });
  }

  // ── 11. Owner: pending order accept/decline ─────────────
  document.querySelectorAll('.ooa-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row = btn.closest('.order-row');
      if (btn.classList.contains('accept')) {
        showToast('Order accepted ✓');
      } else {
        showToast('Order declined');
      }
      if (row) {
        row.style.transition = 'opacity 0.3s, transform 0.3s';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(function () { row.remove(); }, 320);
      }
    });
  });

  // ── 12. Owner: all orders list ─────────────────────────
  var ownerOrdersList = document.getElementById('owner-orders-list');
  if (ownerOrdersList) {
    var ownerOrders = [
      { img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=80&q=80&fit=crop', name: '#ORD-1042 — Sourdough × 3', date: 'James T. · 22 May', status: 'pending',    price: '£13.50' },
      { img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=80&q=80&fit=crop', name: '#ORD-1043 — Croissants × 12', date: 'Priya K. · 22 May', status: 'pending', price: '£25.20' },
      { img: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=80&q=80&fit=crop', name: '#ORD-1044 — Lemon Tart × 2', date: 'Sophie M. · 22 May', status: 'pending', price: '£11.00' },
      { img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&q=80&fit=crop', name: '#ORD-1038 — Rye Loaf × 1', date: 'Ahmed R. · 21 May', status: 'processing', price: '£4.50' },
      { img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=80&q=80&fit=crop', name: '#ORD-1035 — Birthday Cake', date: 'Laura B. · 20 May', status: 'delivered', price: '£32.00' },
      { img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=80&q=80&fit=crop', name: '#ORD-1034 — Bagel × 6', date: 'Tom C. · 20 May', status: 'delivered', price: '£10.80' },
      { img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=80&q=80&fit=crop', name: '#ORD-1030 — Almond Tart × 1', date: 'Nina P. · 18 May', status: 'cancelled', price: '£6.00' },
    ];

    function renderOwnerOrders(filter) {
      ownerOrdersList.innerHTML = '';
      var filtered = filter === 'all' ? ownerOrders : ownerOrders.filter(function (o) { return o.status === filter; });
      if (filtered.length === 0) {
        ownerOrdersList.innerHTML = '<p style="font-family:var(--font-body);color:var(--caramel-d);opacity:.6;padding:1rem 0;">No orders found.</p>';
        return;
      }
      filtered.forEach(function (o) {
        var card = document.createElement('div');
        card.className = 'order-card-full';
        card.innerHTML = [
          '<div class="ocf-img"><img src="' + o.img + '" alt="" loading="lazy"></div>',
          '<div class="ocf-info">',
          '  <div class="ocf-name">' + o.name + '</div>',
          '  <div class="ocf-meta">' + o.date + '</div>',
          '</div>',
          '<div class="ocf-right">',
          '  <span class="order-status ' + o.status + '">' + o.status.charAt(0).toUpperCase() + o.status.slice(1) + '</span>',
          '  <span class="ocf-price">' + o.price + '</span>',
          '</div>'
        ].join('');
        ownerOrdersList.appendChild(card);
      });
    }

    renderOwnerOrders('all');

    var ownerFilterBtns = document.querySelectorAll('#section-orders .ofbtn');
    ownerFilterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        ownerFilterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderOwnerOrders(btn.getAttribute('data-filter'));
      });
    });
  }

  // ── 13. Owner: mini revenue chart ──────────────────────
  var miniChart = document.getElementById('mini-chart');
  if (miniChart) {
    var weekData = [820, 950, 1100, 880, 1020, 1400, 1284];
    var maxVal   = Math.max.apply(null, weekData);

    weekData.forEach(function (val, i) {
      var bar = document.createElement('div');
      bar.className = 'mini-chart-bar' + (i === 6 ? ' today' : '');
      bar.style.height = Math.round((val / maxVal) * 90) + 'px';
      bar.title = '£' + val;
      miniChart.appendChild(bar);
    });
  }

  // ── 14. Owner: products grid ────────────────────────────
  var productsGrid = document.getElementById('products-grid');
  if (productsGrid) {
    var products = [
      { img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80&fit=crop', name: 'Sourdough Loaf',   cat: 'Breads',    price: '£4.50', stock: 18 },
      { img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80&fit=crop', name: 'Butter Croissant', cat: 'Pastries',  price: '£2.10', stock: 42 },
      { img: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=400&q=80&fit=crop', name: 'Lemon Tart',   cat: 'Cakes & Tarts', price: '£5.50', stock: 9 },
      { img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80&fit=crop', name: 'Rye Loaf',     cat: 'Breads',    price: '£4.00', stock: 6 },
      { img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80&fit=crop', name: 'Custom Cake',  cat: 'Cakes & Tarts', price: '£28.00', stock: 3 },
      { img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&q=80&fit=crop', name: 'Almond Danish', cat: 'Pastries', price: '£2.80', stock: 24 },
      { img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80&fit=crop', name: 'Sesame Bagel', cat: 'Breads',    price: '£1.80', stock: 30 },
      { img: 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=400&q=80&fit=crop', name: 'Mixed Gift Hamper', cat: 'Gift Hampers', price: '£45.00', stock: 5 },
    ];

    function renderProducts() {
      productsGrid.innerHTML = '';
      products.forEach(function (p, idx) {
        var card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = [
          '<div class="product-card-img"><img src="' + p.img + '" alt="' + p.name + '" loading="lazy"></div>',
          '<div class="product-card-body">',
          '  <div class="product-card-cat">' + p.cat + '</div>',
          '  <div class="product-card-name">' + p.name + '</div>',
          '  <div class="product-card-row">',
          '    <span class="product-card-price">' + p.price + '</span>',
          '    <span class="product-card-stock">' + p.stock + ' in stock</span>',
          '  </div>',
          '  <div class="product-card-actions">',
          '    <button class="pc-btn edit-pc">Edit</button>',
          '    <button class="pc-btn del-pc">Remove</button>',
          '  </div>',
          '</div>'
        ].join('');

        card.querySelector('.edit-pc').addEventListener('click', function () {
          showToast('Edit mode for ' + p.name + ' coming soon!');
        });

        card.querySelector('.del-pc').addEventListener('click', function () {
          card.style.transition = 'opacity 0.3s, transform 0.3s';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.92)';
          setTimeout(function () {
            card.remove();
            showToast(p.name + ' removed');
          }, 300);
        });

        productsGrid.appendChild(card);
      });
    }

    renderProducts();

    // add product modal
    var addBtn     = document.getElementById('add-product-btn');
    var modalOver  = document.getElementById('modal-overlay');
    var modalClose = document.getElementById('modal-close');
    var modalSave  = document.getElementById('modal-save');

    if (addBtn && modalOver) {
      addBtn.addEventListener('click', function () { modalOver.classList.add('open'); });
    }
    if (modalClose && modalOver) {
      modalClose.addEventListener('click', function () { modalOver.classList.remove('open'); });
    }
    if (modalOver) {
      modalOver.addEventListener('click', function (e) {
        if (e.target === modalOver) modalOver.classList.remove('open');
      });
    }

    if (modalSave) {
      modalSave.addEventListener('click', function () {
        var pName  = document.getElementById('prod-name').value.trim();
        var pCat   = document.getElementById('prod-cat').value;
        var pPrice = document.getElementById('prod-price').value.trim();
        var pStock = document.getElementById('prod-stock').value.trim();

        if (!pName || !pPrice) {
          showToast('Please fill in name and price');
          return;
        }

        // add to array and re-render
        products.push({
          img:   'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80&fit=crop',
          name:  pName,
          cat:   pCat,
          price: '£' + parseFloat(pPrice).toFixed(2),
          stock: parseInt(pStock) || 0
        });

        renderProducts();
        modalOver.classList.remove('open');
        showToast(pName + ' added!');

        // clear fields
        document.getElementById('prod-name').value  = '';
        document.getElementById('prod-price').value = '';
        document.getElementById('prod-stock').value = '';
      });
    }
  }

  // ── 15. Owner: customers table ──────────────────────────
  var customersTbody = document.getElementById('customers-tbody');
  if (customersTbody) {
    var customersData = [
      { name: 'James Thompson',  email: 'james.t@email.com',  orders: 8,  spent: '£112.50', joined: 'Jan 2025', status: 'active' },
      { name: 'Priya Kapoor',    email: 'priya.k@email.com',  orders: 14, spent: '£218.30', joined: 'Mar 2024', status: 'active' },
      { name: 'Sophie Marceau',  email: 'sophie.m@email.com', orders: 5,  spent: '£76.00',  joined: 'Aug 2025', status: 'active' },
      { name: 'Ahmed Rahman',    email: 'ahmed.r@email.com',  orders: 22, spent: '£341.80', joined: 'Jun 2023', status: 'active' },
      { name: 'Laura Brown',     email: 'laura.b@email.com',  orders: 3,  spent: '£42.00',  joined: 'Feb 2026', status: 'new' },
      { name: 'Tom Collins',     email: 'tom.c@email.com',    orders: 1,  spent: '£10.80',  joined: 'Apr 2026', status: 'new' },
      { name: 'Nina Patel',      email: 'nina.p@email.com',   orders: 0,  spent: '£0.00',   joined: 'May 2026', status: 'inactive' },
    ];

    customersData.forEach(function (c) {
      var badgeStyle = c.status === 'active'
        ? 'background:rgba(122,140,110,.15);color:#4e7a44'
        : c.status === 'new'
        ? 'background:rgba(200,135,74,.12);color:var(--caramel-d)'
        : 'background:rgba(59,32,18,.07);color:#888';

      var tr = document.createElement('tr');
      tr.innerHTML = [
        '<td><strong>' + c.name + '</strong></td>',
        '<td style="opacity:.7">' + c.email + '</td>',
        '<td>' + c.orders + '</td>',
        '<td style="font-family:var(--font-display)">' + c.spent + '</td>',
        '<td style="opacity:.6">' + c.joined + '</td>',
        '<td><span style="' + badgeStyle + ';font-size:.65rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;padding:.18rem .55rem;border-radius:100px">' + c.status + '</span></td>'
      ].join('');
      customersTbody.appendChild(tr);
    });
  }

  // ── 16. Owner: analytics ───────────────────────────────
  var topList = document.getElementById('top-products-list');
  if (topList) {
    var topProds = [
      { name: 'Sourdough Loaf',   num: 284, pct: 100 },
      { name: 'Butter Croissant', num: 241, pct: 85 },
      { name: 'Lemon Tart',       num: 178, pct: 63 },
      { name: 'Rye Loaf',         num: 143, pct: 50 },
      { name: 'Almond Danish',    num: 112, pct: 39 },
    ];
    topProds.forEach(function (p, i) {
      var row = document.createElement('div');
      row.className = 'tp-row';
      row.innerHTML = [
        '<div class="tp-rank">' + (i + 1) + '</div>',
        '<div class="tp-info">',
        '  <div class="tp-name">' + p.name + '</div>',
        '  <div class="tp-bar-wrap"><div class="tp-bar" style="width:' + p.pct + '%"></div></div>',
        '</div>',
        '<div class="tp-num">' + p.num + '</div>'
      ].join('');
      topList.appendChild(row);
    });
  }

  var revBreakdown = document.getElementById('revenue-breakdown');
  if (revBreakdown) {
    var cats = [
      { label: 'Breads',       pct: 42, color: 'var(--caramel)' },
      { label: 'Pastries',     pct: 28, color: 'var(--gold)' },
      { label: 'Cakes & Tarts', pct: 18, color: 'var(--rose)' },
      { label: 'Gift Hampers', pct: 8,  color: 'var(--sage)' },
      { label: 'Seasonal',     pct: 4,  color: 'var(--caramel-l)' },
    ];
    cats.forEach(function (c) {
      var row = document.createElement('div');
      row.className = 'rb-row';
      row.innerHTML = [
        '<div class="rb-color" style="background:' + c.color + '"></div>',
        '<div class="rb-label">' + c.label + '</div>',
        '<div class="rb-bar-wrap"><div class="rb-bar" style="width:' + c.pct + '%;background:' + c.color + '"></div></div>',
        '<div class="rb-pct">' + c.pct + '%</div>'
      ].join('');
      revBreakdown.appendChild(row);
    });
  }

  var bigChart = document.getElementById('big-chart');
  var bigLegend = document.getElementById('big-chart-legend');
  if (bigChart) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var monthData = [3200, 4100, 4800, 5200, 6100, 5700, 6400, 7200, 6800, 7500, 8100, 7800];
    var maxM = Math.max.apply(null, monthData);

    monthData.forEach(function (val, i) {
      var bar = document.createElement('div');
      bar.className = 'big-chart-bar' + (i === 4 ? ' highlight' : '');
      bar.style.height = Math.round((val / maxM) * 140) + 'px';
      bar.title = months[i] + ': £' + val;
      bigChart.appendChild(bar);
    });

    if (bigLegend) {
      months.forEach(function (m) {
        var span = document.createElement('span');
        span.textContent = m;
        bigLegend.appendChild(span);
      });
    }
  }

  // ── 17. Notification bell ──────────────────────────────
  var notifBtn = document.getElementById('notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', function () {
      var msg = userRole === 'owner'
        ? '5 new orders are waiting for review'
        : 'Your Croissant order is being processed!';
      showToast('🔔 ' + msg);
    });
  }

});