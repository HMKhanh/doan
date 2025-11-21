
const sampleData = [
  { date: "01-04-2025", revenue: 250000, orders: 10, sold: 5 },
  { date: "02-04-2025", revenue: 230000, orders: 11, sold: 6 },
  { date: "03-04-2025", revenue: 250000, orders: 12, sold: 7 },
  { date: "04-04-2025", revenue: 280000, orders: 15, sold: 8 },
  { date: "05-04-2025", revenue: 300000, orders: 18, sold: 9 },
  { date: "15-03-2025", revenue: 150000, orders: 6,  sold: 3 },
  { date: "05-04-2024", revenue: 120000, orders: 5,  sold: 4 }
];

// ---- DOM refs ----
const selDay = document.getElementById('date');
const selMonth = document.getElementById('month');
const selYear = document.getElementById('year');
const btn = document.getElementById('btnThongKe');
const tbody = document.getElementById('data-body');
const canvas = document.getElementById('statChart');

// normalize first placeholder option values (in case HTML placeholders are text-only)
if (selDay && selDay.options && selDay.options[0]) selDay.options[0].value = "";
if (selMonth && selMonth.options && selMonth.options[0]) selMonth.options[0].value = "";
if (selYear && selYear.options && selYear.options[0]) selYear.options[0].value = "";

// ---- populate flags to avoid duplicate filling ----
let daysFilled = false;
let monthsFilled = false;
let yearsFilled = false;

// ---- helpers ----
const pad2 = n => String(n).padStart(2, '0');
const parseDMY = (s) => {
  const p = s.split('-');
  return { d: p[0], m: p[1], y: p[2] };
};
const formatCurrency = v => v.toLocaleString('vi-VN');

// ---- populate functions (called on focus/click) ----
function populateDays() {
  if (daysFilled) return;
  for (let d = 1; d <= 31; d++) {
    const o = document.createElement('option');
    o.value = pad2(d);
    o.textContent = d;
    selDay.appendChild(o);
  }
  daysFilled = true;
}

function populateMonths() {
  if (monthsFilled) return;
  for (let m = 1; m <= 12; m++) {
    const o = document.createElement('option');
    o.value = pad2(m);
    o.textContent = m;
    selMonth.appendChild(o);
  }
  monthsFilled = true;
}

function populateYears() {
  if (yearsFilled) return;
  // derive years from sampleData range, add +/-1 for safety
  const years = Array.from(new Set(sampleData.map(r => parseInt(parseDMY(r.date).y, 10)))).sort();
  const minY = Math.min(...years);
  const maxY = Math.max(...years);
  for (let y = minY - 1; y <= maxY + 1; y++) {
    const o = document.createElement('option');
    o.value = String(y);
    o.textContent = y;
    selYear.appendChild(o);
  }
  yearsFilled = true;
}

// attach to focus/click so options appear when user clicks the select
selDay.addEventListener('focus', populateDays);
selDay.addEventListener('click', populateDays); // some browsers don't focus until click
selMonth.addEventListener('focus', populateMonths);
selMonth.addEventListener('click', populateMonths);
selYear.addEventListener('focus', populateYears);
selYear.addEventListener('click', populateYears);

// ---- render table ----
function renderTable(data) {
  tbody.innerHTML = '';
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="padding:12px;color:#ccc">Không có dữ liệu</td></tr>';
    return;
  }
  const frag = document.createDocumentFragment();
  data.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${formatCurrency(r.revenue)} ₫</td>
      <td>${r.orders}</td>
      <td>${r.sold}</td>
    `;
    frag.appendChild(tr);
  });
  tbody.appendChild(frag);
}

// ---- filter logic ----
function filterBySelections() {
  const day = selDay.value || '';
  const month = selMonth.value || '';
  const year = selYear.value || '';

  return sampleData.filter(row => {
    const p = parseDMY(row.date);
    if (day && p.d !== day) return false;
    if (month && p.m !== month) return false;
    if (year && p.y !== year) return false;
    return true;
  });
}

// ---- optional: simple chart rendering (Chart.js) ----
let chartInstance = null;
function drawChart(data) {
  if (!canvas) return;
  const labels = data.map(r => r.date);
  const revenues = data.map(r => r.revenue);

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = revenues;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Doanh thu',
        data: revenues,
        backgroundColor: 'rgba(6,214,255,0.9)',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });
}

// ---- initial load (populate years early to allow quick selection) ----
populateYears(); // optional: fill years at start
renderTable(sampleData);
drawChart(sampleData);

// ---- button action ----
btn.addEventListener('click', () => {
  const filtered = filterBySelections();
  renderTable(filtered);
  // update chart to reflect filtered results (optional)
  drawChart(filtered.length ? filtered : sampleData);
});
