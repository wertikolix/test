const canvas = document.getElementById('asciiCanvas');
const ctx = canvas.getContext('2d');
const glyphs = ['@', '#', '$', '%', '&', '*', '+', '=', '?', '/', '<', '>', '|', '{', '}'];
let particles = [];
let width = 0;
let height = 0;

const pointer = {
  x: 0,
  y: 0,
  strength: 0,
};

class AsciiParticle {
  constructor(initial = false) {
    this.reset(initial);
  }

  reset(initial = false) {
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : -40;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = 0.15 + Math.random() * 0.45;
    this.size = 18 + Math.random() * 18;
    this.char = glyphs[Math.floor(Math.random() * glyphs.length)];
    this.alpha = 0.12 + Math.random() * 0.28;
    this.rotation = (Math.random() - 0.5) * 0.6;
    this.rotationSpeed = (Math.random() - 0.5) * 0.004;
    this.switchInterval = 1500 + Math.random() * 3000;
    this.lastSwitch = performance.now() + Math.random() * this.switchInterval;
    this.offset = Math.random() * Math.PI * 2;
  }

  update(now) {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    if (now - this.lastSwitch > this.switchInterval) {
      this.char = glyphs[Math.floor(Math.random() * glyphs.length)];
      this.alpha = 0.12 + Math.random() * 0.28;
      this.lastSwitch = now + Math.random() * 400;
    }

    if (pointer.strength > 0.01) {
      const dx = this.x - pointer.x;
      const dy = this.y - pointer.y;
      const distSq = Math.max(dx * dx + dy * dy, 60);
      const force = (pointer.strength * 1200) / distSq;
      this.vx += force * dx * 0.02;
      this.vy += force * dy * 0.02;
    }

    if (this.y > height + 60) {
      this.reset();
      this.y = -40;
    }

    if (this.x < -60) {
      this.x = width + 60;
    } else if (this.x > width + 60) {
      this.x = -60;
    }
  }

  draw(now) {
    const swayX = Math.cos(now * 0.00025 + this.offset) * 8;
    const swayY = Math.sin(now * 0.00018 + this.offset) * 6;

    ctx.save();
    ctx.translate(this.x + swayX, this.y + swayY);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;
    ctx.font = `${this.size}px 'Doto', monospace`;
    ctx.fillStyle = '#f5f5f5';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.25)';
    ctx.shadowBlur = 8;
    ctx.fillText(this.char, 0, 0);
    ctx.restore();
  }
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  const density = 0.00018;
  const desired = Math.max(80, Math.floor(width * height * density));
  particles = particles.slice(0, desired);
  while (particles.length < desired) {
    particles.push(new AsciiParticle(true));
  }
}

function animate(now) {
  ctx.fillStyle = 'rgba(5, 5, 5, 0.32)';
  ctx.fillRect(0, 0, width, height);

  for (const particle of particles) {
    particle.update(now);
    particle.draw(now);
  }

  pointer.strength *= 0.92;
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  resize();
});

window.addEventListener('pointermove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.strength = Math.min(pointer.strength + 0.4, 1);
});

window.addEventListener('pointerleave', () => {
  pointer.strength = 0;
});

resize();
requestAnimationFrame(animate);
