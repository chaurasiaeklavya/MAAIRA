'use client';

import { useEffect, useRef } from 'react';
import type { Theme } from '../ExperienceProvider';

/**
 * Pointer-lit leather with a heat-stamped monogram (raw WebGL, no 3D library).
 *
 * The leather is a tileable procedural height map (leather-height.webp). The
 * MAAIRA monogram (monogram-stamp.webp, derived from the original logo
 * pixels) is pressed into that same height field — debossed, with the grain
 * flattened under the foil — so a single moving light shades the leather, the
 * stamp's bevelled walls and the foil together. On load the mark "stamps in"
 * and the foil sweeps across it, like a hot-foil press.
 *
 *   dark theme  → silver metallic foil (echoing the logo's silver)
 *   light theme → deep espresso pigment foil
 *
 * Performance & fallbacks:
 *  - renders only while on screen, visible, and not covered by a dialog/menu
 *  - device-pixel ratio capped (1.5 desktop, 1.25 small screens)
 *  - reduced motion → one static frame (stamp already pressed), no particles
 *  - no WebGL → the CSS leather and the DOM monogram stay visible
 *  - stamp texture fails → leather still renders; the DOM monogram stays
 *
 * Writes --light-x / --light-y (0–1) on the host for DOM layers, and sets
 * data-stamp="on" on the host once the stamped mark is drawn.
 */

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `
precision highp float;
uniform sampler2D uH;
uniform sampler2D uMark;
uniform vec2 uRes;
uniform vec2 uLight;
uniform float uTile;
uniform vec3 uBase;
uniform vec3 uWarm;
uniform vec3 uSpec;
uniform float uAmb;
uniform float uRadius;
uniform float uReveal;
uniform float uNormal;
uniform float uCrease;
uniform vec4 uMarkRect;   // content box in canvas px (y up): x, y, w, h
uniform vec4 uMarkMap;    // texture pad.xy, scale.xy
uniform float uMarkOn;
uniform float uStamp;     // press depth 0..1
uniform float uSweep;     // foil reveal front, 0..1.25
uniform vec3 uFoil;
uniform float uMetal;

const mat2 ROT = mat2(0.8, -0.6, 0.6, 0.8);

float leather(vec2 fc) {
  vec2 uv = vec2(fc.x, uRes.y - fc.y) / uTile;
  return texture2D(uH, uv).r * 0.72 + texture2D(uH, ROT * uv * 1.73 + 0.37).r * 0.28;
}

vec3 mark(vec2 fc) {
  if (uMarkOn < 0.5) return vec3(0.0);
  vec2 m = (fc - uMarkRect.xy) / uMarkRect.zw;
  vec2 t = uMarkMap.xy + vec2(m.x, 1.0 - m.y) * uMarkMap.zw;
  if (t.x < 0.0 || t.y < 0.0 || t.x > 1.0 || t.y > 1.0) return vec3(0.0);
  return texture2D(uMark, t).rgb;
}

float heightAt(vec2 fc) {
  vec3 mk = mark(fc);
  // Grain is pressed flat under the foil; the bevel profile sinks the mark.
  return leather(fc) * (1.0 - 0.85 * mk.r * uStamp) - mk.g * uStamp * 0.9;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float lc = leather(fc);
  vec3 mk = mark(fc);

  float hx = heightAt(fc + vec2(1.0, 0.0)) - heightAt(fc - vec2(1.0, 0.0));
  float hy = heightAt(fc + vec2(0.0, 1.0)) - heightAt(fc - vec2(0.0, 1.0));
  vec3 n = normalize(vec3(-hx * uNormal, -hy * uNormal, 1.0));

  vec3 lp = vec3(uLight, max(uRes.x, uRes.y) * 0.22);
  vec3 L = normalize(lp - vec3(fc, 0.0));
  float d = length(uLight - fc) / max(uRes.x, uRes.y);
  float fall = exp(-(d * d) / (uRadius * uRadius));

  float diff = max(dot(n, L), 0.0);
  vec3 Hh = normalize(L + vec3(0.0, 0.0, 1.0));
  float nh = max(dot(n, Hh), 0.0);
  float spec = pow(nh, 42.0);
  float crease = smoothstep(0.02, 0.5, lc);

  vec3 col = uBase * (uAmb + (1.0 - uAmb) * diff * (0.35 + 0.65 * fall));
  col = mix(col * uCrease, col, crease);
  col += uWarm * fall * diff * 0.55;
  col += uSpec * spec * (0.25 + 0.75 * fall) * crease;

  // Pressed-in occlusion around the stamp's walls.
  col *= 1.0 - 0.22 * uStamp * clamp(mk.b - mk.r * 0.7, 0.0, 1.0);

  // Foil: revealed by a sweep from left to right.
  float mx = (fc.x - uMarkRect.x) / uMarkRect.z;
  float sweep = 1.0 - smoothstep(uSweep - 0.14, uSweep, mx);
  float foil = smoothstep(0.32, 0.72, mk.r) * uStamp * sweep;
  float sheen = pow(nh, 70.0) * 1.3 + pow(nh, 9.0) * 0.32;
  vec3 foilCol = uFoil * (0.34 + 0.66 * diff * (0.4 + 0.6 * fall));
  foilCol += mix(vec3(0.05), vec3(1.0, 0.985, 0.96), uMetal) * sheen * (0.3 + 0.7 * fall);
  float band = exp(-pow((fc.x - uLight.x) / (uMarkRect.z * 0.4 + 1.0), 2.0)) * uMetal * 0.18;
  foilCol += vec3(band);
  col = mix(col, foilCol, foil);

  vec2 q = fc / uRes - 0.5;
  col *= 1.0 - dot(q, q) * 0.75;
  col *= uReveal;

  float dn = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dn - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

type Palette = {
  base: number[];
  warm: number[];
  spec: number[];
  amb: number;
  radius: number;
  normal: number;
  crease: number;
  foil: number[];
  metal: number;
  mote: string;
};

const PALETTES: Record<Theme, Palette> = {
  dark: {
    base: [0.235, 0.163, 0.128],
    warm: [0.28, 0.19, 0.12],
    spec: [0.5, 0.46, 0.42],
    amb: 0.3,
    radius: 0.42,
    normal: 2.0,
    crease: 0.78,
    foil: [0.74, 0.72, 0.69],
    metal: 1,
    mote: '255, 238, 214',
  },
  light: {
    base: [0.93, 0.885, 0.825],
    warm: [0.07, 0.05, 0.02],
    spec: [0.18, 0.16, 0.13],
    amb: 0.82,
    radius: 0.55,
    normal: 1.4,
    crease: 0.92,
    foil: [0.2, 0.135, 0.1],
    metal: 0.12,
    mote: '150, 112, 70',
  },
};

/** monogram-stamp.webp geometry (see scripts/build-brand-assets.mjs). */
const STAMP = { texW: 908, texH: 650, pad: 48, contentW: 812, contentH: 554 };

interface Props {
  theme: Theme;
  reducedMotion: boolean;
  hostRef: React.RefObject<HTMLElement | null>;
  /** Element whose box the stamped monogram should occupy. */
  anchorRef: React.RefObject<HTMLElement | null>;
  className?: string;
  particlesClassName?: string;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function LeatherCanvas({ theme, reducedMotion, hostRef, anchorRef, className, particlesClassName }: Props) {
  const glRef = useRef<HTMLCanvasElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef(theme);
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    themeRef.current = theme;
    redrawRef.current();
  }, [theme]);

  useEffect(() => {
    const canvas = glRef.current;
    const dustCanvas = dustRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return; // CSS fallback stays visible

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('[LeatherCanvas] shader error', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const names = [
      'uH', 'uMark', 'uRes', 'uLight', 'uTile', 'uBase', 'uWarm', 'uSpec', 'uAmb', 'uRadius', 'uReveal', 'uNormal',
      'uCrease', 'uMarkRect', 'uMarkMap', 'uMarkOn', 'uStamp', 'uSweep', 'uFoil', 'uMetal',
    ] as const;
    const U = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(prog, n)])) as Record<
      (typeof names)[number],
      WebGLUniformLocation | null
    >;
    gl.uniform1i(U.uH, 0);
    gl.uniform1i(U.uMark, 1);
    gl.uniform4f(
      U.uMarkMap,
      STAMP.pad / STAMP.texW,
      STAMP.pad / STAMP.texH,
      STAMP.contentW / STAMP.texW,
      STAMP.contentH / STAMP.texH,
    );

    let disposed = false;
    let ready = false;
    let markOn = false;
    const leatherTex = gl.createTexture();
    const markTex = gl.createTexture();

    const upload = (unit: number, tex: WebGLTexture | null, img: HTMLImageElement, format: number, repeat: boolean) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, img);
      const wrap = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      if (repeat) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    void Promise.allSettled([
      loadImage('/textures/leather-height.webp'),
      loadImage('/textures/monogram-stamp.webp'),
    ]).then(([leatherRes, markRes]) => {
      if (disposed || leatherRes.status !== 'fulfilled') return;
      upload(0, leatherTex, leatherRes.value, gl.LUMINANCE, true);
      if (markRes.status === 'fulfilled') {
        upload(1, markTex, markRes.value, gl.RGB, false);
        markOn = true;
      }
      ready = true;
      start = performance.now();
      measure();
      requestFrame();
    });

    const small = () => window.innerWidth < 700;
    let dpr = 1;
    let W = 0;
    let H = 0;
    const markRect = { x: 0, y: 0, w: 1, h: 1 };

    /** Place the stamp where the DOM anchor sits (canvas px, y up). */
    const measure = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const c = canvas.getBoundingClientRect();
      const a = anchor.getBoundingClientRect();
      const sx = W / Math.max(1, c.width);
      const sy = H / Math.max(1, c.height);
      markRect.w = Math.max(1, a.width * sx);
      markRect.h = Math.max(1, a.height * sy);
      markRect.x = (a.left - c.left) * sx;
      markRect.y = H - (a.top - c.top + a.height) * sy;
      requestFrame();
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.25 : 1.5);
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width * dpr));
      H = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = W;
      canvas.height = H;
      gl.viewport(0, 0, W, H);
      if (dustCanvas) {
        dustCanvas.width = Math.round(rect.width * Math.min(window.devicePixelRatio || 1, 2));
        dustCanvas.height = Math.round(rect.height * Math.min(window.devicePixelRatio || 1, 2));
      }
      seedMotes();
      measure();
      requestFrame();
    };

    // Light position in 0–1 host coordinates (y down).
    const target = { x: 0.32, y: 0.3 };
    const light = { x: reducedMotion ? 0.36 : 0.08, y: reducedMotion ? 0.3 : 0.12 };
    let pointerActive = false;
    let lastPointer = 0;

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = host.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = (e.clientY - r.top) / r.height;
      pointerActive = true;
      lastPointer = performance.now();
      requestFrame();
    };
    const onLeave = () => {
      pointerActive = false;
    };

    // Dust motes
    type Mote = { x: number; y: number; r: number; vx: number; vy: number; phase: number; a: number };
    let motes: Mote[] = [];
    function seedMotes() {
      if (!dustCanvas || reducedMotion) return;
      const count = small() ? 16 : 34;
      motes = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.5 + Math.random() * 1.4,
        vx: (Math.random() - 0.5) * 0.004,
        vy: -0.004 - Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2,
        a: 0.35 + Math.random() * 0.65,
      }));
    }
    const dctx = dustCanvas?.getContext('2d') ?? null;

    let start = performance.now();
    let raf = 0;
    let visible = true;
    let lastCss = { x: -1, y: -1 };
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

    const draw = (now: number) => {
      raf = 0;
      if (!ready) return;
      const p = PALETTES[themeRef.current];
      const t = (now - start) / 1000;

      if (!reducedMotion) {
        if (!pointerActive || now - lastPointer > 4000) {
          // idle drift: a slow figure-of-eight across the upper half
          target.x = 0.5 + Math.sin(t * 0.13) * 0.32;
          target.y = 0.36 + Math.sin(t * 0.21) * 0.16;
        }
        const k = pointerActive ? 0.075 : 0.02;
        light.x += (target.x - light.x) * k;
        light.y += (target.y - light.y) * k;
      }
      const reveal = reducedMotion ? 1 : clamp01(t / 1.6);
      const eased = 1 - Math.pow(1 - reveal, 3);
      // Hot-foil press: the die lands, overshoots a touch, settles; then the foil sweeps.
      const s = reducedMotion ? 1 : clamp01((t - 0.5) / 0.65);
      const stamp = (1 - Math.pow(1 - s, 3)) * (1 + 0.1 * Math.sin(s * Math.PI));
      const sweep = reducedMotion ? 1.25 : clamp01((t - 0.95) / 1.15) * 1.25;

      gl.uniform2f(U.uRes, W, H);
      gl.uniform2f(U.uLight, light.x * W, (1 - light.y) * H);
      // Grain scales with the viewport so phones see fine grain, not pebbles.
      gl.uniform1f(U.uTile, Math.min(480, Math.max(250, (W / dpr) * 0.3)) * dpr);
      gl.uniform3fv(U.uBase, p.base);
      gl.uniform3fv(U.uWarm, p.warm);
      gl.uniform3fv(U.uSpec, p.spec);
      gl.uniform1f(U.uAmb, p.amb);
      gl.uniform1f(U.uRadius, p.radius);
      gl.uniform1f(U.uNormal, p.normal);
      gl.uniform1f(U.uCrease, p.crease);
      gl.uniform1f(U.uReveal, 0.15 + 0.85 * eased);
      gl.uniform4f(U.uMarkRect, markRect.x, markRect.y, markRect.w, markRect.h);
      gl.uniform1f(U.uMarkOn, markOn ? 1 : 0);
      gl.uniform1f(U.uStamp, stamp);
      gl.uniform1f(U.uSweep, sweep);
      gl.uniform3fv(U.uFoil, p.foil);
      gl.uniform1f(U.uMetal, p.metal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (canvas.dataset.ready !== 'true') canvas.dataset.ready = 'true';
      if (markOn && host.dataset.stamp !== 'on') host.dataset.stamp = 'on';

      if (Math.abs(light.x - lastCss.x) > 0.002 || Math.abs(light.y - lastCss.y) > 0.002) {
        host.style.setProperty('--light-x', light.x.toFixed(3));
        host.style.setProperty('--light-y', light.y.toFixed(3));
        lastCss = { x: light.x, y: light.y };
      }

      if (dctx && dustCanvas && motes.length) {
        const dw = dustCanvas.width;
        const dh = dustCanvas.height;
        const scale = dw / Math.max(1, dustCanvas.clientWidth);
        dctx.clearRect(0, 0, dw, dh);
        for (const m of motes) {
          m.x += m.vx * 0.016 + Math.sin(t * 0.6 + m.phase) * 0.00012;
          m.y += m.vy * 0.016;
          if (m.y < -0.02) {
            m.y = 1.02;
            m.x = Math.random();
          }
          if (m.x < -0.02) m.x = 1.02;
          if (m.x > 1.02) m.x = -0.02;
          const dx = (m.x - light.x) * (dw / dh);
          const dy = m.y - light.y;
          const glow = Math.exp(-(dx * dx + dy * dy) / 0.06);
          const alpha = m.a * glow * (0.55 + 0.45 * Math.sin(t * 1.3 + m.phase)) * eased;
          if (alpha < 0.02) continue;
          dctx.beginPath();
          dctx.fillStyle = `rgba(${p.mote}, ${alpha.toFixed(3)})`;
          dctx.arc(m.x * dw, m.y * dh, m.r * scale, 0, Math.PI * 2);
          dctx.fill();
        }
      }

      if (!reducedMotion && visible && !document.hidden && !covered()) requestFrame();
    };

    // Paused while a dialog or the menu covers the page (scroll lock class).
    const covered = () => document.documentElement.classList.contains('is-locked');

    function requestFrame() {
      if (!raf) raf = requestAnimationFrame(draw);
    }
    redrawRef.current = requestFrame;

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestFrame();
    });
    io.observe(host);

    const onVisibility = () => {
      if (!document.hidden) requestFrame();
    };
    const lockObserver = new MutationObserver(() => {
      if (!covered()) requestFrame();
    });
    lockObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (anchorRef.current) ro.observe(anchorRef.current);
    resize();

    host.addEventListener('pointermove', onPointer, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      lockObserver.disconnect();
      host.removeEventListener('pointermove', onPointer);
      host.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      delete host.dataset.stamp;
      redrawRef.current = () => {};
      gl.deleteTexture(leatherTex);
      gl.deleteTexture(markTex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [hostRef, anchorRef, reducedMotion]);

  return (
    <>
      <canvas ref={glRef} className={className} aria-hidden="true" />
      {!reducedMotion && <canvas ref={dustRef} className={particlesClassName} aria-hidden="true" />}
    </>
  );
}
