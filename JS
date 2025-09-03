// ==========================
//  IMPORTS (solo si usas módulos)
// ==========================
// import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js";

// ==========================
//  HERO ANIMATION BASE
// ==========================

// Si tenías algo ya hecho con GSAP y Three.js, lo mantenemos.
// Aquí agrego la capa futurista de neón interactiva.
function initFuturisticBackground() {
  const container = document.getElementById("hero-canvas");
  if (!container) return;

  // === ESCENA ===
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // === LUCES ===
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  const point = new THREE.PointLight(0x38bdf8, 1.2);
  point.position.set(5, 5, 5);
  scene.add(ambient, point);

  // === FIGURAS 3D ===
  const materials = [
    new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.5,
    }),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.6,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      wireframe: true,
      emissive: 0xa855f7,
      emissiveIntensity: 0.6,
    }),
  ];

  const shapes = [];
  for (let i = 0; i < 12; i++) {
    const geometry =
      Math.random() > 0.5
        ? new THREE.IcosahedronGeometry(0.6 + Math.random() * 0.4, 0)
        : new THREE.TorusKnotGeometry(0.4, 0.12, 100, 16);

    const mesh = new THREE.Mesh(
      geometry,
      materials[Math.floor(Math.random() * materials.length)]
    );
    mesh.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6
    );
    mesh.rotationSpeed = {
      x: Math.random() * 0.01,
      y: Math.random() * 0.01,
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  // === PARTÍCULAS ===
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 400;
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
  }
  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(posArray, 3)
  );

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.7,
  });
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  // === INTERACCIÓN MOUSE ===
  const mouse = { x: 0, y: 0 };
  document.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // === ANIMACIÓN ===
  function animate() {
    requestAnimationFrame(animate);

    shapes.forEach((obj) => {
      obj.rotation.x += obj.rotationSpeed.x;
      obj.rotation.y += obj.rotationSpeed.y;
    });

    particles.rotation.y += 0.0008;
    particles.rotation.x += 0.0004;

    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 0.6 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  // === RESPONSIVE ===
  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

// ==========================
//  MAIN INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  initFuturisticBackground();

  // Ejemplo: si ya tienes tu propia animación con Three.js
  // initMyOriginalHeroScene();
  // initGSAPAnimations();
});
