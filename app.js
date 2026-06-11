// =============================================
// TEMPLATE ENGINE SHIFT LOGIC (Teacher Panel)
// =============================================
function handleTemplateChange() {
  const selectedType = document.getElementById('quest-template-type').value;
  const customBox = document.getElementById('custom-fields');
  const mcBox = document.getElementById('multiple-choice-fields');
  const titleInput = document.getElementById('quest-name');

  if (selectedType === 'multiple-choice') {
    customBox.style.display = 'none';
    mcBox.style.display = 'block';
    titleInput.value = "📝 Multiple Choice Quiz";
  } else {
    customBox.style.display = 'block';
    mcBox.style.display = 'none';
    titleInput.value = "";
  }
}

// =============================================
// OVERWRITE & UPGRADE: ADD QUEST (Teacher Panel)
// =============================================
function addQuest() {
  const title = document.getElementById('quest-name').value.trim();
  const pointsVal = document.getElementById('quest-points').value.trim();
  const templateType = document.getElementById('quest-template-type').value;

  if (!title || !pointsVal) {
    alert('Please fill in Title and Points fields!');
    return;
  }
  if (parseInt(pointsVal) <= 0) {
    alert('Points reward must be greater than 0!');
    return;
  }

  // Compile layout payload data structure
  let questPayload = {
    id: 'quest_' + Date.now(),
    title: title,
    points: parseInt(pointsVal),
    type: templateType
  };

  if (templateType === 'multiple-choice') {
    questPayload.question = document.getElementById('mc-q1').value.trim() || "Sample Test Question";
    questPayload.options = [
      document.getElementById('mc-q1-a').value.trim() || "Option A",
      document.getElementById('mc-q1-b').value.trim() || "Option B",
      document.getElementById('mc-q1-c').value.trim() || "Option C",
      document.getElementById('mc-q1-d').value.trim() || "Option D"
    ];
    questPayload.correctAnswer = document.getElementById('mc-q1-correct').value;
  } else {
    questPayload.instructions = document.getElementById('quest-desc').value.trim() || "Complete tasks specified by your facilitator.";
  }

  // Save to shared environment cluster arrays
  let distributedQuests = JSON.parse(localStorage.getItem('live_quests')) || [];
  distributedQuests.push(questPayload);
  localStorage.setItem('live_quests', JSON.stringify(distributedQuests));

  alert(`🚀 Quest "${title}" deployed live successfully!`);
  
  // Reset input UI fields cleanly
  document.getElementById('quest-name').value = '';
  document.getElementById('quest-points').value = '';
  if(document.getElementById('quest-desc')) document.getElementById('quest-desc').value = '';
  if(document.getElementById('mc-q1')) {
    document.getElementById('mc-q1').value = '';
    document.getElementById('mc-q1-a').value = '';
    document.getElementById('mc-q1-b').value = '';
    document.getElementById('mc-q1-c').value = '';
    document.getElementById('mc-q1-d').value = '';
  }

  // Refresh teacher dashboard visual view list immediately
  renderTeacherQuestList();
}

// =============================================
// RENDER LIVE DEPLOYED QUESTS (Teacher View)
// =============================================
function renderTeacherQuestList() {
  const container = document.getElementById('quest-list');
  const countEl = document.getElementById('quest-count');
  if (!container) return;

  const deployedQuests = JSON.parse(localStorage.getItem('live_quests')) || [];
  
  if (countEl) countEl.textContent = deployedQuests.length;

  if (deployedQuests.length === 0) {
    container.innerHTML = `<p style="color:#aaa; font-style:italic; padding:10px;">No deployed quests available yet.</p>`;
    return;
  }

  container.innerHTML = '';
  deployedQuests.forEach(quest => {
    const card = document.createElement('div');
    card.className = 'quest-card';
    card.innerHTML = `
      <span>${quest.type === 'multiple-choice' ? '📝' : '📌'} ${quest.title}</span>
      <span class="points-badge">${quest.points} points</span>
    `;
    container.appendChild(card);
  });
}

// Attach the render execution loop directly to the bottom of the window.onload loop
const existingLoader = window.onload;
window.onload = async function() {
  if (existingLoader) await existingLoader();
  renderTeacherQuestList();
};
