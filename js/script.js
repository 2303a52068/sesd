document.addEventListener("DOMContentLoaded", function () {

// ---------------------- STATE ----------------------
const SAMPLE_PLANS=[
 {id:'p1',title:'Beginner Plan',desc:'4-week plan',price:299,features:['3 workouts/week','Videos']},
 {id:'p2',title:'Strength Builder',desc:'8-week plan',price:799,features:['4 workouts/week','Charts']},
 {id:'p3',title:'Cardio Boost',desc:'6-week plan',price:499,features:['5 sessions/week','Guides']}
];

function load(){ let x=localStorage.getItem('fittrack_v1'); return x?JSON.parse(x):{users:[],sessions:null,plans:SAMPLE_PLANS,cart:[],orders:[],weight:[],workouts:[]}; }
let state = load();
function save(){ localStorage.setItem('fittrack_v1', JSON.stringify(state)); }

// ---------------------- RENDER PLANS ----------------------
function renderPlans(){
 const box=document.getElementById('plansList'); box.innerHTML="";
 state.plans.forEach(p=>{
   box.innerHTML+=`
   <div class='col-md-4'>
     <div class='card p-3'>
       <h5>${p.title}</h5>
       <p>${p.desc}</p>
       <strong>₹${p.price}</strong>
       <ul>${p.features.map(f=><li>${f}</li>).join('')}</ul>
       <button class='btn btn-success btn-sm' onclick="addToCart('${p.id}')">Add</button>
     </div>
   </div>`;
 });
}

// ---------------------- CART ----------------------
window.addToCart=function(id){
 if(!state.sessions) return alert('Login first');
 if(!state.cart.includes(id)) state.cart.push(id);
 save(); renderCart();
}

function renderCart(){
 const box=document.getElementById('cartItems'); box.innerHTML="";
 let total=0;
 state.cart.forEach(id=>{
   const p=state.plans.find(x=>x.id===id);
   total+=p.price;
   box.innerHTML+=<div class='d-flex justify-content-between'><div>${p.title}</div><button class='btn btn-danger btn-sm' onclick="removeFromCart('${id}')">X</button></div>;
 });
 document.getElementById('cartTotal').innerText='₹'+total;
 document.getElementById('cartCount').innerText=state.cart.length;
}

window.removeFromCart=function(id){
 state.cart=state.cart.filter(x=>x!==id);
 save(); renderCart();
}

// ---------------------- ORDERS ----------------------
document.getElementById('placeOrderBtn').onclick=function(){
 if(!state.sessions) return alert('Login first');
 if(state.cart.length===0) return alert('Cart empty');
 const total=state.cart.reduce((s,i)=>s+state.plans.find(p=>p.id===i).price,0);
 state.orders.push({title:'Subscription',amount:total,date:new Date().toLocaleString()});
 state.cart=[];
 save(); renderCart(); renderOrders(); alert('Order placed');
}

function renderOrders(){
 const list=document.getElementById('ordersList'); list.innerHTML="";
 state.orders.forEach(o=> list.innerHTML+=<li class='list-group-item'>${o.title} — ₹${o.amount}</li> );
}

// ---------------------- LOGIN ----------------------
document.getElementById('btnOpenLogin').onclick=function(){
 new bootstrap.Modal(document.getElementById('authModal')).show();
}

document.getElementById('toggleSignup').onchange=function(e){
 document.getElementById('nameRow').style.display=e.target.checked?'block':'none';
}

document.getElementById('authForm').onsubmit=function(e){
 e.preventDefault();
 const email=emailInput.value;
 const pw=passInput.value;
 const signup=toggleSignup.checked;

 if(signup){
   if(state.users.find(u=>u.email===email)) return alert('Already exists');
   state.users.push({email,pw,name:nameInput.value});
   state.sessions={email};
 } else {
   const u=state.users.find(u=>u.email===email && u.pw===pw);
   if(!u) return alert('Invalid');
   state.sessions={email};
 }
 save(); location.reload();
}

// ---------------------- WEIGHT TRACKER ----------------------
document.getElementById('weightForm').onsubmit=function(e){
 e.preventDefault();
 let w=weightInput.value;
 let d=weightDate.value || new Date().toISOString().slice(0,10);
 state.weight.push({w,d});
 save(); renderWeight(); renderProgress();
 weightForm.reset();
}

function renderWeight(){
 let ul=document.getElementById('weightList'); ul.innerHTML="";
 state.weight.forEach(x=> ul.innerHTML+=<li class='list-group-item'>${x.d} — ${x.w} kg</li> );
}

// ---------------------- WORKOUT TRACKER ----------------------
document.getElementById('workoutForm').onsubmit=function(e){
 e.preventDefault();
 let t=workoutType.value;
 let m=workoutMins.value;
 state.workouts.push({t,m,date:new Date().toISOString()});
 save(); renderWorkouts(); renderProgress();
 workoutForm.reset();
}

function renderWorkouts(){
 let ul=document.getElementById('workoutList'); ul.innerHTML="";
 state.workouts.forEach(x=> ul.innerHTML+=<li class='list-group-item'>${x.t} — ${x.m} mins</li> );
}

// ---------------------- PROGRESS ----------------------
function renderProgress(){
 if(state.weight.length===0){
   latestWeight.innerText='No entries yet';
   weightProgress.style.width='0%';
   weightProgress.innerText='0%';
 } else {
   let last = state.weight[state.weight.length-1].w;
   latestWeight.innerText = last + ' kg';
   weightProgress.style.width='50%';
   weightProgress.innerText='50%';
 }

 let seven=Date.now() - 7*24*60*60*1000;
 let recent=state.workouts.filter(w=> new Date(w.date).getTime()>=seven);
 workoutSummary.innerText = recent.length + ' sessions';
}

// ---------------------- INIT ----------------------
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

});