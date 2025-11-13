// Student Performance Analyzer - app.js
// Parses CSV / manual input, computes results, renders charts

const fileInput = document.getElementById('fileInput');
const csvText = document.getElementById('csvText');
const parseBtn = document.getElementById('parseBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsTable = document.querySelector('#resultsTable tbody');
const subjectsHeader = document.getElementById('subjectsHeader');
const totalStudents = document.getElementById('totalStudents');
const avgBar = document.getElementById('avgBar');
const subjectLine = document.getElementById('subjectLine');
const gradePie = document.getElementById('gradePie');
const minAvgInput = document.getElementById('minAvg');
const applyFilterBtn = document.getElementById('applyFilter');
const sortBy = document.getElementById('sortBy');
const exportBtn = document.getElementById('exportBtn');
const loadSample = document.getElementById('loadSample');
const stuName = document.getElementById('stuName');
const marksInput = document.getElementById('marks');
const addStudentBtn = document.getElementById('addStudent');

let currentData = null;

// ---- CSV Parsing ----
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = splitCSVLine(lines[0]);
  const rows = lines.slice(1).map(l => splitCSVLine(l));
  return { headers, rows };
}

function splitCSVLine(line) {
  const res = [];
  let cur = '', inQuotes = false;
  for (let ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { res.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  res.push(cur.trim());
  return res;
}

function isNumeric(n) { return !isNaN(parseFloat(n)) && isFinite(n); }

function assignGrade(avg) {
  if (avg >= 85) return 'A';
  if (avg >= 70) return 'B';
  if (avg >= 50) return 'C';
  if (avg >= 35) return 'D';
  return 'F';
}

// ---- Computation ----
function computeMetrics(headers, rows) {
  const nameCol = 0;
  const subjectNames = headers.slice(1);
  const students = rows.map((r, idx) => {
    const name = r[0] || ('Student ' + (idx + 1));
    const marks = subjectNames.map((_, i) => {
      const raw = r[i + 1];
      return isNumeric(raw) ? Number(raw) : NaN;
    });
    const valid = marks.filter(m => isNumeric(m));
    const total = valid.reduce((a, b) => a + b, 0);
    const avg = valid.length ? total / valid.length : 0;
    const status = marks.every(m => isNumeric(m) ? m >= 35 : false) ? 'Pass' : 'Fail';
    const grade = assignGrade(avg);
    return { name, marks, total, avg: +avg.toFixed(2), grade, status };
  });

  const averages = students.map(s => s.avg);
  const classAvg = averages.length ? +(averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(2) : 0;
  const highestAvg = students.length ? Math.max(...averages) : 0;
  const lowestAvg = students.length ? Math.min(...averages) : 0;
  const gradeDist = students.reduce((acc, s) => { acc[s.grade] = (acc[s.grade] || 0) + 1; return acc; }, {});
  return { students, subjectNames, classAvg, highestAvg, lowestAvg, gradeDist };
}

// ---- Rendering ----
function renderMetrics(metrics) {
  subjectsHeader.textContent = metrics.subjectNames.join(', ');
  resultsTable.innerHTML = '';
  metrics.students.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1}</td><td>${s.name}</td><td>${s.marks.map(m => isNaN(m) ? '-' : m).join(', ')}</td><td>${s.total}</td><td>${s.avg}</td><td>${s.grade}</td><td>${s.status}</td>`;
    resultsTable.appendChild(tr);
  });
  totalStudents.textContent = metrics.students.length;
  drawBarChart(metrics.students);
  drawSubjectLine(metrics);
  drawGradePie(metrics.gradeDist);
}

// ---- Charts ----
function drawBarChart(students) {
  const c = avgBar, ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  if (!students.length) return;
  const padding = 30, chartW = c.width - padding * 2, chartH = c.height - padding * 2;
  ctx.strokeStyle = '#e6eef8';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + chartH);
  ctx.lineTo(padding + chartW, padding + chartH); ctx.stroke();
  const max = Math.max(...students.map(s => s.avg), 100);
  const gap = 8, barW = (chartW - gap * (students.length + 1)) / students.length;
  students.forEach((s, i) => {
    const x = padding + gap + i * (barW + gap);
    const h = (s.avg / max) * chartH, y = padding + chartH - h;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x, y, barW, h);
    ctx.fillStyle = '#000';
    ctx.font = '11px sans-serif';
    const label = s.name.length > 10 ? s.name.slice(0, 10) + '..' : s.name;
    ctx.fillText(label, x, padding + chartH + 12);
    ctx.fillText(s.avg, x, y - 4);
  });
}

function drawSubjectLine(metrics) {
  const c = subjectLine, ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  const { subjectNames, students } = metrics;
  if (!students.length) return;
  const subjectAverages = subjectNames.map((_, si) => {
    const vals = students.map(s => s.marks[si]).filter(m => isNumeric(m));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  const padding = 30, w = c.width - padding * 2, h = c.height - padding * 2;
  ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
  ctx.beginPath();
  subjectAverages.forEach((v, i) => {
    const x = padding + (i / (subjectAverages.length - 1 || 1)) * w;
    const y = padding + h - (v / 100) * h;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.fillStyle = '#000'; ctx.font = '11px sans-serif';
  subjectAverages.forEach((v, i) => {
    const x = padding + (i / (subjectAverages.length - 1 || 1)) * w;
    const y = padding + h - (v / 100) * h;
    ctx.fillText(subjectNames[i], x - 10, padding + h + 12);
    ctx.fillText(v.toFixed(1), x - 10, y - 6);
  });
}

function drawGradePie(gradeDist) {
  const c = gradePie, ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  const keys = Object.keys(gradeDist); if (!keys.length) return;
  const total = keys.reduce((a, k) => a + gradeDist[k], 0);
  let start = -Math.PI / 2, i = 0;
  const palette = ['#10b981', '#60a5fa', '#f59e0b', '#ef4444', '#94a3b8'];
  keys.forEach(k => {
    const val = gradeDist[k], angle = (val / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(c.width / 2, c.height / 2);
    ctx.arc(c.width / 2, c.height / 2, 80, start, start + angle);
    ctx.closePath(); ctx.fillStyle = palette[i % palette.length];
    ctx.fill(); start += angle; i++;
  });
  ctx.font = '12px sans-serif';
  let lx = 10, ly = 10; i = 0;
  keys.forEach(k => {
    ctx.fillStyle = palette[i % palette.length];
    ctx.fillRect(lx, ly, 12, 12);
    ctx.fillStyle = '#000';
    ctx.fillText(`${k} (${gradeDist[k]})`, lx + 18, ly + 11);
    ly += 18; i++;
  });
}

// ---- Events ----
fileInput.addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => { csvText.value = ev.target.result; };
  r.readAsText(f);
});

parseBtn.addEventListener('click', () => {
  const text = csvText.value.trim();
  if (!text) return alert('Paste or upload CSV');
  const { headers, rows } = parseCSV(text);
  if (headers.length < 2) return alert('CSV must have at least Name + 1 subject');
  const metrics = computeMetrics(headers, rows);
  currentData = { headers, rows, metrics };
  renderMetrics(metrics);
  localStorage.setItem('spa_last', text);
});

clearBtn.addEventListener('click', () => {
  csvText.value = '';
  fileInput.value = '';
  resultsTable.innerHTML = '';
  currentData = null;
  totalStudents.textContent = '0';
  avgBar.getContext('2d').clearRect(0, 0, avgBar.width, avgBar.height);
  localStorage.removeItem('spa_last');
});

applyFilterBtn.addEventListener('click', () => {
  if (!currentData) return alert('No data');
  const minAvg = Number(minAvgInput.value) || 0;
  let students = [...currentData.metrics.students];
  students = students.filter(s => s.avg >= minAvg);
  const sorted = sortBy.value;
  if (sorted === 'avg_desc') students.sort((a, b) => b.avg - a.avg);
  if (sorted === 'avg_asc') students.sort((a, b) => a.avg - b.avg);
  if (sorted === 'name') students.sort((a, b) => a.name.localeCompare(b.name));
  const filteredMetrics = { ...currentData.metrics, students };
  renderMetrics(filteredMetrics);
});

exportBtn.addEventListener('click', () => {
  if (!currentData) return alert('No data');
  const hdr = currentData.headers.join(',') + '\n';
  const rows = currentData.rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([hdr + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'export.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

loadSample.addEventListener('click', () => {
  fetch('data/sample.csv').then(r => r.text()).then(t => { csvText.value = t; });
});

// ✅ Manual Input
addStudentBtn.addEventListener('click', () => {
  const name = stuName.value
