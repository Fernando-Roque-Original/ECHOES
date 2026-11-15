(() => {
  const OVERLAY_ID = 'echos-cinematic-space';
  const WIDTH = 1920;
  const HEIGHT = 1080;
  const CENTER_X = WIDTH / 2;
  const CENTER_Y = HEIGHT / 2;
  const FOCAL = 920;
  const STAR_COUNT = 1700;
  const DEBRIS_COUNT = 54;

  if (window.__echoesCinema || document.getElementById(OVERLAY_ID)) return;

  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));
  const smoothstep = (start, end, value) => {
    const amount = clamp((value - start) / Math.max(0.0001, end - start), 0, 1);
    return amount * amount * (3 - 2 * amount);
  };

  const makeStar = (deep = false) => ({
    x: random(-1450, 1450),
    y: random(-900, 900),
    z: deep ? random(400, 1450) : random(8, 1450),
    size: random(0.55, 2.5),
    heat: Math.random(),
    twinkle: random(0, Math.PI * 2),
  });

  const makeDebris = (type = null) => {
    const kinds = ['shard', 'panel', 'rod', 'ring', 'cluster'];
    const kind = type ?? kinds[Math.floor(Math.random() * kinds.length)];
    const pointCount = 5 + Math.floor(Math.random() * 5);
    const points = Array.from({ length: pointCount }, (_, index) => {
      const angle = (index / pointCount) * Math.PI * 2;
      const radius = random(0.48, 1.15);
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * random(0.55, 1.15),
        z: random(-0.18, 0.18),
      };
    });

    return {
      kind,
      x: random(-720, 720),
      y: random(-430, 430),
      z: random(70, 1550),
      size: random(28, 145),
      rotation: [random(0, 6.2), random(0, 6.2), random(0, 6.2)],
      spin: [random(-0.32, 0.32), random(-0.38, 0.38), random(-0.25, 0.25)],
      points,
      phase: random(0, Math.PI * 2),
      panelLight: Math.random() > 0.36,
    };
  };

  const stars = Array.from({ length: STAR_COUNT }, () => makeStar());
  stars.slice(0, 420).forEach((star) => {
    star.z = random(25, 350);
  });
  const debris = Array.from({ length: DEBRIS_COUNT }, () => makeDebris());

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    overflow: hidden;
    background: #000;
    pointer-events: none;
    opacity: 1;
    contain: strict;
    isolation: isolate;
  `;

  const background = document.createElement('div');
  background.style.cssText = `
    position: absolute;
    inset: -6%;
    background:
      radial-gradient(ellipse at 62% 43%, rgba(215, 163, 102, 0.17), transparent 31%),
      radial-gradient(ellipse at 37% 57%, rgba(72, 122, 140, 0.12), transparent 42%),
      radial-gradient(ellipse at 50% 50%, rgba(12, 22, 31, 0.05), rgba(0, 0, 0, 0.92) 78%),
      url('/assets/space/milky-way-eso-4096.jpg') center / cover no-repeat;
    filter: brightness(0.76) contrast(1.18) saturate(0.78);
    transform: scale(1.08);
    transform-origin: 50% 50%;
  `;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  `;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  const vignette = document.createElement('div');
  vignette.style.cssText = `
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 50% 50%, transparent 42%, rgba(0, 0, 0, 0.83) 108%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.38), transparent 18%, transparent 82%, rgba(0, 0, 0, 0.38));
    box-shadow: inset 0 0 180px rgba(0, 0, 0, 0.76);
  `;

  const aperture = document.createElement('div');
  aperture.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120vmin;
    height: 120vmin;
    border: 2px solid rgba(244, 203, 126, 0.62);
    border-radius: 50%;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.03);
    box-shadow:
      0 0 42px rgba(244, 203, 126, 0.4),
      inset 0 0 90px rgba(244, 203, 126, 0.17);
    mix-blend-mode: screen;
  `;

  const flash = document.createElement('div');
  flash.style.cssText = `
    position: absolute;
    inset: 0;
    opacity: 0;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(255, 244, 219, 0.98) 0%,
      rgba(244, 202, 126, 0.5) 20%,
      rgba(0, 0, 0, 0) 66%
    );
    mix-blend-mode: screen;
  `;

  const blackout = document.createElement('div');
  blackout.style.cssText = `
    position: absolute;
    inset: 0;
    background: #000;
    opacity: 1;
  `;

  overlay.append(background, canvas, vignette, aperture, flash, blackout);
  document.documentElement.append(overlay);

  let startedAt = 0;
  let outroStartedAt = 0;
  let lastFrameAt = 0;
  let mode = 'idle';
  let raf = 0;
  let introBlack = 1;
  let introTravel = 0;
  let outroTravel = 0;

  const rotatePoint = (point, rotation) => {
    let { x, y, z } = point;
    const [rx, ry, rz] = rotation;

    let cy = Math.cos(ry);
    let sy = Math.sin(ry);
    [x, z] = [x * cy + z * sy, -x * sy + z * cy];

    const cx = Math.cos(rx);
    const sx = Math.sin(rx);
    [y, z] = [y * cx - z * sx, y * sx + z * cx];

    const cz = Math.cos(rz);
    const sz = Math.sin(rz);
    [x, y] = [x * cz - y * sz, x * sz + y * cz];
    return { x, y, z };
  };

  const project = (x, y, z) => {
    const scale = FOCAL / Math.max(4, z);
    return {
      x: CENTER_X + x * scale,
      y: CENTER_Y + y * scale,
      scale,
    };
  };

  const resetStar = (star, deep = false) => {
    star.x = random(-1450, 1450);
    star.y = random(-900, 900);
    star.z = deep ? random(1100, 1500) : random(900, 1500);
    star.size = random(0.55, 2.5);
    star.heat = Math.random();
    star.twinkle = random(0, Math.PI * 2);
  };

  const resetDebris = (object) => {
    Object.assign(object, makeDebris());
    object.z = random(1000, 1700);
  };

  const drawBackgroundMotion = (time, velocity) => {
    const driftX = Math.sin(time * 0.08) * 22;
    const driftY = Math.cos(time * 0.065) * 15;
    const zoom = 1.08 + Math.min(0.32, velocity * 0.045);
    background.style.transform =
      `translate3d(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px, 0) ` +
      `scale(${zoom.toFixed(4)}) rotate(${(driftX * 0.012).toFixed(3)}deg)`;
  };

  const drawStars = (time, delta, velocity, alpha) => {
    context.save();
    context.globalCompositeOperation = 'lighter';
    context.lineCap = 'round';

    for (const star of stars) {
      star.z -= velocity * delta;
      if (star.z <= 5) resetStar(star);

      const current = project(star.x, star.y, star.z);
      const previous = project(
        star.x,
        star.y,
        Math.min(1550, star.z + velocity * delta * 2.6),
      );
      if (
        current.x < -120 ||
        current.x > WIDTH + 120 ||
        current.y < -120 ||
        current.y > HEIGHT + 120
      ) {
        continue;
      }

      const depth = 1 - star.z / 1550;
      const twinkle = 0.72 + Math.sin(time * 1.8 + star.twinkle) * 0.28;
      const size = Math.max(0.35, star.size * (0.45 + depth * 2.2));
      const brightness = clamp((0.2 + depth * 0.95) * twinkle * alpha, 0, 1);
      const warm = star.heat > 0.66;
      const color = warm ? '255, 226, 183' : '205, 227, 240';
      const trail =
        velocity > 350
          ? clamp((velocity - 350) / 680, 0, 1)
          : 0;

      if (trail > 0.02) {
        context.strokeStyle = `rgba(${color}, ${brightness * 0.62})`;
        context.lineWidth = Math.max(0.35, size * 0.72);
        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.lineTo(current.x, current.y);
        context.stroke();
      }

      context.fillStyle = `rgba(${color}, ${brightness})`;
      context.beginPath();
      context.arc(current.x, current.y, size, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  };

  const drawDebrisObject = (object, time, delta, velocity, alpha) => {
    object.z -= velocity * delta;
    if (object.z < 36) resetDebris(object);

    object.rotation[0] += object.spin[0] * delta;
    object.rotation[1] += object.spin[1] * delta;
    object.rotation[2] += object.spin[2] * delta;

    const objectScale = FOCAL / object.z;
    const center = project(object.x, object.y, object.z);
    const size = object.size * objectScale;
    if (
      center.x + size < -160 ||
      center.x - size > WIDTH + 160 ||
      center.y + size < -160 ||
      center.y - size > HEIGHT + 160
    ) {
      return;
    }

    const depthFade = clamp(1.15 - object.z / 1700, 0.08, 0.92) * alpha;
    const glint =
      0.62 + Math.sin(time * 2.8 + object.phase) * 0.22;
    context.save();
    context.translate(center.x, center.y);
    context.rotate(object.rotation[2] * 0.45);
    context.scale(size, size);
    context.globalAlpha = depthFade;

    if (object.kind === 'panel') {
      context.fillStyle = object.panelLight
        ? 'rgba(36, 58, 67, 0.9)'
        : 'rgba(116, 89, 59, 0.88)';
      context.strokeStyle = `rgba(196, 199, 182, ${0.42 + glint * 0.18})`;
      context.lineWidth = 0.014;
      context.beginPath();
      context.rect(-0.82, -0.5, 1.64, 1);
      context.fill();
      context.stroke();
      context.strokeStyle = 'rgba(212, 205, 179, 0.23)';
      context.lineWidth = 0.008;
      for (let line = -0.6; line <= 0.6; line += 0.24) {
        context.beginPath();
        context.moveTo(line, -0.48);
        context.lineTo(line, 0.48);
        context.stroke();
      }
      context.beginPath();
      context.moveTo(-0.8, 0);
      context.lineTo(0.8, 0);
      context.stroke();
    } else if (object.kind === 'rod') {
      context.strokeStyle = 'rgba(153, 157, 149, 0.88)';
      context.lineWidth = 0.055;
      context.beginPath();
      context.moveTo(-0.95, 0.18);
      context.lineTo(0.95, -0.14);
      context.stroke();
      context.strokeStyle = 'rgba(228, 206, 165, 0.62)';
      context.lineWidth = 0.018;
      context.beginPath();
      context.moveTo(-0.35, -0.58);
      context.lineTo(-0.25, 0.62);
      context.moveTo(0.42, -0.52);
      context.lineTo(0.33, 0.58);
      context.stroke();
    } else if (object.kind === 'ring') {
      context.strokeStyle = 'rgba(163, 170, 169, 0.82)';
      context.lineWidth = 0.06;
      context.beginPath();
      context.ellipse(0, 0, 0.86, 0.47, 0.18, 0, Math.PI * 2);
      context.stroke();
      context.strokeStyle = 'rgba(238, 208, 151, 0.34)';
      context.lineWidth = 0.012;
      context.beginPath();
      context.ellipse(0, 0, 0.95, 0.55, 0.18, 0, Math.PI * 2);
      context.stroke();
    } else if (object.kind === 'cluster') {
      const pieces = object.points.slice(0, 6);
      for (const piece of pieces) {
        context.save();
        context.translate(piece.x * 0.7, piece.y * 0.7);
        context.rotate(piece.z * 4);
        context.fillStyle = 'rgba(122, 119, 111, 0.88)';
        context.strokeStyle = 'rgba(237, 215, 173, 0.34)';
        context.lineWidth = 0.015;
        context.beginPath();
        context.moveTo(-0.14, -0.1);
        context.lineTo(0.18, -0.17);
        context.lineTo(0.13, 0.16);
        context.lineTo(-0.17, 0.11);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
      }
    } else {
      const gradient = context.createLinearGradient(-0.7, -0.7, 0.8, 0.8);
      gradient.addColorStop(0, 'rgba(149, 138, 121, 0.95)');
      gradient.addColorStop(0.54, 'rgba(76, 81, 80, 0.94)');
      gradient.addColorStop(1, 'rgba(31, 39, 43, 0.96)');
      context.fillStyle = gradient;
      context.strokeStyle = `rgba(241, 210, 156, ${0.24 + glint * 0.22})`;
      context.lineWidth = 0.017;
      context.beginPath();
      object.points.forEach((point, index) => {
        const rotated = rotatePoint(point, object.rotation);
        if (index === 0) context.moveTo(rotated.x, rotated.y);
        else context.lineTo(rotated.x, rotated.y);
      });
      context.closePath();
      context.fill();
      context.stroke();
    }
    context.restore();

    if (depthFade > 0.45 && glint > 0.72) {
      context.save();
      context.globalCompositeOperation = 'screen';
      const glow = context.createRadialGradient(
        center.x,
        center.y,
        0,
        center.x,
        center.y,
        Math.max(2, size * 0.34),
      );
      glow.addColorStop(0, `rgba(255, 223, 166, ${0.36 * alpha})`);
      glow.addColorStop(1, 'rgba(255, 223, 166, 0)');
      context.fillStyle = glow;
      context.fillRect(
        center.x - size * 0.4,
        center.y - size * 0.4,
        size * 0.8,
        size * 0.8,
      );
      context.restore();
    }
  };

  const render = (now) => {
    if (!startedAt) startedAt = now;
    const delta = clamp((now - lastFrameAt) / 1000, 0.001, 0.045);
    lastFrameAt = now;
    const time = (now - startedAt) / 1000;

    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = '#000';
    context.fillRect(0, 0, WIDTH, HEIGHT);

    if (mode === 'intro') {
      const wake = smoothstep(0.5, 4.5, time);
      const acceleration = smoothstep(4.4, 13.4, time);
      const targetVelocity = 150 + wake * 240 + acceleration * 760;
      introTravel += (targetVelocity - introTravel) * (1 - Math.exp(-2.2 * delta));
      const flashIn = smoothstep(13.15, 14.25, time);
      const flashOut = 1 - smoothstep(14.8, 16.05, time);
      const flashAmount = flashIn * flashOut;
      const portal = smoothstep(13.45, 16.25, time);
      const revealBlack = 1 - smoothstep(0.05, 3.6, time);
      introBlack = revealBlack;
      drawBackgroundMotion(time, introTravel);
      drawStars(time, delta, introTravel, 1);
      for (const object of debris) {
        const objectVisibility = smoothstep(4.3, 7.8, time) * (1 - smoothstep(14.4, 15.8, time));
        if (objectVisibility > 0.01) {
          drawDebrisObject(object, time, delta, introTravel, objectVisibility);
        }
      }
      flash.style.opacity = String(flashAmount * 0.98);
      aperture.style.opacity = String(
        smoothstep(12.8, 13.5, time) * (1 - smoothstep(15.9, 16.35, time)),
      );
      const apertureScale = 0.03 + portal * 1.45;
      aperture.style.transform =
        `translate(-50%, -50%) scale(${apertureScale.toFixed(4)})`;
      aperture.style.borderWidth = `${(1.5 + portal * 2.4).toFixed(2)}px`;
      blackout.style.opacity = String(
        Math.max(revealBlack, flashAmount * 0.34),
      );
      const portalRadius = portal * 108;
      const portalMask =
        portal > 0
          ? `radial-gradient(circle at 50% 50%, transparent 0 ${portalRadius.toFixed(
              2,
            )}%, #000 ${(portalRadius + 0.7).toFixed(2)}%)`
          : 'none';
      overlay.style.maskImage = portalMask;
      overlay.style.webkitMaskImage = portalMask;
      overlay.style.opacity = '1';

      if (time >= 16.55) {
        overlay.style.opacity = '0';
        overlay.style.clipPath = 'none';
        overlay.style.maskImage = 'none';
        overlay.style.webkitMaskImage = 'none';
        aperture.style.opacity = '0';
        flash.style.opacity = '0';
        mode = 'hidden';
      }
    } else if (mode === 'outro') {
      const outroTime = (now - outroStartedAt) / 1000;
      const wake = smoothstep(0.4, 2.4, outroTime);
      const acceleration = smoothstep(2.2, 8.3, outroTime);
      const targetVelocity = 230 + wake * 250 + acceleration * 920;
      outroTravel += (targetVelocity - outroTravel) * (1 - Math.exp(-2.4 * delta));
      drawBackgroundMotion(outroTime + 30, outroTravel);
      drawStars(outroTime, delta, outroTravel, 1);
      for (const object of debris) {
        const objectVisibility =
          smoothstep(1.6, 3.5, outroTime) *
          (1 - smoothstep(8.4, 10.1, outroTime));
        if (objectVisibility > 0.01) {
          drawDebrisObject(object, outroTime, delta, outroTravel, objectVisibility);
        }
      }
      flash.style.opacity = String(
        smoothstep(7.8, 9.25, outroTime) *
          (1 - smoothstep(9.25, 10.4, outroTime)) *
          0.38,
      );
      aperture.style.opacity = '0';
      blackout.style.opacity = String(smoothstep(9.3, 10.65, outroTime));
      overlay.style.opacity = String(smoothstep(0, 0.65, outroTime));
      overlay.style.clipPath = 'none';
      overlay.style.maskImage = 'none';
      overlay.style.webkitMaskImage = 'none';
      if (outroTime >= 11.2) {
        context.fillStyle = '#000';
        context.fillRect(0, 0, WIDTH, HEIGHT);
        blackout.style.opacity = '1';
      }
    } else if (mode === 'hidden') {
      context.fillStyle = '#000';
      context.fillRect(0, 0, WIDTH, HEIGHT);
    }

    raf = requestAnimationFrame(render);
  };

  window.__echoesCinema = {
    begin() {
      startedAt = performance.now();
      lastFrameAt = startedAt;
      mode = 'intro';
      overlay.style.display = 'block';
      overlay.style.opacity = '1';
      overlay.style.clipPath = 'none';
      overlay.style.maskImage = 'none';
      overlay.style.webkitMaskImage = 'none';
      blackout.style.opacity = '1';
      flash.style.opacity = '0';
      aperture.style.opacity = '0';
      if (!raf) raf = requestAnimationFrame(render);
    },
    playOutro() {
      outroStartedAt = performance.now();
      lastFrameAt = outroStartedAt;
      mode = 'outro';
      outroTravel = 0;
      overlay.style.display = 'block';
      overlay.style.opacity = '0';
      overlay.style.clipPath = 'none';
      overlay.style.maskImage = 'none';
      overlay.style.webkitMaskImage = 'none';
      blackout.style.opacity = '0';
      flash.style.opacity = '0';
      aperture.style.opacity = '0';
      if (!raf) raf = requestAnimationFrame(render);
    },
    stop() {
      mode = 'idle';
      overlay.style.display = 'none';
      cancelAnimationFrame(raf);
      raf = 0;
    },
    state() {
      return {
        mode,
        startedAt,
        outroStartedAt,
        introBlack,
      };
    },
  };
})();
