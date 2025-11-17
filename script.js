// FitTrack — modal-based version (brown modals)
// Local storage key
const STORAGE_KEY = "fittrack_workouts_v1_modal";

let workouts = [];
let calChart = null;
let calChartCtx = null;

// Expose modal openers globally
function openAddModal(){
  new bootstrap.Modal(document.getElementById("addModal")).show();
}
function openLogModal(){
  renderLogList();
  new bootstrap.Modal(document.getElementById("logModal")).show();
}
function openStatsModal(){
  renderStats();
  new bootstrap.Modal(document.getElementById("statsModal")).show();
}

// Run after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // load data
  workouts = loadWorkouts();

  // prepare chart context
  const canvas = document.getElementById("mCalChart");
  if (canvas) {
    calChartCtx = canvas.getContext("2d");
    prepareEmptyChart();
  }

  // bind add modal form
  const modalForm = document.getElementById("modalWorkoutForm");
  if (modalForm) {
    modalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      addWorkoutFromModal();
    });
  }

  // log modal controls
  const searchInput = document.getElementById("mSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => renderLogList());
  }
  const clearBtn = document.getElementById("mClearAll");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!confirm("Clear all workouts?")) return;
      workouts = [];
      saveWorkouts();
      renderLogList();
      renderStats();
      showToast("All cleared");
    });
  }
  const exportBtn = document.getElementById("mExport");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportCSV);
  }

  // BMI calc in stats modal
  const bmiBtn = document.getElementById("mCalcBMI");
  if (bmiBtn) {
    bmiBtn.addEventListener("click", () => {
      const kg = parseFloat(document.getElementById("mWeight").value);
      const cm = parseFloat(document.getElementById("mHeight").value);
      const out = document.getElementById("mBmiResult");
      if (!kg || !cm) { out.innerText = "Enter weight (kg) and height (cm)."; return; }
      const m = cm / 100; const bmi = kg / (m * m);
      let cat = "";
      if (bmi < 18.5) cat = "Underweight"; else if (bmi < 25) cat = "Normal";
      else if (bmi < 30) cat = "Overweight"; else cat = "Obese";
      out.innerText = BMI: ${bmi.toFixed(1)} — ${cat};
    });
  }

  // initial updates (if modals opened later)
  renderLogList();
  renderStats();
});

// Storage helpers
function loadWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}
function saveWorkouts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

// Add workout from modal
function addWorkoutFromModal() {
  const date = document.getElementById("mInputDate").value || new Date().toISOString().slice(0,10);
  const type = document.getElementById("mInputType").value;
  const duration = parseInt(document.getElementById("mInputDuration").value, 10);
  const calories = parseInt(document.getElementById("mInputCalories").value, 10);

  if (!type || !duration || !calories) {
    showToast("Please fill all fields.");
    return;
  }

  const item = { id: Date.now(), date, type, duration, calories };
  workouts.push(item);
  saveWorkouts();

  // reset and update
  const form = document.getElementById("modalWorkoutForm");
  if (form) form.reset();

  renderLogList();
  renderStats();

  // close modal
  const modalEl = document.getElementById("addModal");
  const modalObj = bootstrap.Modal.getInstance(modalEl);
  if (modalObj) modalObj.hide();

  showToast("Workout added");
}

// Render log list
function renderLogList() {
  const q = (document.getElementById("mSearchInput") && document.getElementById("mSearchInput").value.trim().toLowerCase()) || "";
  const list = workouts.slice().reverse().filter(w => {
    if (!q) return true;
    return w.type.toLowerCase().includes(q) || (w.date && w.date.includes(q));
  });

  const container = document.getElementById("mLogList");
  if (!container) return;

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

// Delete workout
function deleteWorkout(id) {
  if (!confirm("Delete this workout?")) return;
  workouts = workouts.filter(w => w.id !== id);
  saveWorkouts();
  renderLogList();
  renderStats();
  showToast("Deleted");
}

// Stats: totals + chart
function renderStats() {
  const totalSessions = workouts.length;
  const totalCalories = workouts.reduce((s, w) => s + (w.calories || 0), 0);
  const elSessions = document.getElementById("mTotalSessions");
  const elCalories = document.getElementById("mTotalCalories");
  if (elSessions) elSessions.innerText = totalSessions;
  if (elCalories) elCalories.innerText = totalCalories;
  updateChart();
}

// Chart helpers
function prepareEmptyChart() {
  if (!calChartCtx) return;
  calChart = new Chart(calChartCtx, {
    type: "line",
    data: { labels: [], datasets: [{ label: "Calories", data: [], tension: 0.3, fill: true, backgroundColor: "rgba(90,62,43,0.08)", borderColor: "#7a4f3a", pointRadius: 3 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: "#3b2a1c" } }, y: { beginAtZero: true } } }
  });
}

function updateChart() {
  if (!calChart) {
    // try to initialize if context exists
    if (calChartCtx) prepareEmptyChart();
    else return;
  }
  const byDate = {};
  workouts.forEach(w => { byDate[w.date] = (byDate[w.date] || 0) + (w.calories || 0); });
  const dates = Object.keys(byDate).sort();
  const labels = dates.slice(-10);
  const data = labels.map(d => byDate[d] || 0);
  calChart.data.labels = labels;
  calChart.data.datasets[0].data = data;
  calChart.update();
}

// CSV export
function exportCSV() {
  if (!workouts.length) { alert("No workouts to export."); return; }
  const rows = [["Date","Activity","Duration(mins)","Calories"]];
  workouts.forEach(w => rows.push([w.date, w.type, w.duration, w.calories]));
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

// Small toast
function showToast(msg) {
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
  setTimeout(() => t.style.opacity = "0", 1300);
  setTimeout(() => t.remove(), 1800);
}

// Escape helper
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}