/* ═══════════════════════════════════════════════════════════════════
   WEBGL-EFFECTS.JS — Sid Perfume
   Liquid Distortion | Interactive Fluid Particles | WebGL
   ═══════════════════════════════════════════════════════════════════ */
'use strict';

/* ───────────────────────────────────────────────
   1. LIQUID WEBGL DISTORTION SHADER
   ─────────────────────────────────────────────── */
class LiquidDistortion {
  constructor(container, options = {}) {
    this.container = container;
    this.options = Object.assign({
      intensity: 0.15,
      rippleSpeed: 0.002,
      color1: [0.83, 0.69, 0.22],  // gold
      color2: [0.02, 0.31, 0.23],  // emerald
      color3: [0.90, 0.22, 0.27],  // crimson
    }, options);

    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.time = 0;
    this.animationId = null;
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.boundResize = this.resize.bind(this);
    this.boundMouse = this.onMouse.bind(this);

    this.init();
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'liquid-distortion-canvas';
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.4;';
    this.container.style.position = 'relative';
    this.container.appendChild(this.canvas);

    this.gl = this.canvas.getContext('webgl', { alpha: true, antialias: true });
    if (!this.gl) return;

    this.resize();
    this.createShaderProgram();

    window.addEventListener('resize', this.boundResize);
    this.container.addEventListener('mousemove', this.boundMouse);

    this.render();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  onMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = (e.clientX - rect.left) / rect.width;
    this.mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
  }

  createShaderProgram() {
    const gl = this.gl;

    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;

      vec3 color1 = vec3(0.83, 0.69, 0.22);
      vec3 color2 = vec3(0.02, 0.31, 0.23);
      vec3 color3 = vec3(0.90, 0.22, 0.27);

      void main() {
        vec2 uv = vUv;
        vec2 res = uResolution;
        float aspect = res.x / res.y;

        // Ripple distortion from mouse
        vec2 delta = uv - uMouse;
        float dist = length(delta);
        float ripple = sin(dist * 20.0 - uTime * 2.0) * 0.03 * smoothstep(0.5, 0.0, dist);
        vec2 distortedUv = uv + normalize(delta) * ripple;

        // Secondary wave patterns
        float wave1 = sin(distortedUv.x * 8.0 + uTime * 0.8) * 0.01;
        float wave2 = sin(distortedUv.y * 10.0 - uTime * 1.2) * 0.01;
        distortedUv += vec2(wave1, wave2);

        // Mouse glow
        float glow = exp(-dist * 6.0) * 0.3;

        // Color mixing based on position + time
        float mix1 = sin(distortedUv.x * 3.0 + uTime * 0.3) * 0.5 + 0.5;
        float mix2 = cos(distortedUv.y * 3.0 + uTime * 0.4) * 0.5 + 0.5;
        float mix3 = sin((distortedUv.x + distortedUv.y) * 2.0 + uTime * 0.5) * 0.5 + 0.5;

        vec3 baseColor = mix(color1, color2, mix1);
        baseColor = mix(baseColor, color3, mix2 * 0.4);

        // Add mouse glow highlight
        baseColor += vec3(0.83, 0.69, 0.22) * glow * 0.5;

        // Subtle vignette
        float vignette = 1.0 - length(distortedUv - 0.5) * 0.6;
        baseColor *= vignette;

        // Time-based slow pulse
        float pulse = sin(uTime * 0.2) * 0.05 + 0.95;
        baseColor *= pulse;

        gl_FragColor = vec4(baseColor, 0.6);
      }
    `;

    function createShader(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }

    const vs = createShader(vsSource, gl.VERTEX_SHADER);
    const fs = createShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.warn('Program link error');
      return;
    }
    gl.useProgram(this.program);

    // Full-screen quad
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, 'aPosition');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    this.uTimeLoc = gl.getUniformLocation(this.program, 'uTime');
    this.uMouseLoc = gl.getUniformLocation(this.program, 'uMouse');
    this.uResLoc = gl.getUniformLocation(this.program, 'uResolution');
  }

  render() {
    const gl = this.gl;
    if (!gl || !this.program) return;

    this.time += this.options.rippleSpeed;

    gl.uniform1f(this.uTimeLoc, this.time);
    gl.uniform2f(this.uMouseLoc, this.mouseX, this.mouseY);
    gl.uniform2f(this.uResLoc, this.canvas.width, this.canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    this.animationId = requestAnimationFrame(() => this.render());
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.boundResize);
    if (this.container) {
      this.container.removeEventListener('mousemove', this.boundMouse);
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
    if (this.gl && this.program) {
      const ext = this.gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.container = null;
  }
}

/* ───────────────────────────────────────────────
   2. INTERACTIVE FLUID PARTICLE SIMULATION
   Low-overhead particle system with cursor interaction
   ─────────────────────────────────────────────── */
class FluidParticleField {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseVX = 0;
    this.mouseVY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.animationId = null;
    this.dpr = Math.min(window.devicePixelRatio, 2);
    this.boundResize = this.resize.bind(this);
    this.boundMouse = this.onMouse.bind(this);
    this.boundLeave = this.onMouseLeave.bind(this);

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('mousemove', this.boundMouse);
    this.canvas.addEventListener('mouseleave', this.boundLeave);

    this.createParticles();
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.width = w;
    this.height = h;
    this.ctx.scale(this.dpr, this.dpr);

    // Re-create particles on resize
    this.createParticles();
  }

  createParticles() {
    this.particles = [];
    const area = this.width * this.height;
    const count = Math.min(Math.floor(area / 4000), 120);

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.6 ? 45 : (Math.random() > 0.5 ? 0 : 160),
        opacity: Math.random() * 0.4 + 0.15,
        originX: Math.random() * this.width,
        originY: Math.random() * this.height,
      });
    }
  }

  onMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    const prevX = this.mouseX;
    const prevY = this.mouseY;
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    this.mouseVX = this.mouseX - prevX;
    this.mouseVY = this.mouseY - prevY;
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
  }

  onMouseLeave() {
    this.mouseX = -9999;
    this.mouseY = -9999;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const ctx = this.ctx;
    const particles = this.particles;
    const mx = this.mouseX;
    const my = this.mouseY;
    const mvx = this.mouseVX;
    const mvy = this.mouseVY;

    // Draw connections first (behind particles)
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(212, 175, 55, ${0.06 * (1 - dist / 120)})`;
          ctx.stroke();
        }
      }
    }

    // Update & draw particles
    for (const p of particles) {
      // Mouse repulsion / attraction
      if (mx > 0 && my > 0) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          // Push away
          p.vx += (dx / dist) * force * 0.4;
          p.vy += (dy / dist) * force * 0.4;

          // Swirl effect from mouse velocity
          const swirl = 0.15;
          p.vx += (-dy / dist) * force * swirl * mvx;
          p.vy += (dx / dist) * force * swirl * mvy;
        }
      }

      // Gentle drift back to origin
      p.vx += (p.originX - p.x) * 0.0005;
      p.vy += (p.originY - p.y) * 0.0005;

      // Damping
      p.vx *= 0.96;
      p.vy *= 0.96;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -20) p.x = this.width + 20;
      if (p.x > this.width + 20) p.x = -20;
      if (p.y < -20) p.y = this.height + 20;
      if (p.y > this.height + 20) p.y = -20;

      // Draw
      let color;
      if (p.hue === 45) color = '212, 175, 55';
      else if (p.hue === 0) color = '230, 57, 70';
      else color = '6, 78, 59';

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
      ctx.fill();

      // Glow for larger particles
      if (p.size > 1.8) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.opacity * 0.15})`;
        ctx.fill();
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.boundResize);
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.boundMouse);
      this.canvas.removeEventListener('mouseleave', this.boundLeave);
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
  }
}

/* ───────────────────────────────────────────────
   3. GLOBAL WEBGL MANAGER
   ─────────────────────────────────────────────── */
class WebGLManager {
  constructor() {
    this.liquidInstances = [];
    this.fluidField = null;
  }

  initLiquidDistortion(selector, options) {
    document.querySelectorAll(selector).forEach(el => {
      this.liquidInstances.push(new LiquidDistortion(el, options));
    });
  }

  initFluidField(canvasId) {
    this.fluidField = new FluidParticleField(canvasId);
  }

  destroyAll() {
    this.liquidInstances.forEach(inst => inst.destroy());
    this.liquidInstances = [];
    if (this.fluidField) {
      this.fluidField.destroy();
      this.fluidField = null;
    }
  }
}