import React, { useEffect, useRef } from "react";

const Firefly3D = ({ duration = 9800, direction = 1 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let frame, renderer, resizeObserver;
    let disposed = false;
    const startedAt = performance.now();

    const initialize = async () => {
      const THREE = await import("three");
      if (disposed || !canvasRef.current) return;
      const canvas = canvasRef.current;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
      } catch (error) { return; }
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 30);
      camera.position.set(0, 0.12, 7.5);
      scene.add(new THREE.HemisphereLight(0xfff3d4, 0x33454d, 2.6));
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
      keyLight.position.set(2, 4, 5);
      scene.add(keyLight);

      const insect = new THREE.Group();
      insect.scale.x = direction;
      scene.add(insect);

      const shell = new THREE.MeshPhysicalMaterial({ color: 0x383428, roughness: 0.28, metalness: 0.12, clearcoat: 0.65, clearcoatRoughness: 0.22 });
      const warmShell = new THREE.MeshPhysicalMaterial({ color: 0x65583a, roughness: 0.32, metalness: 0.08, clearcoat: 0.45 });
      const jointMaterial = new THREE.MeshStandardMaterial({ color: 0x2d291f, roughness: 0.52 });
      const eyeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x080907, roughness: 0.05, clearcoat: 1 });
      const glowMaterial = new THREE.MeshStandardMaterial({ color: 0xffe678, emissive: 0xffb000, emissiveIntensity: 7, roughness: 0.18 });
      const wingMaterial = new THREE.MeshPhysicalMaterial({ color: 0xe9ffff, transparent: true, opacity: 0.48, roughness: 0.08, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });

      const addBodyPart = (radius, material, position, scale) => {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 28, 20), material);
        mesh.position.set(...position);
        mesh.scale.set(...scale);
        insect.add(mesh);
        return mesh;
      };
      addBodyPart(0.48, warmShell, [0.92, 0.14, 0], [1, 0.92, 0.92]);
      addBodyPart(0.48, shell, [0.25, 0.05, 0], [0.92, 0.82, 0.84]);
      addBodyPart(0.52, shell, [-0.52, 0.02, 0], [1.22, 0.68, 0.7]);
      const lantern = addBodyPart(0.48, glowMaterial, [-1.08, 0, 0], [1.02, 0.64, 0.68]);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 14), eyeMaterial);
      eye.position.set(1.2, 0.28, 0.35);
      insect.add(eye);
      const eyeGlint = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      eyeGlint.position.set(1.25, 0.34, 0.48);
      insect.add(eyeGlint);

      const glowLight = new THREE.PointLight(0xffbd2f, 9, 5.5, 1.45);
      glowLight.position.set(-1.1, 0, 0.42);
      insect.add(glowLight);

      const haloCanvas = document.createElement("canvas");
      haloCanvas.width = 128; haloCanvas.height = 128;
      const context = haloCanvas.getContext("2d");
      const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 62);
      gradient.addColorStop(0, "rgba(255,250,190,1)");
      gradient.addColorStop(0.18, "rgba(255,211,74,.85)");
      gradient.addColorStop(0.48, "rgba(255,177,25,.32)");
      gradient.addColorStop(1, "rgba(255,160,0,0)");
      context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
      const haloTexture = new THREE.CanvasTexture(haloCanvas);
      const haloMaterial = new THREE.SpriteMaterial({ map: haloTexture, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
      const halo = new THREE.Sprite(haloMaterial);
      halo.position.set(-1.08, 0, -0.08); halo.scale.set(2.5, 2.5, 1);
      insect.add(halo);

      const makeWing = (zSide) => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.bezierCurveTo(-0.25, 0.42, -1.25, 0.7, -1.62, 0.35);
        shape.bezierCurveTo(-1.42, -0.02, -0.45, -0.18, 0, 0);
        const pivot = new THREE.Group();
        pivot.position.set(0.28, 0.26, zSide * 0.15);
        pivot.add(new THREE.Mesh(new THREE.ShapeGeometry(shape, 20), wingMaterial));
        insect.add(pivot);
        return pivot;
      };
      const nearWing = makeWing(1);
      const farWing = makeWing(-1);

      const makeLimb = (points, radius = 0.024) => {
        const pivot = new THREE.Group();
        pivot.position.set(...points[0]);
        const relative = points.map(([x, y, z]) => new THREE.Vector3(x - points[0][0], y - points[0][1], z - points[0][2]));
        pivot.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(relative), 10, radius, 5, false), jointMaterial));
        insect.add(pivot);
        return pivot;
      };
      const antennae = [
        makeLimb([[1.18, 0.36, 0.12], [1.52, 0.65, 0.1], [1.76, 0.58, 0.08]], 0.019),
        makeLimb([[1.18, 0.3, -0.1], [1.52, 0.49, -0.12], [1.72, 0.39, -0.13]], 0.019),
      ];
      const legs = [
        makeLimb([[0.42, -0.12, 0.12], [0.55, -0.52, 0.14], [0.82, -0.68, 0.12]]),
        makeLimb([[0.08, -0.17, 0.15], [-0.02, -0.58, 0.16], [0.2, -0.78, 0.13]]),
        makeLimb([[-0.3, -0.15, 0.1], [-0.5, -0.5, 0.12], [-0.4, -0.72, 0.1]]),
      ];

      const fit = () => {
        const width = Math.max(canvas.clientWidth, 1), height = Math.max(canvas.clientHeight, 1);
        renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
      };
      fit(); resizeObserver = new ResizeObserver(fit); resizeObserver.observe(canvas);

      const render = (now) => {
        if (disposed) return;
        const elapsed = (now - startedAt) / 1000;
        const journey = ((now - startedAt) % duration) / duration;
        const resting = journey >= 0.42 && journey <= 0.68;
        const beat = Math.sin(elapsed * 132);
        nearWing.rotation.x = resting ? 0.16 : beat * 1.08;
        farWing.rotation.x = resting ? -0.12 : -beat * 1.08;
        nearWing.rotation.z = resting ? -0.18 : -0.08 + beat * 0.05;
        farWing.rotation.z = resting ? 0.08 : 0.02 - beat * 0.05;
        antennae.forEach((part, index) => { part.rotation.z = Math.sin(elapsed * 5.2 + index * 1.3) * (resting ? 0.08 : 0.16); });
        legs.forEach((part, index) => { part.rotation.z = resting ? -0.1 + index * 0.05 + Math.sin(elapsed * 2.5 + index) * 0.025 : Math.sin(elapsed * 10.5 + index * 1.8) * 0.2; });
        insect.position.y = resting ? -0.06 : Math.sin(elapsed * 8) * 0.09;
        insect.rotation.x = resting ? -0.05 : Math.sin(elapsed * 5.5) * 0.08;
        insect.rotation.y = resting ? 0.12 : 0.22 + Math.sin(elapsed * 3.2) * 0.1;
        insect.rotation.z = resting ? -0.07 : Math.sin(elapsed * 4.6) * 0.08;
        insect.scale.x = direction;
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 4.1);
        glowMaterial.emissiveIntensity = 6.2 + pulse * 3.2;
        glowLight.intensity = 7.5 + pulse * 4.5;
        haloMaterial.opacity = 0.7 + pulse * 0.28;
        const haloSize = 2.35 + pulse * 0.32;
        halo.scale.set(haloSize, haloSize, 1);
        lantern.scale.y = 0.64 + pulse * 0.025;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      };
      frame = requestAnimationFrame(render);
    };

    initialize();
    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      if (resizeObserver) resizeObserver.disconnect();
      if (renderer) renderer.dispose();
    };
  }, [direction, duration]);

  return <canvas ref={canvasRef} className="easter-firefly__canvas" />;
};

export default Firefly3D;
