/* ============================================
   AI ROBOT ODYSSEY — Main Application
   ============================================ */

(function () {
  'use strict';

  // State
  const state = {
    progress: {},          // { stationId: 0-100 }
    completed: new Set(),  // completed station ids
    currentStation: 1,
    panelOpen: false,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
    animatingCamera: false
  };

  // DOM refs
  const $ = (sel) => document.querySelector(sel);
  const viewport = $('#map-viewport');
  const world = $('#map-world');
  const panel = $('#learning-panel');
  const intro = $('#intro');

  // ---------- Persistence ----------
  function loadProgress() {
    try {
      const raw = localStorage.getItem('aiRobotOdyssey');
      if (raw) {
        const data = JSON.parse(raw);
        state.progress = data.progress || {};
        state.completed = new Set(data.completed || []);
        state.currentStation = data.currentStation || 1;
      }
    } catch (e) { /* ignore */ }
  }

  function saveProgress() {
    try {
      localStorage.setItem('aiRobotOdyssey', JSON.stringify({
        progress: state.progress,
        completed: [...state.completed],
        currentStation: state.currentStation
      }));
    } catch (e) { /* ignore */ }
  }

  function getOverallPercent() {
    const total = MISSIONS.length;
    let sum = 0;
    MISSIONS.forEach(m => {
      if (state.completed.has(m.id)) sum += 100;
      else sum += (state.progress[m.id] || 0);
    });
    return Math.round(sum / total);
  }

  // ---------- HUD ----------
  function updateHUD() {
    const pct = getOverallPercent();
    const done = state.completed.size;
    $('#missions-done').textContent = done;
    $('#global-progress').style.width = pct + '%';
    $('#progress-pct').textContent = pct + '%';
    $('#big-progress-fill').style.width = pct + '%';
    $('#big-progress-pct').textContent = pct + '%';

    const m = MISSIONS.find(x => x.id === state.currentStation) || MISSIONS[0];
    $('#current-mission').textContent =
      String(m.id).padStart(2, '0') + ' / 10 — ' + m.titleEn;

    RobotCompanion.updateStage(done);
  }

  // ---------- Stations ----------
  function createStations() {
    const container = $('#stations-container');
    container.innerHTML = '';

    MISSIONS.forEach(m => {
      const node = document.createElement('div');
      node.className = 'station-node' + (m.isFinal ? ' final' : '');
      node.dataset.id = m.id;
      node.style.left = m.x + 'px';
      node.style.top = m.y + 'px';

      const prog = state.progress[m.id] || 0;
      const isDone = state.completed.has(m.id);
      if (isDone) node.classList.add('completed');
      if (m.id === state.currentStation) node.classList.add('active');

      node.innerHTML = `
        <div class="node-ring">
          <span class="node-icon">${m.icon}</span>
        </div>
        <div class="node-num">${String(m.id).padStart(2, '0')}</div>
        <div class="node-title">${m.titleEn}</div>
        <div class="node-title-zh">${m.titleZh}</div>
        <div class="node-desc">${m.shortDesc}</div>
        <div class="node-progress"><div class="node-progress-fill" style="width:${isDone ? 100 : prog}%"></div></div>
      `;

      node.addEventListener('click', (e) => {
        e.stopPropagation();
        selectStation(m.id);
      });

      container.appendChild(node);
    });
  }

  function selectStation(id) {
    state.currentStation = id;
    const m = MISSIONS.find(x => x.id === id);
    if (!m) return;

    // Highlight
    document.querySelectorAll('.station-node').forEach(n => {
      n.classList.toggle('active', parseInt(n.dataset.id) === id);
    });

    // Move camera
    centerOn(m.x, m.y);

    // Move robot
    RobotCompanion.moveTo(m.x, m.y);

    // Open panel
    openPanel(m);

    updateHUD();
    saveProgress();
  }

  // ---------- Camera / Pan / Zoom ----------
  function applyTransform() {
    world.style.transform =
      `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`;
  }

  function centerOn(wx, wy, duration = 0.9) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const targetX = vw / 2 - wx * state.scale;
    const targetY = vh / 2 - wy * state.scale;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      state.offsetX = targetX;
      state.offsetY = targetY;
      applyTransform();
      return;
    }

    state.animatingCamera = true;
    gsap.to(state, {
      offsetX: targetX,
      offsetY: targetY,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: applyTransform,
      onComplete: () => { state.animatingCamera = false; }
    });
  }

  function setupPanZoom() {
    viewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      state.isDragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      viewport.classList.add('dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!state.isDragging || state.animatingCamera) return;
      const dx = e.clientX - state.lastX;
      const dy = e.clientY - state.lastY;
      state.offsetX += dx;
      state.offsetY += dy;
      state.velocityX = dx;
      state.velocityY = dy;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      applyTransform();
    });

    window.addEventListener('mouseup', () => {
      if (!state.isDragging) return;
      state.isDragging = false;
      viewport.classList.remove('dragging');
      // Inertia
      if (Math.abs(state.velocityX) > 2 || Math.abs(state.velocityY) > 2) {
        gsap.to(state, {
          offsetX: state.offsetX + state.velocityX * 8,
          offsetY: state.offsetY + state.velocityY * 8,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: applyTransform
        });
      }
      state.velocityX = 0;
      state.velocityY = 0;
    });

    // Touch
    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        state.isDragging = true;
        state.lastX = e.touches[0].clientX;
        state.lastY = e.touches[0].clientY;
      }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (!state.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - state.lastX;
      const dy = e.touches[0].clientY - state.lastY;
      state.offsetX += dx;
      state.offsetY += dy;
      state.lastX = e.touches[0].clientX;
      state.lastY = e.touches[0].clientY;
      applyTransform();
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
      state.isDragging = false;
    });

    // Wheel zoom
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      const newScale = Math.min(1.6, Math.max(0.45, state.scale + delta));
      // Zoom toward cursor
      const rect = viewport.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const wx = (mx - state.offsetX) / state.scale;
      const wy = (my - state.offsetY) / state.scale;
      state.scale = newScale;
      state.offsetX = mx - wx * state.scale;
      state.offsetY = my - wy * state.scale;
      applyTransform();
    }, { passive: false });
  }

  // ---------- Panel ----------
  function openPanel(m) {
    $('#panel-num').textContent = String(m.id).padStart(2, '0') + ' / 10';
    $('#panel-title-en').textContent = m.titleEn;
    $('#panel-title-zh').textContent = m.titleZh;
    $('#panel-desc').textContent = m.fullDesc;
    $('#panel-mission').textContent = m.mission;

    const topics = $('#panel-topics');
    topics.innerHTML = m.topics.map(t => `<li>${t}</li>`).join('');

    // Lab
    renderLab(m);

    const prog = state.completed.has(m.id) ? 100 : (state.progress[m.id] || 0);
    $('#station-progress-fill').style.width = prog + '%';

    const btn = $('#start-mission-btn');
    if (state.completed.has(m.id)) {
      btn.textContent = 'MISSION COMPLETE ✓';
      btn.classList.add('completed');
    } else {
      btn.textContent = 'START MISSION →';
      btn.classList.remove('completed');
    }

    panel.classList.add('open');
    state.panelOpen = true;
  }

  function closePanel() {
    panel.classList.remove('open');
    state.panelOpen = false;
  }

  // ---------- Interactive Labs ----------
  function renderLab(m) {
    const lab = $('#panel-lab');
    lab.innerHTML = '';

    switch (m.labType) {
      case 'prompt':
        lab.innerHTML = `
          <div class="lab-prompt">
            <textarea id="lab-prompt-input" placeholder="Enter a prompt...">A curious robot exploring a neon city at night</textarea>
            <button id="lab-generate-btn">GENERATE →</button>
            <div class="lab-result" id="lab-result">Result will appear here...</div>
          </div>`;
        $('#lab-generate-btn').addEventListener('click', () => {
          const prompt = $('#lab-prompt-input').value.trim();
          const results = [
            `▸ Generated text: "${prompt.slice(0, 40)}..." → A vivid scene unfolds with glowing circuits and soft rain reflections.`,
            `▸ Tokens processed: ${Math.floor(prompt.length * 1.3) + 12} · Embedding dim: 768`,
            `▸ Image latent sampled · Style: cinematic · Seed: ${Math.floor(Math.random() * 99999)}`
          ];
          $('#lab-result').textContent = results[Math.floor(Math.random() * results.length)];
          bumpProgress(m.id, 25);
        });
        break;

      case 'multimodal':
        lab.innerHTML = `
          <div style="text-align:center;font-size:0.8rem;color:var(--text-dim);margin-bottom:10px;">
            📷 Camera · 🎤 Mic · 📝 Text → Multimodal Model
          </div>
          <div class="lab-result" id="lab-mm-result">
            Simulated input: [Image of a desk] + "What objects do you see?"
          </div>
          <button id="lab-mm-btn" style="margin-top:10px;padding:8px 14px;background:rgba(94,234,212,0.12);border:1px solid var(--cyan);color:var(--cyan);font-family:var(--font-mono);font-size:0.75rem;border-radius:6px;cursor:pointer;width:100%;">
            RUN MULTIMODAL REASONING
          </button>`;
        $('#lab-mm-btn').addEventListener('click', () => {
          $('#lab-mm-result').innerHTML = `
            <strong style="color:var(--cyan)">Understanding:</strong><br/>
            Detected: laptop, notebook, coffee cup, window light.<br/>
            Scene: indoor workspace, daytime.<br/>
            Reasoning: User is likely working or studying.`;
          bumpProgress(m.id, 30);
        });
        break;

      case 'agent':
        lab.innerHTML = `
          <div class="lab-agent-loop" id="agent-loop">
            <div class="loop-step" data-step="0">OBSERVE</div>
            <div class="loop-arrow">↓</div>
            <div class="loop-step" data-step="1">THINK</div>
            <div class="loop-arrow">↓</div>
            <div class="loop-step" data-step="2">PLAN</div>
            <div class="loop-arrow">↓</div>
            <div class="loop-step" data-step="3">ACT</div>
            <div class="loop-arrow">↓</div>
            <div class="loop-step" data-step="4">OBSERVE</div>
          </div>
          <button id="lab-agent-btn" style="margin-top:12px;padding:8px 14px;background:rgba(94,234,212,0.12);border:1px solid var(--cyan);color:var(--cyan);font-family:var(--font-mono);font-size:0.75rem;border-radius:6px;cursor:pointer;width:100%;">
            GIVE MISSION: Find object & move
          </button>
          <div class="lab-result" id="lab-agent-result" style="margin-top:8px;font-size:0.7rem;"></div>`;
        let agentStep = 0;
        let agentInterval = null;
        const steps = document.querySelectorAll('#agent-loop .loop-step');
        function tickAgent() {
          steps.forEach(s => s.classList.remove('active'));
          steps[agentStep % 5].classList.add('active');
          agentStep++;
        }
        agentInterval = setInterval(tickAgent, 800);
        tickAgent();
        $('#lab-agent-btn').addEventListener('click', () => {
          $('#lab-agent-result').innerHTML = `
            Mission received.<br/>
            1. OBSERVE: scan scene<br/>
            2. THINK: locate red object<br/>
            3. PLAN: path via open space<br/>
            4. ACT: drive forward 1.2m, turn 15°`;
          bumpProgress(m.id, 35);
        });
        // cleanup when panel closes is approximate
        break;

      case 'vision':
        lab.innerHTML = `
          <div class="lab-cv-sim">
            <div class="cv-scene">
              <div class="cv-obj" style="left:20%;top:30%;width:70px;height:90px;">PERSON 0.96</div>
              <div class="cv-obj" style="left:55%;top:45%;width:55px;height:50px;border-color:var(--violet);color:var(--violet);">CHAIR 0.88</div>
              <div class="cv-obj" style="left:70%;top:60%;width:40px;height:35px;border-color:var(--green);color:var(--green);">CUP 0.91</div>
              <div class="cv-obj" style="left:35%;top:55%;width:50px;height:45px;">ROBOT 0.94</div>
            </div>
          </div>
          <div style="margin-top:8px;font-size:0.7rem;color:var(--text-muted);font-family:var(--font-mono);text-align:center;">
            Simulated YOLO detection · 4 objects
          </div>`;
        bumpProgress(m.id, 15);
        break;

      case 'sensors':
        const sensors = ['Camera', 'Microphone', 'IMU', 'LiDAR', 'Ultrasonic', 'Encoder', 'GPS', 'Gyro'];
        lab.innerHTML = `
          <div class="lab-sensors" id="sensor-grid">
            ${sensors.map(s => `<button class="lab-sensor-btn active" data-sensor="${s}">${s}</button>`).join('')}
          </div>
          <div class="lab-result" id="sensor-status" style="margin-top:10px;font-size:0.75rem;">
            All sensors active · Full world model available
          </div>`;
        lab.querySelectorAll('.lab-sensor-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            btn.classList.toggle('disabled');
            const active = [...lab.querySelectorAll('.lab-sensor-btn.active')].map(b => b.dataset.sensor);
            const lost = sensors.filter(s => !active.includes(s));
            $('#sensor-status').textContent = lost.length
              ? `Offline: ${lost.join(', ')} · Perception degraded`
              : 'All sensors active · Full world model available';
            bumpProgress(m.id, 10);
          });
        });
        break;

      case 'control':
        lab.innerHTML = `
          <div class="lab-control">
            <div class="lab-dpad">
              <button class="up" data-dir="fwd">↑</button>
              <button class="left" data-dir="left">←</button>
              <div class="center">DRIVE</div>
              <button class="right" data-dir="right">→</button>
              <button class="down" data-dir="back">↓</button>
            </div>
            <div class="lab-motor-status" id="motor-status">
              L: 0% &nbsp; R: 0% &nbsp; DIR: —
            </div>
          </div>`;
        const motorMap = {
          fwd: { L: 80, R: 80, dir: 'FORWARD' },
          back: { L: -60, R: -60, dir: 'BACKWARD' },
          left: { L: -40, R: 70, dir: 'LEFT' },
          right: { L: 70, R: -40, dir: 'RIGHT' }
        };
        lab.querySelectorAll('.lab-dpad button[data-dir]').forEach(btn => {
          btn.addEventListener('mousedown', () => {
            const d = motorMap[btn.dataset.dir];
            $('#motor-status').textContent = `L: ${d.L}%  R: ${d.R}%  DIR: ${d.dir}`;
            btn.classList.add('active');
            bumpProgress(m.id, 12);
          });
          btn.addEventListener('mouseup', () => {
            btn.classList.remove('active');
            $('#motor-status').textContent = 'L: 0%  R: 0%  DIR: —';
          });
          btn.addEventListener('mouseleave', () => {
            btn.classList.remove('active');
          });
        });
        break;

      case 'embodied':
        lab.innerHTML = `
          <div style="font-family:var(--font-mono);font-size:0.7rem;line-height:1.8;color:var(--text-dim);text-align:center;">
            PERCEPTION → WORLD MODEL → REASONING<br/>
            ↓<br/>
            ACTION → ENVIRONMENT → PERCEPTION
          </div>
          <div class="lab-result" style="margin-top:12px;text-align:center;">
            Closed-loop embodied interaction active.<br/>
            Robot continuously updates its world model.
          </div>`;
        bumpProgress(m.id, 20);
        break;

      case 'vla':
        lab.innerHTML = `
          <div class="lab-vla-flow">
            <div class="flow-row"><span class="flow-box">CAMERA</span> → <span class="flow-box">VISION ENCODER</span></div>
            <div class="flow-row"><span class="flow-box">"Find the red object"</span> → <span class="flow-box">LANGUAGE MODEL</span></div>
            <div class="flow-row">↓ REASONING ↓</div>
            <div class="flow-row"><span class="flow-box highlight">ACTION TOKENS</span> → <span class="flow-box highlight">ROBOT CONTROL</span></div>
          </div>
          <button id="lab-vla-btn" style="margin-top:12px;padding:8px 14px;background:rgba(94,234,212,0.12);border:1px solid var(--cyan);color:var(--cyan);font-family:var(--font-mono);font-size:0.75rem;border-radius:6px;cursor:pointer;width:100%;">
            RUN VLA PIPELINE
          </button>
          <div class="lab-result" id="lab-vla-result" style="margin-top:8px;"></div>`;
        $('#lab-vla-btn').addEventListener('click', () => {
          $('#lab-vla-result').innerHTML = `
            Camera → objects: [red_cube, table, wall]<br/>
            Language aligns "red object" → red_cube<br/>
            Action tokens: approach(0.8m), grasp()<br/>
            Motors executing...`;
          bumpProgress(m.id, 30);
        });
        break;

      case 'autonomous':
        lab.innerHTML = `
          <div class="lab-arch">
CAMERA  MIC  IMU  LiDAR
    \\    |    |    /
     PERCEPTION
          ↓
     WORLD MODEL
          ↓
      AI AGENT → PLANNER
          ↓
         VLA
          ↓
   ROBOT CONTROLLER
          ↓
   MOTORS / SERVOS
          </div>
          <div class="lab-result" style="margin-top:10px;text-align:center;">
            Full autonomy stack online.<br/>
            Detect → Plan → Act → Learn
          </div>`;
        bumpProgress(m.id, 25);
        break;

      case 'final':
        lab.innerHTML = `
          <div style="font-family:var(--font-mono);font-size:0.65rem;line-height:1.7;color:var(--green);text-align:center;">
                 AUTONOMOUS AI ROBOT<br/><br/>
                      AI AGENT<br/>
               ┌────────┼────────┐<br/>
               ▼        ▼        ▼<br/>
             VLM     MEMORY   PLANNER<br/>
               │<br/>
               ▼<br/>
             VLA<br/>
        ┌──────┴──────┐<br/>
        ▼             ▼<br/>
   PERCEPTION       ACTION<br/>
  Camera Mic IMU  Motor Servo
          </div>
          <div class="lab-result" style="margin-top:12px;text-align:center;color:var(--green);">
            Final architecture ready.<br/>
            Integrate all modules to complete the odyssey.
          </div>`;
        break;

      default:
        lab.innerHTML = '<div class="lab-result">Interactive experiment available in this station.</div>';
    }
  }

  function bumpProgress(id, amount) {
    if (state.completed.has(id)) return;
    const cur = state.progress[id] || 0;
    const next = Math.min(100, cur + amount);
    state.progress[id] = next;
    if (next >= 100) {
      state.completed.add(id);
      state.progress[id] = 100;
    }
    // Update node bar
    const node = document.querySelector(`.station-node[data-id="${id}"]`);
    if (node) {
      const fill = node.querySelector('.node-progress-fill');
      if (fill) fill.style.width = next + '%';
      if (next >= 100) node.classList.add('completed');
    }
    $('#station-progress-fill').style.width = next + '%';
    if (next >= 100) {
      const btn = $('#start-mission-btn');
      btn.textContent = 'MISSION COMPLETE ✓';
      btn.classList.add('completed');
    }
    updateHUD();
    saveProgress();
  }

  // ---------- Mission button ----------
  function setupMissionButton() {
    $('#start-mission-btn').addEventListener('click', () => {
      const id = state.currentStation;
      if (state.completed.has(id)) return;
      // Complete the station
      state.progress[id] = 100;
      state.completed.add(id);
      const node = document.querySelector(`.station-node[data-id="${id}"]`);
      if (node) {
        node.classList.add('completed');
        const fill = node.querySelector('.node-progress-fill');
        if (fill) fill.style.width = '100%';
      }
      $('#station-progress-fill').style.width = '100%';
      const btn = $('#start-mission-btn');
      btn.textContent = 'MISSION COMPLETE ✓';
      btn.classList.add('completed');
      updateHUD();
      saveProgress();
    });
  }

  // ---------- Next mission ----------
  function setupNextButton() {
    $('#next-mission-btn').addEventListener('click', () => {
      const next = Math.min(10, state.currentStation + 1);
      selectStation(next);
    });
  }

  // ---------- Progress overlay ----------
  function setupProgressOverlay() {
    // Click on progress area to open
    $('.hud-right').addEventListener('click', () => {
      renderStationList();
      $('#progress-overlay').classList.add('open');
    });
    $('#close-progress').addEventListener('click', () => {
      $('#progress-overlay').classList.remove('open');
    });
  }

  function renderStationList() {
    const ul = $('#station-list');
    ul.innerHTML = MISSIONS.map(m => {
      let status = '○';
      let cls = '';
      if (state.completed.has(m.id)) {
        status = '✓';
        cls = 'done';
      } else if (m.id === state.currentStation) {
        status = '●';
        cls = 'current';
      }
      return `<li data-id="${m.id}">
        <span class="status ${cls}">${status}</span>
        <span>${String(m.id).padStart(2, '0')} ${m.titleEn}</span>
      </li>`;
    }).join('');

    ul.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        selectStation(parseInt(li.dataset.id));
        $('#progress-overlay').classList.remove('open');
      });
    });
  }

  // ---------- Mobile journey ----------
  function setupMobile() {
    const container = $('#mobile-journey');
    container.innerHTML = MISSIONS.map((m, i) => `
      ${i > 0 ? '<div class="mobile-connector">│</div><div class="mobile-connector">▼</div>' : ''}
      <div class="mobile-station" data-id="${m.id}">
        <div class="ms-num">${String(m.id).padStart(2, '0')} / 10 ${state.completed.has(m.id) ? '✓' : ''}</div>
        <div class="ms-title">${m.titleEn}</div>
        <div class="ms-zh">${m.titleZh}</div>
        <div class="ms-desc">${m.shortDesc}</div>
      </div>
    `).join('');

    container.querySelectorAll('.mobile-station').forEach(el => {
      el.addEventListener('click', () => {
        selectStation(parseInt(el.dataset.id));
      });
    });
  }

  // ---------- Final modules ----------
  function setupFinalModules() {
    const container = $('#final-modules');
    const final = MISSIONS[9];
    container.style.left = final.x + 'px';
    container.style.top = final.y + 'px';

    const modules = [
      { text: 'VISION', dx: -140, dy: -80 },
      { text: 'LANGUAGE', dx: 100, dy: -90 },
      { text: 'MEMORY', dx: -160, dy: 20 },
      { text: 'PLANNING', dx: 120, dy: 10 },
      { text: 'WORLD MODEL', dx: -130, dy: 100 },
      { text: 'VLA', dx: 110, dy: 90 },
      { text: 'CONTROL', dx: -40, dy: 130 },
      { text: 'SENSORS', dx: 50, dy: -130 }
    ];

    modules.forEach(mod => {
      const el = document.createElement('div');
      el.className = 'final-module';
      el.textContent = mod.text;
      el.style.left = mod.dx + 'px';
      el.style.top = mod.dy + 'px';
      container.appendChild(el);
    });
  }

  // ---------- Intro Animation ----------
  function playIntro() {
    const core = $('.intro-core');
    const title = $('.intro-title');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      intro.style.display = 'none';
      document.querySelectorAll('.station-node').forEach(n => n.style.opacity = 1);
      const rc = document.getElementById('robot-companion');
      if (rc) rc.style.opacity = 1;
      $('#final-modules').classList.add('visible');
      finishIntro();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(intro, {
          opacity: 0,
          duration: 0.6,
          onComplete: () => {
            intro.style.display = 'none';
            finishIntro();
          }
        });
      }
    });

    tl.to(core, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' })
      .to(core, { scale: 1.8, duration: 0.4, ease: 'power1.inOut' })
      .to(core, { scale: 1, boxShadow: '0 0 60px #5eead4, 0 0 120px rgba(94,234,212,0.3)', duration: 0.5 })
      .to(title, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3')
      .to({}, { duration: 1.2 }); // hold
  }

  function finishIntro() {
    // Draw route
    RouteSystem.drawPath(2.2).then(() => {
      // Reveal stations sequentially
      const nodes = document.querySelectorAll('.station-node');
      nodes.forEach((n, i) => {
        gsap.fromTo(n,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.4, delay: i * 0.08, ease: 'back.out(1.4)' }
        );
      });

      // Show final modules
      setTimeout(() => {
        $('#final-modules').classList.add('visible');
      }, nodes.length * 80 + 400);

      // Center on first station & reveal robot
      setTimeout(() => {
        const first = MISSIONS[0];
        centerOn(first.x, first.y, 1.2);
        RobotCompanion.moveTo(first.x, first.y);
        gsap.to('#robot-companion', { opacity: 1, duration: 0.8 });
      }, 800);
    });
  }

  // ---------- Panel close ----------
  function setupPanelClose() {
    $('#panel-close').addEventListener('click', closePanel);
    // Click outside on map closes panel
    viewport.addEventListener('click', (e) => {
      if (e.target === viewport || e.target === world || e.target.id === 'particles-canvas') {
        if (state.panelOpen) closePanel();
      }
    });
  }

  // ---------- Init ----------
  function init() {
    loadProgress();

    // Particles
    ParticleSystem.init($('#particles-canvas'));

    // Route
    RouteSystem.init(
      $('#route-path'),
      $('#route-path-bg'),
      $('#energy-particles')
    );

    // Stations
    createStations();

    // Robot
    RobotCompanion.init($('#robot-companion'));
    const first = MISSIONS.find(m => m.id === state.currentStation) || MISSIONS[0];
    RobotCompanion.moveTo(first.x, first.y);
    RobotCompanion.updateStage(state.completed.size);

    // Final modules
    setupFinalModules();

    // Camera
    setupPanZoom();
    // Initial position (will be refined after intro)
    state.scale = 0.85;
    state.offsetX = window.innerWidth / 2 - first.x * state.scale;
    state.offsetY = window.innerHeight / 2 - first.y * state.scale;
    applyTransform();

    // UI
    updateHUD();
    setupMissionButton();
    setupNextButton();
    setupProgressOverlay();
    setupPanelClose();
    setupMobile();

    // Intro
    playIntro();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
