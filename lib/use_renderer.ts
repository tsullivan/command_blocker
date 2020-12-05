import { MutableRefObject } from 'react';
import * as THREE from 'three';
import { FirstPersonControls } from './jsm/controls/FirstPersonControls';
import { ImprovedNoise } from './jsm/math/ImprovedNoise';
import { BufferGeometryUtils } from './jsm/utils/BufferGeometryUtils';

let container: Element;
let camera: THREE.PerspectiveCamera;
let controls: FirstPersonControls;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;

const worldWidth = 128, worldDepth = 128;
const worldHalfWidth = worldWidth / 2;
const worldHalfDepth = worldDepth / 2;
const data = generateHeight(worldWidth, worldDepth);

const clock = new THREE.Clock();

function init() {

  container = document.getElementById('container');

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.y = getY(worldHalfWidth, worldHalfDepth) * 100 + 100;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd1e5);

  // sides

  const matrix = new THREE.Matrix4();

  const pxGeometry = new THREE.PlaneBufferGeometry(100, 100);
  pxGeometry.attributes.uv.array[1] = 0.5;
  pxGeometry.attributes.uv.array[3] = 0.5;
  pxGeometry.rotateY(Math.PI / 2);
  pxGeometry.translate(50, 0, 0);

  const nxGeometry = new THREE.PlaneBufferGeometry(100, 100);
  nxGeometry.attributes.uv.array[1] = 0.5;
  nxGeometry.attributes.uv.array[3] = 0.5;
  nxGeometry.rotateY(- Math.PI / 2);
  nxGeometry.translate(- 50, 0, 0);

  const pyGeometry = new THREE.PlaneBufferGeometry(100, 100);
  pyGeometry.attributes.uv.array[5] = 0.5;
  pyGeometry.attributes.uv.array[7] = 0.5;
  pyGeometry.rotateX(- Math.PI / 2);
  pyGeometry.translate(0, 50, 0);

  const pzGeometry = new THREE.PlaneBufferGeometry(100, 100);
  pzGeometry.attributes.uv.array[1] = 0.5;
  pzGeometry.attributes.uv.array[3] = 0.5;
  pzGeometry.translate(0, 0, 50);

  const nzGeometry = new THREE.PlaneBufferGeometry(100, 100);
  nzGeometry.attributes.uv.array[1] = 0.5;
  nzGeometry.attributes.uv.array[3] = 0.5;
  nzGeometry.rotateY(Math.PI);
  nzGeometry.translate(0, 0, - 50);

  //

  const geometries = [];

  for (let z = 0; z < worldDepth; z++) {

    for (let x = 0; x < worldWidth; x++) {

      const h = getY(x, z);

      matrix.makeTranslation(
        x * 100 - worldHalfWidth * 100,
        h * 100,
        z * 100 - worldHalfDepth * 100
      );

      const px = getY(x + 1, z);
      const nx = getY(x - 1, z);
      const pz = getY(x, z + 1);
      const nz = getY(x, z - 1);

      geometries.push(pyGeometry.clone().applyMatrix4(matrix));

      if ((px !== h && px !== h + 1) || x === 0) {

        geometries.push(pxGeometry.clone().applyMatrix4(matrix));

      }

      if ((nx !== h && nx !== h + 1) || x === worldWidth - 1) {

        geometries.push(nxGeometry.clone().applyMatrix4(matrix));

      }

      if ((pz !== h && pz !== h + 1) || z === worldDepth - 1) {

        geometries.push(pzGeometry.clone().applyMatrix4(matrix));

      }

      if ((nz !== h && nz !== h + 1) || z === 0) {

        geometries.push(nzGeometry.clone().applyMatrix4(matrix));

      }

    }

  }

  const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
  geometry.computeBoundingSphere();

  const texture = new THREE.TextureLoader().load('textures/minecraft/atlas.png');
  texture.magFilter = THREE.NearestFilter;

  const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }));
  scene.add(mesh);

  const ambientLight = new THREE.AmbientLight(0xcccccc);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(1, 1, 0.5).normalize();
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  controls = new FirstPersonControls(camera, renderer.domElement);

  controls.movementSpeed = 1000;
  controls.lookSpeed = 0.125;
  controls.lookVertical = true;

  //

  window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

export function useRenderer(gameContainer: MutableRefObject<Element>) {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  gameContainer.current.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();

  //create a blue LineBasicMaterial
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

  // After material we will need a geometry with some vertices:
  const points = [];
  points.push(new THREE.Vector3(- 10, 0, 0));
  points.push(new THREE.Vector3(0, 10, 0));
  points.push(new THREE.Vector3(10, 0, 0));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // Note that lines are drawn between each consecutive pair of vertices, but not between the first and last(the line is not closed.)
  // Now that we have points for two lines and a material, we can put them together to form a line.
  const line = new THREE.Line(geometry, material);

  // All that's left is to add it to the scene and call render.
  scene.add(line);
  renderer.render(scene, camera);
}

function generateHeight(width: number, height: number) {
  const data = [], perlin = new ImprovedNoise(),
    size = width * height, z = Math.random() * 100;

  let quality = 2;

  for (let j = 0; j < 4; j++) {

    if (j === 0) for (let i = 0; i < size; i++) data[i] = 0;

    for (let i = 0; i < size; i++) {

      const x = i % width, y = (i / width) | 0;
      data[i] += perlin.noise(x / quality, y / quality, z) * quality;


    }

    quality *= 4;

  }

  return data;

}

function getY(x, z) {

  return (data[x + z * worldWidth] * 0.2) | 0;

}

//

function animate() {

  requestAnimationFrame(animate);

  render();

}

function render() {

  controls.update(clock.getDelta());
  renderer.render(scene, camera);

}