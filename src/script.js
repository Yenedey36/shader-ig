import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer, camera, camcontrols;
let uniforms;
let objetos = [];

init();
animationLoop();

function init() {
  camera = new THREE.PerspectiveCamera(
    20,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);

  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  uniforms = {
    u_time: { type: "f", value: 0.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_mouse: { type: "v2", value: new THREE.Vector2() },
  };

  PlaneShader(5, 2, fragmentShader());

  camcontrols = new OrbitControls(camera, renderer.domElement);

  onWindowResize();
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}

document.onmousemove = function (e) {
  uniforms.u_mouse.value.x = e.pageX / window.innerWidth;
  uniforms.u_mouse.value.y = e.pageY / window.innerHeight;
};

function PlaneShader(sx, sy, fragsh) {
  let geometry = new THREE.PlaneBufferGeometry(sx, sy);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragsh,
    vertexShader: vertexShader(),
  });

  let mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  objetos.push(mesh);
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  uniforms.u_time.value += 0.05;
  renderer.render(scene, camera);
}

function vertexShader() {
  return `
    varying vec3 vUv; 
    varying vec4 modelViewPosition; 
    
    void main() {
      vUv = position; 
      vec4 modelViewPosition = modelViewMatrix * vec4(vUv, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `;
}

function fragmentShader() {
  return `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;

    void main() {
      // Normalizamos coordenadas ajustando la proporcion de la ventana
      vec2 R = u_resolution;
      vec2 st = gl_FragCoord.xy / R.y;

      // Adaptamos u_mouse
      vec2 m = vec2(u_mouse.x, 1.0 - u_mouse.y) * R / R.y;

      // Distancia de cada pixel al raton y onda suave expansiva
      float d = distance(st, m);
      float onda = sin(d * 10.0 - u_time * 3.0);
      float cercania = smoothstep(0.7, 0.0, d);

      // Efecto lente magnetica: desplazamos la rejilla suavemente alrededor del cursor
      vec2 desplazamiento = (st - m) / (d + 0.2) * 0.08;
      vec2 celda = fract((st + desplazamiento) * 9.0) - 0.5;

      // Dibujamos anillos suaves cuyo radio respira con la onda
      float radio = 0.22 + 0.1 * onda;
      float anillo = smoothstep(0.06, 0.02, abs(length(celda) - radio));

      // Paleta: fondo azul noche, anillos cian y brillo calido cerca del raton
      vec3 colorFondo = vec3(0.05, 0.07, 0.12);
      vec3 colorLejos = vec3(0.15, 0.65, 0.85);
      vec3 colorCerca = vec3(0.95, 0.80, 0.55);

      vec3 colorForma = mix(colorLejos, colorCerca, cercania);
      vec3 color = mix(colorFondo, colorForma, anillo) + cercania * 0.12;

      gl_FragColor = vec4(color, 1.0);
    }
  `;
}