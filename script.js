const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("light-background").appendChild(renderer.domElement);

const cloudVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const cloudFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;

  float random(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float noise(vec2 p) { /* Simplified noise function */ }
  float fbm(vec2 p) { /* Simplified fbm function */ }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float clouds = fbm(p * 3.0 + uTime * 0.05);
    clouds = smoothstep(0.3, 0.8, clouds);
    vec3 skyColor = mix(vec3(0.6, 0.75, 0.9), vec3(0.9, 0.95, 1.0), clouds);
    gl_FragColor = vec4(skyColor, 1.0);
  }
`;

const uniforms = { uTime: { value: 0 } };
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(400, 32, 32),
  new THREE.ShaderMaterial({
    vertexShader: cloudVertexShader,
    fragmentShader: cloudFragmentShader,
    uniforms,
    side: THREE.BackSide,
  })
);
scene.add(sphere);

const clock = new THREE.Clock();
function animate() {
  uniforms.uTime.value += clock.getDelta() * 0.2;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
