const parallaxRoot = document.getElementById("parallax");
const layers = Array.from(parallaxRoot.querySelectorAll("[data-depth]"));
const particlesContainer = document.getElementById("particles");
const auroraCanvas = document.getElementById("aurora");
const auroraCtx = auroraCanvas.getContext("2d");

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pointer = { x: 0, y: 0 };
const velocity = { x: 0, y: 0 };
const scroll = { current: 0, target: 0 };
const parallaxStrength = { base: 42, particles: 70 };
const orbs = [];

const auroraWaves = new Array(3).fill(0).map((_, idx) => ({
  amplitude: 90 + idx * 40,
  frequency: 0.7 + idx * 0.35,
  speed: 0.18 + idx * 0.05,
  baseY: 0.22 + idx * 0.16,
  hue: 180 + idx * 70,
  hueShift: 80 + idx * 20,
  alpha: 0.35 - idx * 0.08,
  phase: Math.random() * Math.PI * 2,
}));

function resizeAurora() {
  const scale = 1.6;
  auroraCanvas.width = Math.ceil(window.innerWidth * scale);
  auroraCanvas.height = Math.ceil(window.innerHeight * scale);
}

function drawAurora(time) {
  if (!auroraCtx) return;
  const { width, height } = auroraCanvas;
  auroraCtx.clearRect(0, 0, width, height);
  auroraCtx.globalCompositeOperation = "lighter";

  auroraWaves.forEach((wave, index) => {
    const progress = time * 0.001 * wave.speed + wave.phase;
    const baseY = height * wave.baseY;
    const amplitude = prefersReduced ? wave.amplitude * 0.3 : wave.amplitude;
    auroraCtx.beginPath();
    auroraCtx.moveTo(0, height);
    auroraCtx.lineTo(0, baseY);

    const steps = 24 + index * 12;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = t * width;
      const waveShift = Math.sin(t * Math.PI * 2 * wave.frequency + progress) * amplitude;
      const y = baseY + waveShift;
      auroraCtx.lineTo(x, y);
    }

    auroraCtx.lineTo(width, height);
    auroraCtx.closePath();

    const gradient = auroraCtx.createLinearGradient(0, baseY - amplitude, width, baseY + amplitude);
    gradient.addColorStop(0, `hsla(${wave.hue}, 90%, 70%, ${wave.alpha})`);
    gradient.addColorStop(0.4, `hsla(${wave.hue + wave.hueShift * 0.5}, 95%, 65%, ${wave.alpha * 1.2})`);
    gradient.addColorStop(0.85, `hsla(${wave.hue + wave.hueShift}, 90%, 60%, ${wave.alpha * 0.75})`);
    gradient.addColorStop(1, `hsla(${wave.hue + wave.hueShift * 1.4}, 90%, 55%, 0)`);

    auroraCtx.fillStyle = gradient;
    auroraCtx.globalAlpha = prefersReduced ? 0.45 : 0.75 - index * 0.1;
    auroraCtx.fill();
  });

  auroraCtx.globalAlpha = 1;
}

function createParticles() {
  const targetCount = prefersReduced ? 14 : window.innerWidth < 720 ? 20 : 34;
  particlesContainer.innerHTML = "";
  orbs.length = 0;

  for (let i = 0; i < targetCount; i += 1) {
    const orb = document.createElement("span");
    const size = prefersReduced ? 50 + Math.random() * 110 : 80 + Math.random() * 180;
    const blur = Math.random() * (prefersReduced ? 10 : 22);
    const hue = 180 + Math.random() * 160;
    const depth = 0.2 + Math.random() * 0.7;
    const floatSpeed = 0.3 + Math.random() * 1.4;

    orb.style.setProperty("--size", `${size}px`);
    orb.style.setProperty("--blur", `${blur}px`);
    orb.style.setProperty("--hue", `${hue}`);
    orb.style.setProperty("--delay", `${Math.random() * -10}s`);

    orb.style.left = `${Math.random() * 100}%`;
    orb.style.top = `${Math.random() * 100}%`;

    orb.dataset.depth = depth.toString();
    orb.dataset.floatSpeed = floatSpeed.toString();
    orb.dataset.offset = (Math.random() * Math.PI * 2).toString();

    particlesContainer.appendChild(orb);
    orbs.push(orb);
  }
}

function handlePointer(event) {
  const x = event.touches ? event.touches[0].clientX : event.clientX;
  const y = event.touches ? event.touches[0].clientY : event.clientY;
  const ratioX = (x / window.innerWidth) * 2 - 1;
  const ratioY = (y / window.innerHeight) * 2 - 1;
  pointer.x = ratioX;
  pointer.y = ratioY;
}

function handleScroll() {
  scroll.target = window.scrollY || window.pageYOffset || 0;
}

function updateParallax(time) {
  velocity.x += (pointer.x - velocity.x) * 0.08;
  velocity.y += (pointer.y - velocity.y) * 0.08;
  scroll.current += (scroll.target - scroll.current) * 0.1;

  layers.forEach((layer) => {
    const depth = Number(layer.dataset.depth || 0);
    const translateX = velocity.x * depth * parallaxStrength.base;
    const translateY = velocity.y * depth * parallaxStrength.base + scroll.current * depth * 0.25;
    const scale = 1.05 + depth * 0.08;

    layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
  });

  const timeFactor = time * 0.0005;

  orbs.forEach((orb) => {
    const depth = Number(orb.dataset.depth || 0.5);
    const offset = Number(orb.dataset.offset || 0);
    const speed = Number(orb.dataset.floatSpeed || 1);

    const floatX = Math.sin(timeFactor * speed + offset) * (prefersReduced ? 6 : 18);
    const floatY = Math.cos(timeFactor * speed * 0.8 + offset) * (prefersReduced ? 10 : 26);

    const translateX = velocity.x * depth * parallaxStrength.particles + floatX;
    const translateY = velocity.y * depth * parallaxStrength.particles + floatY + scroll.current * depth * 0.35;

    orb.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  });

  drawAurora(time);
  requestAnimationFrame(updateParallax);
}

function init() {
  resizeAurora();
  createParticles();
  handleScroll();

  window.addEventListener("resize", () => {
    resizeAurora();
    createParticles();
  });

  window.addEventListener("mousemove", handlePointer);
  window.addEventListener("touchmove", handlePointer, { passive: true });
  window.addEventListener("scroll", handleScroll, { passive: true });

  requestAnimationFrame(updateParallax);
}

init();
