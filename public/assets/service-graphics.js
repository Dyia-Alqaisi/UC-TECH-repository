/* UC-TECH service graphics: one animated SVG per capability.
 * Injected into the AI / Cybersecurity explorers and the feature cards on the
 * Cloud, AI and Cybersecurity pages. Pure SVG + CSS keyframes (service-graphics.css).
 * Animations only run while the graphic is on screen. */
(() => {
  const svg = (vb, body, cls) =>
    `<svg class="sg ${cls}" viewBox="${vb}" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  const range = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("");

  // Identify: when the sweeping lens (4s loop) reaches asset i — row 1 left→right, row 2 right→left
  const lensDelay = (i) => {
    const col = i % 6, row = Math.floor(i / 6);
    return ((row === 0 ? (col / 5) * 0.4 : 0.5 + ((5 - col) / 5) * 0.4) * 4).toFixed(2);
  };

  /* ---------- Explorer scenes (wide, 240 x 96) ---------- */
  const SCENES = {
    // AI
    language: svg("0 0 240 96", `
      <g class="sg-wave">${range(11, (i) => `<rect x="${14 + i * 8}" y="28" width="4" height="40" rx="2" style="--i:${i}"/>`)}</g>
      <path class="sg-arrow" d="M112 48h20m-6-6 6 6-6 6"/>
      <g class="sg-type">
        <path d="M148 32h70" style="--i:0"/><path d="M148 48h56" style="--i:1"/><path d="M148 64h64" style="--i:2"/>
      </g>`, "sg-language"),
    vision: svg("0 0 240 96", `
      <rect class="sg-frame" x="20" y="8" width="200" height="80" rx="6"/>
      <circle class="sg-dim" cx="72" cy="52" r="16"/>
      <path class="sg-dim" d="M120 80l26-34 18 22 12-14 28 26"/>
      <g class="sg-box sg-box-a"><path d="M50 30h-6v6M94 30h6v6M50 74h-6v-6M94 74h6v-6"/><rect class="sg-tag" x="44" y="18" width="30" height="8" rx="2"/></g>
      <g class="sg-box sg-box-b"><path d="M134 40h-6v6M200 40h6v6M134 86h-6v-6M200 86h6v-6"/><rect class="sg-tag" x="128" y="28" width="38" height="8" rx="2"/></g>
      <path class="sg-scan" d="M22 10h196"/>`, "sg-vision"),
    assistants: svg("0 0 240 96", `
      <g class="sg-bubble sg-q"><rect x="128" y="8" width="96" height="24" rx="12"/><path d="M142 20h50"/></g>
      <g class="sg-dots"><circle cx="34" cy="50" r="3" style="--i:0"/><circle cx="46" cy="50" r="3" style="--i:1"/><circle cx="58" cy="50" r="3" style="--i:2"/></g>
      <g class="sg-bubble sg-a"><rect x="16" y="40" width="132" height="46" rx="12"/><path d="M30 55h96M30 71h70"/></g>`, "sg-assistants"),
    predictions: svg("0 0 240 96", `
      <path class="sg-axis" d="M20 10v76h204"/>
      <path class="sg-band" d="M140 46 C170 30 196 22 222 14 L222 50 C196 52 170 56 140 54Z"/>
      <path class="sg-history" d="M20 76 L44 66 L64 70 L86 54 L108 60 L126 46 L140 50"/>
      <path class="sg-forecast" d="M140 50 C170 42 196 36 222 32"/>
      <circle class="sg-end" cx="222" cy="32" r="4"/>`, "sg-predictions"),
    // Cybersecurity
    govern: svg("0 0 300 110", `
      <rect class="sg-node sg-top" x="128" y="6" width="44" height="22" rx="4"/>
      <path class="sg-link" d="M150 28v14M60 42h180M60 42v14M150 42v14M240 42v14"/>
      ${[60, 150, 240].map((x, i) => `<g class="sg-owner" style="--i:${i}"><rect x="${x - 34}" y="56" width="68" height="44" rx="5"/><path class="sg-tick" d="M${x - 10} 78l7 7 14-14"/></g>`).join("")}`, "sg-govern"),
    identify: svg("0 0 300 110", `
      ${range(12, (i) => `<rect class="sg-asset" x="${34 + (i % 6) * 40}" y="${16 + Math.floor(i / 6) * 44}" width="28" height="30" rx="4" style="--d:${lensDelay(i)}s"/>`)}
      <g class="sg-lens"><circle cx="0" cy="0" r="17"/><path d="M12 12l12 12"/></g>`, "sg-identify"),
    protect: svg("0 0 300 110", `
      <circle class="sg-ring" cx="150" cy="55" r="30" style="--i:0"/><circle class="sg-ring" cx="150" cy="55" r="30" style="--i:1"/>
      <path class="sg-shield" d="M150 27 172 36v17c0 15-22 26-22 26s-22-11-22-26V36Z"/>
      <path class="sg-lock" d="M143 55h14v11h-14zM146 55v-5a4 4 0 0 1 8 0v5"/>
      ${[["l", 10, 30], ["l", 10, 80], ["r", 290, 40], ["r", 290, 75]].map(([s, x, y], i) => `<circle class="sg-threat sg-${s}" cx="${x}" cy="${y}" r="4" style="--i:${i}"/>`).join("")}`, "sg-protect"),
    detect: svg("0 0 300 110", `
      <path class="sg-grid" d="M10 30h280M10 55h280M10 80h280"/>
      <path class="sg-trace" d="M0 55h60l8-14 10 26 8-12h44l6-8 8 8h30l10-40 12 70 10-30h94"/><path class="sg-pulse" d="M0 55h60l8-14 10 26 8-12h44l6-8 8 8h30l10-40 12 70 10-30h94"/>
      <circle class="sg-alert" cx="198" cy="15" r="5"/>`, "sg-detect"),
    respond: svg("0 0 300 110", `
      <path class="sg-link" d="M60 30 150 55 240 30M60 85 150 55 240 85"/>
      <path class="sg-cut" d="M150 55 240 85"/>
      ${[[60, 30], [60, 85], [150, 55], [240, 30]].map(([x, y]) => `<circle class="sg-host" cx="${x}" cy="${y}" r="9"/>`).join("")}
      <circle class="sg-host sg-infected" cx="240" cy="85" r="9"/>
      <circle class="sg-quarantine" cx="240" cy="85" r="20"/>`, "sg-respond"),
    recover: svg("0 0 300 110", `
      <circle class="sg-track" cx="70" cy="55" r="32"/>
      <circle class="sg-progress" cx="70" cy="55" r="32" pathLength="100"/>
      <path class="sg-rewind" d="M60 45a14 14 0 1 1-2 14M58 38v8h8"/>
      ${range(5, (i) => `<rect class="sg-bar" x="${140 + i * 28}" y="20" width="16" height="70" rx="3" style="--i:${i}"/>`)}`, "sg-recover"),
  };

  /* ---------- Feature pictograms (64 x 64) ---------- */
  const P = (body, cls) => svg("0 0 64 64", body, `sg-pict ${cls}`);
  const PICTOS = [
    // Cloud
    [/applications|workloads/i, P(`${range(3, (i) => `<rect class="sg-layer" x="12" y="${14 + i * 13}" width="40" height="9" rx="2" style="--i:${i}"/>`)}`, "sg-p-layers")],
    [/capacity|growth/i, P(`<path class="sg-axis" d="M10 54h46"/>${range(4, (i) => `<rect class="sg-grow" x="${14 + i * 10}" y="${38 - i * 8}" width="6" height="${16 + i * 8}" rx="1" style="--i:${i}"/>`)}`, "sg-p-grow")],
    [/recovery/i, P(`<circle class="sg-dim" cx="32" cy="32" r="20"/><path class="sg-spin" d="M32 12a20 20 0 1 1-19 14M13 18v8h8"/><path class="sg-hand" d="M32 22v10l7 5"/>`, "sg-p-recover")],
    [/region|connectivity/i, P(`<circle class="sg-ping" cx="32" cy="28" r="6" style="--i:0"/><circle class="sg-ping" cx="32" cy="28" r="6" style="--i:1"/><path class="sg-pin" d="M32 46s-12-11-12-19a12 12 0 0 1 24 0c0 8-12 19-12 19Z"/><circle cx="32" cy="27" r="4" class="sg-pin"/><path class="sg-dash" d="M8 56h48"/>`, "sg-p-region")],
    // AI
    [/language|speech/i, P(`<g class="sg-wave">${range(7, (i) => `<rect x="${12 + i * 6}" y="22" width="3" height="20" rx="1.5" style="--i:${i}"/>`)}</g>`, "sg-p-wave")],
    [/vision/i, P(`<path class="sg-dim" d="M6 32s10-16 26-16 26 16 26 16-10 16-26 16S6 32 6 32Z"/><circle class="sg-iris" cx="32" cy="32" r="8"/><path class="sg-scan" d="M8 20h48"/>`, "sg-p-vision")],
    [/chatbot|assistant/i, P(`<rect class="sg-dim" x="8" y="14" width="40" height="26" rx="8"/><path class="sg-dim" d="M16 40l-4 10 12-10"/>${range(3, (i) => `<circle class="sg-dot" cx="${20 + i * 8}" cy="27" r="2.6" style="--i:${i}"/>`)}`, "sg-p-chat")],
    [/machine learning|prediction/i, P(`<path class="sg-axis" d="M10 10v44h46"/><path class="sg-line" d="M12 46l10-8 8 4 10-14 14-12"/><circle class="sg-end" cx="54" cy="16" r="3"/>`, "sg-p-predict")],
    // Cybersecurity
    [/threat detection|monitoring/i, P(`<path class="sg-trace" d="M0 34h14l5-10 7 20 6-14h8l5 4h19"/><path class="sg-pulse" d="M0 34h14l5-10 7 20 6-14h8l5 4h19"/>`, "sg-p-pulse")],
    [/incident response/i, P(`<path class="sg-bell" d="M20 42V30a12 12 0 0 1 24 0v12l4 4H16Z"/><path class="sg-dim" d="M28 50a4 4 0 0 0 8 0"/><circle class="sg-ping" cx="32" cy="32" r="22" style="--i:0"/>`, "sg-p-alert")],
    [/scanning|penetration/i, P(`<circle class="sg-dim" cx="32" cy="32" r="22"/><circle class="sg-dim" cx="32" cy="32" r="12"/><path class="sg-sweep" d="M32 32 32 10"/><circle class="sg-blip" cx="42" cy="22" r="2.5"/>`, "sg-p-radar")],
    [/network|cloud security/i, P(`<path class="sg-dim" d="M14 18 32 32 50 18M14 46 32 32 50 46"/>${[[14, 18], [50, 18], [14, 46], [50, 46]].map(([x, y], i) => `<circle class="sg-node-p" cx="${x}" cy="${y}" r="4" style="--i:${i}"/>`).join("")}<path class="sg-shield-p" d="M32 24 39 27v5c0 5-7 9-7 9s-7-4-7-9v-5Z"/>`, "sg-p-network")],
    [/endpoint/i, P(`<rect class="sg-dim" x="12" y="16" width="40" height="26" rx="2"/><path class="sg-dim" d="M6 48h52"/><path class="sg-shield-p" d="M32 21 39 24v5c0 5-7 9-7 9s-7-4-7-9v-5Z"/><circle class="sg-ping" cx="32" cy="29" r="12" style="--i:0"/>`, "sg-p-endpoint")],
    [/compliance/i, P(`<rect class="sg-dim" x="14" y="8" width="36" height="48" rx="3"/>${range(3, (i) => `<path class="sg-check" d="M20 ${22 + i * 12}l3 3 6-6" style="--i:${i}"/><path class="sg-dim" d="M33 ${22 + i * 12}h11"/>`)}`, "sg-p-comply")],
  ];

  /* ---------- Inject ---------- */
  // AI explorer: graphic lives inside the "AI capability" engine card
  document.querySelectorAll(".explorer-ai .explore-content").forEach((sec) => {
    const key = sec.id.replace("ai-", "");
    const engine = sec.querySelector(".flow-engine");
    if (SCENES[key] && engine) engine.insertAdjacentHTML("beforeend", `<div class="sg-stage">${SCENES[key]}</div>`);
  });
  // Cybersecurity explorer: graphic heads each function's detail panel
  document.querySelectorAll(".explorer-security .explore-content").forEach((sec) => {
    const key = sec.id.replace("security-", "");
    if (SCENES[key]) sec.insertAdjacentHTML("afterbegin", `<div class="sg-stage sg-stage-wide">${SCENES[key]}</div>`);
  });
  // Feature cards: match by heading
  document.querySelectorAll(".feature").forEach((card) => {
    const title = card.querySelector("h3")?.textContent || "";
    const hit = PICTOS.find(([re]) => re.test(title));
    if (hit) card.insertAdjacentHTML("afterbegin", `<div class="sg-pict-wrap">${hit[1]}</div>`);
  });

  /* ---------- Only animate what's on screen ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle("sg-live", e.isIntersecting));
  }, { rootMargin: "60px" });
  document.querySelectorAll(".sg").forEach((el) => io.observe(el));
})();
