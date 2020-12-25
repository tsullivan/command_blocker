import * as THREE from 'three';
import { Landscape } from './landscape';
import { getSpaceObjects } from './space';
import { Yoda } from './yoda';

export class Sandbox {
  public init: (scene: THREE.Scene) => Promise<void>;
  public animate: (camera: THREE.Camera, time: number) => void;
  public destroy: () => void;

  constructor(scene: THREE.Scene, landscape: Landscape) {
    // light
    {
      const sunLightColor = 0xffffff;
      const sunLightIntensity = 3;
      const sunLight = new THREE.PointLight(sunLightColor, sunLightIntensity);
      scene.add(sunLight);
    }

    // celestials
    const spaceObjects = getSpaceObjects(scene);

    // player character
    const yoda = new Yoda();

    // Init
    this.init = async (scene: THREE.Scene): Promise<void> => {
      if (!yoda.avatar) {
        await yoda.createYoda();
      }

      scene.add(yoda.avatar);
    };

    // Animate
    this.animate = (camera: THREE.Camera, time: number) => {
      yoda.animate();
      yoda.avatar.rotation.y = time * 10;

      {
        const floor = landscape.getY(landscape.WORLD_WIDTH / 2, landscape.WORLD_DEPTH / 2) * landscape.CUBE_SIZE +
          landscape.CUBE_SIZE / 2;
        const [solarSystem] = spaceObjects;

        yoda.avatar.position.y = floor;
        solarSystem.position.y = floor + 20;
      }

      spaceObjects.forEach((mesh, ndx) => {
        const speed = 1 + ndx * 0.1;
        const rot = time * speed;
        mesh.rotation.y = rot;
      });
    };

    // Cleanup
    this.destroy = (): void => {
      yoda.destroy();
    };
  }
}
