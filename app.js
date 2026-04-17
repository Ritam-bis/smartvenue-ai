/* app.js — SmartVenue AI Main Logic */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMap();
  renderQueues();
  renderFood();
  renderExitSections();
  renderAlerts();
  initVoice();
  initCart();
  startLiveUpdates();
});

/* ===== NAVIGATION ===== */
function initNav() {
  const items = document.querySelectorAll('.nav-item');
  const screens = document.querySelectorAll('.screen');
  const title = document.getElementById('page-title');
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('menu-toggle');

  items.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.screen;
      items.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      screens.forEach(s => s.classList.remove('active'));
      document.getElementById('screen-' + id).classList.add('active');
      title.textContent = btn.querySelector('span').textContent;
      sidebar.classList.remove('open');
      if (id === 'map') setTimeout(() => initMap(), 50);
    });
  });

  toggle?.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.querySelector('.main-content')?.addEventListener('click', () => sidebar.classList.remove('open'));
}

/* ===== QUEUE DATA ===== */
const queueData = {
  food: [
    { name:'Food Stall A', detail:'Burgers & Fries · North Stand', wait:18, status:'high' },
    { name:'Food Stall B', detail:'Pizza & Pasta · East Stand', wait:8, status:'med' },
    { name:'Food Stall C', detail:'Snacks & Drinks · South Stand', wait:2, status:'low' },
    { name:'Food Stall D', detail:'Asian Kitchen · West Stand', wait:5, status:'low' },
  ],
  wash: [
    { name:'Washroom Block A', detail:'North Stand · Level 1', wait:12, status:'high' },
    { name:'Washroom Block B', detail:'East Stand · Level 2', wait:10, status:'high' },
    { name:'Washroom Block C', detail:'South Stand · Level 1', wait:5, status:'med' },
    { name:'Washroom Block D', detail:'West Stand · Level 2', wait:1, status:'low' },
  ],
  gate: [
    { name:'Gate 1 (North)', detail:'Main Entry', wait:22, status:'high' },
    { name:'Gate 2 (South)', detail:'South Entrance', wait:9, status:'med' },
    { name:'Gate 3 (West)', detail:'VIP & General', wait:7, status:'med' },
    { name:'Gate 4 (East)', detail:'Recommended ✨', wait:2, status:'low' },
  ],
};

function renderQueues() {
  ['food','wash','gate'].forEach(type => {
    const el = document.getElementById('queue-' + type + '-list');
    if (!el) return;
    el.innerHTML = queueData[type].map(q => `
      <div class="queue-item">
        <div class="queue-status-dot" style="background:var(--${q.status==='low'?'green':q.status==='med'?'amber':'red'})"></div>
        <div class="queue-info">
          <div class="queue-name">${q.name}</div>
          <div class="queue-detail">${q.detail}</div>
        </div>
        <div class="queue-time ${q.status}">${q.wait} min</div>
        <button class="queue-action">${q.status==='low'?'Navigate':'View Alt'}</button>
      </div>
    `).join('');
  });
}

/* ===== FOOD DATA ===== */
const foodItems = [
  { id:1, name:'Classic Burger', emoji:'🍔', price:8.99, stall:'A' },
  { id:2, name:'Cheese Fries', emoji:'🍟', price:5.49, stall:'A' },
  { id:3, name:'Pepperoni Pizza', emoji:'🍕', price:9.99, stall:'B' },
  { id:4, name:'Pasta Bowl', emoji:'🍝', price:7.99, stall:'B' },
  { id:5, name:'Nachos Grande', emoji:'🧀', price:6.49, stall:'C' },
  { id:6, name:'Soft Drink', emoji:'🥤', price:3.99, stall:'C' },
  { id:7, name:'Hot Dog', emoji:'🌭', price:4.99, stall:'C' },
  { id:8, name:'Ice Cream', emoji:'🍦', price:4.49, stall:'C' },
  { id:9, name:'Fried Rice', emoji:'🍚', price:7.49, stall:'D' },
  { id:10,name:'Spring Rolls', emoji:'🥟', price:5.99, stall:'D' },
  { id:11,name:'Beer', emoji:'🍺', price:6.99, stall:'A' },
  { id:12,name:'Popcorn', emoji:'🍿', price:3.49, stall:'B' },
];

let cart = [];
let activeStall = 'all';

function renderFood() {
  const grid = document.getElementById('food-grid');
  if (!grid) return;
  const items = activeStall === 'all' ? foodItems : foodItems.filter(f => f.stall === activeStall);
  grid.innerHTML = items.map(f => `
    <div class="food-card">
      <div class="food-emoji">${f.emoji}</div>
      <div class="food-name">${f.name}</div>
      <div class="food-stall-name">Stall ${f.stall}</div>
      <div class="food-bottom">
        <div class="food-price">$${f.price.toFixed(2)}</div>
        <button class="food-add-btn" data-id="${f.id}">+</button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.food-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = foodItems.find(f => f.id === +btn.dataset.id);
      if (item) { cart.push(item); updateCart(); showToast(item.name + ' added to cart!'); }
    });
  });

  document.querySelectorAll('.stall-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.stall-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeStall = tab.dataset.stall;
      renderFood();
    });
  });
}

function initCart() {
  document.getElementById('cart-btn')?.addEventListener('click', () => {
    document.getElementById('cart-panel')?.classList.toggle('open');
  });
  document.getElementById('close-cart')?.addEventListener('click', () => {
    document.getElementById('cart-panel')?.classList.remove('open');
  });
  document.getElementById('place-order-btn')?.addEventListener('click', () => {
    if (cart.length === 0) return showToast('Cart is empty!');
    cart = [];
    updateCart();
    document.getElementById('cart-panel')?.classList.remove('open');
    showToast('⚡ Order placed! Pickup at Stall C, Counter 2 in ~3 min');
  });
}

function updateCart() {
  document.getElementById('cart-count').textContent = cart.length;
  const list = document.getElementById('cart-items-list');
  const total = document.getElementById('cart-total');
  if (!list) return;
  list.innerHTML = cart.map((c,i) => `<div class="cart-item"><span>${c.emoji} ${c.name}</span><span>$${c.price.toFixed(2)}</span></div>`).join('');
  const sum = cart.reduce((a,b) => a + b.price, 0);
  total.textContent = 'Total: $' + sum.toFixed(2);
}

/* ===== EXIT SECTIONS ===== */
const exitSections = [
  { name:'Section A (North)', time:'Now', status:'Exiting', color:'green' },
  { name:'Section B-14 (You)', time:'5:30', status:'Waiting', color:'cyan' },
  { name:'Section C (South)', time:'8:00', status:'Queued', color:'amber' },
  { name:'Section D (West)', time:'11:00', status:'Queued', color:'amber' },
  { name:'VIP Lounge', time:'Now', status:'Exiting', color:'green' },
  { name:'Section E (East)', time:'3:00', status:'Waiting', color:'cyan' },
];

function renderExitSections() {
  const grid = document.getElementById('exit-sections-grid');
  if (!grid) return;
  grid.innerHTML = exitSections.map(s => `
    <div class="exit-section-card">
      <div class="exit-section-name">${s.name}</div>
      <div class="exit-section-time">Exit in: ${s.time}</div>
      <div class="exit-section-status" style="color:var(--${s.color})">${s.status}</div>
    </div>
  `).join('');
}

/* Exit countdown */
let exitSeconds = 330;
function tickExit() {
  const el = document.getElementById('exit-countdown');
  if (!el) return;
  const m = Math.floor(exitSeconds / 60);
  const s = exitSeconds % 60;
  el.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  if (exitSeconds > 0) exitSeconds--;
}
setInterval(tickExit, 1000);

/* ===== ALERTS ===== */
const alertsData = [
  { icon:'⚽', title:'Match starting in 5 minutes', desc:'Quarter 4 kickoff at 8:45 PM. Head to your seats!', time:'Just now', type:'info' },
  { icon:'🚨', title:'North Gate Overcrowded', desc:'Avoid Gate 1. AI suggests Gate 4 (East) — 40% less crowded.', time:'2 min ago', type:'urgent' },
  { icon:'🎆', title:'Fireworks at Gate 5 Area', desc:'Post-match celebration at 9:30 PM near East exit.', time:'5 min ago', type:'info' },
  { icon:'✅', title:'Your pre-order is ready!', desc:'Pickup at Stall C, Counter 2. Your nachos are waiting!', time:'8 min ago', type:'success' },
  { icon:'🚻', title:'Washroom Block A — High Wait', desc:'12 min queue detected. Block D has only 1 min wait.', time:'12 min ago', type:'urgent' },
  { icon:'🎟️', title:'Exit discount unlocked!', desc:'Stay 5 more mins after your exit window → 15% off next ticket.', time:'15 min ago', type:'success' },
];

function renderAlerts() {
  const el = document.getElementById('alerts-list');
  if (!el) return;
  el.innerHTML = alertsData.map(a => `
    <div class="alert-item alert-${a.type}">
      <div class="alert-icon">${a.icon}</div>
      <div class="alert-body">
        <div class="alert-title">${a.title}</div>
        <div class="alert-desc">${a.desc}</div>
      </div>
      <div class="alert-time">${a.time}</div>
    </div>
  `).join('');

  document.getElementById('clear-alerts-btn')?.addEventListener('click', () => {
    el.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:2rem">No new alerts</p>';
    document.getElementById('alert-badge').style.display = 'none';
  });
}

/* ===== VOICE ASSISTANT ===== */
const voiceAnswers = {
  'Where is the nearest free washroom?': '🚻 Washroom Block D (West Stand, Level 2) is free — only 1 min wait, 2 min walk from your seat.',
  'Which food stall has no queue?': '🍕 Food Stall C (South Stand) has almost no queue! Try their Nachos Grande.',
  'When should I exit?': '🚪 Your exit window opens in 5:30. Proceed to East Gate 4 for the fastest exit.',
  'Which gate is least crowded?': '🟢 Gate 4 (East) has only 2 min wait — 40% less crowded than Gate 1.',
};

function initVoice() {
  const overlay = document.getElementById('voice-overlay');
  const openBtn = document.getElementById('voice-btn');
  const closeBtn = document.getElementById('voice-close');
  const prompt = document.getElementById('voice-prompt');
  const response = document.getElementById('voice-response');
  const orb = document.getElementById('voice-orb');

  openBtn?.addEventListener('click', () => overlay.classList.add('open'));
  closeBtn?.addEventListener('click', () => { overlay.classList.remove('open'); response.textContent = ''; prompt.textContent = 'Tap to speak...'; });

  document.querySelectorAll('.voice-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.q;
      prompt.textContent = '"' + q + '"';
      response.textContent = '';
      orb.style.transform = 'scale(1.15)';
      setTimeout(() => {
        orb.style.transform = 'scale(1)';
        response.textContent = voiceAnswers[q] || 'Thinking...';
      }, 800);
    });
  });

  orb?.addEventListener('click', () => {
    prompt.textContent = 'Listening...';
    response.textContent = '';
    orb.style.transform = 'scale(1.2)';
    setTimeout(() => {
      orb.style.transform = 'scale(1)';
      prompt.textContent = '"Where is the nearest free washroom?"';
      setTimeout(() => {
        response.textContent = voiceAnswers['Where is the nearest free washroom?'];
      }, 600);
    }, 1500);
  });
}

/* ===== TOAST ===== */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ===== LIVE UPDATES (Simulated) ===== */
function startLiveUpdates() {
  setInterval(() => {
    // Randomly fluctuate queue times
    ['food','wash','gate'].forEach(type => {
      queueData[type].forEach(q => {
        q.wait = Math.max(1, q.wait + Math.floor(Math.random()*5) - 2);
        q.status = q.wait <= 4 ? 'low' : q.wait <= 9 ? 'med' : 'high';
      });
    });
    if (document.getElementById('screen-queues')?.classList.contains('active')) renderQueues();

    // Fluctuate crowd density
    MAP.zones.forEach(z => {
      if (z.id !== 'field') z.crowd = Math.min(1, Math.max(.1, z.crowd + (Math.random()-.5)*.06));
    });
    if (document.getElementById('screen-map')?.classList.contains('active')) {
      const c = document.getElementById('stadiumCanvas');
      if (c) drawStadium(c);
    }

    // Update KPI
    const avgWait = Math.round(queueData.food.reduce((a,b) => a+b.wait, 0) / queueData.food.length);
    const densityEl = document.getElementById('kpi-density');
    const waitEl = document.getElementById('kpi-wait');
    if (waitEl) waitEl.textContent = avgWait + ' min';
    if (densityEl) {
      const d = Math.round(MAP.zones.filter(z=>z.id!=='field').reduce((a,z)=>a+z.crowd,0)/4*100);
      densityEl.textContent = d + '%';
    }
  }, 4000);
}
