/* ═══════════════════════════════════════════
   CSES DP — app.js
═══════════════════════════════════════════ */

"use strict";

// ── DOM refs ──
const problemList  = document.getElementById("problemList");
const searchInput  = document.getElementById("searchInput");
const emptyState   = document.getElementById("emptyState");
const codeView     = document.getElementById("codeView");
const problemTitle = document.getElementById("problemTitle");
const problemLink  = document.getElementById("problemLink");
const codeBlock    = document.getElementById("codeBlock");
const copyBtn      = document.getElementById("copyBtn");
const lineCount    = document.getElementById("lineCount");
const toast        = document.getElementById("toast");
const dpViz        = document.getElementById("dpViz");
const bgCanvas     = document.getElementById("bgCanvas");

let allQuestions = [];
let activeCard   = null;

// ══════════════════════════════════════════
//  Animated canvas background
// ══════════════════════════════════════════
(function initCanvas() {
    const ctx = bgCanvas.getContext("2d");
    let W, H, particles;
    const COUNT = 55;

    function resize() {
        W = bgCanvas.width  = window.innerWidth;
        H = bgCanvas.height = window.innerHeight;
    }

    function mkParticle() {
        return {
            x:   Math.random() * W,
            y:   Math.random() * H,
            vx:  (Math.random() - 0.5) * 0.3,
            vy:  (Math.random() - 0.5) * 0.3,
            r:   Math.random() * 1.5 + 0.4,
            a:   Math.random() * 0.5 + 0.15,
            hue: Math.random() < 0.6 ? 195 : 265
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: COUNT }, mkParticle);
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        ctx.strokeStyle = "rgba(0,212,255,0.035)";
        ctx.lineWidth = 1;
        const GAP = 60;
        for (let x = 0; x < W; x += GAP) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += GAP) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.hue === 195
                ? `rgba(0,212,255,${p.a})`
                : `rgba(124,58,237,${p.a})`;
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dist = Math.hypot(p.x - q.x, p.y - q.y);
                if (dist < 130) {
                    const alpha = (1 - dist / 130) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    init();
    draw();
})();

// ══════════════════════════════════════════
//  DP Grid Visualization (sidebar)
// ══════════════════════════════════════════
(function initDPGrid() {
    const ROWS = 5, COLS = 8;
    const cells = [];

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const d = document.createElement("div");
            d.className = "dp-cell";
            dpViz.appendChild(d);
            cells.push(d);
        }
    }

    const TOTAL = ROWS * COLS;
    let step = 0;
    const colorClasses = ["filled", "filled2", "filled3"];

    function nextStep() {
        if (step >= TOTAL) {
            step = 0;
            cells.forEach(c => c.className = "dp-cell");
        }
        const r = Math.floor(step / COLS);
        const c = step % COLS;
        const pick = (r + c) % 2 === 0 ? colorClasses[0] : colorClasses[1];
        cells[r * COLS + c].className = "dp-cell " + pick;
        step++;
        setTimeout(nextStep, 80);
    }

    nextStep();
})();

// ══════════════════════════════════════════
//  Load questions
// ══════════════════════════════════════════
async function loadQuestions() {
    try {
        const res = await fetch("questions.json");
        allQuestions = await res.json();
        renderProblems(allQuestions);
    } catch (err) {
        problemList.innerHTML = `
            <div style="padding:20px;color:var(--muted);font-size:12px;text-align:center;">
                Could not load questions.json
            </div>`;
    }
}

// ══════════════════════════════════════════
//  Render sidebar cards
// ══════════════════════════════════════════
function renderProblems(questions) {
    problemList.innerHTML = "";

    if (questions.length === 0) {
        problemList.innerHTML = `
            <div style="padding:20px;color:var(--muted);font-size:12px;text-align:center;">
                No problems match your search.
            </div>`;
        return;
    }

    questions.forEach((problem, i) => {
        const card = document.createElement("div");
        card.className = "problem-card";
        card.style.animationDelay = `${i * 0.05}s`;

        const num = String(i + 1).padStart(2, "0");

        card.innerHTML = `
            <div class="problem-card-top">
                <span class="problem-num">#${num}</span>
            </div>
            <div class="problem-name">${problem.title}</div>
        `;

        card.addEventListener("click", () => {
            if (activeCard) activeCard.classList.remove("active");
            card.classList.add("active");
            activeCard = card;
            loadSolution(problem);
        });

        problemList.appendChild(card);
    });
}

// ══════════════════════════════════════════
//  Load & display solution
// ══════════════════════════════════════════
async function loadSolution(problem) {
    emptyState.style.display = "none";
    codeView.style.display   = "flex";

    problemTitle.textContent = problem.title;
    problemLink.href = problem.link || "#";

    codeBlock.textContent = "// Loading…";
    lineCount.textContent = "—";
    hljs.highlightElement(codeBlock);

    try {
        const res  = await fetch(problem.file);
        const code = await res.text();

        codeBlock.textContent = code;
        hljs.highlightElement(codeBlock);

        const lines = code.split("\n").length;
        lineCount.textContent = `${lines} lines`;

    } catch {
        codeBlock.textContent = "// Could not load solution file.\n// Make sure the file path in questions.json is correct.";
        hljs.highlightElement(codeBlock);
        lineCount.textContent = "—";
    }
}

// ══════════════════════════════════════════
//  Copy button
// ══════════════════════════════════════════
copyBtn.addEventListener("click", async () => {
    const code = codeBlock.textContent;
    if (!code || code.startsWith("// Select") || code.startsWith("// Loading") || code.startsWith("// Could not")) return;

    try {
        await navigator.clipboard.writeText(code);
        showToast();
    } catch {
        const ta = document.createElement("textarea");
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast();
    }
});

function showToast() {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2200);
}

// ══════════════════════════════════════════
//  Search  (title only — tags removed)
// ══════════════════════════════════════════
searchInput.addEventListener("input", () => {
    const kw = searchInput.value.toLowerCase().trim();
    const filtered = allQuestions.filter(q =>
        q.title.toLowerCase().includes(kw)
    );
    renderProblems(filtered);
});

// ══════════════════════════════════════════
//  Boot
// ══════════════════════════════════════════
loadQuestions();
