/* UC-TECH service-page hero scenes (canvas 2D, no dependencies).
 * Cloud: drifting data network. AI: neural network firing. Cybersecurity: radar sweep.
 * Draws behind the hero copy; pauses off-screen; disabled for reduced motion. */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const hero = document.querySelector(".cloud-geographic-hero");
  if (!hero) return;

  const theme = document.querySelector(".explorer-ai") ? "ai"
    : document.querySelector(".explorer-security") ? "security"
      : document.querySelector(".geographic-panel") ? "cloud" : null;
  if (!theme) return;

  const ORANGE = [255, 106, 0];
  const PEACH = [255, 190, 140];
  const CYAN = [119, 217, 237]; // matches the AI explorer's --signal colour
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  const scene = { cloud: cloudScene, ai: aiScene, security: securityScene }[theme]();
  const canvas = document.createElement("canvas");
  canvas.className = "hero-scene";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  hero.classList.add("has-scene");
  const ctx = canvas.getContext("2d");

  let w = 0, h = 0, dpr = 1, mobile = false;
  const mouse = { x: -9999, y: -9999 };
  // Scenes live in the hero's upper band (the copy area), mostly on the right on desktop
  const area = () => {
    const intro = hero.querySelector(".cloud-geographic-intro");
    const bottom = intro ? intro.offsetTop + intro.offsetHeight + 40 : h * 0.5;
    return mobile
      ? { x0: 0, x1: w, y0: 0, y1: bottom }
      : { x0: w * 0.42, x1: w, y0: 0, y1: bottom };
  };

  function resize() {
    const r = hero.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = r.width; h = r.height; mobile = w < 760;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scene.layout?.();
    buildTextMask();
  }

  // Soft "holes" behind the hero text so the scene never hurts readability.
  const mask = document.createElement("canvas");
  function buildTextMask() {
    mask.width = canvas.width; mask.height = canvas.height;
    const m = mask.getContext("2d");
    m.setTransform(dpr, 0, 0, dpr, 0, 0);
    m.filter = "blur(28px)";
    m.fillStyle = "#000";
    const hr = hero.getBoundingClientRect();
    hero.querySelectorAll(".cloud-geographic-intro h1, .cloud-geographic-intro p, .cloud-geographic-intro .button, .cloud-geographic-intro .eyebrow").forEach((el) => {
      const r = el.getBoundingClientRect();
      m.fillRect(r.left - hr.left - 24, r.top - hr.top - 18, r.width + 48, r.height + 36);
    });
  }

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

  /* ---------------- Cloud: data network ---------------- */
  function cloudScene() {
    let nodes = [], edges = [], packets = [];
    return {
      layout() {
        const a = area();
        const n = mobile ? 22 : 38;
        nodes = Array.from({ length: n }, () => ({
          x: a.x0 + Math.random() * (a.x1 - a.x0), y: a.y0 + 30 + Math.random() * (a.y1 - a.y0 - 30),
          vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
          r: 1.5 + Math.random() * 2.2, a,
        }));
        packets = [];
      },
      draw(t, dt) {
        const MAX = mobile ? 130 : 170;
        edges = [];
        for (const p of nodes) {
          p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
          if (p.x < p.a.x0 || p.x > p.a.x1) p.vx *= -1;
          if (p.y < p.a.y0 + 20 || p.y > p.a.y1) p.vy *= -1;
        }
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < MAX) {
              edges.push([a, b]);
              const near = Math.max(0, 1 - Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) / 220);
              ctx.strokeStyle = rgba(ORANGE, (1 - d / MAX) * (0.18 + near * 0.5));
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
        }
        // packets travel along live edges
        if (edges.length && packets.length < (mobile ? 6 : 12) && Math.random() < 0.08) {
          const [a, b] = edges[(Math.random() * edges.length) | 0];
          packets.push({ a, b, p: 0, s: 0.5 + Math.random() * 0.7 });
        }
        packets = packets.filter((k) => (k.p += dt * k.s) < 1);
        for (const k of packets) {
          const x = k.a.x + (k.b.x - k.a.x) * k.p, y = k.a.y + (k.b.y - k.a.y) * k.p;
          ctx.fillStyle = rgba(PEACH, 0.95);
          ctx.shadowColor = rgba(ORANGE, 1); ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
        for (const p of nodes) {
          const near = Math.max(0, 1 - Math.hypot(p.x - mouse.x, p.y - mouse.y) / 160);
          ctx.fillStyle = rgba(ORANGE, 0.45 + near * 0.55);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r + near * 2, 0, Math.PI * 2); ctx.fill();
        }
      },
    };
  }

  /* ---------------- AI: neural network ---------------- */
  function aiScene() {
    let layers = [], signals = [];
    return {
      layout() {
        const a = area();
        const counts = mobile ? [3, 5, 5, 3] : [4, 6, 7, 6, 3];
        layers = counts.map((c, li) => Array.from({ length: c }, (_, i) => ({
          x: a.x0 + (a.x1 - a.x0) * (0.12 + 0.76 * li / (counts.length - 1)),
          y: a.y0 + 40 + (a.y1 - a.y0 - 60) * ((i + 0.5) / c),
          heat: 0, li,
        })));
        signals = [];
      },
      draw(t, dt) {
        // connections
        for (let li = 0; li < layers.length - 1; li++) {
          for (const a of layers[li]) for (const b of layers[li + 1]) {
            const hot = Math.max(a.heat, b.heat) * 0.35;
            ctx.strokeStyle = rgba(CYAN, 0.07 + hot);
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        // fire new signals from the input layer
        if (Math.random() < (mobile ? 0.04 : 0.07)) {
          const a = layers[0][(Math.random() * layers[0].length) | 0];
          a.heat = 1;
          const b = layers[1][(Math.random() * layers[1].length) | 0];
          signals.push({ a, b, p: 0 });
        }
        // cursor excites nearby neurons
        for (const L of layers) for (const n of L) {
          if (Math.hypot(n.x - mouse.x, n.y - mouse.y) < 70 && n.heat < 0.4 && n.li < layers.length - 1) {
            n.heat = 1;
            signals.push({ a: n, b: layers[n.li + 1][(Math.random() * layers[n.li + 1].length) | 0], p: 0 });
          }
        }
        signals = signals.filter((s) => {
          s.p += dt * 1.6;
          if (s.p >= 1) {
            s.b.heat = 1;
            const next = layers[s.b.li + 1];
            if (next) signals.push({ a: s.b, b: next[(Math.random() * next.length) | 0], p: 0 });
            return false;
          }
          return true;
        });
        for (const s of signals) {
          const x = s.a.x + (s.b.x - s.a.x) * s.p, y = s.a.y + (s.b.y - s.a.y) * s.p;
          ctx.strokeStyle = rgba(CYAN, 0.9);
          ctx.lineWidth = 2;
          const tx = s.a.x + (s.b.x - s.a.x) * Math.max(0, s.p - 0.15), ty = s.a.y + (s.b.y - s.a.y) * Math.max(0, s.p - 0.15);
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        }
        // neurons: last layer glows orange (the "useful output")
        for (const L of layers) for (const n of L) {
          n.heat = Math.max(0, n.heat - dt * 1.4);
          const out = n.li === layers.length - 1;
          const c = out ? ORANGE : CYAN;
          ctx.fillStyle = rgba(c, 0.25 + n.heat * 0.75);
          ctx.shadowColor = rgba(c, 1); ctx.shadowBlur = n.heat * 18;
          ctx.beginPath(); ctx.arc(n.x, n.y, 3.5 + n.heat * 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = rgba(c, 0.35);
          ctx.beginPath(); ctx.arc(n.x, n.y, 7 + n.heat * 3, 0, Math.PI * 2); ctx.stroke();
        }
      },
    };
  }

  /* ---------------- Cybersecurity: radar sweep ---------------- */
  function securityScene() {
    let cx = 0, cy = 0, R = 0, blips = [], grid = [];
    return {
      layout() {
        const a = area();
        R = Math.min((a.x1 - a.x0) * 0.42, (a.y1 - a.y0) * 0.62);
        cx = mobile ? w * 0.72 : a.x0 + (a.x1 - a.x0) * 0.62;
        cy = a.y0 + (a.y1 - a.y0) * (mobile ? 0.32 : 0.5);
        blips = Array.from({ length: mobile ? 7 : 12 }, () => {
          const ang = Math.random() * Math.PI * 2, d = R * (0.2 + Math.random() * 0.75);
          return { ang, x: cx + Math.cos(ang) * d, y: cy + Math.sin(ang) * d, life: 0, threat: Math.random() < 0.25 };
        });
        grid = [];
        const step = 28;
        for (let x = a.x0; x < a.x1; x += step) for (let y = a.y0 + 10; y < a.y1; y += step) grid.push({ x, y });
      },
      draw(t, dt) {
        // dot grid, brighter around the cursor (a scanner's spotlight)
        for (const g of grid) {
          const near = Math.max(0, 1 - Math.hypot(g.x - mouse.x, g.y - mouse.y) / 180);
          ctx.fillStyle = rgba(PEACH, 0.06 + near * 0.4);
          ctx.fillRect(g.x - 1, g.y - 1, 2, 2);
        }
        // rings + crosshair
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
          ctx.strokeStyle = rgba(ORANGE, 0.08 + (i === 4 ? 0.12 : 0));
          ctx.beginPath(); ctx.arc(cx, cy, (R * i) / 4, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.strokeStyle = rgba(ORANGE, 0.08);
        ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
        // sweep
        const ang = (t * 0.9) % (Math.PI * 2);
        const grad = ctx.createConicGradient ? ctx.createConicGradient(ang - 0.9, cx, cy) : null;
        if (grad) {
          grad.addColorStop(0, rgba(ORANGE, 0));
          grad.addColorStop(0.14, rgba(ORANGE, 0.22));
          grad.addColorStop(0.1433, rgba(ORANGE, 0));
          grad.addColorStop(1, rgba(ORANGE, 0));
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = rgba(PEACH, 0.7); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); ctx.stroke();
        // blips light up when the sweep passes, then fade
        for (const b of blips) {
          let diff = (ang - ((b.ang + Math.PI * 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          if (diff < 0.06) b.life = 1;
          b.life = Math.max(0, b.life - dt * 0.45);
          if (b.life <= 0) continue;
          const c = b.threat ? ORANGE : PEACH;
          ctx.fillStyle = rgba(c, b.life);
          ctx.shadowColor = rgba(ORANGE, 1); ctx.shadowBlur = 10 * b.life;
          ctx.beginPath(); ctx.arc(b.x, b.y, b.threat ? 3.5 : 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          if (b.threat) { // lock-on ring
            ctx.strokeStyle = rgba(ORANGE, b.life * 0.8);
            ctx.beginPath(); ctx.arc(b.x, b.y, 9 + (1 - b.life) * 14, 0, Math.PI * 2); ctx.stroke();
          }
        }
      },
    };
  }


  let running = false, last = 0, raf = 0;
  function frame(ms) {
    const t = ms / 1000, dt = Math.min(0.05, t - last || 0.016);
    last = t;
    ctx.clearRect(0, 0, w, h);
    scene.draw(t, dt);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 0.92;
    ctx.drawImage(mask, 0, 0);
    ctx.restore();
    raf = requestAnimationFrame(frame);
  }
  resize();
  new ResizeObserver(resize).observe(hero);
  // re-measure once fonts load and the headline intro has settled
  document.fonts?.ready.then(buildTextMask);
  setTimeout(buildTextMask, 1600);
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(frame); }
    else if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf); }
  }).observe(hero);
  requestAnimationFrame(() => canvas.classList.add("is-on"));
})();
