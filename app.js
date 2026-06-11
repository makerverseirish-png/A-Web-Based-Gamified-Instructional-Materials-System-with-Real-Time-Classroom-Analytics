// =============================================
// iRISE - Connected to Google Sheets
// =============================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMp1p5VBgV0eSKrhhgTBHTgrd3_GeJ5_CRw2rRr78jAx2Ht0VI0z5q0Idnc2sNfXERMQ/exec';

// =============================================
// STUDENT LOGIN & AUTO-REGISTRATION
// =============================================
async function studentLogin() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();
  let section = document.getElementById('section').value.trim(); 

  if (!user || !pass || !section) {
    alert('Please enter username, password, and section.');
    return;
  }

  // ✨ FIX: Converts dropdown value to match your all-caps Google Sheet tab name perfectly
  if (section === "GRADE 11-STEM" || section === "grade11-stem") {
    section = "GRADE 11-STEM";
  }

  try {
    showLoading('Logging in...');
    
    // Send standard login request to Apps Script backend
    const res = await fetch(`${SCRIPT_URL}?action=login&username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}&section=${encodeURIComponent(section)}`);
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('role', 'student');
      localStorage.setItem('username', user);
      localStorage.setItem('section', section);
      window.location.href = 'student-dashboard.html';
    } else {
      hideLoading();
      // Display the specific message returned by your sheet engine backend
      alert(data.message || 'Invalid username or password. Please try again.');
    }
  } catch (err) {
    hideLoading();
    alert('Connection error. Please check your internet and try again.');
  }
}

// =============================================
// TEACHER LOGIN (hardcoded for security)
// =============================================
function teacherLogin() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();

  if (user === 'teacher' && pass === 'irise2024') {
    localStorage.setItem('role', 'teacher');
    localStorage.setItem('username', user);
    window.location.href = 'teacher-dashboard.html';
  } else {
    alert('Invalid teacher credentials.');
  }
}

// =============================================
// STUDENT DASHBOARD - Load Data
// =============================================
window.onload = async function () {
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('username');
  const section = localStorage.getItem('section');

  const welcomeEl = document.getElementById('welcome-msg');
  if (welcomeEl && name) {
    welcomeEl.textContent = 'Welcome, ' + name + '!';
  }

  if (role === 'student' && name && section) {
    await loadStudentData(name, section);
  }

  if (role === 'teacher') {
    const sectionSelect = document.getElementById('section-select');
    if (sectionSelect) {
      sectionSelect.addEventListener('change', () => {
        loadTeacherData(sectionSelect.value);
      });
    }
  }
};

// =============================================
// LOAD STUDENT DATA FROM GOOGLE SHEETS
// =============================================
async function loadStudentData(username, section) {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getStudents&section=${encodeURIComponent(section)}`);
    const students = await res.json();

    const student = students.find(s => s.name === username);
    if (!student) return;

    const q1El = document.getElementById('quest1-points');
    const q2El = document.getElementById('quest2-points');
    const q3El = document.getElementById('quest3-points');
    const totalEl = document.getElementById('total-points');

    if (q1El) q1El.textContent = (student.quest1 || 0) + ' Points';
    if (q2El) q2El.textContent = (student.quest2 || 0) + ' Points';
    if (q3El) q3El.textContent = (student.quest3 || 0) + ' Points';
    if (totalEl) totalEl.textContent = (student.total || 0) + ' Points';

    const total = student.total || 0;
    const level = Math.floor(total / 100) + 1;
    const levelEl = document.getElementById('level');
    if (levelEl) levelEl.textContent = 'Level ' + level;

    if (total >= 50) unlockBadge(0);
    if (total >= 100) unlockBadge(1);

    loadLeaderboard(students, section);

  } catch (err) {
    console.error('Failed to load student data:', err);
  }
}

// =============================================
// LEADERBOARD - Per Quest Ranking
// =============================================
function loadLeaderboard(students, section) {
  const leaderboardEl = document.getElementById('leaderboard');
  if (!leaderboardEl) return;

  const sorted = [...students]
    .filter(s => s.name)
    .sort((a, b) => (b.total || 0) - (a.total || 0));

  let html = `<h3>🏆 Leaderboard - ${section}</h3>`;
  html += `<table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Quest 1</th>
        <th>Quest 2</th>
        <th>Quest 3</th>
        <th>Total Points</th>
      </tr>
    </thead>
    <tbody>`;

  sorted.forEach((s, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
    html += `<tr>
      <td>${medal}</td>
      <td>${s.name}</td>
      <td>${s.quest1 || '-'}</td>
      <td>${s.quest2 || '-'}</td>
      <td>${s.quest3 || '-'}</td>
      <td><strong>${s.total || 0}</strong></td>
    </tr>`;
  });

  html += '</tbody></table>';
  leaderboardEl.innerHTML = html;
}

// =============================================
// TEACHER - LOAD SECTION DATA
// =============================================
async function loadTeacherData(section) {
  if (!section) return;
  try {
    showLoading('Loading students...');
    const res = await fetch(`${SCRIPT_URL}?action=getStudents&section=${encodeURIComponent(section)}`);
    const students =
