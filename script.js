// Scene, Camera, Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Vertex Shader
const cloudVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader
const cloudFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;

  float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x),
      mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float scale = 1.0;
    float weight = 0.5;
    for (int i = 0; i < 5; i++) {
      value += weight * noise(p * scale);
      scale *= 2.0;
      weight *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float clouds = fbm(p * 3.0 + uTime * 0.05);
    clouds = smoothstep(0.3, 0.8, clouds);
    vec3 skyColor = mix(vec3(0.6, 0.75, 0.9), vec3(1.0), clouds);
    gl_FragColor = vec4(skyColor, 1.0);
  }
`;

// Uniforms and Material
const cloudUniforms = {
  uTime: { value: 0 },
};

const cloudMaterial = new THREE.ShaderMaterial({
  vertexShader: cloudVertexShader,
  fragmentShader: cloudFragmentShader,
  uniforms: cloudUniforms,
  side: THREE.BackSide, // Render inside of the sphere
});

// Large Sphere for the Background
const sphereGeometry = new THREE.SphereGeometry(500, 64, 64);
const cloudSphere = new THREE.Mesh(sphereGeometry, cloudMaterial);
scene.add(cloudSphere);

// Camera Position
camera.position.set(0, 0, 50);
camera.lookAt(0, 0, 0);

// Animation Loop with Smoother Speed
const clock = new THREE.Clock(); // Initialize the clock
function animate() {
  requestAnimationFrame(animate);

  // Get elapsed time since the last frame
  const delta = clock.getDelta(); // Time elapsed in seconds

  // Limit delta to prevent sudden large jumps (just in case)
  const adjustedDelta = Math.min(delta, 0.033); // ~30 FPS cap for safety

  // Adjust cloud speed to ensure smoother motion
  cloudUniforms.uTime.value += adjustedDelta * 0.3; // Adjust speed multiplier if needed

  renderer.render(scene, camera);
}
animate();


// Handle Window Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
