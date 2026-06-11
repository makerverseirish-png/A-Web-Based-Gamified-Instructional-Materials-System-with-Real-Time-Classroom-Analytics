const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMp1p5VBgV0eSKrhhgTBHTgrd3_GeJ5_CRw2rRr78jAx2Ht0VI0z5q0Idnc2sNfXERMQ/exec';

async function studentLogin() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();
  let section = document.getElementById('section').value.trim(); 

  if (!user || !pass || !section) {
    alert('Please enter username, password, and section.');
    return;
  }

  if (section === "GRADE 11-STEM" || section === "grade11-stem") {
    section = "GRADE 11-STEM";
  }

  try {
    showLoading('Logging in...');
    const res = await fetch(`${SCRIPT_URL}?action=login&username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}&section=${encodeURIComponent(section)}`);
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('role', 'student');
      localStorage.setItem('username', user);
      localStorage.setItem('section', section);
      window.location.href = 'student-dashboard.html';
    } else {
      hideLoading();
      alert(data.message || 'Invalid username or password. Please try again.');
    }
  } catch (err) {
    hideLoading();
    alert('Connection error. Please check your internet and try again.');
  }
}

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

async function loadTeacherData(section) {
  if (!section) return;
  try {
    showLoading('Loading students...');
    const res = await fetch(`${SCRIPT_URL}?action=getStudents&section=${encodeURIComponent(section)}`);
    const students = await res.json();
    hideLoading();

    const countEl = document.getElementById('student-count');
    if (countEl) countEl.textContent = students.filter(s => s.name).length;

    const listEl = document.getElementById('student-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    students.filter(s => s.name).forEach(s => {
      const card = document.createElement('div');
      card.className = 'student-card';
      card.innerHTML = `
        <span class="student-name">👤 ${s.name}</span>
        <span class="points-badge">${s.total || 0} Points</span>
        <button class="bonus-btn" onclick="awardBonus('${s.name}', '${section}')">+50 Bonus</button>
      `;
      listEl.appendChild(card);
    });
  } catch (err) {
    hideLoading();
    console.error('Failed to load teacher data:', err);
  }
}

function addQuest() {
  const name = document.getElementById('quest-name').value.trim();
  const pointsVal = document.getElementById('quest-points').value.trim();

  if (!name || !pointsVal) {
    alert('Please fill in both fields!');
    return;
  }
  if (parseInt(pointsVal) <= 0) {
    alert('Points reward must be greater than 0!');
    return;
  }

  const list = document.getElementById('quest-list');
  const card = document.createElement('div');
  card.className = 'quest-card';
  card.innerHTML = `<span>📌 ${name}</span><span class="points-badge">${pointsVal} Points</span>`;
  list.appendChild(card);

  const count = document.getElementById('quest-count');
  if (count) count.textContent = parseInt(count.textContent) + 1;

  document.getElementById('quest-name').value = '';
  document.getElementById('quest-points').value = '';
}

async function awardBonus(username, section) {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=awardBonus&username=${encodeURIComponent(username)}&section=${encodeURIComponent(section)}&bonus=50`);
    const data = await res.json();
    if (data.success) {
      alert(`+50 Bonus Points awarded to ${username}! ✅`);
      loadTeacherData(section);
    }
  } catch (err) {
    console.error('Failed to award bonus:', err);
  }
}

async function completeQuest(btn, questName, points) {
  const username = localStorage.getItem('username');
  const section = localStorage.getItem('section');

  if (!username || !section) return;

  try {
    btn.disabled = true;
    btn.textContent = '⏳ Saving...';

    const res = await fetch(`${SCRIPT_URL}?action=updatePoints&username=${encodeURIComponent(username)}&section=${encodeURIComponent(section)}&quest=${encodeURIComponent(questName)}&points=${points}`);
    const data = await res.json();

    if (data.success) {
      btn.parentElement.classList.add('done');
      btn.textContent = '✅ Done';
      await loadStudentData(username, section);
    } else {
      btn.disabled = false;
      btn.textContent = 'Complete';
      alert('Failed to save. Please try again.');
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Complete';
    alert('Connection error. Please try again.');
  }
}

function unlockBadge(index) {
  const badges = document.querySelectorAll('.badge');
  if (badges[index]) {
    badges[index].classList.remove('locked');
    badges[index].classList.add('unlocked');
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

function showLoading(msg = 'Loading...') {
  let el = document.getElementById('loading-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'loading-overlay';
    el.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); display: flex; align-items: center;
      justify-content: center; z-index: 9999; color: white; font-size: 1.2rem;
    `;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = 'flex';
}

function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = 'none';
}

function toggleSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (!element) return;
  element.classList.toggle('hidden');
  if (!element.classList.contains('hidden')) {
    loadClassListData(sectionId);
  }
}

async function loadClassListData(sectionId) {
  const container = document.getElementById(sectionId);
  container.innerHTML = "<p style='padding:12px;color:#aaa;'>⏳ Fetching student records...</p>";
  
  let sheetSectionQuery = "GRADE 11-STEM";
  if (sectionId === "grade11-stem" || sectionId === "GRADE 11-STEM") {
    sheetSectionQuery = "GRADE 11-STEM";
  }

  try {
    const res = await fetch(`${SCRIPT_URL}?action=getStudents&section=${encodeURIComponent(sheetSectionQuery)}`);
    const students = await res.json();
    container.innerHTML = ""; 
    
    if (!students || students.length === 0 || students.error) {
      container.innerHTML = "<p style='padding:12px;color:#aaa;'>No students found in this section.</p>";
      return;
    }
    
    students.forEach(student => {
      if (!student.name) return;
      const studentWrapper = document.createElement('div');
      studentWrapper.className = 'student-dropdown-wrapper';
      studentWrapper.innerHTML = `
        <div class="student-trigger" onclick="this.nextElementSibling.classList.toggle('hidden')">
          <span>👤 ${student.name}</span>
          <span style="color:#aaa; font-size:0.85rem;">Click to view Quizzes ⬇️</span>
        </div>
        <div class="student-quizzes hidden">
          <div class="quiz-item-link" onclick="reviewStudentQuiz('${student.name}', 'Quiz 1', ${student.quest1 || 0})">
            <span>📝 Quiz 1</span>
            <span class="points-text">Points: ${student.quest1 || 0}</span>
          </div>
          <div class="quiz-item-link" onclick="reviewStudentQuiz('${student.name}', 'Quiz 2', ${student.quest2 || 0})">
            <span>📝 Quiz 2</span>
            <span class="points-text">Points: ${student.quest2 || 0}</span>
          </div>
          <div class="quiz-item-link" onclick="reviewStudentQuiz('${student.name}', 'Quiz 3', ${student.quest3 || 0})">
            <span>📝 Quiz 3</span>
            <span class="points-text">Points: ${student.quest3 || 0}</span>
          </div>
        </div>
      `;
      container.appendChild(studentWrapper);
    });
  } catch (err) {
    console.error("Error loading class list data:", err);
    container.innerHTML = "<p style='padding:12px;color:#ef4444;'>❌ Failed to reach database connection.</p>";
  }
}

function reviewStudentQuiz(studentName, quizName, pointsValue) {
  const modal = document.getElementById('review-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  
  title.innerText = `🔎 Reviewing: ${studentName}`;
  body.innerHTML = `
    <div class="review-summary">ℹ️ Performance Overview – ${quizName}</div>
    <div style="margin-bottom:15px; color:#aaa;"><strong>Score Earned:</strong> ${pointsValue} Points</div>
    <hr style="border-color:#2a2a3e; margin-bottom:15px;">
    <div class="review-question correct">
      <p><strong>Q1: What is the main microcontroller on an Arduino Uno board?</strong></p>
      <p style="margin-top:5px; color:#10b981;">✔️ Response: ATmega328P <span class="status-tag ok">Correct</span></p>
    </div>
    <div class="review-question incorrect">
      <p><strong>Q2: What digital signal level provides exactly 0 Volts?</strong></p>
      <p style="margin-top:5px; color:#ef4444;">❌ Response: HIGH</p>
      <p class="correct-correction">💡 Accurate Answer: LOW <span class="status-tag bad">Incorrect</span></p>
    </div>
  `;
  modal.classList.remove('hidden');
}

function closeReviewModal() {
  document.getElementById('review-modal').classList.add('hidden');
}
