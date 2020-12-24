import * as THREE from 'three';
import type { UseSceneFn } from './render';

function makeInstance(geometry: THREE.BoxGeometry, color: number, z: number) {
  const material = new THREE.MeshPhongMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.z = z;
  cube.position.y = 1;
  return cube;
}

export class Sandbox {
  private meshes: Array<THREE.Mesh>;

  constructor(cb: UseSceneFn) {
    // learn webgl
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const meshes = [
      makeInstance(geometry, 0xa44a88, -8),
      makeInstance(geometry, 0x4a48a8, -4),
      makeInstance(geometry, 0xa4488a, -2),
      makeInstance(geometry, 0x44aa88, 0),
      makeInstance(geometry, 0x48a48a, 2),
      makeInstance(geometry, 0x48a48a, 4),
      makeInstance(geometry, 0xa8448a, 8),
    ];

    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(-1, 2, 4);

    cb((scene: THREE.Scene) => {
      scene.add(light);

      meshes.forEach(mesh => {
        scene.add(mesh);
      });
    });

    this.meshes = meshes;
  }

  public animate(time: number): void {
    this.meshes.forEach((mesh, ndx) => {
      const speed = 1 + ndx * 0.1;
      const rot = time * speed;
      mesh.rotation.x = rot;
      mesh.rotation.y = rot;
    });
  }
}