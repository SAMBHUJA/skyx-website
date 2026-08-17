/* ============================================================
   SKYX ENERGY — Main JavaScript
   ============================================================ */

/* ---- NAVBAR: scroll shrink + mobile toggle ---- */
const navbar  = document.getElementById('navbar');
const toggle  = document.getElementById('navToggle');
const navMenu = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

toggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  toggle.classList.toggle('active');
});

// Close menu when a link is clicked
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    toggle.classList.remove('active');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    navMenu.classList.remove('open');
    toggle.classList.remove('active');
  }
});

/* ---- COUNTER ANIMATION (hero stats) ---- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (target === 0) { el.textContent = '0'; return; }
  const duration = 1800;
  const step = 16;
  const increment = target / (duration / step);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current);
  }, step);
}

// Trigger counters when hero stats enter viewport
const statNums = document.querySelectorAll('.stat-num');
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      statNums.forEach(animateCounter);
      heroObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

/* ---- SCROLL REVEAL (why-cards) ---- */
const revealCards = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger each card
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, Array.from(revealCards).indexOf(entry.target) * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealCards.forEach(card => revealObserver.observe(card));

/* ---- SMOOTH ACTIVE NAV LINK ---- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle(
          'active-link',
          link.getAttribute('href') === '#' + entry.target.id
        );
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(sec => sectionObserver.observe(sec));

/* ---- SAVINGS CALCULATOR ---- */
document.getElementById('calcBtn').addEventListener('click', calculateSavings);

// Also run on Enter in any input field
document.querySelectorAll('.calc-field input, .calc-field select').forEach(el => {
  el.addEventListener('keydown', e => { if (e.key === 'Enter') calculateSavings(); });
});

function calculateSavings() {
  const bill    = parseFloat(document.getElementById('monthlyBill').value);
  const load    = parseFloat(document.getElementById('connectedLoad').value);
  const zone    = document.getElementById('location').value;
  const resultsEl = document.getElementById('calcResults');

  if (!bill || !load || !zone) {
    showCalcError(resultsEl, 'Please fill in all three fields to get your estimate.');
    return;
  }

  // Zone-based peak sun hours
  const sunHours = { high: 5.5, medium: 5.0, standard: 4.5 };
  const peakSun  = sunHours[zone];

  // Estimate solar capacity (kWp)
  // Rule of thumb: offset 80 % of load, PR = 0.78
  const solarCapacity = (load * 0.80) / (peakSun * 0.78);

  // Monthly generation (kWh)
  const monthlyGen = solarCapacity * peakSun * 30 * 0.78;

  // Assumed current tariff (₹/kWh) based on bill & load
  const hoursPerDay    = 10;
  const monthlyUnits   = load * hoursPerDay * 30;
  const currentTariff  = bill / monthlyUnits;

  // SKYX tariff = 60 % of current grid tariff
  const skyxTariff      = currentTariff * 0.60;
  const costPerMonthGrid = monthlyGen * currentTariff;
  const costPerMonthSKYX = monthlyGen * skyxTariff;
  const monthlySaving    = costPerMonthGrid - costPerMonthSKYX;
  const annualSaving     = monthlySaving * 12;

  // Carbon offset: 0.82 kg CO₂ per kWh (India grid average)
  const annualGen    = monthlyGen * 12;
  const carbonOffset = (annualGen * 0.82) / 1000; // tonnes

  // Render
  resultsEl.innerHTML = `
    <div class="calc-output">
      <div class="calc-metric">
        <div class="cm-value">${solarCapacity.toFixed(1)} kWp</div>
        <div class="cm-label">Recommended Solar Capacity</div>
      </div>
      <div class="calc-metric">
        <div class="cm-value">₹${formatNum(Math.round(monthlySaving))}</div>
        <div class="cm-label">Estimated Monthly Savings</div>
      </div>
      <div class="calc-metric">
        <div class="cm-value">₹${formatNum(Math.round(annualSaving))}</div>
        <div class="cm-label">Estimated Annual Savings</div>
      </div>
      <div class="calc-metric">
        <div class="cm-value">${carbonOffset.toFixed(1)} T</div>
        <div class="cm-label">Annual CO₂ Offset</div>
      </div>
    </div>
    <p class="calc-note">* Estimates based on typical rooftop solar performance and average Indian grid tariffs. Actual savings may vary.</p>
    <div class="calc-cta-wrap">
      <a href="#contact" class="btn-primary">Get My Detailed Savings Report →</a>
    </div>
  `;
}

function showCalcError(container, msg) {
  container.innerHTML = `
    <div class="calc-placeholder">
      <div class="calc-sun">⚠️</div>
      <p style="color:#F5AE1D">${msg}</p>
    </div>`;
}

function formatNum(n) {
  return n.toLocaleString('en-IN');
}

/* ---- CONTACT FORM ---- */
function handleSubmit(e) {
  e.preventDefault();
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  // Basic validation
  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    if (!field.value.trim()) { field.style.borderColor = '#FF6B6B'; valid = false; }
    else                      { field.style.borderColor = ''; }
  });
  if (!valid) return;

  // Simulate submission (replace with your backend / Formspree / EmailJS endpoint)
  const btn = form.querySelector('.form-submit');
  btn.textContent = 'Sending…';
  btn.disabled    = true;

  setTimeout(() => {
    form.style.display    = 'none';
    success.style.display = 'block';
  }, 1200);
}

/* ---- MOBILE NAV HAMBURGER ANIMATION ---- */
const styleEl = document.createElement('style');
styleEl.textContent = `
  .nav-toggle.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .nav-toggle.active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .nav-toggle.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  .nav-links a.active-link { color: #D98900 !important; }
`;
document.head.appendChild(styleEl);
