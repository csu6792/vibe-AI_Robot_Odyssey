/* ============================================
   AI ROBOT ODYSSEY — Robot Companion
   Stages upgrade with overall progress
   ============================================ */

const RobotCompanion = (function () {
  let el = null;
  let currentStage = 1;

  function init(element) {
    el = element;
    updateStage(0);
  }

  function moveTo(x, y) {
    if (!el) return;
    el.style.left = x + 'px';
    el.style.top = (y + 90) + 'px';
  }

  function updateStage(completedCount) {
    // Stage thresholds based on completed stations
    let stage = 1;
    if (completedCount >= 2) stage = 2;   // eyes / camera
    if (completedCount >= 4) stage = 3;   // sensors
    if (completedCount >= 6) stage = 4;   // wheels
    if (completedCount >= 8) stage = 5;   // full autonomous

    if (stage === currentStage) return;
    currentStage = stage;

    el.classList.remove('stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5');
    el.classList.add('stage-' + stage);

    const labels = {
      1: 'AI CORE',
      2: 'SEEING',
      3: 'SENSING',
      4: 'MOBILE',
      5: 'AUTONOMOUS'
    };
    const labelEl = el.querySelector('.robot-label');
    if (labelEl) labelEl.textContent = labels[stage];
  }

  function getStage() {
    return currentStage;
  }

  return { init, moveTo, updateStage, getStage };
})();
