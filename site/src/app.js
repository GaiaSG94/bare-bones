/**
 * Home page: theme switch, real numbers from metrics.json, lazy 3D engine.
 * Every figure shown here is read from ../metrics.json (built by
 * tools/metrics.mjs) — nothing is hard-coded.
 */
import metrics from "../metrics.json";
import "./site.css";

const site = document.getElementById("site");
const THEMES = ["papier", "encre", "orbite"];

function setTheme(name) {
  const theme = THEMES.includes(name) ? name : "papier";
  site.dataset.bg = theme;
  document.querySelectorAll(".bgs button").forEach((button) => {
    button.setAttribute("aria-checked", String(button.dataset.bg === theme));
  });
  try {
    localStorage.setItem("bb-theme", theme);
  } catch {
    /* storage unavailable */
  }
}

document.querySelectorAll(".bgs button").forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.bg));
});
let stored = new URLSearchParams(location.search).get("bg");
try {
  stored = stored ?? localStorage.getItem("bb-theme");
} catch {
  /* storage unavailable */
}
setTheme(stored ?? "papier");

const number = (value) => Number(value).toLocaleString("en-US");
const euro = (value) => `${value < 0 ? "−" : ""}€${number(Math.abs(value))}`;
const kb = (bytes) => `${Math.round(Number(bytes) / 1024)} kB`;

function fact(value, label) {
  return `<span><b>${value}</b>${label}</span>`;
}

const facts = document.getElementById("bb-facts");
if (facts !== null) {
  facts.innerHTML = [
    fact(number(metrics.tests.cases), "tests, all green"),
    fact(number(metrics.tests.pbtProperties), "property-based checks"),
    fact(number(metrics.packages.core.lines + metrics.packages.ui.lines), "lines in core + ui"),
    fact(number(metrics.runtimeDependencies.length), "runtime dependencies"),
    fact(kb(metrics.siteSizes.budget), "gzip, budget app"),
    fact(kb(metrics.siteSizes.club), "gzip, club app"),
  ].join("");
}

const budgetStat = document.querySelector('[data-stat="budget"]');
if (budgetStat !== null) budgetStat.textContent = `${euro(metrics.demo.budget.balance)} balance`;
const clubStat = document.querySelector('[data-stat="club"]');
if (clubStat !== null) clubStat.textContent = `${metrics.demo.club.leader} ${metrics.demo.club.leaderPoints} pts`;

// The 3D scene is loaded lazily; without WebGL the text fallback stays visible.
const probe = document.createElement("canvas");
const webgl = probe.getContext("webgl2") ?? probe.getContext("webgl");
if (webgl === null) {
  window.__bbNoGL = true;
  document.getElementById("fallback")?.removeAttribute("hidden");
} else {
  void import("./engine.js").catch(() => {
    document.getElementById("fallback")?.removeAttribute("hidden");
  });
}
