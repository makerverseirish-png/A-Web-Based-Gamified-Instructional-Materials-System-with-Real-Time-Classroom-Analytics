function studentLogin() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  if (user && pass) {
    localStorage.setItem('role', 'student');
    localStorage.setItem('username', user);
    window.location.href = 'student-dashboard.html';
  } else {
    alert('Please enter username and password.');
  }
}

function teacherLogin() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  if (user && pass) {
    localStorage.setItem('role', 'teacher');
    localStorage.setItem('username', user);
    window.location.href = 'teacher-dashboard.html';
  } else {
    alert('Please enter username and password.');
  }
}
let points = 0;

function completeQuest(btn, points) {
  points += points;
  document.getElementById('points-points').textContent = points + ' Points';
  const level = Math.floor(points / 100) + 1;
  document.getElementById('level').textContent = 'Level ' + level;
  btn.parentElement.classList.add('done');
  btn.disabled = true;
  btn.textContent = '✅ Done';

  if (points >= 50) unlockBadge(0);
  if (points >= 100) unlockBadge(1);
}

function unlockBadge(index) {
  const badges = document.querySelectorAll('.badge');
  badges[index].classList.remove('locked');
  badges[index].classList.add('unlocked');
}

window.onload = function() {
  const name = localStorage.getItem('username');
  if (name) document.getElementById('welcome-msg').textContent = 'Welcome, ' + name + '!';
}
function addQuest() {
  const name = document.getElementById('quest-name').value;
  const pointsVal = document.getElementById('quest-points').value;
  if (!name || !pointsVal) { alert('Please fill in both fields!'); return; }
  if (parseInt(pointsVal) <= 0) { alert('points reward must be greater than 0!'); return; }

  const list = document.getElementById('quest-list');
  const card = document.createElement('div');
  card.className = 'quest-card';
  card.innerHTML = `<span>📌 ${name}</span><span class="points-badge">${pointsVal} points</span>`;
  list.appendChild(card);

  const count = document.getElementById('quest-count');
  count.textContent = parseInt(count.textContent) + 1;

  document.getElementById('quest-name').value = '';
  document.getElementById('quest-xp').value = '';
}

function awardXP(btn) {
  const card = btn.parentElement;
  const xpSpan = card.querySelector('.xp-badge');
  const current = parseInt(xpSpan.textContent);
  xpSpan.textContent = (current + 50) + ' XP';
}
