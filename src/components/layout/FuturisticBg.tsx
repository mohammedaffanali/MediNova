import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FuturisticBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Detect device capabilities for performance scaling
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const particleCount = isMobile ? 350 : isTablet ? 800 : 2400;
    const nodeCount = isMobile ? 18 : isTablet ? 35 : 70;

    // 1. Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    // Soft transparent fog so background elements don't get pitch black
    scene.fog = new THREE.FogExp2(0x030712, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Bring camera closer so 3D elements wrap around dashboard content vibrantly
    camera.position.z = 135;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 2. High-Intensity Volumetric Lighting System
    const ambientLight = new THREE.AmbientLight(0x1a2e50, 1.8);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 45, 350);
    cyanLight.position.set(-70, 40, 50);
    scene.add(cyanLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 40, 350);
    blueLight.position.set(70, -40, 50);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 30, 250);
    purpleLight.position.set(0, 60, 30);
    scene.add(purpleLight);

    // 3. Persistent 3D Elements Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 3A. Left Side: AI Core projector platform (Bottom Left)
    const projectorGroup = new THREE.Group();
    scene.add(projectorGroup);

    // Projector Platform Rings - Bright Neon Cyan
    const platRingGeom = new THREE.RingGeometry(11, 14, 32);
    const platRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const platRing = new THREE.Mesh(platRingGeom, platRingMat);
    platRing.rotation.x = Math.PI / 2;
    projectorGroup.add(platRing);

    const platRingInnerMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const platRingInner = new THREE.Mesh(new THREE.RingGeometry(6, 9, 24), platRingInnerMat);
    platRingInner.rotation.x = Math.PI / 2;
    platRingInner.position.y = 1;
    projectorGroup.add(platRingInner);

    // Projector Vertical Light Beam - Vibrant Glowing Column
    const beamGeom = new THREE.CylinderGeometry(9, 14, 45, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      wireframe: true,
    });
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.position.y = 22;
    projectorGroup.add(beam);

    // Floating particles inside the projector beam
    const beamPartGeom = new THREE.BufferGeometry();
    const beamPartPos = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 9;
      beamPartPos[i * 3] = Math.cos(angle) * radius;
      beamPartPos[i * 3 + 1] = Math.random() * 45;
      beamPartPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    beamPartGeom.setAttribute('position', new THREE.BufferAttribute(beamPartPos, 3));
    const beamPartMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 2.2,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const beamParticles = new THREE.Points(beamPartGeom, beamPartMat);
    projectorGroup.add(beamParticles);


    // 3B. Right Side: Holographic Cardiac Heart (Bottom Right)
    const heartGroup = new THREE.Group();
    scene.add(heartGroup);

    // Math cardiac heart shape construction
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, 4, -4, 8, -9, 8);
    heartShape.bezierCurveTo(-15, 8, -19, 4, -19, -2);
    heartShape.bezierCurveTo(-19, -8, -13, -15, 0, -24);
    heartShape.bezierCurveTo(13, -15, 19, -8, 19, -2);
    heartShape.bezierCurveTo(19, 4, 15, 8, 9, 8);
    heartShape.bezierCurveTo(4, 8, 0, 4, 0, 0);

    const extrudeSettings = {
      depth: 4,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 1.2,
      bevelThickness: 1.2,
    };
    const heartGeom = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeom.center();

    const heartMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const heartMesh = new THREE.Mesh(heartGeom, heartMat);
    heartMesh.scale.set(0.75, 0.75, 0.75);
    heartMesh.rotation.x = Math.PI;
    heartGroup.add(heartMesh);

    // Glowing heart points boundary layer - Vibrant Crimson Neon
    const heartPointsGeom = new THREE.BufferGeometry().setFromPoints(heartShape.getPoints(40));
    const heartPointsMat = new THREE.PointsMaterial({
      color: 0xf43f5e,
      size: 2.4,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const heartPoints = new THREE.Points(heartPointsGeom, heartPointsMat);
    heartPoints.scale.set(0.76, 0.76, 0.76);
    heartPoints.rotation.x = Math.PI;
    heartGroup.add(heartPoints);

    // 3C. Center Left Background: Holographic AI Core (Medinova Core)
    const aiCoreGroup = new THREE.Group();
    scene.add(aiCoreGroup);
    aiCoreGroup.position.set(-55, 25, -20);

    const coreGeom = new THREE.IcosahedronGeometry(18, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    aiCoreGroup.add(coreMesh);

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(25, 0.4, 8, 28), platRingMat);
    aiCoreGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(32, 0.35, 6, 24), platRingMat);
    ring2.rotation.x = Math.PI / 3;
    aiCoreGroup.add(ring2);


    // 4. Background Constellation Network (Glowing Nodes & Links)
    const neuralGroup = new THREE.Group();
    scene.add(neuralGroup);

    const nodePositions: THREE.Vector3[] = [];
    const nodeSpeeds: THREE.Vector3[] = [];
    const areaWidth = isMobile ? 140 : 280;
    const areaHeight = isMobile ? 90 : 170;
    const areaDepth = 90;

    for (let i = 0; i < nodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * areaWidth,
        (Math.random() - 0.5) * areaHeight,
        (Math.random() - 0.5) * areaDepth
      );
      if (pos.length() < 25) pos.normalize().multiplyScalar(35);
      nodePositions.push(pos);
      nodeSpeeds.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        )
      );
    }

    const nodeGeom = new THREE.BufferGeometry().setFromPoints(nodePositions);
    const nodePoints = new THREE.Points(nodeGeom, new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: isMobile ? 3.0 : 4.8,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    }));
    neuralGroup.add(nodePoints);

    const lineIndices: number[] = [];
    const maxDist = isMobile ? 36 : 50;
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < maxDist) {
          lineIndices.push(i, j);
        }
      }
    }
    const linesGeom = new THREE.BufferGeometry().setFromPoints(nodePositions);
    linesGeom.setIndex(lineIndices);
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
    });
    const neuralLines = new THREE.LineSegments(linesGeom, linesMat);
    neuralGroup.add(neuralLines);


    // 5. Global Depth Particles Layer
    const partGeom = new THREE.BufferGeometry();
    const partPositions = new Float32Array(particleCount * 3);
    const partSpeeds: number[] = [];
    for (let i = 0; i < particleCount; i++) {
      partPositions[i * 3] = (Math.random() - 0.5) * 360;
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 230;
      partPositions[i * 3 + 2] = (Math.random() - 0.5) * 160 - 20;
      partSpeeds.push((Math.random() * 0.08 + 0.02) * (Math.random() < 0.5 ? 1 : -1));
    }
    partGeom.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: isMobile ? 1.0 : 1.8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(partGeom, partMat);
    scene.add(particles);


    // 6. Interactive Cursor Parallax Positioning
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseMoveEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) / 80;
      mouseY = (e.clientY - window.innerHeight / 2) / 80;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Calculate dynamic 3D positions inside boundaries based on aspect ratios
    const updateComponentLayoutPositions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;

      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Place projector in bottom left corner dynamically
      const edgeX = aspect * 55;
      projectorGroup.position.set(-edgeX, -38, -5);
      projectorGroup.rotation.y = Math.PI / 4;

      // Place heart in bottom right corner dynamically
      heartGroup.position.set(edgeX - 4, -36, -5);
    };

    updateComponentLayoutPositions();
    window.addEventListener('resize', updateComponentLayoutPositions);

    // 7. Render Loop Animation
    let clock = new THREE.Clock();
    let animId: number;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const elapsedTime = clock.getElapsedTime();

      // Smooth cursor parallax camera drift
      targetX = mouseX * 4.5;
      targetY = -mouseY * 4.5;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Projector beam rotation & particle upward drift
      platRing.rotation.z += 0.01;
      platRingInner.rotation.z -= 0.015;
      beam.rotation.y += 0.007;

      const beamPositions = beamParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 60; i++) {
        beamPositions[i * 3 + 1] += 0.12; // Drift up
        if (beamPositions[i * 3 + 1] > 45) {
          beamPositions[i * 3 + 1] = 0; // Wrap back down
        }
      }
      beamParticles.geometry.attributes.position.needsUpdate = true;

      // Holographic Heart double-thump medical contraction animation
      const heartBeatSpeed = elapsedTime * 4.4;
      const beatIntensity = Math.pow(Math.sin(heartBeatSpeed), 8) * 0.14 + Math.pow(Math.sin(heartBeatSpeed + 0.4), 12) * 0.07;
      const heartScale = 0.75 + beatIntensity;
      heartGroup.scale.set(heartScale, heartScale, heartScale);
      heartGroup.rotation.y = elapsedTime * 0.4; // slow spin

      // AI Core spin & pulse
      aiCoreGroup.rotation.y += 0.006;
      aiCoreGroup.rotation.x += 0.002;
      ring1.rotation.y -= 0.009;
      ring2.rotation.z += 0.007;
      const corePulse = 1 + Math.sin(elapsedTime * 1.5) * 0.04;
      coreMesh.scale.set(corePulse, corePulse, corePulse);

      // Brownian dynamic node movement
      const positions = nodePoints.geometry.attributes.position.array as Float32Array;
      const lineIdx: number[] = [];
      for (let i = 0; i < nodeCount; i++) {
        positions[i * 3] += nodeSpeeds[i].x;
        positions[i * 3 + 1] += nodeSpeeds[i].y;
        positions[i * 3 + 2] += nodeSpeeds[i].z;

        if (Math.abs(positions[i * 3]) > areaWidth / 2) nodeSpeeds[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > areaHeight / 2) nodeSpeeds[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > areaDepth / 2) nodeSpeeds[i].z *= -1;

        for (let j = i + 1; j < nodeCount; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (distance < maxDist) {
            lineIdx.push(i, j);
          }
        }
      }
      nodePoints.geometry.attributes.position.needsUpdate = true;
      neuralLines.geometry.setIndex(lineIdx);
      neuralLines.geometry.attributes.position.needsUpdate = true;

      // Float background particles
      const partPos = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        partPos[i * 3 + 1] += partSpeeds[i];
        if (partPos[i * 3 + 1] > 120) partPos[i * 3 + 1] = -120;
        else if (partPos[i * 3 + 1] < -120) partPos[i * 3 + 1] = 120;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    tick();

    // 8. Cleanup resources on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateComponentLayoutPositions);
      renderer.dispose();
      
      platRingGeom.dispose();
      platRingMat.dispose();
      platRingInnerMat.dispose();
      beamGeom.dispose();
      beamMat.dispose();
      beamPartGeom.dispose();
      beamPartMat.dispose();
      heartGeom.dispose();
      heartMat.dispose();
      heartPointsGeom.dispose();
      heartPointsMat.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      nodeGeom.dispose();
      linesGeom.dispose();
      linesMat.dispose();
      partGeom.dispose();
      partMat.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-50 w-full h-full bg-[#030712] overflow-hidden select-none pointer-events-none">
      {/* Three.js 3D WebGL render layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Layer 2: Moving Vibrant Space Auroras (CSS Overlay Blend) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d2248] via-transparent to-transparent opacity-80 mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[55%] h-[55%] rounded-full bg-brand-500/20 blur-[140px] opacity-60" />
      <div className="absolute top-[15%] left-[-5%] w-[55%] h-[55%] rounded-full bg-purple-500/15 blur-[130px] opacity-50" />
      <div className="absolute bottom-[20%] left-[20%] w-[45%] h-[45%] rounded-full bg-accent-500/15 blur-[120px] opacity-45" />

      {/* Dot Grid matrix pattern (soft overlay grid layer) */}
      <div className="absolute inset-0 opacity-[0.22]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.22) 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />

      {/* Light subtle edge vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_60%,_rgba(3,_7,_18,_0.45)_100%)]" />
    </div>
  );
}

interface MouseMoveEvent {
  clientX: number;
  clientY: number;
}
