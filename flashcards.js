const CARDS = [
  {
    front: 'Units (Temp, Pressure, Mass, Energy)',
    back: 'Search <strong>"Units and Conversion Factors"</strong> → scroll to °F ↔ °C ↔ K, mg/L ↔ kg/day, psi, atm, Pa, ft, m, in, prefixes k, M, μ'
  },
  {
    front: 'Flow Measurement / Pitot Tube',
    back: 'Search <strong>"Velocity Measurement"</strong> → scroll to Pitot tube equation, velocity head, flow = VA'
  },
  {
    front: 'Pipe Flow / Head Loss / Pumps',
    back: 'Search <strong>"Fluid Mechanics"</strong> → scroll to Continuity, Bernoulli, Darcy–Weisbach, Friction factor, Minor losses'
  },
  {
    front: 'BOD / COD / DO',
    back: 'Search <strong>"Wastewater Treatment"</strong> → scroll to BOD definitions, COD vs BOD, Oxygen demand, Treatment process overview'
  },
  {
    front: 'Activated Sludge / Biological Processes',
    back: 'Search <strong>"Activated Sludge"</strong> → scroll to Biomass relationships, Yield coefficients, Sludge age, Aeration basics'
  },
  {
    front: 'Water Chemistry / pH / Alkalinity',
    back: 'Search <strong>"Chemistry"</strong> → scroll to Acid–base reactions, pH equations, pKa relationships, Equilibrium constants'
  },
  {
    front: 'Gases / Air Pollution / Stacks',
    back: 'Search <strong>"Ideal Gas Law"</strong> → scroll to Gas concentration equations, ppm ↔ mg/m³, Temperature & pressure corrections'
  },
  {
    front: 'Mass Transfer / Fate & Transport',
    back: 'Search <strong>"Mass Transfer"</strong> → scroll to Fick\'s Law, Flux equations, Henry\'s Law'
  },
  {
    front: 'Solid & Hazardous Waste',
    back: 'Search <strong>"Solid Waste"</strong> → scroll to Landfill components, Hazardous classifications, Treatment methods'
  },
  {
    front: 'Sampling / Risk / Compliance',
    back: 'Search <strong>"Probability and Statistics"</strong> → scroll to Mean & variance, Normal distribution, Confidence intervals, Regression'
  },
  {
    front: 'Cost / Life-Cycle / Economics',
    back: 'Search <strong>"Engineering Economics"</strong> → scroll to Present worth, Annual worth, Interest factors'
  }
];

let currentIndex = 0;
let isFlipped = false;
let order = CARDS.map((_, i) => i);

const cardWrapper = document.getElementById('cardWrapper');
const card = document.getElementById('card');
const frontText = document.getElementById('frontText');
const backText = document.getElementById('backText');
const currentNumEl = document.getElementById('currentNum');
const totalNumEl = document.getElementById('totalNum');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const flipBtn = document.getElementById('flipBtn');
const shuffleBtn = document.getElementById('shuffleBtn');

function getCard(i) {
  return CARDS[order[i]];
}

function showFront() {
  isFlipped = false;
  card.classList.remove('flipped');
}

function showBack() {
  isFlipped = true;
  card.classList.add('flipped');
}

function flip() {
  isFlipped = !isFlipped;
  card.classList.toggle('flipped', isFlipped);
}

function render() {
  const c = getCard(currentIndex);
  frontText.textContent = c.front;
  backText.innerHTML = c.back;
  currentNumEl.textContent = currentIndex + 1;
  totalNumEl.textContent = CARDS.length;
  showFront();
}

function goPrev() {
  if (currentIndex <= 0) return;
  currentIndex--;
  render();
}

function goNext() {
  if (currentIndex >= CARDS.length - 1) return;
  currentIndex++;
  render();
}

function shuffle() {
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  currentIndex = 0;
  render();
}

card.addEventListener('click', flip);
flipBtn.addEventListener('click', flip);
prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);
shuffleBtn.addEventListener('click', shuffle);

document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'Space':
      e.preventDefault();
      if (!e.target.closest('button') && !e.target.closest('a')) flip();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      goPrev();
      break;
    case 'ArrowRight':
      e.preventDefault();
      goNext();
      break;
  }
});

render();
