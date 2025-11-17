// FitTrack — modal-based version (brown modals)
// Data key
const STORAGE_KEY = "fittrack_workouts_v1_modal";

// DOM references will be grabbed on DOMContentLoaded
let workouts = [];

// Chart variables
let calChart = null;
let calChartCtx = null;

// Bootstrap modal instances (not required but helpful)
function openAddModal(){
  new bootstrap.Modal(document.getElementById("addModal")).show();
}
function openLogModal(){
  // refresh list before showing
  renderLogList();
  new bootstrap.Modal(document.getElementById("logModal")).show();
}
function openStatsModal(){
  renderStats();
  new bootstrap.Modal(document.getElementById("statsModal")).show();
}

// Load on startup
document.addEventListener("DOMContentLoaded", () => {
  // load data
  workouts = loadWorkouts();

  // cache chart ctx
  calChartCtx = document.getElementById("mCalChart").getContext("2d");

  // bind add modal form
  const modalForm = document.getElementById("modalWorkoutForm");
  modalForm.addEventListener("submit", e => {
    e.preventDefault();
    addWorkoutFromModal();
  });

  // log modal controls
  document.getElementById("mSearchInput").addEventListener("input", () => renderLogList());
  document.getElementById("mClearAll").addEventListener("click", () => {
    if(!confirm("Clear all workouts?")) return;
    workouts = [];
    saveWorkouts();
    renderLogList();
    renderStats();
  });
  document.getElementById("mExport").addEventListener("click", exportCSV);

  // BMI calculation in stats modal
  document.getElementById("mCalcBMI").addEventListener("click", () => {
    const kg = parseFloat(document.getElementById("mWeight").value);
    const cm = parseFloat(document.getElementById("mHeight").value);
    const out = document.getElementById("mBmiResult");
    if(!kg || !cm){ out.innerText = "Enter weight (kg) and height (cm)."; return; }
    const m = cm / 100, bmi = kg / (m*m);
    let cat = "";
    if(bmi < 18.5) cat = "Underweight";
    else if(bmi < 25) cat = "Normal";
    else if(bmi < 30) cat = "Overweight";
    else cat = "Obese";
    out.innerText = BMI: ${bmi.toFixed(1)} — ${cat};
  });

  // render initial (nothing shown until modals open)
  // but prepare chart object (empty) so it updates quickly
  prepareEmptyChart();
});

// Storage helpers
function loadWorkouts(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error(e);
    return [];
  }
}
function saveWorkouts(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

// Add workout from modal inputs
function addWorkoutFromModal(){
  const date = document.getElementById("mInputDate").value || new Date().toISOString().slice(0,10);
  const type = document.getElementById("mInputType").value;
  const duration = parseInt(document.getElementById("mInputDuration").value);
  const calories = parseInt(document.getElementById("mInputCalories").value);

  if(!type || !duration || !calories){
    alert("Please fill all fields.");
    return;
  }

  const item = { id: Date.now(), date, type, duration, calories };
  workouts.push(item);
  saveWorkouts();

  // reset form
  document.getElementById("modalWorkoutForm").reset();
  // update displays
  renderLogList();
  renderStats();
  // close add modal
  bootstrap.Modal.getInstance(document.getElementById("addModal")).hide();
  showToast("Workout added");
}

// Render log list inside log modal
function renderLogList(){
  const q = document.getElementById("mSearchInput").value.trim().toLowerCase();
  const list = workouts.slice().reverse().filter(w => {
    if(!q) return true;
    return w.type.toLowerCase().includes(q) || (w.date && w.date.includes(q));
  });

  const container = document.getElementById("mLogList");
  container.innerHTML = list.map(w => `
    <div class="list-group-item">
      <div>
        <div class="fw-bold">${escapeHtml(w.type)}</div>
        <div class="meta">${escapeHtml(w.date)} • ${w.duration} mins • ${w.calories} kcal</div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-danger" onclick="deleteWorkout(${w.id})">Delete</button>
      </div>
    </div>
  `).join("") || <div class="text-muted">No workouts logged yet.</div>;
}

// Delete single workout
function deleteWorkout(id){
  if(!confirm("Delete this workout?")) return;
  workouts = workouts.filter(w => w.id !== id);
  saveWorkouts();
  renderLogList();
  renderStats();
  showToast("Deleted");
}

// Stats rendering
function renderStats(){
  // totals
  const totalSessions = workouts.length;
  const totalCalories = workouts.reduce((s,w) => s + (w.calories||0), 0);
  document.getElementById("mTotalSessions").innerText = totalSessions;
  document.getElementById("mTotalCalories").innerText = totalCalories;

  // update chart
  updateChart();
}

// Prepare an empty Chart.js chart
function prepareEmptyChart(){
  calChart = new Chart(calChartCtx, {
    type: "line",
    data: { labels: [], datasets: [{ label: "Calories", data: [], tension:0.3, fill:true, backgroundColor:"rgba(90,62,43,0.08)", borderColor:"#7a4f3a", pointRadius:3 }] },
    options: { responsive:true, plugins:{legend:{display:false}}, scales:{ x:{ ticks:{ color:"#3b2a1c" }}, y:{ beginAtZero:true } } }
  });
}

// Update chart using workouts aggregated by date (last 10)
function updateChart(){
  const byDate = {};
  workouts.forEach(w => { byDate[w.date] = (byDate[w.date] || 0) + (w.calories||0); });
  const dates = Object.keys(byDate).sort();
  const labels = dates.slice(-10);
  const data = labels.map(d => byDate[d] || 0);

  calChart.data.labels = labels;
  calChart.data.datasets[0].data = data;
  calChart.update();
}

// CSV export (used from log modal)
function exportCSV(){
  if(!workouts.length){ alert("No workouts to export."); return; }
  const rows = [["Date","Activity","Duration(mins)","Calories"]];
  workouts.forEach(w => rows.push([w.date,w.type,w.duration,w.calories]));
  const csv = rows.map(r => r.map(cell => "${String(cell).replace(/"/g,'""')}").join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fittrack_export_${new Date().toISOString().slice(0,10)}.csv;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Exported CSV");
}

// Utility: show small toast
function showToast(msg){
  const t = document.createElement("div");
  t.innerText = msg;
  t.style.position = "fixed";
  t.style.right = "20px";
  t.style.bottom = "30px";
  t.style.padding = "10px 16px";
  t.style.borderRadius = "10px";
  t.style.background = "#7a4f3a";
  t.style.color = "#f6e8d8";
  t.style.fontWeight = "700";
  t.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity = "0", 1300);
  setTimeout(()=> t.remove(), 1800);
}

// Simple escape for display
function escapeHtml(s){
  return String(s||"").replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}