/* ============================================================
   STACKLY BAKERY — login.js
   Handles login form: role switching, validation, navigation
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // grab elements
  var btnCustomer  = document.getElementById('btn-customer');
  var btnOwner     = document.getElementById('btn-owner');
  var roleSelector = document.getElementById('role-selector');
  var lbtnText     = document.getElementById('lbtn-text');
  var lbtnSubmit   = document.getElementById('lbtn-submit');
  var pwToggle     = document.getElementById('pw-toggle');
  var pwIcon       = document.getElementById('pw-icon');
  var pwField      = document.getElementById('lf-password');
  var loginForm    = document.getElementById('login-form');
  var overlay      = document.getElementById('page-overlay');
  var backLink     = document.getElementById('back-link');

  // active role — start as customer
  var currentRole = 'customer';

  // ── Role switching ──────────────────────────────────────
  function setRole(role) {
    currentRole = role;

    if (role === 'customer') {
      btnCustomer.classList.add('active');
      btnOwner.classList.remove('active');
      roleSelector.classList.remove('owner-active');
      lbtnText.textContent = 'Sign In as Customer';
    } else {
      btnOwner.classList.add('active');
      btnCustomer.classList.remove('active');
      roleSelector.classList.add('owner-active');
      lbtnText.textContent = 'Sign In as Owner';
    }
  }

  if (btnCustomer) {
    btnCustomer.addEventListener('click', function () { setRole('customer'); });
  }

  if (btnOwner) {
    btnOwner.addEventListener('click', function () { setRole('owner'); });
  }

  // ── Password toggle ─────────────────────────────────────
  if (pwToggle && pwField && pwIcon) {
    pwToggle.addEventListener('click', function () {
      var isText = pwField.type === 'text';
      pwField.type = isText ? 'password' : 'text';
      pwIcon.className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  }

  // ── Form submit ─────────────────────────────────────────
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameVal  = document.getElementById('lf-name').value.trim();
      var emailVal = document.getElementById('lf-email').value.trim();
      var passVal  = pwField.value.trim();

      // simple validation
      if (!nameVal || !emailVal || !passVal) {
        shakeForm();
        return;
      }

      // store user info for dashboard to pick up
      sessionStorage.setItem('sb_user_name',  nameVal);
      sessionStorage.setItem('sb_user_email', emailVal);
      sessionStorage.setItem('sb_user_role',  currentRole);

      // show loading state
      lbtnSubmit.classList.add('loading');

      // simulate a tiny auth delay then navigate
      setTimeout(function () {
        var dest = currentRole === 'owner'
          ? 'owner-dashboard.html'
          : 'customer-dashboard.html';

        // use page overlay if available
        if (overlay) {
          overlay.classList.add('active');
          setTimeout(function () { window.location.href = dest; }, 550);
        } else {
          window.location.href = dest;
        }
      }, 900);
    });
  }

  // ── Shake form on bad submit ─────────────────────────────
  function shakeForm() {
    var inner = document.querySelector('.login-form-inner');
    if (!inner) return;
    inner.style.animation = 'none';
    inner.offsetHeight; // reflow
    inner.style.animation = 'formShake 0.4s ease';
  }

  // inject shake keyframe once
  var shakeStyle = document.createElement('style');
  shakeStyle.textContent = [
    '@keyframes formShake {',
    '  0%,100% { transform: translateX(0); }',
    '  20%     { transform: translateX(-8px); }',
    '  40%     { transform: translateX(8px); }',
    '  60%     { transform: translateX(-5px); }',
    '  80%     { transform: translateX(5px); }',
    '}'
  ].join('');
  document.head.appendChild(shakeStyle);

  // ── Back link transition ────────────────────────────────
  if (backLink && overlay) {
    backLink.addEventListener('click', function (e) {
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(function () { window.location.href = backLink.href; }, 550);
    });
  }

  // ── Input label float helpers ────────────────────────────
  // Highlight label when its input is focused
  document.querySelectorAll('.lfield').forEach(function (field) {
    var inp = field.querySelector('input');
    var lbl = field.querySelector('label');
    if (!inp || !lbl) return;

    inp.addEventListener('focus', function () {
      lbl.style.color = 'var(--caramel)';
      lbl.style.opacity = '1';
    });
    inp.addEventListener('blur', function () {
      lbl.style.color = '';
      lbl.style.opacity = '';
    });
  });

});