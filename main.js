const projects = [
  {
    id: "vika",
    title: "vika",
    context: "占位：这是一个效率工具体验升级项目。补充目标用户、关键约束与成功指标。",
    role: ["占位：负责信息架构与关键流程设计", "占位：搭建组件规范与交付规则", "占位：与研发协作完成落地与验收"],
    approach: ["占位：对关键任务流做梳理与分层", "占位：方案对比并明确取舍", "占位：沉淀可复用的设计系统片段"],
    result: "占位：补充数据或可验证结果（例如：完成率/时长/满意度/上线范围）。",
  },
  {
    id: "bika",
    title: "bika",
    context: "占位：从 0 到 1 定义产品体验，覆盖核心信息结构与交互框架。",
    role: ["占位：定义信息架构与导航结构", "占位：制作高保真与原型验证", "占位：推动跨团队对齐与落地"],
    approach: ["占位：建立体验原则与设计基线", "占位：关键页面/状态的系统化设计", "占位：交付可维护的组件化规范"],
    result: "占位：补充结果（例如：转化、留存、支持成本等）。",
  },
  {
    id: "other",
    title: "其他",
    context: "占位：若干视觉/动效/交互探索合集，可替换为你最想展示的内容。",
    role: ["占位：视觉探索与版式系统", "占位：动效与微交互实验", "占位：组件/图标/规范沉淀"],
    approach: ["占位：建立统一视觉语言", "占位：对关键组件做状态与动效定义", "占位：输出可复用资源包"],
    result: "占位：补充影响（例如：提升一致性、减少返工等）。",
  },
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const modal = $("#modal");
const modalPanel = $(".modal__panel");
const modalTitle = $("#modal-title");
const copyStatus = $("#copy-status");

let activeIndex = 0;
let lastActiveEl = null;
let revealObserver = null;
let chartObserver = null;

function setModalProject(index) {
  const p = projects[index];
  if (!p) return;

  activeIndex = index;
  modalTitle.textContent = p.title;

  const contextEl = $('[data-field="context"]', modal);
  const resultEl = $('[data-field="result"]', modal);
  const roleEl = $('[data-field="role"]', modal);
  const approachEl = $('[data-field="approach"]', modal);

  contextEl.textContent = p.context;
  resultEl.textContent = p.result;

  roleEl.innerHTML = p.role.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  approachEl.innerHTML = p.approach.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
}

function openModal(projectId) {
  const index = Math.max(0, projects.findIndex((p) => p.id === projectId));
  setModalProject(index);

  lastActiveEl = document.activeElement;
  // Standard modal open (fade/scale via CSS)
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // focus
  setTimeout(() => modalPanel.focus(), 0);
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (lastActiveEl && typeof lastActiveEl.focus === "function") {
    lastActiveEl.focus();
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Open modal buttons
$$("[data-open-modal]").forEach((btn) => {
  btn.addEventListener("click", () => openModal(btn.dataset.openModal));
});

// Close modal buttons/backdrop
$$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));

// Keyboard
document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("is-open")) return;

  if (e.key === "Escape") {
    e.preventDefault();
    closeModal();
    return;
  }

  // Basic focus trap
  if (e.key === "Tab") {
    const focusables = $$(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      modalPanel
    ).filter((x) => !x.hasAttribute("disabled"));

    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Arrow nav
  if (e.key === "ArrowLeft") {
    setModalProject((activeIndex - 1 + projects.length) % projects.length);
  }
  if (e.key === "ArrowRight") {
    setModalProject((activeIndex + 1) % projects.length);
  }
});

// Modal footer navigation
$("[data-modal-prev]")?.addEventListener("click", () => {
  setModalProject((activeIndex - 1 + projects.length) % projects.length);
});
$("[data-modal-next]")?.addEventListener("click", () => {
  setModalProject((activeIndex + 1) % projects.length);
});

// Email copy
$("[data-copy-email]")?.addEventListener("click", async () => {
  const email = "quanzhenghe15@gmail.com";
  try {
    await navigator.clipboard.writeText(email);
    if (copyStatus) copyStatus.textContent = "已复制到剪贴板";
    setTimeout(() => {
      if (copyStatus) copyStatus.textContent = "";
    }, 1200);
  } catch {
    if (copyStatus) copyStatus.textContent = "复制失败（浏览器权限限制）";
  }
});

// Year
$("#year").textContent = String(new Date().getFullYear());

// Scroll reveal (subtle, reduced-motion friendly)
function initReveal() {
  const targets = $$("[data-reveal]");
  if (targets.length === 0) return;

  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { root: null, threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  targets.forEach((el) => revealObserver.observe(el));
}

initReveal();

// Staggered entrance for hero elements
function initStagger() {
  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    $$("[data-stagger], [data-blur-in]").forEach((el) => el.classList.add("is-in"));
    return;
  }

  const els = $$("[data-stagger], [data-blur-in]");
  els.forEach((el, i) => {
    const delay = Math.min(220 + i * 110, 880);
    setTimeout(() => el.classList.add("is-in"), delay);
  });
}

initStagger();

// Dashboard 3D perspective -> flat on scroll
function initDashboardDepth() {
  const wrap = $("[data-dash-wrap]");
  const dash = $("[data-dash]");
  if (!wrap || !dash) return;

  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    dash.style.transform = "rotateX(0deg) scale(1)";
    return;
  }

  let raf = 0;
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const tick = () => {
    raf = 0;
    const r = wrap.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const start = vh * 0.85;
    const end = vh * 0.15;
    const t = (start - r.top) / (start - end);
    const p = Math.max(0, Math.min(1, t));

    const rot = 20 * (1 - p);
    const scale = 0.9 + 0.1 * p;
    dash.style.transform = `rotateX(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();
}

initDashboardDepth();

// Reflect cover parallax (subtle, GPU-friendly)
function initCoverParallax() {
  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const scene = $("[data-parallax]");
  if (!scene) return;

  let raf = 0;
  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;

  const onMove = (e) => {
    const r = scene.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    targetX = x;
    targetY = y;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const tick = () => {
    raf = 0;
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    scene.style.transform = `translate3d(${curX * 10}px, ${curY * 8}px, 0)`;
    if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
      raf = requestAnimationFrame(tick);
    }
  };

  scene.addEventListener("mousemove", onMove, { passive: true });
  scene.addEventListener(
    "mouseleave",
    () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    },
    { passive: true }
  );
}

// Reflect parallax was for previous cover; keep disabled for current funnel hero
// initCoverParallax();

// tvOS-style parallax tilt for cards
function initTilt() {
  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const max = 7;
  const perspective = 900;

  $$("[data-tilt]").forEach((el) => {
    el.style.transform = `perspective(${perspective}px) translateZ(0)`;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (y - 0.5) * -2 * max;
      const ry = (x - 0.5) * 2 * max;
      el.style.transform = `perspective(${perspective}px) rotateX(${rx.toFixed(
        2
      )}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
    };

    const onLeave = () => {
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });
  });
}

initTilt();

// Scroll narrative charts: count + bar fill
function initCharts() {
  const charts = $$("[data-chart]");
  if (charts.length === 0) return;

  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function playChart(chart) {
    const values = $$("[data-count-to]", chart);
    const bars = $$("[data-bar-to]", chart);

    bars.forEach((b) => {
      const to = Number(b.dataset.barTo || "0");
      b.style.width = `${Math.max(0, Math.min(1, to)) * 100}%`;
      b.style.transition = reduce
        ? "none"
        : "width 900ms cubic-bezier(.2,.8,.2,1)";
    });

    values.forEach((v) => {
      const to = Number(v.dataset.countTo || "0");
      if (reduce) {
        v.textContent = String(to);
        return;
      }
      const start = performance.now();
      const dur = 900;
      const from = Number(v.textContent || "0");
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        v.textContent = String(Math.round(from + (to - from) * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  if (!("IntersectionObserver" in window)) {
    charts.forEach(playChart);
    return;
  }

  chartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playChart(entry.target);
          chartObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
  );

  charts.forEach((c) => chartObserver.observe(c));
}

initCharts();

// FLIP expand animation (card -> modal panel)
function runFlipExpand(sourceEl, onDone) {
  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    onDone();
    return;
  }

  const first = sourceEl.getBoundingClientRect();
  const clone = sourceEl.cloneNode(true);
  clone.removeAttribute("data-open-modal");
  clone.setAttribute("aria-hidden", "true");
  clone.style.position = "fixed";
  clone.style.left = `0px`;
  clone.style.top = `0px`;
  clone.style.width = `${first.width}px`;
  clone.style.height = `${first.height}px`;
  clone.style.margin = "0";
  clone.style.zIndex = "120";
  clone.style.willChange = "transform, opacity";
  clone.style.transformOrigin = "top left";
  clone.style.transition =
    "transform 440ms cubic-bezier(.2,.8,.2,1), opacity 180ms cubic-bezier(.2,.8,.2,1)";

  document.body.appendChild(clone);

  // Ensure modal layout exists to measure target
  onDone();
  const target = modalPanel.getBoundingClientRect();

  // Hide modal content until clone finishes
  modalPanel.style.opacity = "0";

  requestAnimationFrame(() => {
    const dx = target.left - first.left;
    const dy = target.top - first.top;
    const sx = target.width / first.width;
    const sy = target.height / first.height;

    clone.style.transform = `translate3d(${first.left}px, ${first.top}px, 0) scale(1)`;
    // force style flush
    clone.getBoundingClientRect();
    clone.style.transform = `translate3d(${first.left + dx}px, ${
      first.top + dy
    }px, 0) scale(${sx}, ${sy})`;
    clone.style.opacity = "0.985";
  });

  const cleanup = () => {
    clone.removeEventListener("transitionend", cleanup);
    if (clone.parentNode) clone.parentNode.removeChild(clone);
    modalPanel.style.opacity = "";
  };
  clone.addEventListener("transitionend", cleanup);
}

