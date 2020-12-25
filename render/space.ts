import * as THREE from 'three';

export const getSpaceObjects = (scene: THREE.Scene): THREE.Object3D[] => {
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

  // makeAxisGrids([
  //   { node: solarSystem, label: 'solarSystem', units: 25 },
  //   { node: earthOrbit, label: 'earthOrbit' },
  //   { node: moonOrbit, label: 'moonOrbit' },
  // ]);

  return [
    solarSystem,
    sunMesh,
    earthOrbit,
    earthMesh,
    moonOrbit,
    moonMesh,
  ]
}