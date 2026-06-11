// =============================================
// TEMPLATE ENGINE SHIFT LOGIC
// =============================================
function handleTemplateChange() {
  const selectedType = document.getElementById('quest-template-type').value;
  const customBox = document.getElementById('custom-fields');
  const mcBox = document.getElementById('multiple-choice-fields');
  const titleInput = document.getElementById('quest-name');

  if (selectedType === 'multiple-choice') {
    if(customBox) customBox.style.display = 'none';
    if(mcBox) mcBox.style.display = 'block';
    titleInput.value = "📝 Multiple Choice Quiz";
  } else {
    if(customBox) customBox.style.display = 'block';
    if(mcBox) mcBox.style.display = 'none';
    titleInput.value = "";
  }
}

// =============================================
// ADD QUEST & DEPLOY
// =============================================
function addQuest() {
  const title = document.getElementById('quest-name').value.trim();
  const pointsVal = document.getElementById('quest-points').value.trim();
  const templateType = document.getElementById('quest-template-type').value;

  if (!title || !pointsVal) {
    alert('Please fill in Title and Points fields!');
    return;
  }

  let questPayload = {
    id: 'quest_' + Date.now(),
    title: title,
    points: parseInt(pointsVal),
    type: templateType
  };

  if (templateType === 'multiple-choice') {
    questPayload.question = document.getElementById('mc-q1')?.value.trim() || "Sample Test Question";
    questPayload.options = [
      document.getElementById('mc-q1-a')?.value.trim() || "Option A",
      document.getElementById('mc-q1-b')?.value.trim() || "Option B",
      document.getElementById('mc-q1-c')?.value.trim() || "Option C",
      document.getElementById('mc-q1-d')?.value.trim() || "Option D"
    ];
    questPayload.correctAnswer = document.getElementById('mc-q1-correct')?.value;
  } else {
    questPayload.instructions = document.getElementById('quest-desc')?.value.trim() || "Complete tasks.";
  }

  let distributedQuests = JSON.parse(localStorage.getItem('live_quests')) || [];
  distributedQuests.push(questPayload);
  localStorage.setItem('live_quests', JSON.stringify(distributedQuests));

  alert(`🚀 Quest "${title}" deployed!`);
  
  // Clear inputs
  document.getElementById('quest-name').value = '';
  document.getElementById('quest-points').value = '';
  
  // Refresh the list immediately
  renderTeacherQuestList();
}

// =============================================
// RENDER LIVE DEPLOYED QUESTS (The Fix)
// =============================================
function renderTeacherQuestList() {
  const container = document.getElementById('quest-list');
  const countEl = document.getElementById('quest-count');
  
  if (!container) return;

  // IMPORTANT: Clearing the container removes the hardcoded HTML samples
  container.innerHTML = ''; 

  const deployedQuests = JSON.parse(localStorage.getItem('live_quests')) || [];
  
  if (countEl) countEl.textContent = deployedQuests.length;

  if (deployedQuests.length === 0) {
    container.innerHTML = `<p style="color:#aaa; font-style:italic; padding:10px;">No deployed quests available yet.</p>`;
    return;
  }

  deployedQuests.forEach(quest => {
    const card = document.createElement('div');
    card.className = 'quest-card';
    // Added specific styling to match your dashboard
    card.style.cssText = "background: #1e1e2f; padding: 12px; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; border: 1px solid #3d3d5c; color: white;";
    card.innerHTML = `
      <span>${quest.type === 'multiple-choice' ? '📝' : '📌'} ${quest.title}</span>
      <span class="points-badge" style="background:#4f46e5; padding:2px 8px; border-radius:4px; font-size:0.85rem;">${quest.points} pts</span>
    `;
    container.appendChild(card);
  });
}

// Ensure the page renders the list on load
window.onload = function() {
    renderTeacherQuestList();
};
