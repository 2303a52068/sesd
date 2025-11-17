// FitTrack Script.js
const SAMPLE_PLANS=[{id:'p1',title:'Beginner Plan',desc:'4-week guide',price:299,features:['3 workouts','Videos']},{id:'p2',title:'Strength Builder',desc:'8-week program',price:799,features:['4 workouts','Charts']},{id:'p3',title:'Cardio Plan',desc:'6-week cardio plan',price:499,features:['5 sessions','HR guides']}];

function loadState(){const raw=localStorage.getItem('fittrack_v1');return raw?JSON.parse(raw):{users:[],sessions:null,plans:SAMPLE_PLANS,cart:[],orders:[],weight:[],workouts:[]}};
let state=loadState();
function saveState(){localStorage.setItem('fittrack_v1',JSON.stringify(state));}

function renderPlans(){const list=document.getElementById('plansList');list.innerHTML='';state.plans.forEach(p=>{const col=document.createElement('div');col.className='col-md-4';col.innerHTML=<div class="card p-3 plan-card h-100"><h5>${p.title}</h5><p>${p.desc}</p><strong>₹${p.price}</strong><ul>${p.features.map(f=><li>${f}</li>).join('')}</ul><button class='btn btn-success btn-sm' onclick="addToCart('${p.id}')">Add</button></div>;list.appendChild(col);});}

function addToCart(id){if(!state.sessions)return alert('Login first');if(!state.cart.includes(id))state.cart.push(id);saveState();renderCart();}
function renderCart(){const box=document.getElementById('cartItems');box.innerHTML='';let total=0;state.cart.forEach(id=>{const p=state.plans.find(x=>x.id===id);total+=p.price;box.innerHTML+=<div class='d-flex justify-content-between mb-2'><div>${p.title}</div><button class='btn btn-danger btn-sm' onclick="removeFromCart('${id}')">Remove</button></div>;});document.getElementById('cartTotal').textContent='₹'+total;document.getElementById('cartCount').textContent=state.cart.length;}
function removeFromCart(id){state.cart=state.cart.filter(x=>x!==id);saveState();renderCart();}

document.getElementById('placeOrderBtn').onclick=()=>{if(!state.sessions)return alert('Login first');if(state.cart.length===0)return alert('Empty cart');const amount=state.cart.reduce((s,id)=>s+(state.plans.find(p=>p.id===id).price),0);state.orders.push({title:Subscription,amount,date:new Date().toLocaleString()});state.cart=[];saveState();renderCart();renderOrders();alert('Order placed')};

function renderOrders(){const list=document.getElementById('ordersList');list.innerHTML='';state.orders.forEach(o=>{list.innerHTML+=<li class='list-group-item'>${o.title} — ₹${o.amount}</li>});}

document.getElementById('btnOpenLogin').onclick=()=>{new bootstrap.Modal('#authModal').show();};
document.getElementById('toggleSignup').onchange=e=>{document.getElementById('nameRow').style.display=e.target.checked?'block':'none';};

document.getElementById('authForm').onsubmit=e=>{e.preventDefault();const email=emailInput.value;const pw=passInput.value;const isSign=toggleSignup.checked;if(isSign){if(state.users.find(u=>u.email===email))return alert('Exists');state.users.push({email,pw,name:nameInput.value});state.sessions={email};}else{const u=state.users.find(u=>u.email===email&&u.pw===pw);if(!u)return alert('Invalid');state.sessions={email};}saveState();location.reload();};

weightForm.onsubmit=e=>{e.preventDefault();state.weight.push({weight:weightInput.value,date:weightDate.value||new Date().toISOString().slice(0,10)});saveState();renderWeight();};
function renderWeight(){const ul=document.getElementById('weightList');ul.innerHTML='';state.weight.forEach(w=>ul.innerHTML+=<li class='list-group-item'>${w.date} — ${w.weight} kg</li>);}

workoutForm.onsubmit=e=>{e.preventDefault();state.workouts.push({type:workoutType.value,mins:workoutMins.value,date:new Date().toISOString()});saveState();renderWorkouts();};
function renderWorkouts(){const ul=document.getElementById('workoutList');ul.innerHTML='';state.workouts.forEach(w=>ul.innerHTML+=<li class='list-group-item'>${w.type} — ${w.mins} mins</li>);}

function init(){renderPlans();renderCart();renderOrders();renderWeight();renderWorkouts();document.getElementById('year').textContent=new Date().getFullYear();}
init();