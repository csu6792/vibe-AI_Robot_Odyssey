/* ============================================
   AI ROBOT ODYSSEY — Background Particles
   ============================================ */

const ParticleSystem = (function () {
  let canvas, ctx;
  let particles = [];
  let labels = [];
  let width = 3200;
  let height = 2200;
  let rafId = null;
  let reducedMotion = false;

  const LABELS = [
    'TOKEN', 'VECTOR', 'VISION', 'AGENT', 'ACTION',
    'IMU', 'VLA', 'YOLO', 'MOTOR', 'WORLD MODEL',
    'EMBED', 'PLAN', 'SENSE', 'ACT', 'REASON'
  ];

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    canvas.width = width;
    canvas.height = height;

    // Floating particles
    const count = reducedMotion ? 30 : 80;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.35 + 0.08,
        hue: Math.random() > 0.6 ? 170 : (Math.random() > 0.5 ? 260 : 160)
      });
    }

    // Subtle tech labels
    if (!reducedMotion) {
      for (let i = 0; i < 12; i++) {
        labels.push({
          text: LABELS[Math.floor(Math.random() * LABELS.length)],
          x: Math.random() * width,
          y: Math.random() * height,
          alpha: 0,
          targetAlpha: Math.random() * 0.18 + 0.04,
          life: Math.random() * 400 + 200,
          age: Math.random() * 200
        });
      }
    }

    if (!reducedMotion) {
      loop();
    } else {
      drawOnce();
    }
  }

  function loop() {
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
    });

    labels.forEach(l => {
      l.age++;
      if (l.age < 60) {
        l.alpha = (l.age / 60) * l.targetAlpha;
      } else if (l.age > l.life - 60) {
        l.alpha = ((l.life - l.age) / 60) * l.targetAlpha;
      } else {
        l.alpha = l.targetAlpha;
      }
      if (l.age >= l.life) {
        l.x = Math.random() * width;
        l.y = Math.random() * height;
        l.text = LABELS[Math.floor(Math.random() * LABELS.length)];
        l.age = 0;
        l.life = Math.random() * 400 + 200;
        l.targetAlpha = Math.random() * 0.18 + 0.04;
      }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Soft connections between nearby particles
    ctx.strokeStyle = 'rgba(94,234,212,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.globalAlpha = (1 - d / 120) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.alpha})`;
      ctx.fill();
    });

    labels.forEach(l => {
      if (l.alpha <= 0) return;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(148, 163, 184, ${l.alpha})`;
      ctx.fillText(l.text, l.x, l.y);
    });
  }

  function drawOnce() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.alpha})`;
      ctx.fill();
    });
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
  }

  return { init, destroy };
})();
