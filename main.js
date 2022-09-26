import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000);

const camera = new THREE.PerspectiveCamera(
  120,

  window.innerWidth / window.innerHeight,

  0.1,

  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 4);

scene.add(hemisphereLight);

const lightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 5);

//scene.add(lightHelper);

//ambient light

const ambientLight = new THREE.AmbientLight(0xffffff, 1);

scene.add(ambientLight);

//create plane/aircraft

const airplane = () => {
  //cockpit

  const container = new THREE.Object3D();

  const geoCockpit = new THREE.BoxGeometry(5, 3, 3, 1, 1, 1);

  const matCockpit = new THREE.MeshPhongMaterial({
    color: 0xff0000,
  });

  container.name = "airplane";

  const cockpit = new THREE.Mesh(geoCockpit, matCockpit);

  container.add(cockpit);

  //engine

  const geoEngine = new THREE.BoxGeometry(2, 3, 3, 1, 1, 1);

  const matEngine = new THREE.MeshPhongMaterial({
    color: 0xffffff,
  });

  const engine = new THREE.Mesh(geoEngine, matEngine);

  engine.position.x = 3.5;

  container.add(engine);

  //wings

  const geoWing = new THREE.BoxGeometry(2, 4, 0.5, 1, 1, 1);

  const matWing = new THREE.MeshPhongMaterial({
    color: 0x000000,
  });

  const wing = new THREE.Mesh(geoWing, matWing);

  wing.position.set(0, 0, 2);

  wing.rotateX(Math.PI / 2);

  wing.rotateZ(Math.PI / 10);

  container.add(wing);

  const backWing = wing.clone();

  backWing.position.set(0, 0, -2);

  backWing.rotateZ(-Math.PI / 5);

  container.add(backWing);

  container.scale.set(0.25, 0.25, 0.25);

  //propellor

  const geomPropeller = new THREE.BoxGeometry(0.2, 0.3, 0.2, 1, 1, 1);

  const matPropeller = new THREE.MeshPhongMaterial({
    color: 0x46b51d,
  });

  const propeller = new THREE.Mesh(geomPropeller, matPropeller);

  propeller.position.set(4.6, 0, 0);

  container.add(propeller);

  //blades

  var geomBlade = new THREE.BoxGeometry(0.5, 3, 0.2, 1, 1, 1);

  var matBlade = new THREE.MeshPhongMaterial({
    color: 0x46b51d,
  });

  const blade = new THREE.Mesh(geomBlade, matBlade);

  blade.position.x = 0.5;

  propeller.add(blade);

  propeller.name = "propeller";

  //windshield

  const geoWindshield = new THREE.BoxGeometry(0.2, 1, 2, 1, 1, 1);

  const matWindshield = new THREE.MeshPhongMaterial({
    color: 0x46b51d,
  });

  const windshield = new THREE.Mesh(geoWindshield, matWindshield);

  windshield.position.set(2, 2, 0);

  windshield.rotation.z = Math.PI / 10;

  container.add(windshield);
  container.position.set(0, 0, -3);
  return container;
};

scene.add(airplane());

//orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = 180;
camera.position.set(0, 0, 50);
controls.update();

const fragmentShader = `
uniform sampler2D globeTexture;
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
  float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.4, 0.4));
  vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
  gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);
}
`;
//gl_Position x,y,z position and translations
//uniform is an import like props in react
//three js by default passes in some variables into this shader which can be used https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const vertexShader = `
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
  vertexUV = uv;
  vertexNormal = normalize(normalMatrix * normal);
  vec3 newposition = position + position*sin(position.x)*position.z * 0.005*cos(position.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newposition, 1.0 );
}
`;

const fragmentShaderAtmosphere = `
varying vec3 vertexNormal;

void main() {
  float intensity = pow(0.4 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);
  gl_FragColor = vec4(0.3, 0.6, 1.0, 0.4) * intensity;
}
`;

const vertexShaderAtmosphere = `
varying vec3 vertexNormal;

void main() {
  vertexNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const sea = () => {
  const container = new THREE.Object3D();
  const geom = new THREE.CylinderGeometry(24, 24, 32, 50, 1);
  // rotate the geometry on the x axis
  geom.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  // create the material
  const mat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load("./textures/water.jpg"),
      },
    },
  });

  let seaMesh = new THREE.Mesh(geom, mat);
  seaMesh.name = "sea";
  container.add(seaMesh);
  container.position.set(1, -30, 0);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(30, 50, 50),
    new THREE.ShaderMaterial({
      vertexShader: vertexShaderAtmosphere,
      fragmentShader: fragmentShaderAtmosphere,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    })
  );
  atmosphere.scale.set(1.3, 1.3);
  container.add(atmosphere);

  seaMesh.updateMatrix();
  return container;
};

scene.add(sea());

// create moon
const createMoon = () => {
  const sphereGeometry = new THREE.SphereGeometry(20, 64, 32);
  const texture = new THREE.TextureLoader().load("./textures/water.jpg");
  const sphereMaterial = new THREE.MeshPhongMaterial({
    map: texture,
    color: "brown",
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.name = "moon";
  const torusGeometry = new THREE.TorusGeometry(24, 2, 16, 100);
  const torusMaterial = new THREE.MeshPhongMaterial({
    color: "green",
    shading: THREE.FlatShading,
  });
  const torusMaterialBasic = new THREE.MeshBasicMaterial({
    color: "green",
    shading: THREE.FlatShading,
  });
  const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
  const torusMeshBasic = new THREE.Mesh(torusGeometry, torusMaterialBasic);
  torusMeshBasic.position.x = 0;
  torusMeshBasic.position.z = -5;
  sphere.add(torusMesh, torusMeshBasic);
  scene.add(sphere);
  sphere.rotation.x = (3 * Math.PI) / 2;
  sphere.position.set(150, 250, -400);
};
createMoon();

const vertices = [];

for (let i = 0; i < 10000; i++) {
  const x = THREE.MathUtils.randFloatSpread(2000);
  const y = THREE.MathUtils.randFloatSpread(2000);
  const z = THREE.MathUtils.randFloatSpread(2000);

  vertices.push(x, y, z);
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);

const material = new THREE.PointsMaterial({ color: 0x888888 });

const points = new THREE.Points(geometry, material);

scene.add(points);

let airplanePos = { x: 0, y: 0 };
const handleMouseMove = (event) => {
  const x = -1 + (2 * event.clientX) / window.innerWidth;
  const y = -1 + 2 * (1 - event.clientY / window.innerHeight);

  //normalise plane movements
  const normalise = (number) => {
    let clampedNumber = THREE.MathUtils.clamp(number, -0.4, 0.4);
    return clampedNumber * 8;
  };

  airplanePos = { x: normalise(x), y: normalise(y) };
  // i need to clamp the upper and lower limits and increase multiplier in airplanePos
  console.log("airplanePos", airplanePos);
};

window.addEventListener("mousemove", handleMouseMove);

function updatePlane() {
  // update the airplane's position
  const airplane = scene.getObjectByName("airplane");

  airplane.position.y = airplanePos.y;
  airplane.position.x = airplanePos.x;
}

const loop = () => {
  scene.getObjectByName("propeller").rotation.x += 0.3;
  scene.getObjectByName("sea").rotation.z += 0.003;
  updatePlane();
};

function animate() {
  loop();

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

animate();

const handleResize = () => {
  // update height and width of the renderer and the camera
  const HEIGHT = window.innerHeight;
  const WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT, true);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
};
window.addEventListener("resize", handleResize);
