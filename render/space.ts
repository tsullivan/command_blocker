import * as THREE from 'three';
import { makeAxisGrids } from '../lib/axis_grid_helper';

export class SpaceObjects {
  private spaceObjects: THREE.Object3D[];

  constructor(scene: THREE.Scene) {
    const celestialRadius = 1;
    const celestialWidthSegments = 6;
    const celestialHeightSegments = 6;
    const celestialSphereGeometry = new THREE.SphereBufferGeometry(
      celestialRadius,
      celestialWidthSegments,
      celestialHeightSegments
    );

    const ecliptic = new THREE.Object3D();
    ecliptic.rotation.x = -250;
    ecliptic.position.y = 500;

    const solarSystem = new THREE.Object3D();
    solarSystem.position.x = 480;
    solarSystem.scale.set(3, 3, 3);

    // sun
    const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
    const sunMesh = new THREE.Mesh(celestialSphereGeometry, sunMaterial);
    sunMesh.scale.set(5, 5, 5);

    // light
    {
      const sunLightColor = 0xffffff;
      const sunLightIntensity = 3;
      const sunLight = new THREE.PointLight(sunLightColor, sunLightIntensity);
      solarSystem.add(sunLight);
    }

    // earth
    const earthOrbit = new THREE.Object3D();
    earthOrbit.position.x = 15;
    const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x2233ff, emissive: 0x112244 });
    const earthMesh = new THREE.Mesh(celestialSphereGeometry, earthMaterial);

    // moon
    const moonOrbit = new THREE.Object3D();
    moonOrbit.position.x = 3;
    const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 });
    const moonMesh = new THREE.Mesh(celestialSphereGeometry, moonMaterial);
    moonMesh.scale.set(0.5, 0.5, 0.5);

    ecliptic.add(solarSystem);
    solarSystem.add(sunMesh);
    solarSystem.add(earthOrbit);
    earthOrbit.add(earthMesh);
    earthOrbit.add(moonOrbit);
    moonOrbit.add(moonMesh);

    scene.add(ecliptic);

    makeAxisGrids([
      { node: ecliptic, label: 'ecliptic', units: 25 },
      { node: solarSystem, label: 'solarSystem', units: 25 },
    ]);

    this.spaceObjects = [
      ecliptic,
      solarSystem,
      sunMesh,
      earthOrbit,
      earthMesh,
      moonOrbit,
      moonMesh,
    ];
  }

  public getRoot(): THREE.Object3D {
    return this.spaceObjects[0];
  }

  public animate(time: number): void {
    this.spaceObjects.forEach((mesh) => {
      const rot = time / 5;
      mesh.rotation.y = rot;
    });
  }

}
