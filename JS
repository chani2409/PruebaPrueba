// js/main.js
// Punto de entrada: inicializa año, 3D, animaciones y cursor con arquitectura optimizada.

// ----------------------
// Utilidades globales
// ----------------------

const logError = (context, err) => {
    console.error(`[ASFIGES] Error en ${context}:`, err);
};

const observeVisibility = (el, onEnter, onLeave, threshold = 0.1) => {
    if (!el) return;
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => e.isIntersecting ? onEnter?.() : onLeave?.());
    }, { threshold });
    io.observe(el);
    return io;
};

// ----------------------
// Funciones principales
// ----------------------

const setYear = () => {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
};

const initAnimations = () => {
    if (!window.gsap || !window.ScrollTrigger) {
        logError('Animations', 'GSAP o ScrollTrigger no están cargados.');
        return;
    }

    gsap.fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.5 });
    gsap.fromTo('#hero p', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: 'power3.out' });

    gsap.fromTo('.section-title', { opacity: 0, y: 50, filter: 'blur(10px)' }, {
        opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power4.out',
        scrollTrigger: { trigger: '#featured', start: 'top 80%' },
    });

    gsap.fromTo('.featured-card', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 1, stagger: 0.2,
        scrollTrigger: { trigger: '#featured', start: 'top 70%' },
    });
};

const initHeroScene = async () => {
    const heroCanvas = document.getElementById('hero-canvas');
    if (!heroCanvas) return;
    if (!window.THREE) {
        logError('Hero 3D', 'Three.js no está cargado.');
        return;
    }

    const {
        WebGLRenderer, Scene, PerspectiveCamera, Points, BufferGeometry, BufferAttribute, ShaderMaterial,
        AdditiveBlending, Vector3, Color, Clock
    } = THREE;

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const vertexShader = `
        uniform float time;
        uniform float scrollProgress;
        uniform vec3 mouse;
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
            vColor = color;
            vec3 newPosition = position;
            newPosition.z += scrollProgress * 100.0;
            newPosition.x += sin(newPosition.z * 0.1 + time * 0.5) * 2.0;
            newPosition.y += cos(newPosition.z * 0.1 + time * 0.5) * 2.0;
            float dist = length(newPosition.xy - mouse.xy);
            if (dist < 10.0) {
                newPosition += normalize(newPosition.xy - mouse.xy) * (1.0 - dist / 10.0) * 5.0;
            }
            vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const fragmentShader = `
        varying vec3 vColor;
        void main() {
            float strength = distance(gl_PointCoord, vec2(0.5));
            gl_FragColor = vec4(vColor, 1.0 - strength * 2.0);
        }
    `;

    const particleCount = 20000;
    const geometry = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color1 = new Color('#00ffff');
    const color2 = new Color('#ff00ff');

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = Math.random() * -200;
        
        const mixedColor = new Color().lerpColors(color1, color2, Math.random());
        colors[i * 3 + 0] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
        
        sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));

    const material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            time: { value: 0 },
            scrollProgress: { value: 0 },
            mouse: { value: new Vector3() },
        },
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
        vertexColors: true,
    });

    const points = new Points(geometry, material);
    scene.add(points);

    const clock = new Clock();
    const mouse = new Vector3();
    let isRendering = true;

    const animate = () => {
        if (isRendering) {
            requestAnimationFrame(animate);
        }
        material.uniforms.time.value = clock.getElapsedTime();
        material.uniforms.mouse.value.lerp(mouse, 0.1);
        renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousemove', (e) => {
        const vector = new Vector3(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1,
            0.5
        );
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        mouse.copy(camera.position.add(dir.multiplyScalar(distance)));
    });

    if (window.gsap && window.ScrollTrigger) {
        ScrollTrigger.create({
            trigger: '#main',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            onUpdate: self => {
                material.uniforms.scrollProgress.value = self.progress;
            },
        });
    }
};

// ----------------------
// Inicialización global
// ----------------------
const init = () => {
    setYear();
    initAnimations();
    initHeroScene();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
