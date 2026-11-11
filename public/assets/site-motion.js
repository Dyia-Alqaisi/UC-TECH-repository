/* UC-TECH motion layer.
 * Progressive enhancement: every element is visible without this file.
 * Runs after gsap + ScrollTrigger (all scripts are deferred, in order). */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const { gsap, ScrollTrigger } = window;

  /* ---------- Cursor glow (works even with reduced motion: no movement) ---------- */
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest?.(".service-card, .partner-card, .cta-panel, .feature, .provider-card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, { passive: true });

  if (reduce || !gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const hero = document.querySelector(".home-hero");

  /* ---------- 1. Hero light streams (fluid silk field) ---------- */
  // Every line samples one shared, slowly evolving flow field, so neighbouring lines
  // bend together like silk instead of moving as separate rigid sine waves.
  function lightStreams(host) {
    if (!host) return;
    const canvas = document.createElement("canvas");
    canvas.className = "light-streams";
    canvas.setAttribute("aria-hidden", "true");
    host.prepend(canvas);
    host.classList.add("has-streams");
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1, running = false, raf = 0, last = 0;
    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999, k: 0, tk: 0 };
    const ripples = []; // expanding rings of displacement from cursor movement

    const COUNT = innerWidth < 760 ? 14 : 26;
    const lines = Array.from({ length: COUNT }, (_, i) => {
      const u = i / (COUNT - 1);
      return {
        base: u,
        width: 0.5 + Math.random() * 1.3,
        alpha: 0.22 + Math.random() * 0.5,
        breathe: Math.random() * Math.PI * 2,
        dash: 60 + Math.random() * 200,
        gap: 260 + Math.random() * 520,
        dashSpeed: 50 + Math.random() * 130,
        lag: Math.random() * 0.6, // each line responds a little later -> fluid feel
      };
    });

    function resize() {
      const r = host.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // shared flow field: smooth, slowly drifting frequencies
    function field(x, b, t) {
      const f1 = 0.0026 + Math.sin(t * 0.07) * 0.0006;
      const f2 = 0.0055 + Math.sin(t * 0.05 + 1.3) * 0.0012;
      return Math.sin(x * f1 + t * 0.42 + b * 2.4) * 1.0
        + Math.sin(x * f2 - t * 0.31 + b * 4.1) * 0.55
        + Math.sin(x * 0.011 + t * 0.73 + b * 7.0) * 0.18;
    }

    const pts = [];
    function buildPath(l, t) {
      const step = 12;
      const amp = h * (0.05 + 0.025 * Math.sin(t * 0.35 + l.breathe)); // breathing
      const tl = t - l.lag;
      pts.length = 0;
      for (let x = -60; x <= w + 60; x += step) {
        const u = x / w;
        // sweep lower-left -> upper-right, arcing like the brand artwork
        let y = h * (1.1 - l.base * 0.7) - u * h * (0.55 + l.base * 0.25) + u * u * h * 0.22;
        // travelling bulge that rolls along each line
        const roll = Math.exp(-Math.pow((u - ((tl * 0.06 + l.breathe) % 1.4 - 0.2)) * 5, 2));
        y += field(x, l.base, tl) * amp + roll * amp * 0.9;
        // cursor: soft gaussian pull + expanding ripples
        const dx = x - mouse.x, dy = y - mouse.y;
        y += (mouse.y - y) * 0.22 * mouse.k * Math.exp(-(dx * dx + dy * dy) / 60000);
        for (const r of ripples) {
          const d = Math.hypot(x - r.x, y - r.y) - r.r;
          y += Math.sin(d * 0.06) * r.a * Math.exp(-(d * d) / 3000);
        }
        pts.push(x, y);
      }
      // smooth curve through points (midpoint quadratic)
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length - 2; i += 2) {
        const mx = (pts[i] + pts[i + 2]) / 2, my = (pts[i + 1] + pts[i + 3]) / 2;
        ctx.quadraticCurveTo(pts[i], pts[i + 1], mx, my);
      }
      ctx.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
    }

    function frame(ms) {
      const t = ms / 1000, dt = Math.min(0.05, t - last || 0.016);
      last = t;
      mouse.k += (mouse.tk - mouse.k) * 0.04;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += dt * 260; r.a *= 0.965;
        if (r.a < 0.3) ripples.splice(i, 1);
      }
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      for (const l of lines) {
        buildPath(l, t);
        ctx.setLineDash([]);
        ctx.lineWidth = l.width;
        ctx.strokeStyle = `rgba(255,106,0,${l.alpha * 0.2})`;
        ctx.stroke();
        ctx.setLineDash([l.dash, l.gap]);
        ctx.lineDashOffset = -t * l.dashSpeed;
        ctx.lineWidth = l.width * 3.2;
        ctx.strokeStyle = `rgba(255,106,0,${l.alpha * 0.32})`;
        ctx.stroke();
        ctx.lineWidth = l.width;
        ctx.strokeStyle = `rgba(255,210,170,${l.alpha})`;
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    }

    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    new ResizeObserver(resize).observe(host);
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(host);
    host.addEventListener("pointermove", (e) => {
      const r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.tk = 1;
      const moved = Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py);
      if (moved > 70 && ripples.length < 6) {
        ripples.push({ x: mouse.x, y: mouse.y, r: 0, a: Math.min(18, moved * 0.12) });
        mouse.px = mouse.x; mouse.py = mouse.y;
      }
    }, { passive: true });
    host.addEventListener("pointerleave", () => { mouse.tk = 0; });
    requestAnimationFrame(() => canvas.classList.add("is-on"));
  }

  /* ---------- 2. Headline + hero intro ---------- */
  // Wrap each text line of an h1 so it can rise in; the orange dot spans stay as they are.
  function splitHeadline(h1) {
    [...h1.childNodes].forEach((n) => {
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      const word = document.createElement("span");
      word.className = "word";
      const inner = document.createElement("i");
      inner.textContent = n.textContent;
      word.appendChild(inner);
      // keep the orange dot glued to its word so it never wraps onto its own line
      const next = n.nextSibling;
      if (next?.nodeType === 1 && next.tagName === "SPAN" && next.textContent.trim().length <= 2) {
        next.classList.add("dot");
        inner.appendChild(next); // inside <i>: an inline-block that wraps would push it to a new line
      }
      n.replaceWith(word);
    });
  }

  function innerPageIntro() {
    if (hero) return;
    const h1 = document.querySelector("main h1");
    const section = h1?.closest("section");
    if (!h1 || !section) return;
    splitHeadline(h1);
    const extras = section.querySelectorAll(":scope .breadcrumb, :scope .eyebrow, :scope h1 ~ p, :scope p, :scope .button");
    const intro = [...extras].filter((el) => !el.closest(".geographic-panel, .service-explorer") && el.getBoundingClientRect().top < innerHeight);
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(h1.querySelectorAll(".word > i"), { yPercent: 110, duration: 1, stagger: 0.12 })
      .from(h1.querySelectorAll(".dot"), { scale: 0, opacity: 0, duration: 0.6, ease: "back.out(4)", transformOrigin: "50% 80%" }, "-=0.5")
      .from(intro, { y: 18, opacity: 0, duration: 0.8, stagger: 0.06 }, 0.1);
  }

  function heroIntro() {
    if (!hero) return;
    const h1 = hero.querySelector(".hero-copy h1");
    if (h1) splitHeadline(h1);
    const orbits = hero.querySelectorAll(".orbit");
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-copy .eyebrow", { y: 16, opacity: 0, duration: 0.7 })
      .from(".hero-copy h1 .word > i", { yPercent: 110, duration: 1, stagger: 0.14 }, "-=0.4")
      .from(".hero-copy h1 .dot", { scale: 0, opacity: 0, duration: 0.6, ease: "back.out(4)", stagger: 0.14, transformOrigin: "50% 80%" }, "-=0.7")
      .from(".hero-copy p, .hero-copy .actions", { y: 22, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.5")
      .from(".map-brand", { opacity: 0, duration: 0.8 }, 0.3)
      .fromTo(orbits, { "--pop": 0.4, opacity: 0 }, { "--pop": 1, opacity: 1, duration: 0.9, ease: "back.out(2)", stagger: 0.12 }, 0.45)
      .from(".hero-foot > *", { y: 12, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.4");
  }

  /* ---------- 3. Data packets between hub and services ---------- */
  function dataPackets() {
    const map = document.querySelector(".home-hero .service-map");
    if (!map) return;
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "packets");
    svg.setAttribute("aria-hidden", "true");
    map.appendChild(svg);

    const hub = map.querySelector(".map-brand");
    const nodes = [".cloud-orbit", ".ai-orbit", ".security-orbit"].map((s) => map.querySelector(s));
    let pts = null;
    const measure = () => {
      const f = map.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${f.width} ${f.height}`);
      const c = (el) => { const r = el.getBoundingClientRect(); return { x: r.left - f.left + r.width / 2, y: r.top - f.top + r.height / 2, r: r.width / 2 }; };
      pts = { hub: c(hub), nodes: nodes.map(c) };
    };
    measure();
    new ResizeObserver(measure).observe(map);

    // two packets per route, flowing outward from UC-TECH to each service
    const packets = [];
    nodes.forEach((node, i) => {
      for (let k = 0; k < 2; k++) {
        const dot = document.createElementNS(NS, "circle");
        dot.setAttribute("r", "3.2");
        dot.setAttribute("class", "packet");
        svg.appendChild(dot);
        packets.push({ dot, node, i, offset: k * 0.5 + i * 0.17, last: 0 });
      }
    });

    let running = false;
    const DURATION = 2.6;
    function tick(ms) {
      if (!running) return;
      const t = ms / 1000;
      for (const p of packets) {
        const prog = ((t / DURATION) + p.offset) % 1;
        const a = pts.hub, b = pts.nodes[p.i];
        // stop at the orbit's edge, not its centre
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
        const end = 1 - b.r / len;
        const e = prog * end;
        p.dot.setAttribute("cx", a.x + dx * e);
        p.dot.setAttribute("cy", a.y + dy * e);
        p.dot.setAttribute("opacity", Math.min(1, prog * 6, (1 - prog) * 10));
        if (prog < p.last) { // arrived
          p.node.classList.add("is-ping");
          setTimeout(() => p.node.classList.remove("is-ping"), 260);
        }
        p.last = prog;
      }
      requestAnimationFrame(tick);
    }
    new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) requestAnimationFrame(tick);
    }).observe(map);
  }

  /* ---------- 4. Service icons draw themselves ---------- */
  function iconDraw() {
    document.querySelectorAll(".service-card").forEach((card) => {
      const parts = [...card.querySelectorAll(".card-top .icon > *")];
      parts.forEach((el) => {
        const len = el.getTotalLength ? el.getTotalLength() : 100;
        el.style.strokeDasharray = len;
        el.dataset.len = len;
      });
      const draw = (d = 1.4) => gsap.fromTo(parts, { strokeDashoffset: (i, el) => el.dataset.len }, { strokeDashoffset: 0, duration: d, ease: "power2.inOut", stagger: 0.15 });
      ScrollTrigger.create({ trigger: card, start: "top 85%", once: true, onEnter: () => draw() });
      card.addEventListener("mouseenter", () => draw(0.8));
    });
  }

  /* ---------- 5. Section reveals ---------- */
  function reveals() {
    if (!hero) return; // other pages keep app.js reveals
    // app.js has a simple CSS reveal; hand these elements over to GSAP so the two never fight.
    document.querySelectorAll("main .reveal-ready").forEach((el) => el.classList.remove("reveal-ready", "is-visible"));
    const up = (targets, trigger, opts = {}) => gsap.from(targets, {
      y: 40, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1,
      scrollTrigger: { trigger, start: "top 82%", once: true }, ...opts,
    });
    up("#services .section-heading > *", "#services .section-heading");
    up("#services .service-card", "#services .service-grid", { y: 60, stagger: 0.14 });
    up(".partners-copy > *", ".partners-section");
    up(".partner-card", ".partner-list", { x: 80, y: 0, stagger: 0.15 });
    up(".approach .split > *", ".approach .split", { stagger: 0.15 });
    up(".cta-panel > *", ".cta-panel");

    // Approach progress line, scrubbed with scroll
    const approach = document.querySelector(".approach");
    if (approach) {
      const line = document.createElement("span");
      line.className = "progress-line";
      line.setAttribute("aria-hidden", "true");
      approach.querySelector(".eyebrow")?.after(line);
      gsap.fromTo(line, { "--progress": 0 }, {
        "--progress": 1, ease: "none",
        scrollTrigger: { trigger: approach, start: "top 85%", end: "center 55%", scrub: 0.4 },
      });
    }

    // CTA top border draws in
    const cta = document.querySelector(".cta-panel");
    if (cta) {
      const line = document.createElement("span");
      line.className = "cta-line";
      line.setAttribute("aria-hidden", "true");
      cta.prepend(line);
      gsap.fromTo(line, { "--progress": 0 }, {
        "--progress": 1, duration: 1.2, ease: "power3.inOut",
        scrollTrigger: { trigger: cta, start: "top 85%", once: true },
      });
    }
  }

  /* ---------- 6. Magnetic buttons ---------- */
  function magnetic() {
    if (!finePointer) return;
    document.querySelectorAll("main .button").forEach((btn) => {
      btn.classList.add("is-magnetic");
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--tx", `${(e.clientX - r.left - r.width / 2) * 0.18}px`);
        btn.style.setProperty("--ty", `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.setProperty("--tx", "0px");
        btn.style.setProperty("--ty", "0px");
      });
    });
  }

  lightStreams(hero);
  lightStreams(document.querySelector(".about-hero"));
  heroIntro();
  innerPageIntro();
  dataPackets();
  iconDraw();
  reveals();
  magnetic();
})();
