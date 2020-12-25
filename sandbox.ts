import * as THREE from 'three';
import { makeAxisGrid } from './axis_grid_helper';
import { CUBE_SIZE, WORLD_DEPTH, WORLD_WIDTH } from './render';
import { Landscape } from './render/landscape';
import { Yoda } from './render/yoda';

export class Sandbox {
  private yoda = new Yoda();
  private objects: Array<THREE.Object3D>;

  constructor(scene: THREE.Scene) {
    // light
    const sunLightColor = 0xffffff;
    const sunLightIntensity = 3;
    const sunLight = new THREE.PointLight(sunLightColor, sunLightIntensity);
    scene.add(sunLight);

    const objects: THREE.Object3D[] = [];

    // celestials
    const celestialRadius = 1;
    const celestialWidthSegments = 6;
    const celestialHeightSegments = 6;
    const celestialSphereGeometry = new THREE.SphereBufferGeometry(
      celestialRadius,
      celestialWidthSegments,
      celestialHeightSegments
    );

    const solarSystem = new THREE.Object3D();
    solarSystem.position.y = 10;

    // sun
    const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
    const sunMesh = new THREE.Mesh(celestialSphereGeometry, sunMaterial);
    sunMesh.scale.set(5, 5, 5);

    // earth
    const earthOrbit = new THREE.Object3D();
    earthOrbit.position.x = 10;
    const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x2233ff, emissive: 0x112244 });
    const earthMesh = new THREE.Mesh(celestialSphereGeometry, earthMaterial);

    // moon
    const moonOrbit = new THREE.Object3D();
    moonOrbit.position.x = 2;
    const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 });
    const moonMesh = new THREE.Mesh(celestialSphereGeometry, moonMaterial);
    moonMesh.scale.set(0.5, 0.5, 0.5);

    solarSystem.add(sunMesh);
    solarSystem.add(earthOrbit);
    earthOrbit.add(earthMesh);
    earthOrbit.add(moonOrbit);
    moonOrbit.add(moonMesh);

    scene.add(solarSystem);

    objects.push(solarSystem);
    objects.push(sunMesh);
    objects.push(earthOrbit);
    objects.push(earthMesh);
    objects.push(moonOrbit);
    objects.push(moonMesh);

    // helper
    import('dat.gui').then((dat) => {
      const gui = new dat.GUI();
      makeAxisGrid(gui, solarSystem, 'solarSystem', 25);
      makeAxisGrid(gui, earthOrbit, 'earthOrbit');
      makeAxisGrid(gui, moonOrbit, 'moonOrbit');
    });

    this.objects = objects;
  }

  public async init(scene: THREE.Scene, landscape: Landscape): Promise<void> {
    if (!this.yoda.avatar) {
      await this.yoda.createYoda();
    }

    const yodaAvatar = this.yoda.avatar;
    yodaAvatar.position.y =
      landscape.getY(WORLD_WIDTH / 2, WORLD_DEPTH / 2) * CUBE_SIZE + CUBE_SIZE / 2;
    scene.add(yodaAvatar);
  }

  public animate(camera: THREE.Camera, pressed: string[], time: number): void {
    if (this.yoda.avatar) {
      camera.lookAt(this.yoda.avatar.position); // camera always looking at baby yoda

      if (pressed['A']) {
        this.yoda.avatar.lookAt(camera.position); // very weird
      }
    }

    this.yoda.animate();
    this.objects.forEach((mesh, ndx) => {
      const speed = 1 + ndx * 0.1;
      const rot = time * speed;
      // mesh.rotation.x = rot;
      mesh.rotation.y = rot;
    });
  }

  public destroy(): void {
    this.yoda.destroy();
  }
}
