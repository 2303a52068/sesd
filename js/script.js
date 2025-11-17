// =============================
// Load & Save State
// =============================
const SAMPLE_PLANS=[
 {id:'p1',title:'Beginner Plan',desc:'4-week beginner guide',price:299,features:['3 workouts/week','Video demos']},
 {id:'p2',title:'Strength Builder',desc:'8-week strength training',price:799,features:['4 workouts/week','Progress charts']},
 {id:'p3',title:'Cardio Boost',desc:'6-week cardio improvement',price:499,features:['5 sessions/week','Heart-rate guide']}
];

function loadState(){
 const raw=localStorage.getItem('fittrack_v1');
 return raw?JSON.parse(raw):{users:[],sessions:null,plans:SAMPLE_PLANS,cart:[],orders:[],weight:[],workouts:[]};
}
let state=loadState();
function saveState(){ localStorage.setItem('fittrack_v1',JSON.stringify(state)); }

// =============================
// Render Plans
// =============================
function renderPlans(){
 const list=document.getElementById('plansList');
 list.innerHTML='';
 state.plans.forEach(p=>{
   list.innerHTML+=`
     <div class='col-md-4'>
       <div class='card p-3 h-100'>
         <h5>${p.title}</h5>
         <p>${p.desc}</p>
         <strong>₹${p.price}</strong>
         <ul>${p.features.map(f=><li>${f}</li>).join('')}</ul>
         <button class='btn btn-success btn-sm' onclick="addToCart('${p.id}')">Add</button>
       </div>
     </div>
   `;
 });
}

// =============================
// Cart Functions
// =============================
function addToCart(id){
 if(!state.sessions) return alert('Please login to add to cart');
 if(!state.cart.includes(id)) state.cart.push(id);
 saveState(); renderCart();
}

function renderCart(){
 const box=document.getElementById('cartItems');
 box.innerHTML='';
 let total=0;
 state.cart.forEach(id=>{
   const p=state.plans.find(x=>x.id===id);
   total+=p.price;
   box.innerHTML+=`
     <div class='d-flex justify-content-between mb-2'>
       <div>${p.title}</div>
       <button class='btn btn-danger btn-sm' onclick="removeFromCart('${id}')">Remove</button>
     </div>
   `;
 });
 document.getElementById('cartTotal').textContent='₹'+total;
 document.getElementById('cartCount').textContent=state.cart.length;
}

function removeFromCart(id){
 state.cart=state.cart.filter(x=>x!==id);
 saveState(); renderCart();
}

// =============================
// Place Order
// =============================
document.getElementById('placeOrderBtn').onclick=()=>{
 if(!state.sessions) return alert('Login first');
 if(state.cart.length===0) return alert('Cart is empty');

 const amount=state.cart.reduce((s,id)=>s+(state.plans.find(p=>p.id===id).price),0);
 state.orders.push({title:Subscription,amount,date:new Date().toLocaleString()});
 state.cart=[];
 saveState(); renderCart(); renderOrders();
 alert('Order placed successfully!');
};

function renderOrders(){
 const list=document.getElementById('ordersList');
 list.innerHTML='';
 state.orders.forEach(o=>{
   list.innerHTML+=<li class='list-group-item'>${o.title} — ₹${o.amount}</li>;
 });
}

// =============================
// Login / Signup
// =============================
document.getElementById('btnOpenLogin').onclick=()=>{
 const modal=new bootstrap.Modal(document.getElementById('authModal'));
 modal.show();
};

document.getElementById('toggleSignup').onchange=e=>{
 document.getElementById('nameRow').style.display=e.target.checked?'block':'none';
 document.getElementById('authTitle').textContent=e.target.checked?'Signup':'Login';
};

document.getElementById('authForm').onsubmit=e=>{
 e.preventDefault();
 const email=emailInput.value;
 const pw=passInput.value;
 const isSign=toggleSignup.checked;

 if(isSign){
   if(state.users.find(u=>u.email===email)) return alert('Account already exists');
   state.users.push({email,pw,name:nameInput.value});
   state.sessions={email};
 }
 else{
   const u=state.users.find(u=>u.email===email && u.pw===pw);
   if(!u) return alert('Invalid email or password');
   state.sessions={email};
 }
 saveState(); location.reload();
};

// =============================
// Weight Tracker
// =============================
weightForm.onsubmit=e=>{
 e.preventDefault();
 state.weight.push({weight:weightInput.value,date:weightDate.value||new Date().toISOString().slice(0,10)});
 saveState(); renderWeight(); renderProgress();
 weightForm.reset();
};

function renderWeight(){
 const ul=document.getElementById('weightList');
 ul.innerHTML='';
 state.weight.forEach(w=>{
   ul.innerHTML+=<li class='list-group-item'>${w.date} — ${w.weight} kg</li>;
 });
}

// =============================
// Workout Tracker
// =============================
workoutForm.onsubmit=e=>{
 e.preventDefault();
 state.workouts.push({type:workoutType.value,mins:workoutMins.value,date:new Date().toISOString()});
 saveState(); renderWorkouts(); renderProgress();
 workoutForm.reset();
};

function renderWorkouts(){
 const ul=document.getElementById('workoutList');
 ul.innerHTML='';
 state.workouts.forEach(w=>{
   ul.innerHTML+=<li class='list-group-item'>${w.type} — ${w.mins} mins</li>;
 });
}

// =============================
// Progress Summary
// =============================
function renderProgress(){
 // Weight
 if(state.weight.length===0) {
   latestWeight.textContent='No entries yet';
   weightProgress.style.width='0%';
   weightProgress.textContent='0%';
 }
 else{
   const last=state.weight[state.weight.length-1].weight;
   latestWeight.textContent=last + ' kg';
   weightProgress.style.width='50%';
   weightProgress.textContent='50%';
 }

 // Workout summary
 const sevenDaysAgo=Date.now()-(7*24*60*60*1000);
 const recent=state.workouts.filter(w=> new Date(w.date).getTime() >= sevenDaysAgo);
 if(recent.length===0) workoutSummary.textContent='No recent workouts';
 else workoutSummary.textContent=recent.length+' sessions';
}

// =============================
// Initialize
// =============================
function init(){
 renderPlans();
 renderCart();
 renderOrders();
 renderWeight();
 renderWorkouts();
 renderProgress();
 document.getElementById('year')?.textContent=new Date().getFullYear();
}
init();