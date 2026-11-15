/* =========================================================
   DESSITOZ: Cinematic Coming Soon (GSAP only)
   ========================================================= */

/* ---------- ANIMATION TIMINGS (seconds): tweak the feel here ---------- */
const T = {
  background: 0.8,   // spotlight + floor pool reveal
  pagdiFall: 1.3,    // Pagdi descent
  bounce: 0.4,       // landing bounce
  headline: 0.8,     // each headline line
  support: 0.6,      // supporting text, announcement, kicker
  decor: 0.5,        // diamonds, divider line, mascot, moustache
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const root = document.documentElement;
const q = (s) => document.querySelector(s);

function showEverything() {
  root.classList.remove("js");
}

/* Wait for the Pagdi so it never falls in half-loaded */
function whenPagdiReady() {
  const img = q(".pagdi__img");
  if (!img) return Promise.resolve();
  const decoded = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
  const timeout = new Promise((r) => setTimeout(r, 2500));
  return Promise.race([decoded, timeout]);
}

function playIntro() {
  const drop = q(".pagdi-drop");
  const fallDistance = drop.getBoundingClientRect().top + drop.offsetHeight + 80;

  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: startAmbient });

  /* 1. Dark stage, golden spotlight fades up */
  tl.fromTo(".bg__beam", { opacity: 0, scaleY: 0.55 }, { opacity: 1, scaleY: 1, duration: T.background })
    .fromTo(".bg__pool", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: T.background }, 0.1)
    .fromTo(".fade", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, 0.35)

    /* 2. Pagdi descends with a slight rotation */
    .set(drop, { opacity: 1 }, 0.55)
    .fromTo(drop, { y: -fallDistance, rotation: -32 }, { y: 0, rotation: -6, duration: T.pagdiFall, ease: "power2.in" }, 0.55)
    .fromTo(".stage__shadow", { opacity: 0, scaleX: 0.3 }, { opacity: 1, scaleX: 1, duration: T.pagdiFall, ease: "power2.in" }, 0.55)

    /* 3. Landing bounce, spotlight pulses on impact */
    .to(drop, { y: -28, rotation: -2.5, duration: T.bounce / 2, ease: "power2.out" })
    .to(".bg__pool", { scale: 1.12, duration: T.bounce / 2, yoyo: true, repeat: 1 }, "<")
    .to(drop, { y: 0, rotation: -6, duration: T.bounce / 2, ease: "power2.in" })

    /* 4. Headline, one line at a time */
    .fromTo(".line__inner", { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: T.headline, stagger: 0.12 }, "-=0.25")

    /* 5. Supporting text, announcement, kicker */
    .fromTo(".support", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: T.support }, "-=0.45")
    .fromTo(".coming", { opacity: 0, scale: 0.8, rotation: -9 }, { opacity: 1, scale: 1, rotation: -2, duration: T.support, ease: "back.out(1.4)" }, "-=0.3")
    .fromTo(".kicker", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: T.support }, "-=0.35")

    /* 6. Decorative details */
    .fromTo("[data-gem]", { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: T.decor, stagger: 0.08, ease: "back.out(2)" }, "-=0.2")
    .fromTo(".footer__line", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power2.out" }, "<")
    .fromTo(".footer__text", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: T.decor }, "-=0.5")
    .fromTo(".footer__moustache", { opacity: 0, scale: 0.4, rotation: -12 }, { opacity: 1, scale: 1, rotation: 0, duration: T.decor, ease: "back.out(2)" }, "<")
    .fromTo(".peek__img", { opacity: 1, yPercent: 105 }, { yPercent: 0, duration: 0.7, ease: "back.out(1.3)" }, "-=0.1");
}

/* Idle motion: gentle, low cost */
function startAmbient() {
  gsap.to(".pagdi-float", { y: -14, rotation: 1.2, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".stage__shadow", { scaleX: 0.86, opacity: 0.7, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut" });

  gsap.utils.toArray("[data-gem]").forEach((gem, i) => {
    gsap.to(gem, { y: i % 2 ? 10 : -10, duration: 2.4 + i * 0.35, yoyo: true, repeat: -1, ease: "sine.inOut" });
  });

  if (!finePointer) return;
  const moveX = gsap.quickTo(".pagdi-parallax", "x", { duration: 0.9, ease: "power3.out" });
  const moveY = gsap.quickTo(".pagdi-parallax", "y", { duration: 0.9, ease: "power3.out" });
  const spin = gsap.quickTo(".pagdi-parallax", "rotation", { duration: 0.9, ease: "power3.out" });
  window.addEventListener("pointermove", (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    moveX(nx * 26);
    moveY(ny * 18);
    spin(nx * 4);
  }, { passive: true });
}

/* ---------- Boot ---------- */
(async function init() {
  if (!window.gsap || reducedMotion) return showEverything();
  await whenPagdiReady();
  playIntro();
})();
