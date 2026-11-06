import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_LAND_PATH_1024 } from './earthLandData';

interface SharedGoalGlobe3DProps {
  currentKm: number;
  targetKm: number;
  percentage: number;
  className?: string;
  interactive?: boolean;
}

// Cores especificadas: Água rgb(78, 95, 128) e Continentes rgb(68, 96, 80) com contorno preto
const AVATAR_THEME = {
  ocean: 'rgb(78, 95, 128)',     // Água
  land: 'rgb(68, 96, 80)',       // Continentes
  outline: 0x000000,             // Contorno preto
  outlineHex: '#000000',
  activeRing: 0xc09358,          // 'Âmbar Calmo' dos avatares
  marker: 0x9e5b4b,              // 'Carmesim Suave' dos avatares
  startPin: 0x000000,            // Ponto de início preto
  inactiveRing: 0xd2dadf,        // Cinza mineral sólido opaco
};

// Curva analítica em arco circular no plano equatorial (X, Z) para intervalos arbitrários [startAngle, endAngle]
class EquatorialRangeArcCurve extends THREE.Curve<THREE.Vector3> {
  radius: number;
  startAngle: number;
  endAngle: number;

  constructor(radius: number, startAngle: number, endAngle: number) {
    super();
    this.radius = radius;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const angle = this.startAngle + t * (this.endAngle - this.startAngle);
    return optionalTarget.set(
      this.radius * Math.cos(angle),
      0,
      this.radius * Math.sin(angle)
    );
  }
}

// Textura Toon 2D baseada estritamente nas cores da paleta de avatares
function createToonEarthTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Oceano: 'Azul Céu Suave' da paleta de avatares
    ctx.fillStyle = AVATAR_THEME.ocean;
    ctx.fillRect(0, 0, width, height);

    // // Linha do equador sutil
    // ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    // ctx.lineWidth = 1.0;
    // ctx.setLineDash([8, 8]);
    // ctx.beginPath();
    // ctx.moveTo(0, height / 2);
    // ctx.lineTo(width, height / 2);
    // ctx.stroke();
    // ctx.setLineDash([]);

    // 2. Continentes: rgb(68, 96, 80) com contorno preto e um pouco menos grosso
    try {
      const landPath = new Path2D(EARTH_LAND_PATH_1024);

      // Preenchimento
      ctx.fillStyle = AVATAR_THEME.land;
      ctx.fill(landPath);

      // Contorno preto um pouco menos grosso (3.2px)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke(landPath);
    } catch {
      ctx.fillStyle = AVATAR_THEME.land;
      ctx.fillRect(0, 0, width, height);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export const SharedGoalGlobe3D: React.FC<SharedGoalGlobe3DProps> = ({
  percentage,
  className = '',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 165;

    // 1. Cena, Câmera e Renderizador (Toon Unlit)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    
    // Calibra a distância da câmera dinamicamente para garantir que o anel (raio 1.35) nunca sofra clip lateral em qualquer aspect ratio
    const updateCameraFrame = (w: number, h: number) => {
      const aspect = w / h;
      camera.aspect = aspect;
      const zDist = aspect < 1.05 ? 4.4 : (aspect < 1.3 ? 3.9 : 3.55);
      camera.position.set(0, 1.25, zDist);
      camera.lookAt(0, -0.05, 0);
      camera.updateProjectionMatrix();
    };

    updateCameraFrame(width, height);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    // 2. Grupo de Inclinação Axial da Terra
    const axisGroup = new THREE.Group();
    axisGroup.rotation.z = THREE.MathUtils.degToRad(-21);
    axisGroup.rotation.x = THREE.MathUtils.degToRad(14);
    scene.add(axisGroup);

    // 3. Grupo de Rotação (Planeta + Anel giram em conjunto)
    const spinGroup = new THREE.Group();
    axisGroup.add(spinGroup);

    // 3.1. Globo Terrestre Toon
    const texture = createToonEarthTexture();
    const globeRadius = 1.0;
    const globeGeo = new THREE.SphereGeometry(globeRadius, 48, 32);
    const globeMat = new THREE.MeshBasicMaterial({
      map: texture,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeMesh.rotation.y = THREE.MathUtils.degToRad(-65);
    spinGroup.add(globeMesh);

    // Contorno exterior da Terra (Preto Toon de mesma espessura que os continentes)
    const outlineGeo = new THREE.SphereGeometry(globeRadius * 1.018, 48, 32);
    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
    });
    const outlineMesh = new THREE.Mesh(outlineGeo, outlineMat);
    spinGroup.add(outlineMesh);

    // 3.2. Anel de Saturno Equatorial Dividido em Partes Concluída e Incompleta
    // Ambos os arcos são materiais 100% sólidos (transparent: false), impedindo que o outline da Terra transpareça por trás
    const orbitRadius = 1.28;
    const ringTubeRadius = 0.025;

    const clampedPct = Math.max(0, Math.min(percentage, 100));
    const targetProgressAngle = (clampedPct / 100) * (2 * Math.PI);
    let currentAnimatedAngle = Math.min(0.05, targetProgressAngle);

    // Material do arco ativo: 'Âmbar Calmo' dos avatares, sólido e opaco
    const activeProgressMat = new THREE.MeshBasicMaterial({
      color: AVATAR_THEME.activeRing,
      transparent: false,
    });

    // Material da parte incompleta: cinza mineral 100% SÓLIDO (transparent: false), bloqueia totalmente o outline da Terra
    const inactiveProgressMat = new THREE.MeshBasicMaterial({
      color: AVATAR_THEME.inactiveRing,
      transparent: false,
    });

    // Marcador da expedição: 'Carmesim Suave' dos avatares
    const markerMat = new THREE.MeshBasicMaterial({
      color: AVATAR_THEME.marker,
    });
    const markerGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const markerMesh = new THREE.Mesh(markerGeo, markerMat);
    spinGroup.add(markerMesh);

    // Ponto de início da Volta ao Mundo (0 km)
    const startPointMat = new THREE.MeshBasicMaterial({
      color: AVATAR_THEME.startPin,
    });
    const startPointGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const startPointMesh = new THREE.Mesh(startPointGeo, startPointMat);
    startPointMesh.position.set(orbitRadius, 0, 0);
    spinGroup.add(startPointMesh);

    // Referências das malhas dinâmicas dos arcos
    let activeMesh: THREE.Mesh | null = null;
    let inactiveMesh: THREE.Mesh | null = null;

    const updateRingMeshes = (angle: number) => {
      // 1. Limpa arcos anteriores
      if (activeMesh) {
        spinGroup.remove(activeMesh);
        activeMesh.geometry.dispose();
        activeMesh = null;
      }
      if (inactiveMesh) {
        spinGroup.remove(inactiveMesh);
        inactiveMesh.geometry.dispose();
        inactiveMesh = null;
      }

      // 2. Arco Ativo (Progresso concluído [0, angle])
      if (angle > 0.01) {
        const activeSegments = Math.max(6, Math.floor((angle / (2 * Math.PI)) * 100));
        const activeCurve = new EquatorialRangeArcCurve(orbitRadius, 0, angle);
        const activeGeo = new THREE.TubeGeometry(activeCurve, activeSegments, ringTubeRadius, 8, false);
        activeMesh = new THREE.Mesh(activeGeo, activeProgressMat);
        spinGroup.add(activeMesh);
      }

      // 3. Arco Inativo (Parte cinza incompleta [angle, 2*PI])
      const remainingAngle = (2 * Math.PI) - angle;
      if (remainingAngle > 0.01) {
        const inactiveSegments = Math.max(6, Math.floor((remainingAngle / (2 * Math.PI)) * 100));
        const inactiveCurve = new EquatorialRangeArcCurve(orbitRadius, angle, 2 * Math.PI);
        const inactiveGeo = new THREE.TubeGeometry(inactiveCurve, inactiveSegments, ringTubeRadius, 8, false);
        inactiveMesh = new THREE.Mesh(inactiveGeo, inactiveProgressMat);
        spinGroup.add(inactiveMesh);
      }

      // 4. Marcador na ponta exata da expedição
      markerMesh.position.set(
        orbitRadius * Math.cos(angle),
        0,
        orbitRadius * Math.sin(angle)
      );
    };

    updateRingMeshes(currentAnimatedAngle);

    // 4. Rotação Contemplativa e Lenta
    const slowAutoRotateSpeed = 0.0007;
    let isDragging = false;
    let previousMouseX = 0;
    let dragVelocity = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      dragVelocity = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      previousMouseX = e.clientX;
      spinGroup.rotation.y += deltaX * 0.006;
      dragVelocity = deltaX * 0.006;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    if (interactive) {
      domEl.style.cursor = 'grab';
      domEl.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    } else {
      domEl.style.pointerEvents = 'none';
    }

    // 5. Redimensionamento
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      updateCameraFrame(w, h);
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // 6. Loop de Renderização
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Preenchimento progressivo suave até a meta real
      if (currentAnimatedAngle < targetProgressAngle) {
        currentAnimatedAngle += (targetProgressAngle - currentAnimatedAngle) * 0.04;
        if (Math.abs(targetProgressAngle - currentAnimatedAngle) < 0.003) {
          currentAnimatedAngle = targetProgressAngle;
        }
        updateRingMeshes(currentAnimatedAngle);
      }

      // Rotação conjunta
      if (isDragging) {
        domEl.style.cursor = 'grabbing';
      } else {
        domEl.style.cursor = 'grab';
        if (Math.abs(dragVelocity) > 0.00005) {
          spinGroup.rotation.y += dragVelocity;
          dragVelocity *= 0.93;
        } else {
          spinGroup.rotation.y += slowAutoRotateSpeed;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (interactive) {
        domEl.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      }

      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }

      globeGeo.dispose();
      outlineGeo.dispose();
      globeMat.dispose();
      outlineMat.dispose();
      texture.dispose();
      activeProgressMat.dispose();
      inactiveProgressMat.dispose();
      markerGeo.dispose();
      markerMat.dispose();
      startPointGeo.dispose();
      startPointMat.dispose();
      if (activeMesh) {
        activeMesh.geometry.dispose();
      }
      if (inactiveMesh) {
        inactiveMesh.geometry.dispose();
      }
      renderer.dispose();
    };
  }, [percentage]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full select-none ${className}`}
    />
  );
};

export default SharedGoalGlobe3D;
