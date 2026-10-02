/* ============================================
   AI ROBOT ODYSSEY — Route Path & Energy
   ============================================ */

const RouteSystem = (function () {
  let pathEl, pathBgEl;
  let energyContainer;
  let energyDots = [];
  let pathLength = 0;
  let reducedMotion = false;

  function init(path, pathBg, energyEl) {
    pathEl = path;
    pathBgEl = pathBg;
    energyContainer = energyEl;
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Build organic path through station positions
    const points = MISSIONS.map(m => ({ x: m.x, y: m.y }));
    const d = buildSmoothPath(points);

    pathEl.setAttribute('d', d);
    pathBgEl.setAttribute('d', d);

    // Measure length for dash animation
    pathLength = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = pathLength;
    pathEl.style.strokeDashoffset = pathLength;

    if (!reducedMotion) {
      spawnEnergyParticles(points);
    }
  }

  function buildSmoothPath(pts) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      // Catmull-Rom to cubic Bezier approximation
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  function drawPath(duration = 2.5) {
    if (reducedMotion) {
      pathEl.style.strokeDashoffset = 0;
      return Promise.resolve();
    }
    return new Promise(resolve => {
      gsap.to(pathEl, {
        strokeDashoffset: 0,
        duration: duration,
        ease: 'power2.inOut',
        onComplete: resolve
      });
    });
  }

  function spawnEnergyParticles(points) {
    // Create dots that travel along the path
    const count = 14;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'energy-dot';
      energyContainer.appendChild(dot);
      energyDots.push({
        el: dot,
        progress: i / count,
        speed: 0.0008 + Math.random() * 0.0006
      });
    }
    animateEnergy();
  }

  function animateEnergy() {
    if (!pathEl) return;
    const len = pathLength || pathEl.getTotalLength();
    energyDots.forEach(dot => {
      dot.progress += dot.speed;
      if (dot.progress > 1) dot.progress -= 1;
      const pt = pathEl.getPointAtLength(dot.progress * len);
      dot.el.style.left = pt.x + 'px';
      dot.el.style.top = pt.y + 'px';
      dot.el.style.transform = 'translate(-50%, -50%)';
    });
    requestAnimationFrame(animateEnergy);
  }

  return { init, drawPath };
})();
