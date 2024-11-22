// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("light-background").appendChild(renderer.domElement);

// Vertex Shader
const cloudVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader (Brighter Sky)
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
    clouds = smoothstep(0.4, 0.9, clouds);
    vec3 baseColor = vec3(0.75, 0.9, 1.0); // Brighter blue
    vec3 highlightColor = vec3(1.0, 0.95, 0.85); // Warm highlights
    vec3 skyColor = mix(baseColor, highlightColor, clouds);
    gl_FragColor = vec4(skyColor, 1.0);
  }
`;

// Uniforms
const cloudUniforms = {
  uTime: { value: 0 },
};

// Sphere Geometry and Shader Material
const sphereGeometry = new THREE.SphereGeometry(400, 32, 32);
const cloudMaterial = new THREE.ShaderMaterial({
  vertexShader: cloudVertexShader,
  fragmentShader: cloudFragmentShader,
  uniforms: cloudUniforms,
  side: THREE.BackSide,
});
const cloudSphere = new THREE.Mesh(sphereGeometry, cloudMaterial);
scene.add(cloudSphere);

// Animation Loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  cloudUniforms.uTime.value += delta * 0.2; // Slower animation for calm effect
  renderer.render(scene, camera);
}
animate();

// Resize Handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
