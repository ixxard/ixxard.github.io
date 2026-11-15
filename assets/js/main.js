// The only script on the site, inlined at the end of each page (~1.5 KB minified).
(() => {
  const d = document, root = d.documentElement;
  const dark = matchMedia("(prefers-color-scheme: dark)");

  // Theme: follow the OS until the reader picks one, then remember it.
  const current = () => root.dataset.theme || (dark.matches ? "dark" : "light");
  const toggle = () => {
    const t = current() === "dark" ? "light" : "dark";
    root.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch (_) {}
  };
  d.querySelector(".theme-toggle")?.addEventListener("click", toggle);

  // Copy buttons. Shell sessions copy only the commands, without "$ " and output.
  const textOf = (el, drop) => {
    const c = el.cloneNode(true);
    c.querySelectorAll(drop).forEach((n) => n.remove());
    return c.textContent.replace(/\n$/, "");
  };
  d.addEventListener("click", async (e) => {
    const b = e.target.closest("button.copy");
    if (!b) return;
    const fig = b.closest("figure.code");
    const code = fig.querySelector("pre code") || fig.querySelector("pre");
    let text = "";
    if (/^(console|shell-session)$/.test(fig.dataset.lang)) {
      text = [...code.querySelectorAll(".line")]
        .filter((l) => l.querySelector(".gp"))
        .map((l) => textOf(l, ".gp,.ln"))
        .join("\n");
    }
    if (!text) text = textOf(code, ".ln");
    try {
      await navigator.clipboard.writeText(text);
      b.textContent = "copied";
    } catch (_) {
      b.textContent = "select + ⌘C";
    }
    b.classList.add("ok");
    clearTimeout(b._t);
    b._t = setTimeout(() => { b.textContent = "copy"; b.classList.remove("ok"); }, 1400);
  });

  // Links that leave the site open in a new tab. The templates already mark them;
  // this catches any raw <a> written in a post.
  d.querySelectorAll('a[href^="http"]:not([target])').forEach((a) => {
    if (a.host !== location.host) { a.target = "_blank"; a.rel = "noopener"; }
  });

  // Contents sidebar: mark the section being read.
  const toc = d.querySelector(".toc-side");
  if (toc) {
    const links = new Map(
      [...toc.querySelectorAll('a[href^="#"]')].map((a) => [decodeURIComponent(a.hash.slice(1)), a])
    );
    const heads = [...d.querySelectorAll(".prose :is(h2,h3)[id]")].filter((h) => links.has(h.id));
    let cur = null, queued = 0;
    const spy = () => {
      queued = 0;
      let id = null;
      for (const h of heads) {
        if (h.getBoundingClientRect().top < 140) id = h.id; else break;
      }
      const a = id ? links.get(id) : null;
      if (a === cur) return;
      cur?.removeAttribute("aria-current");
      a?.setAttribute("aria-current", "location");
      cur = a;
    };
    addEventListener("scroll", () => { queued ||= requestAnimationFrame(spy); }, { passive: true });
    spy();
  }

  // Keys: [ and ] for previous/next, t for theme.
  d.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    const go = (rel) => { const a = d.querySelector(`a[rel="${rel}"]`); if (a) location.href = a.href; };
    if (e.key === "[") go("prev");
    else if (e.key === "]") go("next");
    else if (e.key === "t") toggle();
  });
})();
