import * as THREE from 'three';
import './style.css';

const canvas = document.getElementById('solarCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / (window.innerHeight * 0.8),
  0.1,
  1000
);
camera.position.set(0, 100, 400);
camera.lookAt(0, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 1));
const sunLight = new THREE.PointLight(0xffffff, 2);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(10, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffd700 })
);
scene.add(sun);

let starMaterial;
let stars;
createStarField(0xffffff); // initial white stars for dark theme

const planetData = [
  { name: 'Mercury', color: 0xbfbfbf, size: 5, distance: 30 },
  { name: 'Venus', color: 0xffa07a, size: 6.5, distance: 45 },
  { name: 'Earth', color: 0x1e90ff, size: 7.5, distance: 60 },
  { name: 'Mars', color: 0xff4500, size: 5.5, distance: 75 },
  { name: 'Jupiter', color: 0xf5deb3, size: 12, distance: 100 },
  { name: 'Saturn', color: 0xf0e68c, size: 10, distance: 125 },
  { name: 'Uranus', color: 0x40e0d0, size: 9, distance: 150 },
  { name: 'Neptune', color: 0x4169e1, size: 9, distance: 175 },
];

const planets = [];
const speeds = {};
const controls = document.getElementById('controls');

planetData.forEach((data, index) => {
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 32, 32),
    new THREE.MeshStandardMaterial({ color: data.color })
  );
  scene.add(planet);
  planets.push({ mesh: planet, angle: 0, distance: data.distance });

  speeds[data.name] = 0.01 + index * 0.002;

  const label = document.createElement('label');
  label.innerHTML = `${data.name} <input type="range" min="0" max="0.1" step="0.001" value="${speeds[data.name]}" data-planet="${data.name}">`;
  controls.appendChild(label);
});

controls.addEventListener('input', (e) => {
  const planet = e.target.dataset.planet;
  if (planet) speeds[planet] = parseFloat(e.target.value);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  planets.forEach((planet, i) => {
    const name = planetData[i].name;
    planet.angle += speeds[name];
    planet.mesh.position.set(
      planet.distance * Math.cos(planet.angle),
      0,
      planet.distance * Math.sin(planet.angle)
    );
  });

  renderer.render(scene, camera);
}

animate();

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  if (document.body.classList.contains('dark')) {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    scene.background = new THREE.Color(0xf5f5f5);
    updateStarColor(0x000000); // black stars in light mode
  } else {
    document.body.classList.remove('light');
    document.body.classList.add('dark');
    scene.background = new THREE.Color(0x000000);
    updateStarColor(0xffffff); // white stars in dark mode
  }
});

document.body.classList.add('dark');
scene.background = new THREE.Color(0x000000);

function createStarField(color) {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPositions = [];

  for (let i = 0; i < starCount; i++) {
    const x = THREE.MathUtils.randFloatSpread(1000);
    const y = THREE.MathUtils.randFloatSpread(1000);
    const z = THREE.MathUtils.randFloatSpread(1000);
    starPositions.push(x, y, z);
  }

  starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starPositions, 3)
  );

  starMaterial = new THREE.PointsMaterial({
    color: color,
    size: 2.5, 
    transparent: true,
    opacity: 0.8,
  });

  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

function updateStarColor(color) {
  if (starMaterial) {
    starMaterial.color.set(color);
  }
}
