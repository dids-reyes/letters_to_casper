import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { IoFlameOutline, IoEyeOutline, IoLocationOutline } from "react-icons/io5";
import { BsMailboxFlag } from "react-icons/bs";
import { toast } from "react-toastify";
import { render_url, api_key } from "../data/keys";
import { displayDirectLinkAds } from "../data/direct_link";
import { extractMediaLinks, getLetterStampProps } from "./DetailsModal";
import { LetterStamp } from "./LetterStamp";
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

// Asynchronously pre-cache the 512x512 RGB noise map from ykob's burn sketch
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
if (typeof window !== "undefined") {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => loadNoiseTextureImage(), { timeout: 3000 });
  } else {
    setTimeout(loadNoiseTextureImage, 2000);
  }
}

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
 * Creates a crystal-clear 2D canvas fallback matching the authentic .letter-paper design.
 * Uses the exact same Courier New typography, ruled lines, vignette, and dog-ear corner.
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

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 480;
  const padX = isMobile ? 22 : 46;
  const padTop = isMobile ? 30 : 44;
  const foldSize = isMobile ? 20 : 24;

  // 1. Authentic paper background
  ctx.fillStyle = isNightShift ? "#23201a" : "#faf7ec";
  ctx.fillRect(0, 0, width, height);

  // Subtle aged paper vignette matching .letter-paper
  if (!isNightShift) {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(1, height / width);
    const maxR = width * 0.7;
    const vig = ctx.createRadialGradient(0, 0, maxR * 0.74, 0, 0, maxR);
    vig.addColorStop(0, "rgba(135, 78, 28, 0)");
    vig.addColorStop(0.54, "rgba(135, 78, 28, 0.05)");
    vig.addColorStop(0.85, "rgba(98, 52, 18, 0.14)");
    vig.addColorStop(1, "rgba(68, 34, 10, 0.22)");
    ctx.fillStyle = vig;
    ctx.fillRect(-width / 2, -width / 2, width, width);
    ctx.restore();
  }

  // Warm inset border matching .letter-paper box-shadow
  ctx.strokeStyle = isNightShift ? "rgba(255, 240, 200, 0.14)" : "rgba(65, 32, 10, 0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  // 2. Header: From & To in Courier New matching .letter-paper .letter-info
  const infoFontSize = isMobile ? 14 : 16;
  const fromY = padTop + infoFontSize;
  const toY = fromY + Math.round(infoFontSize * 1.6) + 4;

  ctx.font = `800 ${infoFontSize}px "Courier New", Courier, monospace`;
  ctx.fillStyle = isNightShift ? "#f3efe2" : "#080704";
  ctx.fillText("From: ", padX, fromY);
  const fromLabelW = ctx.measureText("From: ").width;
  ctx.font = `400 ${infoFontSize}px "Courier New", Courier, monospace`;
  ctx.fillStyle = isNightShift ? "#e4decb" : "#332f24";
  ctx.fillText(letter.from || "Anonymous", padX + fromLabelW, fromY);

  ctx.font = `800 ${infoFontSize}px "Courier New", Courier, monospace`;
  ctx.fillStyle = isNightShift ? "#f3efe2" : "#080704";
  ctx.fillText("To: ", padX, toY);
  const toLabelW = ctx.measureText("To: ").width;
  ctx.font = `400 ${infoFontSize}px "Courier New", Courier, monospace`;
  ctx.fillStyle = isNightShift ? "#e4decb" : "#332f24";
  ctx.fillText(letter.to || "You", padX + toLabelW, toY);

  // 3. Centered Date in Courier New matching .letter-paper__date .timestamp-text
  let bodyStartY = toY + 26;
  if (letter.timestamp) {
    const dateY = toY + 28;
    const dateStr = formatTimestamp(letter.timestamp);
    ctx.font = '400 12px "Courier New", Courier, monospace';
    ctx.fillStyle = isNightShift ? "#b8b09a" : "#393428";
    const dateW = ctx.measureText(dateStr).width;
    ctx.fillText(dateStr, Math.max(padX, (width - dateW) / 2), dateY);
    bodyStartY = dateY + 26;
  }

  // 4. Message body in Courier New with ruled stationery lines matching .letter-paper__body
  const bodyFontSize = isMobile ? 13 : 14;
  const lineHeight = isMobile ? 25 : 28;
  ctx.font = `400 ${bodyFontSize}px "Courier New", Courier, monospace`;
  const rawMessage = extractMediaLinks(letter.message)?.newMessage || letter.message || "";
  const maxWidth = width - padX * 2 - 4;
  const maxBodyY = height - 44;

  const paragraphs = String(rawMessage).split("\n");
  const lines = [];
  for (let p = 0; p < paragraphs.length; p++) {
    const words = paragraphs[p].split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const candidate = line ? `${line} ${words[n]}` : words[n];
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = words[n];
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }

  let y = bodyStartY + lineHeight * 0.72;
  const ruleColor = isNightShift
    ? "rgba(255, 244, 214, 0.08)"
    : "rgba(120, 100, 60, 0.12)";
  const textColor = isNightShift ? "#e4decb" : "#332f24";

  for (let i = 0; i < lines.length; i++) {
    if (y > maxBodyY) break;
    // Draw ruled line underneath text line
    ctx.fillStyle = ruleColor;
    ctx.fillRect(padX, Math.round(y + 5), width - padX * 2, 1);
    // Draw text
    ctx.fillStyle = textColor;
    ctx.fillText(lines[i], padX + 2, y);
    y += lineHeight;
  }

  // 5. Cut out top-right dog-ear corner and draw folded paper flap
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.moveTo(width - foldSize, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, foldSize);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(width - foldSize, 0);
  const s = foldSize / 48;
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(48, 48);
  ctx.quadraticCurveTo(24, 42, 3, 47);
  ctx.quadraticCurveTo(7, 24, 0, 0);
  ctx.closePath();
  ctx.fillStyle = isNightShift ? "#505143" : "#e4d7b6";
  ctx.fill();
  ctx.strokeStyle = isNightShift ? "#77765d" : "#baa982";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.restore();

  return canvas;
};

/**
 * Captures clean DOM snapshot of the letter paper without interference from overlays or iframes.
 */
const capturePaperTexture = async (element) => {
  if (!element) return null;
  try {
    const isNightShift =
      typeof document !== "undefined" &&
      document.documentElement?.classList?.contains("night-shift");
    const computedPaper =
      typeof window !== "undefined" && window.getComputedStyle
        ? window.getComputedStyle(element)
        : null;
    const paperBgColor =
      computedPaper?.backgroundColor &&
      computedPaper.backgroundColor !== "rgba(0, 0, 0, 0)" &&
      computedPaper.backgroundColor !== "transparent"
        ? computedPaper.backgroundColor
        : isNightShift
        ? "#23201a"
        : "#faf7ec";

    // Pre-inline SVG <image> stamp assets as data URLs so SVG serialization renders them
    const svgImages = Array.from(element.querySelectorAll?.("svg image") || []);
    const dataUrlMap = new Map();
    await Promise.all(
      svgImages.map(async (svgImg) => {
        const href =
          svgImg.getAttribute("href") || svgImg.getAttribute("xlink:href");
        if (!href || href.startsWith("data:")) return;
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = href;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = img.naturalWidth || 78;
          tempCanvas.height = img.naturalHeight || 98;
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            dataUrlMap.set(href, tempCanvas.toDataURL("image/png"));
          }
        } catch {
          // Ignore stamp image load errors
        }
      })
    );

    // Pre-generate ruled stationery line tile because html2canvas drops multi-stop repeating-linear-gradient
    let ruleTileDataUrl = null;
    let bodyLineHeight = 28;
    let bodyBgPosition = "0 0";
    const bodyEl = element.querySelector?.(".letter-paper__body");
    if (bodyEl && typeof window !== "undefined" && window.getComputedStyle) {
      const computedBody = window.getComputedStyle(bodyEl);
      bodyLineHeight = Math.max(
        18,
        Math.round(parseFloat(computedBody.lineHeight) || 28)
      );
      bodyBgPosition = computedBody.backgroundPosition || "0 0";
      try {
        const ruleCanvas = document.createElement("canvas");
        ruleCanvas.width = 8;
        ruleCanvas.height = bodyLineHeight;
        const ruleCtx = ruleCanvas.getContext("2d");
        if (ruleCtx) {
          ruleCtx.fillStyle = isNightShift
            ? "rgba(255, 244, 214, 0.08)"
            : "rgba(120, 100, 60, 0.12)";
          ruleCtx.fillRect(0, bodyLineHeight - 1, 8, 1);
          ruleTileDataUrl = ruleCanvas.toDataURL("image/png");
        }
      } catch {
        ruleTileDataUrl = null;
      }
    }

    const scale = Math.min(
      2,
      (typeof window !== "undefined" && window.devicePixelRatio) || 1
    );
    const html2canvasModule = await import("html2canvas");
    const html2canvas = html2canvasModule.default || html2canvasModule;
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor: paperBgColor,
      logging: false,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      ignoreElements: (el) => {
        if (
          el.tagName === "IFRAME" ||
          el.tagName === "BUTTON" ||
          el.classList?.contains("burn-confirm-backdrop") ||
          el.classList?.contains("burn-confirm-dialog-wrapper") ||
          el.classList?.contains("burn-readable-controls")
        ) {
          return true;
        }
        // Skip cloning the entire background page outside the letter paper subtree
        if (
          typeof document !== "undefined" &&
          document.body &&
          document.body.contains(el) &&
          el !== element &&
          !el.contains?.(element) &&
          !element.contains?.(el)
        ) {
          return true;
        }
        return false;
      },
      onclone: (_clonedDoc, clonedEl) => {
        if (!clonedEl) return;
        clonedEl.style.backgroundColor = paperBgColor;
        clonedEl.style.backgroundImage = "none";
        clonedEl.style.boxShadow = "none";
        clonedEl.style.borderRadius = "0px";
        clonedEl.style.clipPath = "none";
        clonedEl.style.animation = "none";
        clonedEl.style.transform = "none";
        clonedEl.style.fontFamily = '"Courier New", Courier, monospace';

        // Lock exact Courier New typography on all text nodes inside the cloned letter paper
        const typoNodes = clonedEl.querySelectorAll?.(
          ".letter-info, .letter-info span, .letter-info strong, .letter-paper__date, .timestamp-text, .timestamp-text span, .letter-paper__body, .letter-paper__body span, .letter-paper__meta, .letter-paper__meta span"
        ) || [];
        typoNodes.forEach((node) => {
          node.style.fontFamily = '"Courier New", Courier, monospace';
        });

        const clonedBody = clonedEl.querySelector?.(".letter-paper__body");
        if (clonedBody && ruleTileDataUrl) {
          clonedBody.style.backgroundImage = `url("${ruleTileDataUrl}")`;
          clonedBody.style.backgroundRepeat = "repeat";
          clonedBody.style.backgroundSize = `8px ${bodyLineHeight}px`;
          clonedBody.style.backgroundPosition = bodyBgPosition;
        }

        const clonedSvgImages = clonedEl.querySelectorAll?.("svg image") || [];
        clonedSvgImages.forEach((imgNode) => {
          const origHref =
            imgNode.getAttribute("href") || imgNode.getAttribute("xlink:href");
          const inlined = origHref ? dataUrlMap.get(origHref) : null;
          if (inlined) {
            imgNode.setAttribute("href", inlined);
            imgNode.setAttributeNS(
              "http://www.w3.org/1999/xlink",
              "xlink:href",
              inlined
            );
          }
        });
      },
    });

    if (canvas && typeof canvas.getContext === "function") {
      const ctx = canvas.getContext("2d");
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        const w = canvas.width;
        const h = canvas.height;
        const foldCssSize =
          typeof window !== "undefined" && window.innerWidth <= 480 ? 20 : 24;
        const foldPx = foldCssSize * scale;

        // Subtle aged paper vignette matching .letter-paper radial-gradient without html2canvas artifacts
        if (!isNightShift) {
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.scale(1, h / w);
          const maxR = w * 0.7;
          const vig = ctx.createRadialGradient(0, 0, maxR * 0.74, 0, 0, maxR);
          vig.addColorStop(0, "rgba(135, 78, 28, 0)");
          vig.addColorStop(0.54, "rgba(135, 78, 28, 0.05)");
          vig.addColorStop(0.85, "rgba(98, 52, 18, 0.14)");
          vig.addColorStop(1, "rgba(68, 34, 10, 0.22)");
          ctx.fillStyle = vig;
          ctx.fillRect(-w / 2, -w / 2, w, w);
          ctx.restore();
        }

        // Subtle warm paper inset border matching .letter-paper box-shadow
        ctx.save();
        ctx.strokeStyle = isNightShift
          ? "rgba(255, 240, 200, 0.14)"
          : "rgba(65, 32, 10, 0.28)";
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeRect(0, 0, w, h);
        ctx.restore();

        // Cut out top-right dog-ear corner silhouette
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(w - foldPx, 0);
        ctx.lineTo(w, 0);
        ctx.lineTo(w, foldPx);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw folded dog-ear corner flap onto the captured paper texture
        ctx.save();
        ctx.translate(w - foldPx, 0);
        const s = foldPx / 48;
        ctx.scale(s, s);
        ctx.shadowColor = isNightShift
          ? "rgba(0, 0, 0, 0.6)"
          : "rgba(70, 61, 41, 0.35)";
        ctx.shadowBlur = 3 * scale;
        ctx.shadowOffsetX = -2 * scale;
        ctx.shadowOffsetY = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(48, 48);
        ctx.quadraticCurveTo(24, 42, 3, 47);
        ctx.quadraticCurveTo(7, 24, 0, 0);
        ctx.closePath();
        ctx.fillStyle = isNightShift ? "#505143" : "#e4d7b6";
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = isNightShift ? "#77765d" : "#baa982";
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.restore();
      }
    }

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
  const capturePromiseRef = useRef(null);
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
    capturePromiseRef.current = null;
  }, []);

  // Reset state when modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      loadNoiseTextureImage();
      import("html2canvas").catch(() => {});
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

  // Pre-capture letter texture once when targetLetter is mounted; do NOT cancel on stage transitions
  useEffect(() => {
    if (!targetLetter || letterTextureCanvasRef.current || capturePromiseRef.current) {
      return undefined;
    }
    let isCancelled = false;
    const t = setTimeout(() => {
      if (isCancelled || !paperRef.current) return;
      const promise = capturePaperTexture(paperRef.current)
        .then((canvas) => {
          if (!isCancelled && canvas) {
            letterTextureCanvasRef.current = canvas;
          }
          return canvas;
        })
        .finally(() => {
          capturePromiseRef.current = null;
        });
      capturePromiseRef.current = promise;
    }, 30);
    return () => {
      isCancelled = true;
      clearTimeout(t);
    };
  }, [targetLetter]);

  // WebGL ykob-Style Organic Crawling Fire Engine + Atmospheric Sparks
  useEffect(() => {
    if (stage !== STAGES.BURNING) return;

    const webglCanvas = webglCanvasRef.current;
    const sparksCanvas = sparksCanvasRef.current;

    const width = paperRef.current?.offsetWidth || 580;
    const height = paperRef.current?.offsetHeight || 440;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    if (!letterTextureCanvasRef.current && targetLetter) {
      const isNight =
        typeof document !== "undefined" &&
        document.documentElement?.classList?.contains("night-shift");
      letterTextureCanvasRef.current = createLetterCanvasFallback(
        targetLetter,
        width,
        height,
        dpr,
        isNight
      );
    }

    const textureSource = letterTextureCanvasRef.current;

    let gl = null;
    let program = null;
    let uProgressLoc = null;
    let uTimeLoc = null;

    // 1. Initialize WebGL Shader if canvas and texture are available
    if (webglCanvas && textureSource) {
      try {
        if (
          paperRef.current &&
          typeof window !== "undefined" &&
          window.getComputedStyle
        ) {
          const paperClipPath = window.getComputedStyle(paperRef.current).clipPath;
          if (paperClipPath && paperClipPath !== "none") {
            webglCanvas.style.clipPath = paperClipPath;
          }
        }
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

          if (capturePromiseRef.current) {
            capturePromiseRef.current.then((capturedCanvas) => {
              if (!capturedCanvas || !gl || gl.isContextLost()) return;
              try {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, letterTex);
                gl.texImage2D(
                  gl.TEXTURE_2D,
                  0,
                  gl.RGBA,
                  gl.RGBA,
                  gl.UNSIGNED_BYTE,
                  capturedCanvas
                );
              } catch {
                // Ignore
              }
            });
          }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (!letterTextureCanvasRef.current && !capturePromiseRef.current && paperRef.current) {
      capturePromiseRef.current = capturePaperTexture(paperRef.current)
        .then((canvas) => {
          if (canvas) {
            letterTextureCanvasRef.current = canvas;
          }
          return canvas;
        })
        .finally(() => {
          capturePromiseRef.current = null;
        });
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
              <div
                className={`burn-paper-stage${
                  stage !== STAGES.BURNING ? " letter-paper-wrapper" : ""
                } ${getLetterStampProps(targetLetter).paperClass || ""} ${
                  getLetterStampProps(targetLetter).deckleClass || ""
                }`}
              >
                {/* Folded corner close button (kept visible through PRE_BURN before WebGL canvas takes over) */}
                {(stage === STAGES.CONFIRM || stage === STAGES.PRE_BURN) && (
                  <button
                    type="button"
                    className="letter-modal__close"
                    onClick={stage === STAGES.CONFIRM ? onClose : undefined}
                    disabled={stage !== STAGES.CONFIRM}
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

                {/* The authentic letter-paper component: remains sharp until physically consumed */}
                <div
                  ref={paperRef}
                  className={`letter-paper ${
                    getLetterStampProps(targetLetter).paperClass || ""
                  } ${getLetterStampProps(targetLetter).deckleClass || ""}${
                    stage === STAGES.BURNING
                      ? " is-center-burning is-letter-burning-hidden"
                      : ""
                  }`}
                >
                  <div className="letter-paper__head">
                    <div className="letter-paper__addressee">
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
                    <div className="letter-paper__stamp-slot">
                      <LetterStamp
                        className="letter-paper__stamp"
                        city={targetLetter.loc?.city || targetLetter.city || ""}
                        region={targetLetter.loc?.region || targetLetter.region || ""}
                        country={targetLetter.loc?.country || targetLetter.country || ""}
                        variant={getLetterStampProps(targetLetter).variant}
                        isFeatured={getLetterStampProps(targetLetter).isFeatured}
                      />
                    </div>
                  </div>

                  {targetLetter.timestamp && (
                    <div className="letter-paper__date">
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
                      className={`burn-webgl-canvas ${
                        getLetterStampProps(targetLetter).deckleClass || ""
                      }`}
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
