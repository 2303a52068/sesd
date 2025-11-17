// FitTrack - frontend-only (localStorage) script
// Demo-only: do NOT store real passwords or sensitive data in localStorage in production.

// ---------- Sample plans ----------
const SAMPLE_PLANS = [
  { id: 'p1', title: 'Beginner Plan', desc: '4-week beginner-friendly workout & nutrition guide', price: 299, features: ['3 workouts/week', 'Beginner videos', 'Nutrition tips'] },
  { id: 'p2', title: 'Strength Builder', desc: '8-week strength program with progressive overload', price: 799, features: ['4 workouts/week', 'Progress charts', 'Video demos'] },
  { id: 'p3', title: 'Cardio Boost', desc: '6-week cardio-focused program', price: 499, features: ['5 sessions/week', 'Interval training', 'Heart-rate guides'] }
];

// ---------- State management ----------
function loadState(){
  try{
    const raw = localStorage.getItem('fittrack_v1');
    return raw ? JSON.parse(raw) : { users: [], sessions: null, plans: SAMPLE_PLANS, cart: [], orders: [], weight: [], workouts: [] };
  } catch(e){ console.error(e); return { users: [], sessions: null, plans: SAMPLE_PLANS, cart: [], orders: [], weight: [], workouts: [] }; }
}
function saveState(state){ localStorage.setItem('fittrack_v1', JSON.stringify(state)); }

let state = loadState();

// ---------- Helpers ----------
const $ = id => document.getElementById(id);

// ---------- Renders ----------
function renderPlans(){
  const container = $('plansList');
  container.innerHTML = '';
  state.plans.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = `
      <div class="card p-3 h-100 plan-card">
        <div class="d-flex justify-content-between">
          <h5 class="mb-0">${p.title}</h5>
          <div><strong>₹${p.price}</strong></div>
        </div>
        <p class="small-muted my-2">${p.desc}</p>
        <ul class="small-muted mb-3">${p.features.map(f=><li>${f}</li>).join('')}</ul>
        <div class="mt-auto d-flex gap-2">
          <button class="btn btn-outline-success btn-sm view-plan" data-id="${p.id}">View</button>
          <button class="btn btn-success btn-sm add-plan" data-id="${p.id}">Add</button>
        </div>
      </div>
    `;
    container.appendChild(col);
  });

  // attach listeners
  document.querySelectorAll('.add-plan').forEach(btn => btn.addEventListener('click', e => addToCart(e.target.dataset.id)));
  document.querySelectorAll('.view-plan').forEach(btn => btn.addEventListener('click', e => viewPlan(e.target.dataset.id)));
}

function renderCart(){
  const box = $('cartItems'); box.innerHTML = '';
  if(state.cart.length === 0){
    box.innerHTML = '<div class="small-muted">No plans added yet.</div>';
    $('cartTotal').textContent = '₹0';
    $('cartCount').textContent = '0';
    return;
  }
  let total = 0;
  state.cart.forEach(id => {
    const p = state.plans.find(x => x.id === id);
    if(!p) return;
    total += p.price;
    const row = document.createElement('div');
    row.className = 'd-flex justify-content-between align-items-center mb-2';
    row.innerHTML = <div><strong>${p.title}</strong><div class="small-muted">₹${p.price}</div></div><div><button class="btn btn-sm btn-danger remove-plan" data-id="${p.id}">Remove</button></div>;
    box.appendChild(row);
  });
  $('cartTotal').textContent = ₹${total};
  $('cartCount').textContent = state.cart.length;
  document.querySelectorAll('.remove-plan').forEach(b => b.addEventListener('click', e => removeFromCart(e.target.dataset.id)));
}

function renderOrders(){
  const list = $('ordersList'); list.innerHTML = '';
  if(!state.orders || state.orders.length === 0){ list.innerHTML = '<li class="list-group-item small-muted">No past orders</li>'; return; }
  state.orders.slice().reverse().forEach(o => {
    const li = document.createElement('li'); li.className = 'list-group-item';
    li.textContent = ${o.title} — ₹${o.amount} (${o.date});
    list.appendChild(li);
  });
}

function renderWeightList(){
  const ul = $('weightList'); ul.innerHTML = '';
  if(state.weight.length === 0){ ul.innerHTML = '<li class="list-group-item small-muted">No weight entries</li>'; return; }
  state.weight.slice().reverse().forEach(w => {
    const li = document.createElement('li'); li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = <div>${w.date}<div class="small-muted">${w.weight} kg</div></div><div><button class="btn btn-sm btn-danger del-weight" data-id="${w.id}">Del</button></div>;
    ul.appendChild(li);
  });
  document.querySelectorAll('.del-weight').forEach(b => b.addEventListener('click', e => removeWeight(e.target.dataset.id)));
}

function renderWorkoutList(){
  const ul = $('workoutList'); ul.innerHTML = '';
  if(state.workouts.length === 0){ ul.innerHTML = '<li class="list-group-item small-muted">No workouts logged</li>'; return; }
  state.workouts.slice().reverse().forEach(w => {
    const li = document.createElement('li'); li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = <div>${new Date(w.date).toLocaleString()}<div class="small-muted">${w.type} • ${w.mins} min</div></div><div><button class="btn btn-sm btn-danger del-workout" data-id="${w.id}">Del</button></div>;
    ul.appendChild(li);
  });
  document.querySelectorAll('.del-workout').forEach(b => b.addEventListener('click', e => removeWorkout(e.target.dataset.id)));
}

// ---------- Actions ----------
function addToCart(id){
  if(!state.sessions){ alert('Please login/signup to save plans.'); return; }
  if(!state.cart.includes(id)) state.cart.push(id);
  saveState(state); renderCart();
}
function removeFromCart(id){
  state.cart = state.cart.filter(x => x !== id);
  saveState(state); renderCart();
}
function viewPlan(id){
  const p = state.plans.find(x => x.id === id);
  if(!p) return;
  alert(${p.title}\n\n${p.desc}\n\nFeatures:\n- ${p.features.join('\n- ')});
}

// ---------- Orders ----------
$('placeOrderBtn').addEventListener('click', () => {
  if(!state.sessions){ alert('Please login first to place an order.'); return; }
  if(state.cart.length === 0){ alert('Your cart is empty.'); return; }
  const amount = state.cart.reduce((s, id) => s + (state.plans.find(p => p.id === id)?.price || 0), 0);
  const order = { id: 'o' + Date.now(), user: state.sessions.email, title: Subscription (${state.cart.length}), amount, date: new Date().toLocaleString() };
  state.orders.push(order);
  state.cart = [];
  saveState(state); renderCart(); renderOrders(); alert('Order placed!');
});

// ---------- Auth (localStorage demo) ----------
$('btnOpenLogin').addEventListener('click', () => {
  const modal = new bootstrap.Modal(document.getElementById('authModal'));
  document.getElementById('toggleSignup').checked = false;
  document.getElementById('nameRow').style.display = 'none';
  document.getElementById('authTitle').textContent = 'Login';
  modal.show();
});

$('toggleSignup').addEventListener('change', (e) => {
  document.getElementById('nameRow').style.display = e.target.checked ? 'block' : 'none';
  document.getElementById('authTitle').textContent = e.target.checked ? 'Sign up' : 'Login';
});

$('authForm').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const email = $('emailInput').value.trim().toLowerCase();
  const pw = $('passInput').value;
  const isSignup = $('toggleSignup').checked;
  if(!email || !pw) return alert('Fill email & password');
  if(isSignup){
    if(state.users.find(u => u.email === email)) return alert('Email already registered. Please login.');
    state.users.push({ email, pw, name: $('nameInput').value.trim() || email.split('@')[0] });
    state.sessions = { email, name: $('nameInput').value.trim() || email.split('@')[0] };
    saveState(state); location.reload();
  } else {
    const user = state.users.find(u => u.email === email && u.pw === pw);
    if(!user) return alert('Invalid credentials.');
    state.sessions = { email: user.email, name: user.name || user.email.split('@')[0] };
    saveState(state); location.reload();
  }
});

// ---------- Trackers: weight & workouts ----------
$('weightForm').addEventListener('submit', e => {
  e.preventDefault();
  const val = parseFloat($('weightInput').value);
  const date = $('weightDate').value || new Date().toISOString().slice(0,10);
  if(isNaN(val) || val <= 0) return alert('Enter a valid weight');
  state.weight.push({ id: 'w' + Date.now(), weight: val, date });
  saveState(state); renderWeightList(); renderProgress();
  $('weightForm').reset();
});

function removeWeight(id){
  state.weight = state.weight.filter(w => w.id !== id);
  saveState(state); renderWeightList(); renderProgress();
}
window.removeWeight = removeWeight; // not required but safe

$('workoutForm').addEventListener('submit', e => {
  e.preventDefault();
  const type = $('workoutType').value.trim();
  const mins = parseInt($('workoutMins').value, 10);
  if(!type || isNaN(mins) || mins <= 0) return alert('Enter valid workout details');
  state.workouts.push({ id: 'wk' + Date.now(), type, mins, date: new Date().toISOString() });
  saveState(state); renderWorkoutList(); renderProgress();
  $('workoutForm').reset();
});

function removeWorkout(id){
  state.workouts = state.workouts.filter(w => w.id !== id);
  saveState(state); renderWorkoutList(); renderProgress();
}
window.removeWorkout = removeWorkout;

// Hook delete buttons delegated (since created dynamically)
document.addEventListener('click', (e) => {
  if(e.target.matches('.del-weight')) removeWeight(e.target.dataset.id);
  if(e.target.matches('.del-workout')) removeWorkout(e.target.dataset.id);
});

// ---------- Progress calculations ----------
function renderProgress(){
  // Latest weight & weight trend
  const latestWeightEl = $('latestWeight');
  const weightProgressEl = $('weightProgress');

  if(state.weight.length === 0){
    latestWeightEl.textContent = 'No entries yet';
    weightProgressEl.style.width = '0%';
    weightProgressEl.textContent = '0%';
  } else {
    // sort by date ascending (date strings are YYYY-MM-DD or ISO)
    const sorted = state.weight.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
    const first = sorted[0].weight;
    const last = sorted[sorted.length - 1].weight;
    const lastDate = sorted[sorted.length - 1].date;
    latestWeightEl.textContent = ${last} kg (on ${lastDate});

    // percent change: (first - last) / first -> positive means weight decreased (progress)
    let pct = 50;
    if(first > 0) {
      pct = Math.round(((first - last) / first) * 100) + 50; // map to around 50 = neutral
    }
    pct = Math.max(0, Math.min(100, pct));
    weightProgressEl.style.width = pct + '%';
    weightProgressEl.textContent = pct + '%';
  }

  // Workouts in last 7 days
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recent = state.workouts.filter(w => new Date(w.date).getTime() >= sevenDaysAgo);
  const workoutSummaryEl = $('workoutSummary');
  if(recent.length === 0) workoutSummaryEl.textContent = 'No workouts logged in last 7 days.';
  else {
    const totalMins = recent.reduce((s, w) => s + Number(w.mins), 0);
    workoutSummaryEl.textContent = ${recent.length} sessions • ${totalMins} minutes total;
  }
}

// ---------- Initialize UI ----------
function updateUIForUser(){
  const btn = $('btnOpenLogin');
  if(state.sessions){
    btn.textContent = Hi, ${state.sessions.name || state.sessions.email.split('@')[0]};
    btn.classList.remove('btn-outline-success'); btn.classList.add('btn-success');
  } else {
    btn.textContent = 'Login / Signup';
    btn.classList.remove('btn-success'); btn.classList.add('btn-outline-success');
  }
}

function init(){
  // ensure plans exist
  if(!state.plans || state.plans.length === 0) state.plans = SAMPLE_PLANS;
  renderPlans();
  renderCart();
  renderOrders();
  renderWeightList();
  renderWorkoutList();
  renderProgress();
  updateUIForUser();
  $('year').textContent = new Date().getFullYear();
}
init();