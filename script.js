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
document.getElementById("light-background").appendChild(renderer.domElement);

// Cloud Texture (optional if you want clouds)
const cloudTextureLoader = new THREE.TextureLoader();
const cloudTexture = cloudTextureLoader.load(
  "https://cdn.pixabay.com/photo/2016/03/26/13/09/clouds-1282315_960_720.png" // Replace with your own cloud texture
);

// Create Cloud Layers
function createCloudLayer() {
  const geometry = new THREE.PlaneGeometry(500, 300, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.5, // Adjust cloud transparency
  });

  const clouds = new THREE.Mesh(geometry, material);
  clouds.position.z = -50; // Push clouds further back
  return clouds;
}

const cloudLayer1 = createCloudLayer();
cloudLayer1.position.y = 20;

const cloudLayer2 = createCloudLayer();
cloudLayer2.position.y = -20;
cloudLayer2.position.x = -10;

scene.add(cloudLayer1, cloudLayer2);

// Animation Loop for Moving Clouds
function animate() {
  cloudLayer1.position.x += 0.05; // Adjust for smooth cloud motion
  cloudLayer2.position.x -= 0.03;

  // Reset position when clouds go out of view
  if (cloudLayer1.position.x > 100) cloudLayer1.position.x = -100;
  if (cloudLayer2.position.x < -100) cloudLayer2.position.x = 100;

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
