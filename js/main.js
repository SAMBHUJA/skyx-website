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

/* ============================================================
   SKYX ENERGY — ADVANCED SOLAR SAVINGS CALCULATOR
   ============================================================ */

const calcBtn = document.getElementById('calcBtn');

if (calcBtn) {
  calcBtn.addEventListener('click', calculateSavings);
}


/*
 * Approximate peak-sun-hours by state.
 *
 * These are planning assumptions, not official DISCOM values.
 * Final project design should use actual site-specific
 * solar resource and engineering calculations.
 */
const stateSolarData = {

  telangana: {
    sunHours: 5.2
  },

  'andhra-pradesh': {
    sunHours: 5.2
  },

  maharashtra: {
    sunHours: 5.1
  },

  gujarat: {
    sunHours: 5.5
  },

  rajasthan: {
    sunHours: 5.7
  },

  karnataka: {
    sunHours: 5.0
  },

  'tamil-nadu': {
    sunHours: 5.1
  },

  'madhya-pradesh': {
    sunHours: 5.2
  },

  delhi: {
    sunHours: 4.8
  },

  'uttar-pradesh': {
    sunHours: 4.8
  },

  punjab: {
    sunHours: 4.7
  },

  haryana: {
    sunHours: 4.8
  },

  'west-bengal': {
    sunHours: 4.5
  },

  other: {
    sunHours: 4.8
  }

};


/*
 * Planning assumptions.
 *
 * These should eventually be replaced/configured using
 * SKYX's actual project economics and tariff assumptions.
 */
const calculatorAssumptions = {

  performanceRatio: 0.78,

  /*
   * Approximate annual degradation.
   */
  annualDegradation: 0.005,

  /*
   * Approximate installation cost per kW.
   * Used ONLY for preliminary payback estimation.
   */
  capexPerKW: 55000,

  /*
   * Approximate CO2 factor.
   */
  co2KgPerKWh: 0.70,

  /*
   * Approximate usable roof area requirement.
   */
  roofAreaPerKW: {
    RCC: 90,
    Metal: 85,
    Ground: 100
  },

  /*
   * Indicative tariff assumptions.
   *
   * These are not official tariffs.
   * Actual customer tariff should be used whenever
   * monthly units are available.
   */
  tariff: {
    LT: 10.0,
    HT: 9.0
  }

};


function calculateSavings() {

  const bill = parseFloat(
    document.getElementById('monthlyBill').value
  ) || 0;

  const units = parseFloat(
    document.getElementById('monthlyUnits').value
  ) || 0;

  const state = document.getElementById('state').value;

  const connection = document.getElementById('connectionType').value;

  const roofType = document.getElementById('roofType').value;

  const roofArea = parseFloat(
    document.getElementById('roofArea').value
  ) || 0;

  const resultsEl = document.getElementById('calcResults');


  /* ----------------------------------------------------------
     VALIDATION
     ---------------------------------------------------------- */

  if (!bill && !units) {

    showCalcError(
      resultsEl,
      'Please enter either your monthly electricity bill or monthly units consumed.'
    );

    return;
  }

  if (!state) {

    showCalcError(
      resultsEl,
      'Please select your state.'
    );

    return;
  }

  if (!connection) {

    showCalcError(
      resultsEl,
      'Please select your electricity connection type.'
    );

    return;
  }

  if (!roofType) {

    showCalcError(
      resultsEl,
      'Please select your roof type.'
    );

    return;
  }


  /* ----------------------------------------------------------
     SOLAR RESOURCE
     ---------------------------------------------------------- */

  const sunHours =
    stateSolarData[state]?.sunHours || 4.8;


  /* ----------------------------------------------------------
     ELECTRICITY CONSUMPTION
     ---------------------------------------------------------- */

  let monthlyConsumption = units;

  /*
   * If customer didn't enter units,
   * estimate them from bill and an indicative tariff.
   */
  if (!monthlyConsumption && bill) {

    const assumedTariff =
      calculatorAssumptions.tariff[connection];

    monthlyConsumption =
      bill / assumedTariff;

  }


  /*
   * Estimate current effective tariff if both
   * bill and units are provided.
   */
  let effectiveTariff;

  if (bill && units) {

    effectiveTariff =
      bill / units;

  } else {

    effectiveTariff =
      calculatorAssumptions.tariff[connection];

  }


  /* ----------------------------------------------------------
     SOLAR CAPACITY
     ---------------------------------------------------------- */

  /*
   * Monthly generation from 1 kW:
   *
   * kW × peak sun hours × 30 × performance ratio
   */

  const generationPerKW =
    sunHours *
    30 *
    calculatorAssumptions.performanceRatio;


  /*
   * Annual energy consumption.
   */

  const annualConsumption =
    monthlyConsumption * 12;


  /*
   * Recommended solar generation target:
   * approximately 80% of annual consumption.
   */

  const targetAnnualSolarGeneration =
    annualConsumption * 0.80;


  /*
   * Capacity based on annual energy requirement.
   */

  let recommendedCapacity =
    targetAnnualSolarGeneration /
    (sunHours *
      365 *
      calculatorAssumptions.performanceRatio);


  /* ----------------------------------------------------------
     ROOF AREA LIMIT
     ---------------------------------------------------------- */

  let roofLimited = false;

  if (roofArea > 0) {

    const maxRoofCapacity =
      roofArea /
      calculatorAssumptions.roofAreaPerKW[roofType];

    if (recommendedCapacity > maxRoofCapacity) {

      recommendedCapacity = maxRoofCapacity;

      roofLimited = true;

    }

  }


  /*
   * Round capacity to practical increments.
   */

  recommendedCapacity =
    Math.max(
      1,
      Math.round(recommendedCapacity * 2) / 2
    );


  /* ----------------------------------------------------------
     GENERATION
     ---------------------------------------------------------- */

  const monthlyGeneration =
    recommendedCapacity *
    generationPerKW;


  const annualGeneration =
    monthlyGeneration * 12;


  /* ----------------------------------------------------------
     SAVINGS
     ---------------------------------------------------------- */

  /*
   * Preliminary annual electricity value.
   */

  const annualEnergyValue =
    annualGeneration *
    effectiveTariff;


  const monthlySavings =
    annualEnergyValue / 12;


  const annualSavings =
    annualEnergyValue;


  /* ----------------------------------------------------------
     SYSTEM COST / PAYBACK
     ---------------------------------------------------------- */

  const estimatedSystemCost =
    recommendedCapacity *
    calculatorAssumptions.capexPerKW;


  const paybackYears =
    annualSavings > 0
      ? estimatedSystemCost / annualSavings
      : 0;


  /* ----------------------------------------------------------
     CO2
     ---------------------------------------------------------- */

  const annualCO2 =
    (annualGeneration *
      calculatorAssumptions.co2KgPerKWh) / 1000;


  /* ----------------------------------------------------------
     25 YEAR SAVINGS
     ---------------------------------------------------------- */

  let twentyFiveYearGeneration = 0;

  let yearlyGeneration =
    annualGeneration;


  for (let year = 1; year <= 25; year++) {

    twentyFiveYearGeneration +=
      yearlyGeneration;

    yearlyGeneration *=
      (1 - calculatorAssumptions.annualDegradation);

  }


  const twentyFiveYearSavings =
    twentyFiveYearGeneration *
    effectiveTariff;


  /* ----------------------------------------------------------
     PAYBACK RANGE
     ---------------------------------------------------------- */

  const paybackMin =
    Math.max(1, paybackYears * 0.90);

  const paybackMax =
    paybackYears * 1.15;


  /* ----------------------------------------------------------
     RENDER RESULTS
     ---------------------------------------------------------- */

  resultsEl.innerHTML = `

    <div class="calc-result-header">

      <span class="section-eyebrow">
        Your Solar Recommendation
      </span>

      <h3>
        Based on the information you provided
      </h3>

    </div>


    <div class="calc-output">


      <!-- CAPACITY -->

      <div class="calc-metric">

        <div class="cm-icon">☀️</div>

        <div class="cm-value">
          ${recommendedCapacity.toFixed(1)} kW
        </div>

        <div class="cm-label">
          Recommended Solar Capacity
        </div>

      </div>


      <!-- GENERATION -->

      <div class="calc-metric">

        <div class="cm-icon">⚡</div>

        <div class="cm-value">
          ${formatNum(Math.round(monthlyGeneration))}
        </div>

        <div class="cm-label">
          Estimated Monthly Generation (kWh)
        </div>

      </div>


      <!-- MONTHLY SAVINGS -->

      <div class="calc-metric">

        <div class="cm-icon">💰</div>

        <div class="cm-value">
          ₹${formatNum(Math.round(monthlySavings))}
        </div>

        <div class="cm-label">
          Estimated Monthly Savings
        </div>

      </div>


      <!-- ANNUAL SAVINGS -->

      <div class="calc-metric">

        <div class="cm-icon">💰</div>

        <div class="cm-value">
          ₹${formatIndianAmount(annualSavings)}
        </div>

        <div class="cm-label">
          Estimated Annual Savings
        </div>

      </div>


      <!-- PAYBACK -->

      <div class="calc-metric">

        <div class="cm-icon">📉</div>

        <div class="cm-value">
          ${paybackMin.toFixed(1)}–${paybackMax.toFixed(1)} yrs
        </div>

        <div class="cm-label">
          Estimated Payback
        </div>

      </div>


      <!-- CO2 -->

      <div class="calc-metric">

        <div class="cm-icon">🌱</div>

        <div class="cm-value">
          ${annualCO2.toFixed(1)} T
        </div>

        <div class="cm-label">
          Estimated CO₂ Reduction / Year
        </div>

      </div>


      <!-- 25 YEAR -->

      <div class="calc-metric calc-metric-wide">

        <div class="cm-icon">🔋</div>

        <div class="cm-value">
          ₹${formatIndianAmount(twentyFiveYearSavings)}
        </div>

        <div class="cm-label">
          Estimated 25-Year Energy Savings
        </div>

      </div>

    </div>


    <div class="calc-details">

      <div>
        <strong>Monthly consumption:</strong>
        ${formatNum(Math.round(monthlyConsumption))} kWh
      </div>

      <div>
        <strong>Solar resource assumption:</strong>
        ${sunHours.toFixed(1)} peak sun hours/day
      </div>

      <div>
        <strong>Connection:</strong>
        ${connection}
      </div>

      <div>
        <strong>Roof:</strong>
        ${roofType === 'RCC'
          ? 'RCC'
          : roofType === 'Metal'
            ? 'Metal'
            : 'Ground Mount'}
      </div>

      ${
        roofLimited
          ? `
            <div class="calc-roof-warning">
              ⚠️ Your available roof area may limit the recommended
              system size.
            </div>
          `
          : ''
      }

    </div>


    <p class="calc-note">

      * This is a preliminary estimate based on the information
      provided and planning assumptions. Actual generation,
      savings, project cost and payback may vary based on site
      conditions, shading, orientation, electricity tariff,
      regulations, financing structure and final engineering design.

    </p>


    <div class="calc-cta-wrap">

      <a
        href="#contact"
        class="btn-primary"
      >
        Get My Detailed Savings Report →
      </a>

    </div>

  `;

}


/* ------------------------------------------------------------
   CALCULATOR ERROR
   ------------------------------------------------------------ */

function showCalcError(container, msg) {

  container.innerHTML = `

    <div class="calc-placeholder">

      <div class="calc-sun">
        ⚠️
      </div>

      <h3>
        Almost there
      </h3>

      <p style="color:#F5AE1D">
        ${msg}
      </p>

    </div>

  `;

}


/* ------------------------------------------------------------
   NUMBER FORMATTING
   ------------------------------------------------------------ */

function formatNum(n) {

  return Math.round(n)
    .toLocaleString('en-IN');

}


function formatIndianAmount(amount) {

  amount = Math.round(amount);

  if (amount >= 10000000) {

    return (
      (amount / 10000000)
        .toFixed(2)
    ) + ' crore';

  }

  if (amount >= 100000) {

    return (
      (amount / 100000)
        .toFixed(2)
    ) + ' lakh';

  }

  return formatNum(amount);

}

/* ---- CONTACT FORM ---- */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const errorBox = document.getElementById('formError');
  const btn = form.querySelector('.form-submit');

  if (errorBox) {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
  }

  const requiredFields = form.querySelectorAll('[required]');
  let valid = true;

  requiredFields.forEach(field => {
    const value = field.value.trim();

    if (!value) {
      field.style.borderColor = '#FF6B6B';
      valid = false;
    } else {
      field.style.borderColor = '';
    }
  });

  if (!valid) {
    const firstInvalid = form.querySelector(':invalid');

    if (firstInvalid) {
      firstInvalid.focus();
    }

    return;
  }

  const originalText = btn.textContent;

  btn.disabled = true;
  btn.textContent = 'Sending…';
  btn.style.opacity = '0.7';
  btn.style.cursor = 'not-allowed';

  try {
    const formData = new FormData(form);

    const response = await fetch(
      'https://formsubmit.co/ajax/kapilreddyt@gmail.com',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      }
    );

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.message || 'Unable to submit the form.'
      );
    }

    form.style.display = 'none';

    if (success) {
      success.style.display = 'block';

      setTimeout(() => {
        success.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }

  } catch (error) {
    console.error('SKYX contact form error:', error);

    if (errorBox) {
      errorBox.textContent =
        'Sorry, we could not send your request. Please try again or contact us directly.';
      errorBox.style.display = 'block';
    }

    btn.disabled = false;
    btn.textContent = originalText;
    btn.style.opacity = '';
    btn.style.cursor = '';
  }
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
