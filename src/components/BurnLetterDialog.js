import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { IoFlameOutline, IoEyeOutline, IoLocationOutline } from "react-icons/io5";
import { BsMailboxFlag } from "react-icons/bs";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import { render_url, api_key } from "../data/keys";
import { displayDirectLinkAds } from "../data/direct_link";
import { extractMediaLinks } from "./DetailsModal";
import "./BurnLetterDialog.css";

const STAGES = {
  KEY_INPUT: "KEY_INPUT",
  CONFIRM: "CONFIRM",
  PRE_BURN: "PRE_BURN",
  BURNING: "BURNING",
  BURNED: "BURNED",
};

const BURN_DURATION_MS = 3400; // 3.4s calibrated smooth natural crawl with zero post-burn lingering
const BURN_START_DELAY_MS = 1000;

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  try {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Date(timestamp).toLocaleString("en-US", options);
  } catch {
    return String(timestamp);
  }
};

const shortLetterAge = (timestamp) => {
  const time = new Date(timestamp).getTime();
  if (!Number.isFinite(time)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  const units = [
    [31536000, "y"],
    [2592000, "mo."],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "min."],
  ];
  const unit = units.find(([duration]) => seconds >= duration);
  if (!unit) return "just now";
  const count = Math.floor(seconds / unit[0]);
  const label = unit[1] === "mo." && count > 1 ? "mos." : unit[1];
  const space = ["min.", "mo."].includes(unit[1]) ? " " : "";
  return `${count}${space}${label} ago`;
};

const formatReadsCount = (readsCount) => {
  const parsed = parseInt(readsCount, 10) || 1;
  return parsed === 1 ? "1 read" : `${parsed} reads`;
};

// Asynchronously pre-cache the exact 1024x1024 RGB noise map from ykob's burn sketch
let preloadedNoiseImage = null;
const loadNoiseTextureImage = () => {
  if (preloadedNoiseImage && preloadedNoiseImage.complete) return;
  if (typeof Image === "undefined") return;
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `${process.env.PUBLIC_URL || ""}/burn_noise.png`;
    img.onload = () => {
      preloadedNoiseImage = img;
    };
  } catch {
    // Ignore in non-browser environments
  }
};
loadNoiseTextureImage();

// Instant 2D procedural noise map fallback for test/offline environments
const createProceduralNoiseCanvas = (width = 256, height = 256) => {
  if (typeof document === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const nx = x / width;
        const ny = y / height;
        const diag = nx * 0.55 + (1.0 - ny) * 0.45;
        const r = Math.sin(nx * 14.0 + ny * 10.0) * 0.5 + 0.5;
        const g = Math.cos(nx * 10.0 - ny * 14.0) * 0.5 + 0.5;
        const b = Math.min(1.0, Math.max(0.0, diag * 0.7 + (r + g) * 0.15));
        data[idx] = Math.round(r * 255);
        data[idx + 1] = Math.round(g * 255);
        data[idx + 2] = Math.round(b * 255);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  } catch {
    return null;
  }
};

// GLSL Vertex & Fragment Shaders implementing ykob's organic crawling burn sketch
const VS_SOURCE = `
  attribute vec2 aPosition;
  uniform vec2 uImgRatio;
  varying vec2 vUv;
  varying vec2 vNoiseUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    vUv.y = 1.0 - vUv.y;

    vNoiseUv = vUv * uImgRatio + vec2(
      (1.0 - uImgRatio.x) * 0.5,
      (1.0 - uImgRatio.y) * 0.5
    );

    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FS_SOURCE = `
  precision highp float;

  varying vec2 vUv;
  varying vec2 vNoiseUv;

  uniform sampler2D uLetterTex;
  uniform sampler2D uNoiseTex;
  uniform float uProgress;
  uniform float uTime;

  void main() {
    vec2 uv = vUv;
    vec4 texColor = texture2D(uLetterTex, uv);

    // ykob noise texture sampling:
    // slide: macro crawling progression map (from Blue channel)
    // noiseR: animated fine turbulence (from Red channel, animated horizontally)
    // noiseG: animated fine turbulence (from Green channel, animated faster)
    float slide = texture2D(uNoiseTex, uv * vec2(0.998) + 0.001).b;
    float noiseR = texture2D(uNoiseTex, vNoiseUv + vec2(uTime * 0.10, 0.0)).r;
    float noiseG = texture2D(uNoiseTex, vNoiseUv + vec2(uTime * 0.20, 0.0)).g;

    // ykob burn threshold formula:
    // slide (60%) guides organic crawling direction across unexpected paths
    // noiseR (20%) + noiseG (20%) add fine dynamic fire turbulence
    float threshold = slide * 0.60 + noiseR * 0.20 + noiseG * 0.20;
    float mask = uProgress * 1.28 - threshold;

    // Complete consumption cutoff: total void
    if (mask > 0.26) {
      discard;
    }

    // 1. Pristine unreached paper: 100% sharp, zero warping
    if (mask < 0.02) {
      gl_FragColor = texColor;
      return;
    }

    // 2. Paper dissolving zone (0.02 <= mask <= 0.26)
    float paperVis = 1.0 - smoothstep(0.10, 0.16, mask);

    // Leading charred soot / scorch line right at the edge of fire
    float scorch = smoothstep(0.02, 0.10, mask) * (1.0 - smoothstep(0.12, 0.16, mask));
    vec3 charColor = vec3(0.07, 0.035, 0.02);
    vec3 burnedPaper = mix(texColor.rgb, charColor, scorch * 0.96);

    // Active creeping flame boundary
    float fireIntensity = smoothstep(0.04, 0.11, mask) * (1.0 - smoothstep(0.17, 0.26, mask));

    // Modulate flame with noiseR for licking tongues of fire (ykob style)
    float flameNoise = smoothstep(0.32, 0.68, noiseR);
    float coreGlow = smoothstep(0.07, 0.12, mask) * (1.0 - smoothstep(0.14, 0.19, mask));

    // High-frequency micro-flicker
    float flicker = sin(uTime * 28.0 + uv.x * 40.0 + uv.y * 30.0) * 0.10 + 0.90;

    // ykob flame color palette: blazing orange, hot golden ember, incandescent white-hot core
    vec3 outerFire = vec3(1.0, 0.38, 0.0);       // ykob signature fire color
    vec3 midFire   = vec3(1.0, 0.78, 0.15);      // golden flame
    vec3 coreFire  = vec3(1.0, 0.97, 0.85);      // white-hot ember core

    vec3 flameColor = mix(outerFire, midFire, flameNoise);
    flameColor = mix(flameColor, coreFire, coreGlow * 0.70);
    flameColor *= flicker * 1.35;

    float fireAlpha = fireIntensity * (flameNoise * 0.55 + 0.55);
    vec3 finalColor = mix(burnedPaper, flameColor, clamp(fireIntensity * 1.35, 0.0, 1.0));
    float finalAlpha = max(paperVis * texColor.a, fireAlpha * texColor.a);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

/**
 * Creates a crystal-clear 2D canvas fallback representing the letter.
 * Guarantees zero blank/invisible texture issues even if html2canvas is slow or unavailable.
 */
const createLetterCanvasFallback = (letter, width, height, dpr, isNightShift = false) => {
  if (!letter) return null;
  const canvas = document.createElement("canvas");
  const canvasW = Math.max(120, Math.round(width * dpr));
  const canvasH = Math.max(120, Math.round(height * dpr));
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = isNightShift ? "#23221c" : "#faf7ec";
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(0, 0, width, height, 12);
  } else {
    ctx.rect(0, 0, width, height);
  }
  ctx.fill();

  // Header: From & To
  ctx.fillStyle = isNightShift ? "#f4eee5" : "#080704";
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`From: ${letter.from || "Anonymous"}`, 24, 34);
  ctx.fillText(`To: ${letter.to || "You"}`, 24, 56);

  // Date
  if (letter.timestamp) {
    ctx.fillStyle = isNightShift ? "#a89d91" : "#8a8264";
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(formatTimestamp(letter.timestamp), 24, 82);
  }

  // Message body text in typewriter font
  ctx.fillStyle = isNightShift ? "#e5ded4" : "#2c2820";
  ctx.font = '16px "Courier New", Courier, monospace';
  const text = letter.message || "";
  const maxWidth = width - 48;
  const lineHeight = 24;
  let y = 120;

  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), 24, y);
      line = words[n] + " ";
      y += lineHeight;
      if (y > height - 36) break;
    } else {
      line = testLine;
    }
  }
  if (line.trim() && y <= height - 36) {
    ctx.fillText(line.trim(), 24, y);
  }

  return canvas;
};

/**
 * Captures clean DOM snapshot of the letter paper without interference from overlays or iframes.
 */
const capturePaperTexture = async (element) => {
  if (!element) return null;
  try {
    const canvas = await html2canvas(element, {
      scale: Math.min(2, window.devicePixelRatio || 1),
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      ignoreElements: (el) =>
        el.tagName === "IFRAME" ||
        el.tagName === "BUTTON" ||
        el.classList?.contains("burn-confirm-backdrop") ||
        el.classList?.contains("burn-confirm-dialog-wrapper") ||
        el.classList?.contains("burn-readable-controls"),
    });
    return canvas;
  } catch (err) {
    console.warn("html2canvas capture notice:", err);
    return null;
  }
};

function BurnLetterDialog({
  isOpen,
  onClose,
  onBurnSuccess,
  cachedMessages = [],
}) {
  const [stage, setStage] = useState(STAGES.KEY_INPUT);
  const [burnKey, setBurnKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [targetLetter, setTargetLetter] = useState(null);

  const keyInputRef = useRef(null);
  const paperRef = useRef(null);
  const webglCanvasRef = useRef(null);
  const sparksCanvasRef = useRef(null);
  const letterTextureCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const burnStartTimeoutRef = useRef(null);
  const burnTimeoutRef = useRef(null);

  // Clean up running animation and timers
  const cancelBurnAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (burnTimeoutRef.current) {
      clearTimeout(burnTimeoutRef.current);
      burnTimeoutRef.current = null;
    }
    if (burnStartTimeoutRef.current) {
      clearTimeout(burnStartTimeoutRef.current);
      burnStartTimeoutRef.current = null;
    }
    letterTextureCanvasRef.current = null;
  }, []);

  // Reset state when modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      loadNoiseTextureImage();
      setStage(STAGES.KEY_INPUT);
      setBurnKey("");
      setErrorMessage("");
      setIsLoading(false);
      setTargetLetter(null);
      setTimeout(() => {
        keyInputRef.current?.focus();
      }, 60);
    } else {
      cancelBurnAnimation();
    }
    return () => cancelBurnAnimation();
  }, [isOpen, cancelBurnAnimation]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        isOpen &&
        stage !== STAGES.PRE_BURN &&
        stage !== STAGES.BURNING
      ) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, stage, onClose]);

  // Extract media links for authentic letter view
  const media = useMemo(() => {
    return extractMediaLinks(targetLetter?.message);
  }, [targetLetter?.message]);

  const spotifyTrackId = media?.spotifyLink?.id || null;
  const youtubeVideoId = media?.youtubeLink?.id || null;
  const cleanedMessage = media?.newMessage || targetLetter?.message || "";
  const hasLocation = Boolean(targetLetter?.loc?.city || targetLetter?.loc?.region);

  // Pre-capture letter texture in the background while confirmation modal is shown
  useEffect(() => {
    if (stage === STAGES.CONFIRM && paperRef.current) {
      let isMounted = true;
      const doCapture = async () => {
        const canvas = await capturePaperTexture(paperRef.current);
        if (isMounted && canvas) {
          letterTextureCanvasRef.current = canvas;
        }
      };
      // Brief delay to let layout settle before snapshotting
      const t = setTimeout(doCapture, 60);
      return () => {
        isMounted = false;
        clearTimeout(t);
      };
    }
  }, [stage]);

  // WebGL ykob-Style Organic Crawling Fire Engine + Atmospheric Sparks
  useEffect(() => {
    if (stage !== STAGES.BURNING) return;

    const webglCanvas = webglCanvasRef.current;
    const sparksCanvas = sparksCanvasRef.current;
    const textureSource = letterTextureCanvasRef.current;

    let gl = null;
    let program = null;
    let uProgressLoc = null;
    let uTimeLoc = null;

    const width = paperRef.current?.offsetWidth || 580;
    const height = paperRef.current?.offsetHeight || 440;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    // 1. Initialize WebGL Shader if canvas and texture are available
    if (webglCanvas && textureSource) {
      try {
        webglCanvas.width = width * dpr;
        webglCanvas.height = height * dpr;
        gl = webglCanvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });

        if (gl) {
          const createShader = (glCtx, type, src) => {
            const shader = glCtx.createShader(type);
            glCtx.shaderSource(shader, src);
            glCtx.compileShader(shader);
            return shader;
          };

          const vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
          const fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
          program = gl.createProgram();
          gl.attachShader(program, vs);
          gl.attachShader(program, fs);
          gl.linkProgram(program);
          gl.useProgram(program);

          const posBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
          );

          const aPosLoc = gl.getAttribLocation(program, "aPosition");
          gl.enableVertexAttribArray(aPosLoc);
          gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

          uProgressLoc = gl.getUniformLocation(program, "uProgress");
          uTimeLoc = gl.getUniformLocation(program, "uTime");
          const uImgRatioLoc = gl.getUniformLocation(program, "uImgRatio");
          const uLetterTexLoc = gl.getUniformLocation(program, "uLetterTex");
          const uNoiseTexLoc = gl.getUniformLocation(program, "uNoiseTex");

          // Aspect ratio preservation for isotropic noise sampling (ykob formulation)
          const ratioX = Math.min(1, width / height);
          const ratioY = Math.min(1, height / width);
          gl.uniform2f(uImgRatioLoc, ratioX, ratioY);

          // Texture Unit 0: Letter Canvas Snapshot
          gl.activeTexture(gl.TEXTURE0);
          const letterTex = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, letterTex);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSource);
          gl.uniform1i(uLetterTexLoc, 0);

          // Texture Unit 1: ykob Noise Map (with procedural fallback)
          const noiseSource =
            preloadedNoiseImage && preloadedNoiseImage.complete && preloadedNoiseImage.naturalWidth > 0
              ? preloadedNoiseImage
              : createProceduralNoiseCanvas();

          gl.activeTexture(gl.TEXTURE1);
          const noiseTex = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, noiseTex);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          if (noiseSource) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, noiseSource);
          }
          gl.uniform1i(uNoiseTexLoc, 1);

          // If preloaded image finishes loading while running, update texture
          if (preloadedNoiseImage && !preloadedNoiseImage.complete) {
            preloadedNoiseImage.addEventListener(
              "load",
              () => {
                if (!gl || gl.isContextLost()) return;
                try {
                  gl.activeTexture(gl.TEXTURE1);
                  gl.bindTexture(gl.TEXTURE_2D, noiseTex);
                  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, preloadedNoiseImage);
                } catch {
                  // Ignore
                }
              },
              { once: true }
            );
          }

          gl.viewport(0, 0, webglCanvas.width, webglCanvas.height);
          gl.clearColor(0, 0, 0, 0);
        }
      } catch (err) {
        console.warn("WebGL initialization skipped:", err);
      }
    }

    // 2. Setup 2D atmospheric sparks & smoke canvas (with padding for floating embers)
    let ctx = null;
    const sparkW = width + 80;
    const sparkH = height + 100;
    if (sparksCanvas && sparksCanvas.getContext) {
      try {
        sparksCanvas.width = sparkW * dpr;
        sparksCanvas.height = sparkH * dpr;
        ctx = sparksCanvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
      } catch {
        ctx = null;
      }
    }

    const particles = [];
    const smokePuffs = [];
    const startTime = performance.now();

    // Embers follow the organic fire front advancing diagonally across the paper
    const spawnEmber = (prog = 0.5) => {
      const frontX = 40 + width * Math.min(0.95, Math.max(0.05, 0.12 + prog * 0.76 + (Math.random() - 0.5) * 0.35));
      const frontY = 60 + height * Math.min(0.95, Math.max(0.05, 0.88 - prog * 0.76 + (Math.random() - 0.5) * 0.35));

      particles.push({
        x: frontX,
        y: frontY,
        vx: (Math.random() - 0.5) * 1.6 - 0.25,
        vy: -(Math.random() * 2.2 + 1.4),
        size: Math.random() * 2.4 + 1.2,
        life: 0,
        maxLife: Math.random() * 40 + 30,
        hue: Math.random() * 28 + 18,
      });
    };

    const spawnSmoke = (prog = 0.5) => {
      const frontX = 40 + width * Math.min(0.95, Math.max(0.05, 0.12 + prog * 0.76 + (Math.random() - 0.5) * 0.30));
      const frontY = 60 + height * Math.min(0.95, Math.max(0.05, 0.88 - prog * 0.76 + (Math.random() - 0.5) * 0.30));

      smokePuffs.push({
        x: frontX,
        y: frontY - 10,
        vx: (Math.random() - 0.5) * 0.8 - 0.2,
        vy: -(Math.random() * 1.0 + 0.6),
        radius: Math.random() * 6 + 6,
        growth: Math.random() * 0.35 + 0.25,
        alpha: Math.random() * 0.12 + 0.07,
        maxLife: Math.random() * 45 + 45,
        life: 0,
      });
    };

    const frame = (now) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / BURN_DURATION_MS, 1);
      // easeInOutQuad: smooth initial crawl, organic momentum, and smooth conclusion
      const progress =
        rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : -1 + (4 - 2 * rawProgress) * rawProgress;

      // Render WebGL ykob-style crawling fire
      if (gl && program) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uProgressLoc, progress);
        gl.uniform1f(uTimeLoc, elapsed * 0.001);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      // Render atmospheric sparks and smoke
      if (ctx) {
        ctx.clearRect(0, 0, sparkW, sparkH);

        // Taper off sparks before completion so the canvas is pristine at the end
        if (progress < 0.82) {
          const sparkRate = progress < 0.15 ? 2 : 3;
          for (let i = 0; i < sparkRate; i++) spawnEmber(progress);
          if (Math.random() < 0.30) spawnSmoke(progress);
        }

        // Draw smoke
        for (let i = smokePuffs.length - 1; i >= 0; i--) {
          const puff = smokePuffs[i];
          puff.life++;
          puff.x += puff.vx;
          puff.y += puff.vy;
          puff.radius += puff.growth;
          const rem = 1 - puff.life / puff.maxLife;

          if (rem <= 0) {
            smokePuffs.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 168, 155, ${puff.alpha * rem})`;
          ctx.fill();
          ctx.restore();
        }

        // Draw embers
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life++;
          p.x += p.vx + Math.sin(p.life * 0.12) * 0.35;
          p.y += p.vy;
          const rem = 1 - p.life / p.maxLife;

          if (rem <= 0) {
            particles.splice(i, 1);
            continue;
          }

          const currentSize = p.size * rem;
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, ${50 + (1 - rem) * 25}%, ${rem})`;
          ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        }
      }

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(frame);
      }
    };

    animationFrameRef.current = requestAnimationFrame(frame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stage]);

  if (!isOpen) return null;

  const handleKeySubmit = async (event) => {
    event?.preventDefault();
    const normalizedKey = burnKey.trim().toUpperCase();

    if (!normalizedKey) {
      setErrorMessage("Enter the private burn key for your letter.");
      return;
    }

    if (!/^LTC-(?:[A-F0-9]{4}-){5}[A-F0-9]{4}$/.test(normalizedKey)) {
      setErrorMessage("Enter a valid burn key format (LTC-••••-••••-••••-••••).");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Attempt to fetch preview from backend /burn/preview
      const response = await fetch(`${render_url}/burn/preview`, {
        method: "POST",
        headers: {
          "x-api-key": api_key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ burnKey: normalizedKey }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.letter) {
          setTargetLetter(data.letter);
          setStage(STAGES.CONFIRM);
          return;
        }
      }

      // If preview returned specific error (404/409)
      if (response.status === 404 || response.status === 409) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Burn key not found or letter is unavailable.");
      }

      // Fallback: If /burn/preview was 404/unavailable on older backend, check local feed
      if (cachedMessages.length > 0) {
        const found = cachedMessages.find(
          (item) => item.burnKey === normalizedKey
        );
        if (found) {
          setTargetLetter(found);
          setStage(STAGES.CONFIRM);
          return;
        }
      }

      throw new Error("Unable to locate a letter matching this burn key.");
    } catch (error) {
      setErrorMessage(error.message || "Failed to locate your letter.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    // Cancel exits the entire burn flow so no letter preview remains behind.
    onClose();
  };

  const handleProceedBurn = () => {
    if (
      !targetLetter ||
      stage === STAGES.PRE_BURN ||
      stage === STAGES.BURNING
    ) return;

    // Ensure texture is ready before transitioning to BURNING stage
    if (!letterTextureCanvasRef.current && targetLetter) {
      const w = paperRef.current?.offsetWidth || 580;
      const h = paperRef.current?.offsetHeight || 440;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const isNight =
        typeof document !== "undefined" &&
        document.documentElement?.classList?.contains("night-shift");
      letterTextureCanvasRef.current = createLetterCanvasFallback(
        targetLetter,
        w,
        h,
        dpr,
        isNight
      );
    }

    const normalizedKey = burnKey.trim().toUpperCase();
    // Hold on the intact letter for one second before starting the existing animation.
    setStage(STAGES.PRE_BURN);
    burnStartTimeoutRef.current = setTimeout(() => {
      burnStartTimeoutRef.current = null;
      setStage(STAGES.BURNING);

      const burnPromise = fetch(`${render_url}/burn`, {
        method: "POST",
        headers: {
          "x-api-key": api_key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ burnKey: normalizedKey }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Burn request failed.");
          }
          return response.json();
        })
        .catch((error) => {
          console.error("Burn execution error:", error);
          return { letterId: targetLetter._id };
        });

      burnTimeoutRef.current = setTimeout(async () => {
        cancelBurnAnimation();
        await burnPromise;
        if (onBurnSuccess && targetLetter._id) {
          onBurnSuccess(targetLetter._id);
        }
        setStage(STAGES.BURNED);
        toast.info("Your Letter is Gone...", {
          toastId: "burn-letter-toast",
          autoClose: 4000,
          position: "top-center",
        });
      }, BURN_DURATION_MS);
    }, BURN_START_DELAY_MS);
  };

  const handleMoveForward = () => {
    displayDirectLinkAds();
    onClose();
  };

  return (
    <div
      className={`burn-dialog-overlay${
        stage === STAGES.PRE_BURN || stage === STAGES.BURNING
          ? " is-burn-stage"
          : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="burn-dialog-title"
      onClick={() => {
        if (stage !== STAGES.PRE_BURN && stage !== STAGES.BURNING) {
          onClose();
        }
      }}
    >
      {/* 1. SECRET BURN KEY INPUT STAGE */}
      {stage === STAGES.KEY_INPUT && (
        <section
          className="burn-dialog-card"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="burn-dialog-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
          <span className="burn-dialog-icon" aria-hidden="true">
            <IoFlameOutline />
          </span>
          <span className="burn-dialog-eyebrow">Your letter, your choice</span>
          <h2 id="burn-dialog-title">Burn a letter you wrote</h2>
          <p>
            Ready to let go? Enter your secret key to burn this letter and leave
            the memory behind.
          </p>

          <form className="burn-dialog-form" onSubmit={handleKeySubmit}>
            <label htmlFor="burn-secret-key-input">Secret burn key</label>
            <input
              id="burn-secret-key-input"
              ref={keyInputRef}
              type="text"
              value={burnKey}
              onChange={(e) => {
                setBurnKey(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="LTC-••••-••••-••••-••••"
              autoComplete="off"
              spellCheck="false"
              disabled={isLoading}
            />
            {errorMessage && (
              <p className="burn-status-message is-error" role="status">
                {errorMessage}
              </p>
            )}
            <button type="submit" disabled={isLoading}>
              <IoFlameOutline />{" "}
              {isLoading ? "Locating letter…" : "Burn My Letter"}
            </button>
          </form>
          <small className="burn-dialog-note">Burning removes the letter you wrote.</small>
        </section>
      )}

      {/* 2 & 3. CONFIRMATION, PRE-BURN, & BURNING STAGES (ACTUAL LETTER VIEW) */}
      {(stage === STAGES.CONFIRM ||
        stage === STAGES.PRE_BURN ||
        stage === STAGES.BURNING) &&
        targetLetter && (
          <div
            className={`burn-peek-stage${
              stage === STAGES.CONFIRM ? " has-confirm-modal" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* The ACTUAL letter view matching the normal letter modal in Letters to Casper */}
            <div className="letter-modal">
              {/* Folded corner close button */}
              {stage === STAGES.CONFIRM && (
                <button
                  type="button"
                  className="letter-modal__close"
                  onClick={onClose}
                  aria-label="Close letter"
                  title="Fold and close letter"
                >
                  <svg
                    className="letter-fold-corner"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M 0 0 L 48 48 Q 24 42 3 47 Q 7 24 0 0 Z" />
                  </svg>
                </button>
              )}

              <div className="burn-paper-stage">
                {/* The authentic letter-paper component: remains sharp until physically consumed */}
                <div
                  ref={paperRef}
                  className={`letter-paper${
                    stage === STAGES.BURNING
                      ? " is-center-burning is-letter-burning-hidden"
                      : ""
                  }`}
                >
                  <div className="letter-paper__head">
                    <div className="letter-info" style={{ marginBottom: "4px" }}>
                      <span>
                        <strong>From:</strong> {targetLetter.from || "Anonymous"}
                      </span>
                    </div>
                    <div className="letter-info">
                      <span>
                        <strong>To:</strong> {targetLetter.to || "You"}
                      </span>
                    </div>
                  </div>

                  {targetLetter.timestamp && (
                    <div
                      className="letter-paper__date"
                      data-tooltip-id="burn_timezone_tooltip"
                      data-tooltip-content="🇵🇭 Philippine Standard Time (UTC +08)"
                      data-tooltip-place="top"
                      data-tooltip-variant="info"
                    >
                      <BsMailboxFlag
                        className="letter-paper__date-icon"
                        size="15px"
                        aria-hidden="true"
                      />
                      <span className="timestamp-text">
                        <span>{formatTimestamp(targetLetter.timestamp)}</span>
                      </span>
                    </div>
                  )}

                  <div
                    className="letter-paper__body letter-text"
                    tabIndex={0}
                    role="region"
                    aria-label="Letter message"
                  >
                    <span>{cleanedMessage}</span>
                  </div>

                  {targetLetter.photo?.url && (
                    <figure className="letter-paper__photo">
                      <img
                        src={targetLetter.photo.url}
                        alt={`Attached to the letter from ${targetLetter.from} to ${targetLetter.to}`}
                      />
                    </figure>
                  )}

                  {spotifyTrackId && (
                    <div className="letter-paper__media">
                      <iframe
                        title="spotify-preview"
                        style={{ border: "12px" }}
                        src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=1`}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      ></iframe>
                    </div>
                  )}

                  {youtubeVideoId && (
                    <div className="letter-paper__media letter-paper__media--youtube">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=0&mute=0&playsinline=1&controls=0&rel=0`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      ></iframe>
                    </div>
                  )}

                  <div className="letter-paper__meta">
                    <span className="letter-paper__age">
                      {shortLetterAge(targetLetter.timestamp)}
                    </span>
                    <span className="letter-meta-sep">·</span>
                    <span className="letter-paper__reads">
                      <IoEyeOutline className="letter-paper__reads-eye" />
                      {formatReadsCount(targetLetter.reads || 1)}
                    </span>
                    {hasLocation && (
                      <>
                        <span className="letter-meta-sep">·</span>
                        <span className="letter-paper__locate">
                          <IoLocationOutline size="12px" />
                          <span>Locate</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Subtle blurred & dimmed backdrop overlay in confirm stage */}
                {stage === STAGES.CONFIRM && (
                  <div className="burn-confirm-backdrop" aria-hidden="true" />
                )}

                {/* Hardware-Accelerated Multi-Corner WebGL Crawling Burn & Atmospheric Sparks */}
                {stage === STAGES.BURNING && (
                  <div className="burn-canvas-container" aria-hidden="true">
                    <canvas
                      ref={webglCanvasRef}
                      className="burn-webgl-canvas"
                    />
                    <canvas
                      ref={sparksCanvasRef}
                      className="burn-sparks-canvas"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Centered lightweight confirmation dialog in front of the letter */}
            {stage === STAGES.CONFIRM && (
              <div
                className="burn-confirm-dialog-wrapper"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="burn-confirm-title"
                aria-describedby="burn-confirm-desc"
              >
                <div className="burn-confirm-dialog">
                  <span className="burn-confirm-icon" aria-hidden="true">
                    <IoFlameOutline />
                  </span>
                  <h3 id="burn-confirm-title">
                    Are you sure you want to burn your letter?
                  </h3>
                  <p id="burn-confirm-desc">
                    This action is irreversible. Your letter will be permanently
                    removed from public view.
                  </p>
                  <div className="burn-confirm-actions">
                    <button
                      type="button"
                      className="burn-confirm-btn is-cancel"
                      onClick={handleCancelConfirm}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="burn-confirm-btn is-proceed"
                      onClick={handleProceedBurn}
                      autoFocus
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      {/* 4. POST-BURN FINAL COMPLETION STATE & UI CLEANUP */}
      {stage === STAGES.BURNED && (
        <section
          className="burn-completed-card"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="burn-completed-icon" aria-hidden="true">
            <IoFlameOutline />
          </span>
          <span className="burn-dialog-eyebrow">Letter burned</span>
          <h2 id="burn-dialog-title">Your Letter is Gone...</h2>
          <p>
            The letter has turned to ashes. You’re choosing to let go, move
            forward, and make space for what comes next.
          </p>
          <button
            type="button"
            className="burn-completed-btn"
            onClick={handleMoveForward}
            autoFocus
          >
            Move Forward
          </button>
        </section>
      )}
    </div>
  );
}

BurnLetterDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onBurnSuccess: PropTypes.func,
  cachedMessages: PropTypes.array,
};

export default BurnLetterDialog;
