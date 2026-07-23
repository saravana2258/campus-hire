// ============================================
// CAMPUS PORTAL — Frontend JavaScript
// Connects to Spring Boot REST API (port 8080)
// ============================================
const API_BASE_URL = "https://campus-hire-ags7.onrender.com/api";

// ============================================
// NAVIGATION
// ============================================
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${pageName}`).classList.add('active');
  document.getElementById(`nav-${pageName}`).classList.add('active');

  // Load page data
  if (pageName === 'dashboard') loadDashboard();
  if (pageName === 'students') loadStudents();
  if (pageName === 'companies') loadCompanies();
  if (pageName === 'applications') loadApplications();
  if (pageName === 'placements') loadPlacements();
}

// Sidebar nav click events
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    showPage(item.dataset.page);
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
  });
});

// Mobile hamburger
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Set date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// ============================================
// API HELPERS
// ============================================
async function apiGet(url) {
  const res = await fetch(API + url);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

async function apiPost(url, data) {
  const res = await fetch(API + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPut(url, data) {
  const res = await fetch(API + url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(API + url, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
  try {
    const [students, companies, apps] = await Promise.all([
      apiGet('/students'),
      apiGet('/companies'),
      apiGet('/applications')
    ]);

    document.getElementById('stat-students').textContent = students.length;
    document.getElementById('stat-companies').textContent = companies.length;
    document.getElementById('stat-applications').textContent = apps.length;
    document.getElementById('stat-placed').textContent =
      students.filter(s => s.status === 'Placed').length;

    // Recent Applications
    const recDiv = document.getElementById('recentApplications');
    if (apps.length === 0) {
      recDiv.innerHTML = '<div class="empty-state">No applications yet.</div>';
    } else {
      recDiv.innerHTML = apps.slice(-5).reverse().map(a => `
        <div class="recent-item">
          <div class="recent-avatar">${a.student.name.charAt(0)}</div>
          <div class="recent-info">
            <div class="recent-name">${a.student.name}</div>
            <div class="recent-sub">${a.company.name} — ${a.role || 'Developer'}</div>
          </div>
          <span class="status-badge ${a.status}">${a.status}</span>
        </div>`).join('');
    }

    // Top Companies
    const compDiv = document.getElementById('topCompanies');
    if (companies.length === 0) {
      compDiv.innerHTML = '<div class="empty-state">No companies added yet.</div>';
    } else {
      compDiv.innerHTML = companies.slice(0, 5).map(c => `
        <div class="company-dash-item">
          <span class="company-dash-name">${c.name}</span>
          <span class="company-dash-pkg">${c.packageLpa} LPA</span>
        </div>`).join('');
    }
  } catch (err) {
    showToast('Could not load dashboard. Is the backend running?', 'error');
  }
}

// ============================================
// STUDENTS
// ============================================
let allStudents = [];

async function loadStudents() {
  try {
    allStudents = await apiGet('/students');
    renderStudents(allStudents);
  } catch {
    showToast('Could not load students.', 'error');
  }
}

function renderStudents(students) {
  const grid = document.getElementById('studentsGrid');
  if (students.length === 0) {
    grid.innerHTML = '<div class="empty-state-full">No students found. Click "+ Add Student" to begin.</div>';
    return;
  }
  grid.innerHTML = students.map(s => `
    <div class="student-card">
      <div class="card-actions">
        <button class="action-btn edit" onclick="editStudent(${s.id})">✏️</button>
        <button class="action-btn delete" onclick="deleteStudent(${s.id})">🗑️</button>
      </div>
      <div class="student-card-top">
        <div class="student-avatar">${s.name.charAt(0).toUpperCase()}</div>
        <div class="student-basic">
          <div class="student-name">${s.name}</div>
          <div class="student-dept">${s.department}</div>
        </div>
      </div>
      <div class="student-meta">
        <span class="meta-tag cgpa">CGPA: ${s.cgpa}</span>
        <span class="meta-tag backlogs">Backlogs: ${s.backlogs}</span>
      </div>
      <div class="student-skills">
        ${(s.skills || '').split(',').filter(Boolean).map(sk =>
          `<span class="skill-tag">${sk.trim()}</span>`).join('')}
      </div>
      <div>
        <span class="status-badge ${s.status}">${s.status}</span>
        <span style="font-size:0.78rem; color:var(--text-muted); margin-left:10px;">${s.email}</span>
      </div>
    </div>`).join('');
}

// Search & filter
document.getElementById('studentSearch').addEventListener('input', filterStudents);
document.getElementById('cgpaFilter').addEventListener('change', filterStudents);
document.getElementById('statusFilter').addEventListener('change', filterStudents);

function filterStudents() {
  const search = document.getElementById('studentSearch').value.toLowerCase();
  const cgpa = parseFloat(document.getElementById('cgpaFilter').value) || 0;
  const status = document.getElementById('statusFilter').value;

  const filtered = allStudents.filter(s =>
    (s.name.toLowerCase().includes(search) ||
     s.department.toLowerCase().includes(search)) &&
    s.cgpa >= cgpa &&
    (status === '' || s.status === status)
  );
  renderStudents(filtered);
}

// Add Student Modal
document.getElementById('addStudentBtn').addEventListener('click', () => {
  document.getElementById('studentModalTitle').textContent = 'Add New Student';
  document.getElementById('studentForm').reset();
  document.getElementById('studentId').value = '';
  openModal('studentModal');
});

document.getElementById('studentForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('studentId').value;
  const data = {
    name: document.getElementById('studentName').value,
    department: document.getElementById('studentDept').value,
    cgpa: parseFloat(document.getElementById('studentCgpa').value),
    backlogs: parseInt(document.getElementById('studentBacklogs').value) || 0,
    email: document.getElementById('studentEmail').value,
    skills: document.getElementById('studentSkills').value,
    status: document.getElementById('studentStatus').value
  };
  try {
    if (id) {
      await apiPut(`/students/${id}`, data);
      showToast('Student updated successfully!');
    } else {
      await apiPost('/students', data);
      showToast('Student added successfully!');
    }
    closeModal('studentModal');
    loadStudents();
    loadDashboard();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
});

async function editStudent(id) {
  const s = allStudents.find(s => s.id === id);
  if (!s) return;
  document.getElementById('studentModalTitle').textContent = 'Edit Student';
  document.getElementById('studentId').value = s.id;
  document.getElementById('studentName').value = s.name;
  document.getElementById('studentDept').value = s.department;
  document.getElementById('studentCgpa').value = s.cgpa;
  document.getElementById('studentBacklogs').value = s.backlogs;
  document.getElementById('studentEmail').value = s.email;
  document.getElementById('studentSkills').value = s.skills || '';
  document.getElementById('studentStatus').value = s.status;
  openModal('studentModal');
}

async function deleteStudent(id) {
  if (!confirm('Delete this student? This cannot be undone.')) return;
  try {
    await apiDelete(`/students/${id}`);
    showToast('Student deleted.');
    loadStudents();
    loadDashboard();
  } catch {
    showToast('Could not delete student.', 'error');
  }
}

// ============================================
// COMPANIES
// ============================================
let allCompanies = [];

async function loadCompanies() {
  try {
    allCompanies = await apiGet('/companies');
    renderCompanies(allCompanies);
  } catch {
    showToast('Could not load companies.', 'error');
  }
}

function renderCompanies(companies) {
  const grid = document.getElementById('companiesGrid');
  if (companies.length === 0) {
    grid.innerHTML = '<div class="empty-state-full">No companies added yet. Click "+ Add Company" to begin.</div>';
    return;
  }
  grid.innerHTML = companies.map(c => `
    <div class="company-card">
      <div class="card-actions">
        <button class="action-btn edit" onclick="editCompany(${c.id})">✏️</button>
        <button class="action-btn delete" onclick="deleteCompany(${c.id})">🗑️</button>
      </div>
      <div class="company-card-top">
        <div class="company-logo">${c.name.charAt(0)}</div>
        <div class="company-name-wrap">
          <div class="company-name">${c.name}</div>
          <div class="company-industry">${c.industry}</div>
        </div>
      </div>
      <div class="company-stats">
        <div class="company-stat">
          <span class="company-stat-val">${c.packageLpa} LPA</span>
          <span class="company-stat-lbl">Package</span>
        </div>
        <div class="company-stat">
          <span class="company-stat-val">${c.cgpaCutoff || 'Any'}</span>
          <span class="company-stat-lbl">Cutoff</span>
        </div>
        <div class="company-stat">
          <span class="company-stat-val">${c.visitDate || 'TBD'}</span>
          <span class="company-stat-lbl">Visit Date</span>
        </div>
      </div>
      <div class="company-roles">🧑‍💻 ${c.roles || 'Roles TBA'}</div>
    </div>`).join('');
}

document.getElementById('addCompanyBtn').addEventListener('click', () => {
  document.getElementById('companyModalTitle').textContent = 'Add New Company';
  document.getElementById('companyForm').reset();
  document.getElementById('companyId').value = '';
  openModal('companyModal');
});

document.getElementById('companyForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('companyId').value;
  const data = {
    name: document.getElementById('companyName').value,
    industry: document.getElementById('companyIndustry').value,
    packageLpa: parseFloat(document.getElementById('companyPackage').value),
    visitDate: document.getElementById('companyDate').value,
    cgpaCutoff: parseFloat(document.getElementById('companyCutoff').value) || null,
    roles: document.getElementById('companyRoles').value
  };
  try {
    if (id) {
      await apiPut(`/companies/${id}`, data);
      showToast('Company updated!');
    } else {
      await apiPost('/companies', data);
      showToast('Company added!');
    }
    closeModal('companyModal');
    loadCompanies();
    loadDashboard();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
});

async function editCompany(id) {
  const c = allCompanies.find(c => c.id === id);
  if (!c) return;
  document.getElementById('companyModalTitle').textContent = 'Edit Company';
  document.getElementById('companyId').value = c.id;
  document.getElementById('companyName').value = c.name;
  document.getElementById('companyIndustry').value = c.industry;
  document.getElementById('companyPackage').value = c.packageLpa;
  document.getElementById('companyDate').value = c.visitDate || '';
  document.getElementById('companyCutoff').value = c.cgpaCutoff || '';
  document.getElementById('companyRoles').value = c.roles || '';
  openModal('companyModal');
}

async function deleteCompany(id) {
  if (!confirm('Delete this company?')) return;
  try {
    await apiDelete(`/companies/${id}`);
    showToast('Company deleted.');
    loadCompanies();
  } catch {
    showToast('Could not delete company.', 'error');
  }
}

// ============================================
// APPLICATIONS (KANBAN BOARD)
// ============================================
let draggedAppId = null;

async function loadApplications() {
  try {
    const apps = await apiGet('/applications');
    const statuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
    statuses.forEach(status => {
      const col = document.getElementById(`cards-${status.toLowerCase()}`);
      const filtered = apps.filter(a => a.status === status);
      document.getElementById(`count-${status.toLowerCase()}`).textContent = filtered.length;
      if (filtered.length === 0) {
        col.innerHTML = '<div class="empty-state">Drop cards here</div>';
      } else {
        col.innerHTML = filtered.map(a => `
          <div class="kanban-card" draggable="true" id="app-${a.id}"
               ondragstart="handleDragStart(event, ${a.id})">
            <button class="kanban-card-delete" onclick="deleteApplication(${a.id})">✕</button>
            <div class="kanban-card-title">${a.student.name}</div>
            <div class="kanban-card-company">🏢 ${a.company.name}</div>
            <div class="kanban-card-role">💼 ${a.role || 'Developer'}</div>
          </div>`).join('');
      }
    });
  } catch {
    showToast('Could not load applications. Is the backend running?', 'error');
  }
}

function handleDragStart(e, appId) {
  draggedAppId = appId;
  document.getElementById(`app-${appId}`).classList.add('dragging');
}

async function handleDrop(e, newStatus) {
  e.preventDefault();
  if (!draggedAppId) return;
  document.querySelectorAll('.kanban-card').forEach(c => c.classList.remove('dragging'));
  try {
    await apiPut(`/applications/${draggedAppId}/status`, { status: newStatus });
    showToast(`Moved to "${newStatus}"!`);
    loadApplications();
    loadDashboard();
  } catch {
    showToast('Could not update status.', 'error');
  }
  draggedAppId = null;
}

async function deleteApplication(id) {
  if (!confirm('Remove this application?')) return;
  try {
    await apiDelete(`/applications/${id}`);
    showToast('Application removed.');
    loadApplications();
    loadDashboard();
  } catch {
    showToast('Could not delete application.', 'error');
  }
}

// New Application Modal
document.getElementById('addApplicationBtn').addEventListener('click', async () => {
  try {
    const [students, companies] = await Promise.all([
      apiGet('/students'), apiGet('/companies')
    ]);
    const sSelect = document.getElementById('appStudent');
    sSelect.innerHTML = '<option value="">Choose Student</option>' +
      students.filter(s => s.status !== 'Placed').map(s =>
        `<option value="${s.id}">${s.name} (${s.department})</option>`).join('');
    const cSelect = document.getElementById('appCompany');
    cSelect.innerHTML = '<option value="">Choose Company</option>' +
      companies.map(c =>
        `<option value="${c.id}">${c.name} — ${c.packageLpa} LPA</option>`).join('');
    document.getElementById('appDate').value = new Date().toISOString().split('T')[0];
    openModal('applicationModal');
  } catch {
    showToast('Load students and companies first.', 'error');
  }
});

document.getElementById('applicationForm').addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    studentId: document.getElementById('appStudent').value,
    companyId: document.getElementById('appCompany').value,
    role: document.getElementById('appRole').value || 'Software Engineer',
    applicationDate: document.getElementById('appDate').value
  };
  try {
    await apiPost('/applications', data);
    showToast('Application submitted!');
    closeModal('applicationModal');
    loadApplications();
    loadDashboard();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
});

// ============================================
// PLACEMENTS
// ============================================
async function loadPlacements() {
  try {
    const offers = await apiGet('/applications/status/Offer');
    const div = document.getElementById('placementsList');
    if (offers.length === 0) {
      div.innerHTML = '<div class="empty-state-full">No placements yet. Move applications to "Offer Received" on the Kanban board.</div>';
      return;
    }
    div.innerHTML = offers.map(a => `
      <div class="placement-card">
        <div class="placement-header">
          <div class="placement-tick">🎉</div>
          <div>
            <div class="placement-student-name">${a.student.name}</div>
            <div class="placement-company">${a.company.name} — ${a.company.industry}</div>
          </div>
        </div>
        <div class="placement-detail">
          <span class="placement-role">💼 ${a.role || 'Software Engineer'}</span>
          <span class="placement-date">💰 ${a.company.packageLpa} LPA</span>
        </div>
      </div>`).join('');
  } catch {
    showToast('Could not load placements.', 'error');
  }
}

// ============================================
// MODAL HELPERS
// ============================================
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close modal on background click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ============================================
// INITIAL LOAD
// ============================================
loadDashboard();
