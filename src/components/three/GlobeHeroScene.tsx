import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, EyeOff, RotateCw, Sparkles, Navigation } from 'lucide-react';

export interface GlobeDestination {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  price: number;
  image: string;
}

const DESTINATIONS: GlobeDestination[] = [
  { id: 'dest_bali', name: 'Bali', country: 'Indonesia', lat: -8.4095, lng: 115.1889, price: 1290, image: '/src/assets/images/dest_bali_temple_1792642638723.jpg' },
  { id: 'dest_swiss_alps', name: 'Swiss Alps', country: 'Switzerland', lat: 46.0207, lng: 7.7491, price: 2450, image: '/src/assets/images/dest_swiss_alps_1792642639766.jpg' },
  { id: 'dest_kyoto', name: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681, price: 1890, image: '/src/assets/images/dest_kyoto_bamboo_1792642639795.jpg' },
  { id: 'dest_santorini', name: 'Santorini', country: 'Greece', lat: 36.3932, lng: 25.4615, price: 2150, image: '/src/assets/images/dest_santorini_view_1792642644829.jpg' },
  { id: 'dest_dubai', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, price: 1650, image: '/src/assets/images/dest_dubai_skyline_1792642640903.jpg' },
  { id: 'dest_manali', name: 'Manali', country: 'India', lat: 32.2432, lng: 77.1892, price: 890, image: '/src/assets/images/dest_manali_himalaya_1792642642153.jpg' },
];

// Flight route connections
const FLIGHT_ROUTES = [
  { from: DESTINATIONS[0], to: DESTINATIONS[1] }, // Bali to Swiss Alps
  { from: DESTINATIONS[1], to: DESTINATIONS[3] }, // Swiss Alps to Santorini
  { from: DESTINATIONS[3], to: DESTINATIONS[4] }, // Santorini to Dubai
  { from: DESTINATIONS[4], to: DESTINATIONS[5] }, // Dubai to Manali
  { from: DESTINATIONS[5], to: DESTINATIONS[2] }, // Manali to Kyoto
  { from: DESTINATIONS[2], to: DESTINATIONS[0] }, // Kyoto to Bali
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Procedural Earth Texture Generator using 2D Canvas
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Oceanic Blue gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#030814');
  oceanGrad.addColorStop(0.5, '#07162c');
  oceanGrad.addColorStop(1, '#030814');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Subtle latitude & longitude oceanic grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let lat = 0; lat < canvas.height; lat += 64) {
    ctx.beginPath();
    ctx.moveTo(0, lat);
    ctx.lineTo(canvas.width, lat);
    ctx.stroke();
  }
  for (let lon = 0; lon < canvas.width; lon += 64) {
    ctx.beginPath();
    ctx.moveTo(lon, 0);
    ctx.lineTo(lon, canvas.height);
    ctx.stroke();
  }

  // 3. Procedural continent landmasses
  ctx.fillStyle = '#0f2942';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 4;

  const drawPolygon = (points: [number, number][], fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    points.forEach(([xPct, yPct], i) => {
      const x = (xPct / 100) * canvas.width;
      const y = (yPct / 100) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  };

  // North America
  drawPolygon([
    [12, 18], [22, 16], [32, 22], [30, 38], [24, 45], [18, 48], [15, 38], [10, 28]
  ], '#123859');

  // South America
  drawPolygon([
    [26, 48], [34, 52], [36, 68], [28, 88], [24, 82], [22, 60]
  ], '#144066');

  // Europe
  drawPolygon([
    [46, 18], [58, 16], [62, 28], [54, 38], [44, 34], [44, 24]
  ], '#164873');

  // Africa
  drawPolygon([
    [44, 40], [56, 38], [64, 52], [58, 78], [50, 84], [42, 64], [40, 48]
  ], '#184c78');

  // Asia
  drawPolygon([
    [62, 16], [88, 18], [94, 36], [82, 54], [72, 50], [64, 42]
  ], '#15436b');

  // India subcontinent
  drawPolygon([
    [68, 44], [74, 44], [72, 58], [68, 52]
  ], '#195485');

  // Southeast Asia & Indonesia
  drawPolygon([
    [78, 56], [86, 56], [88, 64], [82, 68], [76, 64]
  ], '#1b5f94');

  // Australia & Oceania
  drawPolygon([
    [82, 68], [92, 66], [94, 82], [84, 86], [80, 78]
  ], '#16466e');

  // City Lights glow dots across major civilization hubs
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#ffedd5';
  const cities = [
    [25, 32], [29, 36], [16, 34], [49, 24], [52, 26], [55, 32],
    [71, 48], [80, 36], [86, 34], [88, 42], [82, 60], [64, 40]
  ];
  cities.forEach(([xPct, yPct]) => {
    ctx.beginPath();
    ctx.arc((xPct / 100) * canvas.width, (yPct / 100) * canvas.height, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface GlobeHeroSceneProps {
  onSelectDestination?: (dest: GlobeDestination) => void;
  selectedDestinationId?: string | null;
}

export const GlobeHeroScene: React.FC<GlobeHeroSceneProps> = ({
  onSelectDestination,
  selectedDestinationId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDest, setActiveDest] = useState<GlobeDestination>(DESTINATIONS[0]);
  const [isRotating, setIsRotating] = useState(true);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Mutable refs for Three.js scene loop
  const sceneRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    globeGroup: THREE.Group;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    markers: THREE.Mesh[];
    targetRotY: number;
    targetRotX: number;
    isDragging: boolean;
    prevMouseX: number;
    prevMouseY: number;
    flightArcs: { curve: THREE.QuadraticBezierCurve3; pulseMesh: THREE.Mesh; progress: number }[];
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. WebGL Support and Software Check
    let isSoftwareGl = false;
    try {
      const testGl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
      if (!testGl) {
        setWebGlSupported(false);
        return;
      }
      const ext = testGl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        const gpu = String(testGl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
        isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 2. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060b14, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    containerRef.current.appendChild(renderer.domElement);

    // 3. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x1e3a5f, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.5);
    keyLight.position.set(5, 4, 6);
    scene.add(keyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00f0ff, 2.2);
    cyanRimLight.position.set(-6, -2, -4);
    scene.add(cyanRimLight);

    // 4. Starfield Background
    const starsCount = 1200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      const r = 25 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const isCyan = Math.random() > 0.7;
      starColors[i * 3] = isCyan ? 0.0 : 0.9;
      starColors[i * 3 + 1] = isCyan ? 0.94 : 0.95;
      starColors[i * 3 + 2] = 1.0;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5. Globe Group & Multi-part Procedural Earth
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 2.6;

    // A. Base Sphere with Procedural Earth Texture
    const earthTexture = createProceduralEarthTexture();
    const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.2,
      emissive: new THREE.Color(0x041122),
      emissiveIntensity: 0.35,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // B. Outer Atmosphere Glow Layer
    const atmosGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 48, 48);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    globeGroup.add(atmosMesh);

    // C. Interactive 3D Destination Pins
    const markers: THREE.Mesh[] = [];
    DESTINATIONS.forEach((dest) => {
      const pinPos = latLngToVector3(dest.lat, dest.lng, GLOBE_RADIUS);

      const pinGroup = new THREE.Group();
      pinGroup.position.copy(pinPos);
      pinGroup.lookAt(0, 0, 0); // Orient towards center

      // Glowing Gem Pin Head
      const gemGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
      const gemMesh = new THREE.Mesh(gemGeo, gemMat);
      gemMesh.userData = { destId: dest.id, destName: dest.name, destination: dest };
      pinGroup.add(gemMesh);
      markers.push(gemMesh);

      // Surface Pulsing Ring
      const ringGeo = new THREE.RingGeometry(0.09, 0.14, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.z = -0.02;
      pinGroup.add(ringMesh);

      globeGroup.add(pinGroup);
    });

    // D. 3D Flight Arcs with Moving Photon Pulses
    const flightArcs: { curve: THREE.QuadraticBezierCurve3; pulseMesh: THREE.Mesh; progress: number }[] = [];

    FLIGHT_ROUTES.forEach((route, idx) => {
      const vFrom = latLngToVector3(route.from.lat, route.from.lng, GLOBE_RADIUS);
      const vTo = latLngToVector3(route.to.lat, route.to.lng, GLOBE_RADIUS);

      // Arc midpoint elevated outward
      const midPoint = vFrom.clone().add(vTo).multiplyScalar(0.5);
      const distance = vFrom.distanceTo(vTo);
      midPoint.normalize().multiplyScalar(GLOBE_RADIUS + distance * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(vFrom, midPoint, vTo);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      const curveMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.35,
      });
      const arcLine = new THREE.Line(curveGeo, curveMat);
      globeGroup.add(arcLine);

      // Traveling Photon Light Pulse
      const pulseGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      globeGroup.add(pulseMesh);

      flightArcs.push({
        curve,
        pulseMesh,
        progress: (idx * 0.16) % 1,
      });
    });

    // 6. Interactive Raycasting & Drag Rotation
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    sceneRefs.current = {
      scene,
      camera,
      renderer,
      globeGroup,
      raycaster,
      mouse,
      markers,
      targetRotY: 0,
      targetRotX: 0,
      isDragging: false,
      prevMouseX: 0,
      prevMouseY: 0,
      flightArcs,
    };

    const canvasDom = renderer.domElement;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!sceneRefs.current) return;
      sceneRefs.current.isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      sceneRefs.current.prevMouseX = clientX;
      sceneRefs.current.prevMouseY = clientY;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!sceneRefs.current) return;
      const rect = canvasDom.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      sceneRefs.current.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      sceneRefs.current.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      if (sceneRefs.current.isDragging) {
        const deltaX = clientX - sceneRefs.current.prevMouseX;
        const deltaY = clientY - sceneRefs.current.prevMouseY;
        sceneRefs.current.targetRotY += deltaX * 0.006;
        sceneRefs.current.targetRotX = Math.max(-0.6, Math.min(0.6, sceneRefs.current.targetRotX + deltaY * 0.006));
        sceneRefs.current.prevMouseX = clientX;
        sceneRefs.current.prevMouseY = clientY;
      }
    };

    const handlePointerUp = () => {
      if (sceneRefs.current) {
        sceneRefs.current.isDragging = false;
      }
    };

    const handleClick = () => {
      if (!sceneRefs.current) return;
      sceneRefs.current.raycaster.setFromCamera(sceneRefs.current.mouse, sceneRefs.current.camera);
      const intersects = sceneRefs.current.raycaster.intersectObjects(sceneRefs.current.markers);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const dest = hit.userData.destination as GlobeDestination;
        if (dest) {
          focusDestination(dest);
        }
      }
    };

    canvasDom.addEventListener('mousedown', handlePointerDown);
    canvasDom.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    canvasDom.addEventListener('click', handleClick);
    canvasDom.addEventListener('touchstart', handlePointerDown, { passive: true });
    canvasDom.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // 7. Animation Loop with Exponential Damping
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (sceneRefs.current) {
        const { globeGroup, targetRotY, targetRotX, flightArcs } = sceneRefs.current;

        // Auto rotate when not dragging
        if (isRotating && !sceneRefs.current.isDragging) {
          sceneRefs.current.targetRotY += 0.0035;
        }

        // Smooth damping
        globeGroup.rotation.y = THREE.MathUtils.damp(globeGroup.rotation.y, targetRotY, 4.0, delta);
        globeGroup.rotation.x = THREE.MathUtils.damp(globeGroup.rotation.x, targetRotX, 4.0, delta);

        // Advance flight path photons
        flightArcs.forEach((arc) => {
          arc.progress += 0.22 * delta;
          if (arc.progress > 1) arc.progress = 0;
          const point = arc.curve.getPoint(arc.progress);
          arc.pulseMesh.position.copy(point);
        });

        // Twinkle stars gently
        starField.rotation.y += 0.0003;

        renderer.render(scene, camera);
      }
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !sceneRefs.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      sceneRefs.current.camera.aspect = newW / newH;
      sceneRefs.current.camera.updateProjectionMatrix();
      sceneRefs.current.renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('mousedown', handlePointerDown);
      canvasDom.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvasDom.removeEventListener('click', handleClick);
      canvasDom.removeEventListener('touchstart', handlePointerDown);
      canvasDom.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthTexture.dispose();
      earthGeometry.dispose();
      starGeometry.dispose();
    };
  }, [isRotating]);

  // Focus destination helper
  const focusDestination = (dest: GlobeDestination) => {
    setActiveDest(dest);
    if (onSelectDestination) {
      onSelectDestination(dest);
    }
    if (!sceneRefs.current) return;

    // Convert lat/lng to globe rotation angle so the marker faces front (+Z)
    const radY = (-dest.lng - 90) * (Math.PI / 180);
    const radX = (dest.lat) * (Math.PI / 180);

    sceneRefs.current.targetRotY = radY;
    sceneRefs.current.targetRotX = Math.max(-0.5, Math.min(0.5, radX * 0.6));
  };

  useEffect(() => {
    if (selectedDestinationId) {
      const match = DESTINATIONS.find(d => d.id === selectedDestinationId);
      if (match) focusDestination(match);
    }
  }, [selectedDestinationId]);

  if (!webGlSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#060b14] via-[#0b132b] to-[#060b14] p-8 text-center">
        <img
          src={DESTINATIONS[0].image}
          alt="Travel Destination"
          className="w-80 h-52 object-cover rounded-2xl mb-4 border border-cyan-500/30"
          referrerPolicy="no-referrer"
        />
        <h3 className="text-xl font-bold text-white mb-2">Explore the World in 3D</h3>
        <p className="text-slate-400 text-sm max-w-md">
          Hardware acceleration preview is in standard mode. All destination tours and reservations are fully available below.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[580px] lg:min-h-[720px] select-none overflow-hidden">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Active Destination Badge (Top Left of 3D Scene) */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="glass-panel rounded-xl px-4 py-3 border border-cyan-500/20 max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">Active Coordinates</span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">{activeDest.name}, {activeDest.country}</div>
          <div className="text-xs text-slate-300 mt-0.5">
            Lat {activeDest.lat.toFixed(2)}° · Lng {activeDest.lng.toFixed(2)}° · From ${activeDest.price}
          </div>
        </div>
      </div>

      {/* Unified Bottom Control Dock (Compliant with Three.js Skill - Collapsible, Zero Viewport Occlusion) */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-transform duration-300 z-20 w-[94%] max-w-4xl ${
          controlsCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Toggle Tab */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setControlsCollapsed(!controlsCollapsed)}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-[#091224]/90 hover:text-white border border-slate-700/60 rounded-t-lg transition-colors flex items-center gap-1.5 shadow-lg"
          >
            {controlsCollapsed ? (
              <>
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Show 3D Travel Controls</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Cinema Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Control Bar Panel */}
        <div className="glass-panel p-3 rounded-2xl border border-cyan-500/20 shadow-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Destination Quick-Focus Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium px-2 flex items-center gap-1 whitespace-nowrap">
              <Navigation className="w-3 h-3 text-cyan-400" />
              Focus:
            </span>
            {DESTINATIONS.map((d) => {
              const isSelected = activeDest.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => focusDestination(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  {d.name}
                </button>
              );
            })}
          </div>

          {/* Action Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                isRotating
                  ? 'bg-slate-800/80 text-cyan-300 border-cyan-500/30'
                  : 'bg-slate-900/60 text-slate-400 border-slate-700'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span>{isRotating ? 'Auto Orbit' : 'Paused'}</span>
            </button>

            <button
              onClick={() => {
                const random = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
                focusDestination(random);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-cyan-500/20 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Surprise Trip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
