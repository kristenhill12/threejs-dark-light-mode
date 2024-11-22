// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xA3D9FF); // Light blue for the sky

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Attach Renderer to the Light Background Container
document.getElementById("light-background").appendChild(renderer.domElement);

// Create Rotating Stars
function createStar() {
  const geometry = new THREE.SphereGeometry(Math.random() * 0.05 + 0.02, 24, 24);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(200));
  star.position.set(x, y, z);
  scene.add(star);
}

// Add Multiple Stars for the Sky
Array(300).fill().forEach(createStar);

// Animation Loop
function animate() {
  scene.rotation.y += 0.0005; // Subtle rotation for dynamic motion
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Resize Handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
