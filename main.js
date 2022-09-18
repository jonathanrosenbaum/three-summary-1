import * as THREE from "three";

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

const loop = () => {
  scene.getObjectByName("propeller").rotation.x += 0.3;
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
