// Home-page easter eggs. None of this downloads until someone asks for it
// (the small loader in layouts/home.html imports this file on demand):
//
//   ~  or a click on the big blinking cursor     a drop-down console
//   ↑ ↑ ↓ ↓ ← → ← → b a                          a tiny demoscene intro
//   hvc() in the browser's devtools              part 01's guest exit, any imm16
const d = document, root = d.documentElement;

const CSS = `
.egg-con{position:fixed;inset:0 0 auto;z-index:40;display:flex;flex-direction:column;height:min(48vh,26rem);background:color-mix(in oklab,var(--bg) 94%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-bottom:1px solid var(--accent);box-shadow:0 14px 40px -24px #000;font:.85rem/1.6 var(--mono);color:var(--fg);animation:egg-drop .16s ease-out}
.egg-con[hidden]{display:none}
.egg-out,.egg-in{padding-inline:max(var(--pad),calc((100vw - var(--frame))/2))}
.egg-out{flex:1;margin:0;padding-block:1rem .2rem;overflow:auto;white-space:pre-wrap;color:var(--fg-2)}
.egg-in{display:flex;gap:1ch;padding-block:.2rem .9rem;color:var(--accent)}
.egg-in input{flex:1;min-width:0;padding:0;border:0;outline:0;background:none;color:var(--fg);font:inherit;caret-color:var(--accent)}
.egg-demo{position:fixed;inset:0;z-index:50;background:#000;cursor:none}
.egg-demo canvas{display:block;width:100%;height:100%;object-fit:cover;image-rendering:pixelated}
@keyframes egg-drop{from{transform:translateY(-100%)}}
@media (prefers-reduced-motion:reduce){.egg-con{animation:none}}
@media (max-width:40rem){.egg-in input{font-size:16px}}`;

let styled = false;
const style = () => {
  if (styled) return;
  const s = d.createElement("style");
  s.textContent = CSS;
  d.head.append(s);
  styled = true;
};

// What part 01's program prints when the guest runs hvc #imm.
// ESR = EC 0x16 (HVC from AArch64) << 26 | IL << 25 | imm16.
const exitDump = (imm = 7) => {
  imm = (Number(String(imm).replace(/^#/, "")) || 0) & 0xffff;
  const esr = ((0x16 << 26) | (1 << 25) | imm) >>> 0;
  return [
    "exit reason : 1 (1 = exception)",
    "syndrome    : 0x" + esr.toString(16).padStart(16, "0"),
    "  EC        : 0x16 (0x16 = HVC from AArch64)",
    "  imm16     : " + imm,
    "guest x0    : 42",
    "guest pc    : 0x1000c",
  ].join("\n");
};

/* ---------------------------------------------------------------- console */

let con, out, inp, hi = 0;
const hist = [];
const print = (s) => {
  if (s == null) return;
  out.textContent += s + "\n";
  out.scrollTop = out.scrollHeight;
};
const closeConsole = () => {
  if (!con) return;
  inp.blur();
  con.hidden = true;
};

// Everything `ls` can see is already on the home page.
const entries = () => [...d.querySelectorAll(".home-main .parts a, .home-main .log a, .home-rail .rail-list a")];
const go = (href) => { location.href = href; return null; };

const cmds = {
  help: () => "help  ls  open <n>  whoami  uname -a  hvc #<imm>  echo  theme  demo  clear  exit",
  ls: () => ["series/  notes/  tags/  about/", ...entries().map((a, i) => `${String(i + 1).padStart(2)}  ${a.textContent.trim()}`)].join("\n"),
  open: (n) => {
    if (!n) return "usage: open <number from ls, or series/ notes/ tags/ about/>";
    if (n === "~" || n === "/") return go("/");
    const name = n.replace(/\/$/, "").toLowerCase();
    const a = entries()[n - 1] || [...d.querySelectorAll(".nav a")].find((l) => l.textContent.trim().toLowerCase() === name);
    return a ? go(a.href) : `open: ${n}: no such file or directory`;
  },
  whoami: () => [d.querySelector('meta[name="author"]')?.content, d.querySelector(".intro-bio")?.textContent.trim()].filter(Boolean).join("\n"),
  uname: (a) => (a === "-a" ? "sankrant.systems 1.0.0-static #1 PREEMPT_NONE aarch64 EL0 (no EL2 here, yet)" : "sankrant.systems"),
  hvc: (imm) => exitDump(imm),
  echo: (...a) => a.join(" ").replace(/\$x0\b/g, "42").replace(/\$\w+/g, ""),
  theme: () => { d.querySelector(".theme-toggle")?.click(); return "theme: " + root.dataset.theme; },
  demo: () => { closeConsole(); demo(); return null; },
  clear: () => { out.textContent = ""; return null; },
  exit: () => { closeConsole(); return null; },
  // not in help
  sudo: () => "sankrant is not in the sudoers file. This incident will be reported.",
  rm: () => "rm: /: read-only file system (it's static html)",
};
cmds.cd = cmds.cat = cmds.open;

const onInput = (e) => {
  if (e.key === "Escape" || e.key === "`") { e.preventDefault(); closeConsole(); return; }
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
    hi = Math.max(0, Math.min(hist.length, hi + (e.key === "ArrowUp" ? -1 : 1)));
    inp.value = hist[hi] || "";
    return;
  }
  if (e.key !== "Enter") return;
  const line = inp.value.trim();
  inp.value = "";
  print("$ " + line);
  if (!line) return;
  hist.push(line);
  hi = hist.length;
  const [cmd, ...args] = line.split(/\s+/);
  print(Object.hasOwn(cmds, cmd) ? cmds[cmd](...args) : `sh: ${cmd}: command not found`);
};

const openConsole = () => {
  style();
  if (!con) {
    con = d.createElement("div");
    con.className = "egg-con";
    con.setAttribute("role", "dialog");
    con.setAttribute("aria-label", "Console");
    con.innerHTML =
      '<pre class="egg-out" aria-live="polite"></pre>' +
      '<label class="egg-in"><span aria-hidden="true">$</span>' +
      '<input aria-label="Command" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></label>';
    d.body.append(con);
    out = con.querySelector("pre");
    inp = con.querySelector("input");
    inp.addEventListener("keydown", onInput);
    print("sankrant.systems, running at EL0. type help.");
  }
  con.hidden = false;
  inp.focus();
};

/* ------------------------------------------------------------------- demo */

const SCROLL = ("      sankrant.systems  *  an intro in a few kilobytes, the browser did the rest  *  x0 = 42  *  " +
  "greetings to the scene, to everyone who reads the source, and to whoever types hvc #7  *  esc to leave  *  ").toUpperCase();

const demo = () => {
  style();
  const W = 320, H = 180, CW = 9;
  const box = d.createElement("div");
  box.className = "egg-demo";
  box.setAttribute("role", "img");
  box.setAttribute("aria-label", "A plasma effect with a sine scroller. Press Escape or click to leave.");
  const c = d.createElement("canvas");
  c.width = W;
  c.height = H;
  box.append(c);
  d.body.append(box);
  const g = c.getContext("2d");
  const img = g.createImageData(W, H);
  const px = new Uint32Array(img.data.buffer);

  // 256-entry palette: black, up to the site's accent, a white-hot peak, and back.
  const hex = getComputedStyle(root).getPropertyValue("--accent-base").trim().slice(1);
  const rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) || 160);
  const pal = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    const s = (1 - Math.cos((i / 256) * Math.PI * 2)) / 2;
    const hot = Math.max(0, s - 0.8) * 5;
    const [r, gg, b] = rgb.map((v) => Math.min(255, v * s + 255 * hot) | 0);
    pal[i] = 0xff000000 | (b << 16) | (gg << 8) | r;
  }

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  let raf = 0;
  const draw = (now) => {
    const t = (now - t0) / 1000;
    const cx = W / 2 + Math.sin(t * 0.7) * 90, cy = H / 2 + Math.cos(t * 0.5) * 50;
    for (let y = 0, i = 0; y < H; y++) {
      const sy = Math.sin(y * 0.045 + t * 1.1);
      for (let x = 0; x < W; x++, i++) {
        const dx = x - cx, dy = y - cy;
        const v = Math.sin(x * 0.035 + t) + sy + Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.08 - t * 2);
        px[i] = pal[((v + 3) * 85 + t * 60) & 255];
      }
    }
    g.putImageData(img, 0, 0);

    // sine scroller on a dark band
    const top = H * 0.64;
    g.fillStyle = "rgba(0,0,0,.5)";
    g.fillRect(0, top, W, 36);
    g.font = "bold 14px ui-monospace, Menlo, monospace";
    g.textBaseline = "middle";
    const x0 = W - ((t * 55) % (SCROLL.length * CW + W));
    for (let k = 0; k < SCROLL.length; k++) {
      const x = x0 + k * CW;
      if (x < -CW || x > W) continue;
      const y = top + 18 + Math.sin(x * 0.05 + t * 5) * 9;
      g.fillStyle = "#000";
      g.fillText(SCROLL[k], x + 1, y + 1);
      g.fillStyle = "#fff";
      g.fillText(SCROLL[k], x, y);
    }
    if (!still) raf = requestAnimationFrame(draw);
  };

  const leave = () => {
    cancelAnimationFrame(raf);
    box.remove();
    d.removeEventListener("keydown", onKey, true);
  };
  const onKey = (e) => {
    if (e.key === "Escape" || e.key === "q") { e.preventDefault(); e.stopPropagation(); leave(); }
  };
  d.addEventListener("keydown", onKey, true);
  box.addEventListener("click", leave);
  draw(t0 + (still ? 4000 : 0));
};

/* ------------------------------------------------------------------ entry */

export default (mode, arg) => {
  if (mode === "console") openConsole();
  else if (mode === "demo") demo();
  else if (mode === "hvc") console.log(exitDump(arg));
};
