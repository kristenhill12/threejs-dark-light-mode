// Three.js Scene Setup
const scene = new THREE.Scene(); // Create the scene
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Set up the camera
const renderer = new THREE.WebGLRenderer({
  antialias: true, // Smooth edges
  powerPreference: "high-performance", // Optimize for performance
});

// Renderer Size and Canvas Placement
renderer.setSize(window.innerWidth, window.innerHeight); // Match screen size
document.getElementById("light-background").appendChild(renderer.domElement); // Attach renderer to the background container

// Vertex Shader
const cloudVertexShader = `
  varying vec2 vUv; // Pass UV coordinates to fragment shader
  void main() {
    vUv = uv; // Assign the interpolated UVs
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); // Position the vertex
  }
`;

// Fragment Shader for Blue Sky and Clouds
const cloudFragmentShader = `
  varying vec2 vUv;
  uniform float uTime; // Animation time uniform

  // Random value generator
  float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Noise function for smooth gradients
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f); // Smoother interpolation
    return mix(
      mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x),
      mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Fractal Brownian Motion (fbm) for natural clouds
  float fbm(vec2 p) {
    float value = 0.0;
    float scale = 1.0;
    float weight = 0.5;
    for (int i = 0; i < 5; i++) {
      value += weight * noise(p * scale);
      scale *= 2.0; // Increase scale for finer detail
      weight *= 0.5; // Reduce weight for each octave
    }
    return value;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0; // Normalize UVs
    float clouds = fbm(p * 3.0 + uTime * 0.05); // Add motion with time
    clouds = smoothstep(0.3, 0.8, clouds); // Adjust density/contrast of clouds
    vec3 skyColor = mix(vec3(0.6, 0.75, 0.9), vec3(0.9, 0.95, 1.0), clouds); // Interpolate sky colors
    gl_FragColor = vec4(skyColor, 1.0); // Final pixel color
  }
`;

// Shader Material Setup
const cloudUniforms = {
  uTime: { value: 0 }, // Time for animation
};

// Create a large sphere for the sky background
const sphereGeometry = new THREE.SphereGeometry(400, 32, 32); // Optimized geometry
const cloudMaterial = new THREE.ShaderMaterial({
  vertexShader: cloudVertexShader, // Assign vertex shader
  fragmentShader: cloudFragmentShader, // Assign fragment shader
  uniforms: cloudUniforms, // Pass uniforms
  side: THREE.BackSide, // Render inside the sphere
});

// Add the sky sphere to the scene
const cloudSphere = new THREE.Mesh(sphereGeometry, cloudMaterial);
scene.add(cloudSphere); // Add the sphere to the scene

// Animation Loop
const clock = new THREE.Clock(); // Create a clock for consistent time tracking
function animate() {
  requestAnimationFrame(animate); // Continue animation loop
  const delta = clock.getDelta(); // Time elapsed since last frame
  cloudUniforms.uTime.value += delta * 0.2; // Slow animation speed
  renderer.render(scene, camera); // Render the scene
}
animate(); // Start the animation loop

// Resize Handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight; // Adjust camera aspect ratio
  camera.updateProjectionMatrix(); // Update camera projection
  renderer.setSize(window.innerWidth, window.innerHeight); // Match new screen size
});
