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
