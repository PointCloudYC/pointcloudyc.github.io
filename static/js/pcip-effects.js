// pcip-effects.js — point-cloud & BIM identity flourishes for the homepage.
// Pure 2D canvas, zero dependencies. Each module no-ops if its flag is off or its
// markup is missing, and every module falls back to static / plain content when the
// visitor prefers reduced motion. Palette is locked to the "Contour & Ink" tokens.
//
// ---- Toggle effects here (or set window.PCIP_EFFECTS before this script loads) ----
//   portrait   : pointillist avatar — assembles on load, disperses on hover.
//   scanBim    : "Scan -> Segment -> BIM" pipeline band under the header.
//   lidarSweep : PREVIEW — reveal the portrait with a LiDAR scan line instead of
//                assembling. Requires `portrait: true`. Flip to true to try it.
//   liveViewer : PREVIEW — drag-to-orbit 3D point cloud (placeholder MEP scene until
//                you drop in a real Industrial3D sample). Flip to true to try it.
(function () {
  'use strict';

  var CONFIG = Object.assign({
    portrait: true,
    scanBim: false,
    lidarSweep: false,
    liveViewer: false
  }, window.PCIP_EFFECTS || {});
  window.PCIP_EFFECTS = CONFIG;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Brand palette (Contour & Ink) -------------------------------------------
  var C = {
    ink: '#1c1d21', inkSoft: '#53555f', inkFaint: '#85868f',
    paper: '#fbfaf6', paperAlt: '#f2efe5', line: '#e2ddd0', lineStrong: '#cdc5b2',
    accent: '#1f5c60', accentStrong: '#123f42', ember: '#b5541f'
  };

  // ---- Tiny helpers ------------------------------------------------------------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function hexRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  // Blend two hex colours, return an "rgb(...)" string (t: 0 -> a, 1 -> b).
  function mix(aHex, bHex, t) {
    var a = hexRgb(aHex), b = hexRgb(bHex);
    t = clamp(t, 0, 1);
    return 'rgb(' + Math.round(a.r + (b.r - a.r) * t) + ',' +
      Math.round(a.g + (b.g - a.g) * t) + ',' +
      Math.round(a.b + (b.b - a.b) * t) + ')';
  }

  function classColor(cls) {
    if (cls === 'pipe') return C.accent;
    if (cls === 'pipe2') return C.accentStrong;
    if (cls === 'duct') return C.ember;
    return C.inkFaint; // wall / floor / structure
  }

  // Rotate a point by yaw (around Y) then tilt (around X).
  function rot(x, y, z, yaw, tilt) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw);
    var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    var cx = Math.cos(tilt), sx = Math.sin(tilt);
    return { x: x1, y: y * cx - z1 * sx, z: y * sx + z1 * cx };
  }

  // Fit a canvas to its CSS box at the device pixel ratio; returns a scaled context.
  function fit(canvas) {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: r.width, h: r.height };
  }

  // ---- Geometry samplers (shared by the pipeline band + live viewer) -----------
  // Sample points on the surface of a tube from a to b.
  function samplePipe(a, b, radius, rings, perRing, cls) {
    var pts = [];
    var ax = b.x - a.x, ay = b.y - a.y, az = b.z - a.z;
    var len = Math.hypot(ax, ay, az) || 1;
    var ux = ax / len, uy = ay / len, uz = az / len;
    var tx = 0, ty = 1, tz = 0;
    if (Math.abs(uy) > 0.9) { tx = 1; ty = 0; tz = 0; }
    var e1x = uy * tz - uz * ty, e1y = uz * tx - ux * tz, e1z = ux * ty - uy * tx;
    var e1l = Math.hypot(e1x, e1y, e1z) || 1; e1x /= e1l; e1y /= e1l; e1z /= e1l;
    var e2x = uy * e1z - uz * e1y, e2y = uz * e1x - ux * e1z, e2z = ux * e1y - uy * e1x;
    for (var i = 0; i <= rings; i++) {
      var t = i / rings;
      var cx = a.x + ax * t, cy = a.y + ay * t, cz = a.z + az * t;
      for (var j = 0; j < perRing; j++) {
        var ang = (j / perRing) * Math.PI * 2;
        var ca = Math.cos(ang) * radius, sa = Math.sin(ang) * radius;
        pts.push({
          x: cx + e1x * ca + e2x * sa,
          y: cy + e1y * ca + e2y * sa,
          z: cz + e1z * ca + e2z * sa,
          cls: cls
        });
      }
    }
    return pts;
  }

  // Sample points on the four long faces of a rectangular duct running along Z.
  function sampleDuct(cx, cy, cz, w, h, len, along, around, cls) {
    var pts = [], per = 2 * (w + h);
    for (var i = 0; i <= along; i++) {
      var z = cz - len / 2 + len * (i / along);
      for (var j = 0; j < around; j++) {
        var d = (j / around) * per, px, py;
        if (d < w) { px = -w / 2 + d; py = -h / 2; }
        else if (d < w + h) { px = w / 2; py = -h / 2 + (d - w); }
        else if (d < 2 * w + h) { px = w / 2 - (d - w - h); py = h / 2; }
        else { px = -w / 2; py = h / 2 - (d - 2 * w - h); }
        pts.push({ x: cx + px, y: cy + py, z: z, cls: cls });
      }
    }
    return pts;
  }

  function sampleFloor(w, d, step, y, cls) {
    var pts = [];
    for (var x = -w / 2; x <= w / 2; x += step)
      for (var z = -d / 2; z <= d / 2; z += step)
        pts.push({ x: x, y: y, z: z, cls: cls });
    return pts;
  }

  // Run a render loop only while the target is on screen (saves battery when scrolled away).
  function whenVisible(el, start, stop) {
    if (!('IntersectionObserver' in window)) { start(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
    }, { threshold: 0.05 });
    io.observe(el);
  }

  // =============================================================================
  // MODULE 1 — Point-cloud portrait
  // =============================================================================
  (function portrait() {
    if (!CONFIG.portrait) return;
    var img = document.getElementById('gphoto');
    var frame = img && img.closest ? img.closest('.photo-frame') : null;
    if (!img || !frame) return;

    var portraitFile = (img.getAttribute('src') || '').split('/').pop();
    function isPortrait() { return (img.currentSrc || img.src).indexOf(portraitFile) !== -1; }

    var canvas = document.createElement('canvas');
    canvas.className = 'pcip-portrait-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    frame.appendChild(canvas);

    var ctx, W, H, size, points = null, built = false, running = false;
    var introStart = 0, sweepStart = 0, dispE = 0, targetDisp = 0;
    var useSweep = CONFIG.lidarSweep;

    // Sample the (circular) portrait into a grid of points, duotone by luminance.
    function build() {
      var box = frame.getBoundingClientRect();
      size = Math.round(box.width);
      var gap = size > 260 ? 4 : 3.4;
      var off = document.createElement('canvas');
      off.width = size; off.height = size;
      var octx = off.getContext('2d');
      var iw = img.naturalWidth, ih = img.naturalHeight;
      if (!iw || !ih) return false;
      var s = Math.max(size / iw, size / ih);      // object-fit: cover
      octx.drawImage(img, (size - iw * s) / 2, (size - ih * s) / 2, iw * s, ih * s);
      var data;
      try { data = octx.getImageData(0, 0, size, size).data; }
      catch (e) { return false; }                  // tainted canvas -> keep plain photo
      var cx = size / 2, cy = size / 2, R = size / 2 - 1, out = [];
      for (var y = gap / 2; y < size; y += gap) {
        for (var x = gap / 2; x < size; x += gap) {
          var dx = x - cx, dy = y - cy;
          if (dx * dx + dy * dy > R * R) continue;
          var idx = ((y | 0) * size + (x | 0)) * 4;
          if (data[idx + 3] < 12) continue;
          var lum = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;
          var ang = Math.atan2(dy, dx);
          out.push({
            tx: x, ty: y,
            col: mix(C.accentStrong, C.paper, easeOutCubic(lum)),
            // scattered start position + outward burst vector for hover dispersal
            sx: cx + Math.cos(ang) * size, sy: cy + Math.sin(ang) * size,
            dvx: Math.cos(ang) * size * (0.12 + Math.random() * 0.12),
            dvy: Math.sin(ang) * size * (0.12 + Math.random() * 0.12),
            rv: Math.random()
          });
        }
      }
      points = out;
      return true;
    }

    function ensureBuilt() {
      if (built || !isPortrait() || !img.naturalWidth) return;
      var f = fit(canvas); if (!f) return;
      ctx = f.ctx; W = f.w; H = f.h;
      if (!build()) { canvas.remove(); built = true; return; } // give up -> plain photo
      built = true;
      if (REDUCED) { renderStatic(); }
      else { introStart = performance.now(); sweepStart = introStart; start(); }
    }

    function pointColor(p, alpha) {
      return alpha >= 1 ? p.col : p.col.replace('rgb(', 'rgba(').replace(')', ',' + alpha + ')');
    }

    function draw(getPos) {
      ctx.clearRect(0, 0, W, H);
      var sc = W / size, ps = size > 260 ? 1.7 : 1.4;
      for (var i = 0; i < points.length; i++) {
        var p = points[i], r = getPos(p, i);
        if (!r) continue;
        ctx.fillStyle = r.a != null ? pointColor(p, r.a) : p.col;
        ctx.fillRect(r.x * sc - ps / 2, r.y * sc - ps / 2, ps, ps);
      }
    }

    function renderStatic() {
      draw(function (p) { return { x: p.tx, y: p.ty }; });
    }

    function frameLoop(now) {
      if (!running) return;
      var done;
      if (useSweep) {
        var s = clamp((now - sweepStart) / 1600, 0, 1);
        var line = s * size;
        draw(function (p) {
          if (p.tx > line) return null;
          var a = clamp((line - p.tx) / 26, 0, 1);           // quick fade-in behind the line
          return { x: p.tx + p.dvx * dispE, y: p.ty + p.dvy * dispE, a: a };
        });
        if (s < 1) {                                          // draw the scan line + sparks
          ctx.strokeStyle = C.accent;
          ctx.globalAlpha = 0.85; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(line * (W / size), 0); ctx.lineTo(line * (W / size), H);
          ctx.stroke(); ctx.globalAlpha = 1;
        }
        done = s >= 1;
      } else {
        var e = clamp((now - introStart) / 1100, 0, 1);
        draw(function (p) {
          var pe = easeOutCubic(clamp((e - p.rv * 0.35) / 0.65, 0, 1));
          var bx = p.sx + (p.tx - p.sx) * pe, by = p.sy + (p.ty - p.sy) * pe;
          return { x: bx + p.dvx * dispE, y: by + p.dvy * dispE };
        });
        done = e >= 1;
      }
      // Ease hover dispersal; once settled + no hover, render static and idle the loop.
      dispE += (targetDisp - dispE) * 0.08;
      if (done && targetDisp === 0 && dispE < 0.003) { dispE = 0; renderStatic(); running = false; return; }
      requestAnimationFrame(frameLoop);
    }

    function start() { if (!running) { running = true; requestAnimationFrame(frameLoop); } }

    if (!REDUCED) {
      frame.addEventListener('pointerenter', function () { targetDisp = 1; start(); });
      frame.addEventListener('pointerleave', function () { targetDisp = 0; start(); });
    }

    img.addEventListener('load', function () {
      ensureBuilt();
      if (built && points) canvas.style.display = isPortrait() ? 'block' : 'none';
    });
    if (img.complete) ensureBuilt();

    var rt;
    window.addEventListener('resize', function () {
      if (!built || !points) return;
      clearTimeout(rt);
      rt = setTimeout(function () {
        var f = fit(canvas); if (!f) return;
        ctx = f.ctx; W = f.w; H = f.h;
        if (build()) { REDUCED ? renderStatic() : (introStart = performance.now(), sweepStart = introStart, start()); }
      }, 200);
    }, { passive: true });
  })();

  // =============================================================================
  // MODULE 2 — Scan -> Segment -> BIM pipeline band
  // =============================================================================
  (function scanBim() {
    if (!CONFIG.scanBim) return;
    var band = document.getElementById('scan-bim-band');
    var canvas = document.getElementById('scan-bim-canvas');
    if (!band || !canvas) return;
    band.hidden = false;

    // A small MEP scene: two straight pipes, an elbow pair, and an overhead duct.
    var scene = []
      .concat(samplePipe({ x: -2.6, y: -0.3, z: 0 }, { x: 2.6, y: -0.3, z: 0 }, 0.34, 46, 16, 'pipe'))
      .concat(samplePipe({ x: 1.4, y: -0.3, z: 1.5 }, { x: 1.4, y: -0.3, z: -0.3 }, 0.22, 22, 12, 'pipe2'))
      .concat(samplePipe({ x: 1.4, y: -0.3, z: -0.3 }, { x: 2.4, y: 0.9, z: -0.3 }, 0.22, 18, 12, 'pipe2'))
      .concat(sampleDuct(-0.3, 1.05, 0, 0.75, 0.5, 4.4, 32, 22, 'duct'));

    // Centrelines for the BIM overlay.
    var primitives = [
      { a: { x: -2.6, y: -0.3, z: 0 }, b: { x: 2.6, y: -0.3, z: 0 }, cls: 'pipe' },
      { a: { x: 1.4, y: -0.3, z: 1.5 }, b: { x: 1.4, y: -0.3, z: -0.3 }, cls: 'pipe2' },
      { a: { x: 1.4, y: -0.3, z: -0.3 }, b: { x: 2.4, y: 0.9, z: -0.3 }, cls: 'pipe2' },
      { a: { x: -0.3, y: 1.05, z: -2.2 }, b: { x: -0.3, y: 1.05, z: 2.2 }, cls: 'duct' }
    ];

    var ctx, W, H, running = false, tilt = 0.5, LOOP = 12000;

    function project(p, yaw) {
      var r = rot(p.x, p.y, p.z, yaw, tilt);
      return { x: W / 2 + r.x * (W / 20), y: H / 2 - r.y * (H / 7) - 6, z: r.z };
    }

    function render(now) {
      var f = fit(canvas); if (!f) return; ctx = f.ctx; W = f.w; H = f.h;
      // Static (reduced motion): resolved BIM state at a fixed angle.
      var lt = REDUCED ? 0.82 : ((now % LOOP) / LOOP);
      var yaw = REDUCED ? -0.5 : (now / 5200);

      // Timeline: scan -> recolor -> segment -> BIM -> hold.
      var scanX = clamp(lt / 0.30, 0, 1);
      var segT = clamp((lt - 0.28) / 0.14, 0, 1);
      var bimT = clamp((lt - 0.60) / 0.14, 0, 1);
      if (lt > 0.90) { segT = 1 - clamp((lt - 0.90) / 0.10, 0, 1); bimT = 1 - clamp((lt - 0.90) / 0.10, 0, 1); }

      ctx.clearRect(0, 0, W, H);
      var leftX = -W / 2, rightX = W / 2, scanLine = leftX + (rightX - leftX) * scanX;

      for (var i = 0; i < scene.length; i++) {
        var p = scene[i], s = project(p, yaw);
        if (scanX < 1 && (s.x - W / 2) > scanLine) continue;   // not yet acquired
        var zN = clamp((s.z + 3) / 6, 0, 1);
        var col = mix(C.inkFaint, classColor(p.cls), segT);
        var alpha = (0.35 + 0.5 * zN) * (1 - 0.6 * bimT);
        ctx.fillStyle = col.replace('rgb(', 'rgba(').replace(')', ',' + alpha.toFixed(3) + ')');
        var sz = 1.1 + 1.5 * zN;
        ctx.fillRect(s.x - sz / 2, s.y - sz / 2, sz, sz);
      }

      if (scanX < 1 && !REDUCED) {                             // acquisition scan line
        var lx = W / 2 + scanLine;
        ctx.strokeStyle = C.accent; ctx.globalAlpha = 0.7; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lx, 8); ctx.lineTo(lx, H - 8); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (bimT > 0) {                                          // BIM centreline overlay
        ctx.lineWidth = 2; ctx.lineCap = 'round';
        for (var k = 0; k < primitives.length; k++) {
          var pr = primitives[k], a = project(pr.a, yaw), b = project(pr.b, yaw);
          ctx.strokeStyle = classColor(pr.cls); ctx.globalAlpha = bimT;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          [a, b].forEach(function (n) {
            ctx.fillStyle = classColor(pr.cls);
            ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, Math.PI * 2); ctx.fill();
          });
        }
        ctx.globalAlpha = 1;
      }

      if (running) requestAnimationFrame(render);
    }

    function start() { if (REDUCED) { render(performance.now()); return; } if (!running) { running = true; requestAnimationFrame(render); } }
    function stop() { running = false; }

    whenVisible(band, start, stop);
    window.addEventListener('resize', function () { if (REDUCED) render(performance.now()); }, { passive: true });
  })();

  // =============================================================================
  // MODULE 4 — Live orbitable point-cloud viewer (placeholder MEP scene)
  // =============================================================================
  (function liveViewer() {
    if (!CONFIG.liveViewer) return;
    var band = document.getElementById('live-viewer-band');
    var canvas = document.getElementById('live-viewer-canvas');
    if (!band || !canvas) return;
    band.hidden = false;

    var scene = []
      .concat(sampleFloor(6, 4, 0.34, -1.5, 'floor'))
      .concat(samplePipe({ x: -2.8, y: 0.6, z: -1.4 }, { x: 2.8, y: 0.6, z: -1.4 }, 0.3, 60, 16, 'pipe'))
      .concat(samplePipe({ x: -2.8, y: 0.2, z: 1.2 }, { x: 2.8, y: 0.2, z: 1.2 }, 0.24, 60, 14, 'pipe2'))
      .concat(sampleDuct(0, 1.2, 0, 0.8, 0.55, 5.4, 44, 24, 'duct'));

    var ctx, W, H, running = false;
    var yaw = -0.5, pitch = 0.35, autoYaw = REDUCED ? 0 : 0.0016, dragging = false, lx = 0, ly = 0;
    var f = 300, camZ = 8;

    function render() {
      var box = fit(canvas); if (!box) return; ctx = box.ctx; W = box.w; H = box.h;
      if (!dragging) yaw += autoYaw;
      ctx.clearRect(0, 0, W, H);

      var proj = [];
      for (var i = 0; i < scene.length; i++) {
        var p = scene[i], r = rot(p.x, p.y, p.z, yaw, pitch), depth = camZ - r.z;
        if (depth < 0.4) continue;
        proj.push({ x: W / 2 + r.x * f / depth, y: H / 2 - r.y * f / depth, d: depth, cls: p.cls });
      }
      proj.sort(function (a, b) { return b.d - a.d; });         // painter's order: far first
      for (var j = 0; j < proj.length; j++) {
        var q = proj[j], sz = clamp(0.7 * f / q.d, 0.5, 2.6), a = clamp(2.2 - q.d * 0.16, 0.25, 0.95);
        ctx.fillStyle = classColor(q.cls).replace('rgb(', 'rgba(').replace(')', ',' + a.toFixed(3) + ')');
        ctx.fillRect(q.x - sz / 2, q.y - sz / 2, sz, sz);
      }
      if (running) requestAnimationFrame(render);
    }

    function start() { if (!running) { running = true; requestAnimationFrame(render); } }
    function stop() { running = false; }

    function down(e) { dragging = true; var t = e.touches ? e.touches[0] : e; lx = t.clientX; ly = t.clientY; }
    function move(e) {
      if (!dragging) return;
      var t = e.touches ? e.touches[0] : e;
      yaw += (t.clientX - lx) * 0.008; pitch = clamp(pitch + (t.clientY - ly) * 0.006, -0.4, 1.1);
      lx = t.clientX; ly = t.clientY;
      if (e.cancelable) e.preventDefault();
    }
    function up() { dragging = false; }

    canvas.addEventListener('mousedown', down); canvas.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('mousemove', move); canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', up); window.addEventListener('touchend', up);

    whenVisible(band, start, stop);
  })();
})();
