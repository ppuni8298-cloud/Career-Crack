"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Hero3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainDirectional = new THREE.DirectionalLight(0x10b981, 1.8);
    mainDirectional.position.set(4, 6, 4);
    mainDirectional.castShadow = true;
    scene.add(mainDirectional);

    const goldRimLight = new THREE.DirectionalLight(0xf59e0b, 1.4);
    goldRimLight.position.set(-4, -2, -3);
    scene.add(goldRimLight);

    const fillLight = new THREE.PointLight(0xd1fae5, 2, 10);
    fillLight.position.set(0, 2, 2);
    scene.add(fillLight);

    // Group for the entire educational illustration
    const illustrationGroup = new THREE.Group();
    scene.add(illustrationGroup);

    // 1. Central 3D Graduation Cap (Mortarboard)
    const capGroup = new THREE.Group();

    // Cap Top (diamond plate)
    const capTopGeo = new THREE.BoxGeometry(1.6, 0.08, 1.6);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Deep forest emerald
      roughness: 0.35,
      metalness: 0.2,
    });
    const capTop = new THREE.Mesh(capTopGeo, capMat);
    capTop.rotation.y = Math.PI / 4;
    capTop.position.y = 0.5;
    capTop.castShadow = true;
    capGroup.add(capTop);

    // Cap Skull Crown (base underneath)
    const capBaseGeo = new THREE.CylinderGeometry(0.5, 0.45, 0.45, 32);
    const capBase = new THREE.Mesh(capBaseGeo, capMat);
    capBase.position.y = 0.24;
    capBase.castShadow = true;
    capGroup.add(capBase);

    // Golden Button on Cap Center
    const btnGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const capBtn = new THREE.Mesh(btnGeo, goldMat);
    capBtn.position.y = 0.56;
    capGroup.add(capBtn);

    // Golden Tassel String and Pendant
    const tasselGroup = new THREE.Group();
    const stringCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.56, 0),
      new THREE.Vector3(0.5, 0.52, 0.5),
      new THREE.Vector3(0.9, 0.15, 0.9)
    );
    const stringGeo = new THREE.TubeGeometry(stringCurve, 20, 0.015, 8, false);
    const tasselString = new THREE.Mesh(stringGeo, goldMat);
    tasselGroup.add(tasselString);

    const pendantGeo = new THREE.ConeGeometry(0.06, 0.22, 16);
    const pendant = new THREE.Mesh(pendantGeo, goldMat);
    pendant.position.set(0.9, 0.04, 0.9);
    pendant.rotation.x = Math.PI;
    tasselGroup.add(pendant);

    capGroup.add(tasselGroup);
    illustrationGroup.add(capGroup);

    // 2. Floating 3D Study Books
    const bookGroup = new THREE.Group();
    const bookMatEmerald = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.3,
    });
    const bookMatMint = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      roughness: 0.35,
    });
    const pagesMat = new THREE.MeshStandardMaterial({
      color: 0xfffdfa,
      roughness: 0.6,
    });

    // Book 1 (bottom left)
    const b1Cover = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 1.5), bookMatEmerald);
    b1Cover.position.set(-1.1, -0.6, 0.2);
    b1Cover.rotation.set(0.1, 0.4, -0.15);
    b1Cover.castShadow = true;
    bookGroup.add(b1Cover);

    const b1Pages = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 1.4), pagesMat);
    b1Pages.position.set(-1.1, -0.6, 0.2);
    b1Pages.rotation.set(0.1, 0.4, -0.15);
    bookGroup.add(b1Pages);

    // Book 2 (stacked on book 1 with offset)
    const b2Cover = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 1.3), bookMatMint);
    b2Cover.position.set(-1.0, -0.38, 0.25);
    b2Cover.rotation.set(0.12, 0.15, -0.1);
    b2Cover.castShadow = true;
    bookGroup.add(b2Cover);

    illustrationGroup.add(bookGroup);

    // 3. Glowing Target / Compass Ring (Symbol of Cracking the Exam)
    const ringGeo = new THREE.TorusGeometry(1.7, 0.035, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.5,
      roughness: 0.2,
      emissive: 0x059669,
      emissiveIntensity: 0.4,
    });
    const targetRing = new THREE.Mesh(ringGeo, ringMat);
    targetRing.rotation.x = Math.PI / 2.6;
    illustrationGroup.add(targetRing);

    // 4. Floating Sparkle Stars / Knowledge Seeds
    const starCount = 28;
    const starGeometry = new THREE.OctahedronGeometry(0.07, 0);
    const stars: any[] = [];

    for (let i = 0; i < starCount; i++) {
      const isGold = i % 3 === 0;
      const starMesh = new THREE.Mesh(
        starGeometry,
        new THREE.MeshStandardMaterial({
          color: isGold ? 0xf59e0b : 0x10b981,
          emissive: isGold ? 0xd97706 : 0x059669,
          emissiveIntensity: 0.6,
          roughness: 0.2,
        })
      );

      const angle = (i / starCount) * Math.PI * 2;
      const radius = 1.6 + Math.random() * 0.9;
      const height = (Math.random() - 0.5) * 2.2;

      starMesh.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      (starMesh as any).initialY = height;
      (starMesh as any).speed = 0.5 + Math.random() * 0.8;
      (starMesh as any).offset = Math.random() * Math.PI * 2;

      stars.push(starMesh);
      illustrationGroup.add(starMesh);
    }

    // Interactive mouse tracking
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.45;
      targetRotX = y * 0.35;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth floating motion
      capGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08 + 0.1;
      capGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.12;

      bookGroup.position.y = Math.cos(elapsedTime * 1.3) * 0.05 - 0.2;

      targetRing.rotation.z = elapsedTime * 0.25;
      targetRing.rotation.y = Math.sin(elapsedTime * 0.5) * 0.15;

      // Floating sparkling stars
      stars.forEach((star) => {
        const customData = star as any;
        star.position.y =
          customData.initialY + Math.sin(elapsedTime * customData.speed + customData.offset) * 0.18;
        star.rotation.x += 0.02;
        star.rotation.y += 0.02;
      });

      // Mouse-follow easing
      illustrationGroup.rotation.y += (targetRotY - illustrationGroup.rotation.y) * 0.05;
      illustrationGroup.rotation.x += (targetRotX - illustrationGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] lg:h-[500px] flex items-center justify-center">
      {/* Soft mint backdrop illumination */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/50 via-teal-50/30 to-amber-50/30 rounded-full blur-3xl -z-10 transform scale-75 animate-pulse" />

      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />

      {/* Fallback in case WebGL is unavailable */}
      {!webglSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-emerald-50 to-white rounded-3xl border border-emerald-100 shadow-xl">
          <div className="w-24 h-24 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-5xl shadow-xl shadow-emerald-500/20 mb-4 animate-bounce">
            🎓
          </div>
          <h3 className="font-extrabold text-xl text-slate-800">Crack Your Exam</h3>
          <p className="text-sm text-slate-600 text-center mt-2 max-w-xs">
            Personalized preparation for competitive government exams and tech placements.
          </p>
        </div>
      )}

      {/* Floating Badges for Visual Richness */}
      <div className="absolute -bottom-2 -left-2 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-3 animate-subtle-float">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
          ✓
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Readiness</div>
          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>Target 99.4%ile</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-0 sm:top-6 sm:right-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-amber-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-base">
          ⚡
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Smart Study Plan</div>
          <div className="text-sm font-extrabold text-slate-900">Personalized Today</div>
        </div>
      </div>
    </div>
  );
}
