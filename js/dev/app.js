(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const card = document.querySelector(".card");
const masked = document.querySelector(".masked");
const MAX_RADIUS = 70;
const SMOOTH = 0.05;
const LAYER_OFFSET_X = 0;
const LAYER_OFFSET_Y = 0;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let radius = 0;
let isInside = false;
const lerp = (a, b, n) => a + (b - a) * n;
function getPos(e) {
  const rect = card.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}
card.addEventListener("mouseenter", (e) => {
  const pos = getPos(e);
  currentX = targetX = pos.x;
  currentY = targetY = pos.y;
  isInside = true;
  gsap.to(
    { r: radius },
    {
      r: MAX_RADIUS,
      duration: 0.35,
      ease: "power3.out",
      onUpdate() {
        radius = this.targets()[0].r;
      }
    }
  );
});
card.addEventListener("mouseleave", () => {
  isInside = false;
  gsap.to(
    { r: radius },
    {
      r: 0,
      duration: 0.25,
      ease: "power2.in",
      onUpdate() {
        radius = this.targets()[0].r;
      }
    }
  );
});
card.addEventListener("mousemove", (e) => {
  const pos = getPos(e);
  targetX = pos.x;
  targetY = pos.y;
});
gsap.ticker.add(() => {
  if (!isInside && radius < 0.5) return;
  currentX = lerp(currentX, targetX, SMOOTH);
  currentY = lerp(currentY, targetY, SMOOTH);
  gsap.set(masked, {
    clipPath: `circle(${radius}px at ${currentX}px ${currentY}px)`
  });
  gsap.set(masked, {
    x: LAYER_OFFSET_X,
    y: LAYER_OFFSET_Y
  });
});
