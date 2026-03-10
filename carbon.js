/**
 * Commute Carbon Footprint Calculator
 * Emission factors based on EPA and industry averages (kg CO2 per mile)
 */

const EMISSIONS = {
  // Bus: per-passenger baselines (kg CO2 per mile at 100% full), scaled by occupancy.
  // Electric bus assumed ~80% lower direct emissions than conventional diesel.
  bus: {
    gasoline: (occupancyPercent) => {
      const occupancy = occupancyPercent / 100;
      const baseline = 0.12;
      return baseline / occupancy; // Fuller bus = lower per-passenger emissions
    },
    electric: (occupancyPercent) => {
      const occupancy = occupancyPercent / 100;
      const baseline = 0.02;
      return baseline / occupancy;
    },
  },
  self: 0, // Walking and biking produce negligible direct emissions
  car: {
    sedan: 0.41,
    suv: 0.49,
    truck: 0.51,
    hybrid: 0.22,
  },
};

const RATINGS = {
  low: {
    label: 'Very Low',
    class: 'low',
    desc: 'Your commute has minimal impact. Keep it up!',
    maxKgCO2: 2,
    airQuality: {
      headline: 'Your commute contributes little to local air pollution.',
      details: [
        'Minimal nitrogen oxides (NOₓ) and particulate matter (PM2.5)—the main tailpipe pollutants that worsen smog and respiratory health.',
        'You\'re not adding meaningfully to roadside air quality degradation that affects cyclists, pedestrians, and people living near busy roads.',
        'On hot, sunny days when ozone forms, your choice helps keep ground-level ozone lower in your area.',
      ],
    },
  },
  moderate: {
    label: 'Moderate',
    class: 'moderate',
    desc: 'Your commute has some air quality impact.',
    maxKgCO2: 10,
    airQuality: {
      headline: 'Your commute contributes to local air pollution—especially along your route and at peak times.',
      details: [
        'You add nitrogen oxides (NOₓ) that help form ground-level ozone (smog) on hot days, which can trigger asthma and reduce lung function.',
        'Tailpipe emissions include fine particles (PM2.5) that penetrate deep into the lungs; busier routes concentrate these pollutants.',
        'Idling at lights and in congestion increases exposure for nearby pedestrians, cyclists, and residents—particularly vulnerable groups like children and older adults.',
      ],
    },
  },
  high: {
    label: 'High',
    class: 'high',
    desc: 'Your commute has a notable impact on local air quality.',
    maxKgCO2: Infinity,
    airQuality: {
      headline: 'Your commute meaningfully contributes to local air pollution and health concerns.',
      details: [
        'Higher emissions of NOₓ and PM2.5 add to smog formation and roadside pollution—corridors with heavy traffic often exceed EPA air quality standards.',
        'People living or working near highways and major roads face elevated risk of respiratory and cardiovascular issues from sustained exposure.',
        'On poor air quality days (high ozone, wildfires, inversions), your contribution adds to the cumulative load that makes outdoor activity risky for sensitive populations.',
      ],
    },
  },
};

// Air quality context for zero-emissions (walking/biking)
const SELF_AIR_QUALITY = {
  headline: 'Your commute produces no direct tailpipe emissions.',
  details: [
    'You add zero nitrogen oxides (NOₓ), particulate matter (PM2.5), or carbon monoxide to the air—unlike vehicle traffic on the same routes.',
    'By choosing active transport, you\'re also not contributing to congestion that worsens idling emissions and smog formation.',
    'You may be exposed to pollutants from other vehicles; choosing quieter routes or off-peak times can reduce that exposure.',
  ],
};

function getRating(totalKgCO2) {
  if (totalKgCO2 <= RATINGS.low.maxKgCO2) return RATINGS.low;
  if (totalKgCO2 <= RATINGS.moderate.maxKgCO2) return RATINGS.moderate;
  return RATINGS.high;
}

function calculateEmissions() {
  const mode = document.querySelector('input[name="mode"]:checked')?.value || 'bus';
  const distance = parseInt(document.getElementById('distanceSlider').value, 10);

  let kgCO2 = 0;
  const breakdown = [];

  if (mode === 'bus') {
    const occupancy = parseInt(document.querySelector('input[name="occupancy"]:checked')?.value || '50', 10);
    const busType = document.querySelector('input[name="busType"]:checked')?.value || 'gasoline';
    const perMile = EMISSIONS.bus[busType](occupancy);
    kgCO2 = perMile * distance;
    const busLabels = {
      gasoline: 'Gasoline/Diesel bus',
      electric: 'Electric bus',
    };
    breakdown.push({ label: `${busLabels[busType]} (shared)`, kg: kgCO2 });
  } else if (mode === 'self') {
    kgCO2 = EMISSIONS.self * distance;
    breakdown.push({ label: 'Walking/Biking', kg: 0 });
  } else if (mode === 'car') {
    const carType = document.querySelector('input[name="carType"]:checked')?.value || 'sedan';
    const perMile = EMISSIONS.car[carType];
    kgCO2 = perMile * distance;
    const labels = { sedan: 'Sedan', suv: 'SUV', truck: 'Truck', hybrid: 'Hybrid' };
    breakdown.push({ label: `Car (${labels[carType]})`, kg: kgCO2 });
  }

  const rating = getRating(kgCO2);

  return { kgCO2, breakdown, rating };
}

function updateUI() {
  const { kgCO2, breakdown, rating } = calculateEmissions();
  const mode = document.querySelector('input[name="mode"]:checked')?.value;

  document.getElementById('emissionsValue').textContent = kgCO2.toFixed(2);
  document.getElementById('ratingBadge').textContent = rating.label;
  document.getElementById('ratingBadge').className = `rating-badge ${rating.class}`;
  document.getElementById('ratingDesc').textContent = rating.desc;

  // Air quality context: use special content for walking/biking, else use rating-based
  const airQuality = mode === 'self' ? SELF_AIR_QUALITY : rating.airQuality;
  document.getElementById('airQualityContext').textContent = airQuality.headline;
  document.getElementById('airQualityDetails').innerHTML = airQuality.details
    .map((d) => `<li>${d}</li>`)
    .join('');

  const container = document.getElementById('categoriesBreakdown');
  container.innerHTML = breakdown
    .map(
      (b) =>
        `<div class="category-row"><span>${b.label}</span><span>${b.kg.toFixed(2)} kg CO₂</span></div>`
    )
    .join('');
}

function toggleModeSections() {
  const mode = document.querySelector('input[name="mode"]:checked')?.value || 'bus';

  document.getElementById('busSection').classList.toggle('visible', mode === 'bus');
  document.getElementById('selfSection').classList.toggle('visible', mode === 'self');
  document.getElementById('carSection').classList.toggle('visible', mode === 'car');

  // Set defaults when switching
  if (mode === 'bus' && !document.querySelector('input[name="occupancy"]:checked')) {
    document.querySelector('input[name="occupancy"][value="50"]').checked = true;
  }
  if (mode === 'bus' && !document.querySelector('input[name="busType"]:checked')) {
    document.querySelector('input[name="busType"][value="gasoline"]').checked = true;
  }
  if (mode === 'car' && !document.querySelector('input[name="carType"]:checked')) {
    document.querySelector('input[name="carType"][value="sedan"]').checked = true;
  }
  if (mode === 'self' && !document.querySelector('input[name="selfType"]:checked')) {
    document.querySelector('input[name="selfType"][value="walk"]').checked = true;
  }

  updateUI();
}

function init() {
  // Set initial mode
  document.querySelector('input[name="mode"][value="bus"]').checked = true;
  document.querySelector('input[name="occupancy"][value="50"]').checked = true;
  document.querySelector('input[name="busType"][value="gasoline"]').checked = true;
  toggleModeSections();

  // Distance slider
  const slider = document.getElementById('distanceSlider');
  const output = document.getElementById('distanceValue');
  const roundTrip = document.getElementById('roundTrip');

  function updateDistance() {
    const val = slider.value;
    output.textContent = val;
    roundTrip.textContent = val * 2;
    updateUI();
  }

  slider.addEventListener('input', updateDistance);

  // Mode change
  document.querySelectorAll('input[name="mode"]').forEach((el) => {
    el.addEventListener('change', toggleModeSections);
  });

  // Bus occupancy
  document.querySelectorAll('input[name="occupancy"]').forEach((el) => {
    el.addEventListener('change', updateUI);
  });

  // Bus type
  document.querySelectorAll('input[name="busType"]').forEach((el) => {
    el.addEventListener('change', updateUI);
  });

  // Car type
  document.querySelectorAll('input[name="carType"]').forEach((el) => {
    el.addEventListener('change', updateUI);
  });

  // Self type (both 0, but for consistency)
  document.querySelectorAll('input[name="selfType"]').forEach((el) => {
    el.addEventListener('change', updateUI);
  });

  updateUI();
}

document.addEventListener('DOMContentLoaded', () => {
  init();

  // Sources toggle
  const toggle = document.getElementById('sourcesToggle');
  const content = document.getElementById('sourcesContent');
  if (toggle && content) {
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
      content.hidden = isExpanded;
    });
  }
});
