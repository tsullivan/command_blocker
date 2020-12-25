import * as THREE from 'three';
import { getSpaceObjects } from './space';
import { Yoda } from './yoda';

export class Sandbox {
  public init: (scene: THREE.Scene) => Promise<void>;
  public animate: (camera: THREE.Camera, time: number) => void;
  public destroy: () => void;

  constructor(scene: THREE.Scene) {
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

    // Animate
    this.animate = (camera: THREE.Camera, time: number) => {
      yoda.animate();
      yoda.avatar.position.y = Math.abs(Math.sin(time * 2) * 4) - 2;
      yoda.avatar.rotation.y = time * 10;

      spaceObjects.forEach((mesh, ndx) => {
        const speed = 1 + ndx * 0.1;
        const rot = time * speed;
        mesh.rotation.y = rot;
      });
    };

    // Init
    this.init = async (scene: THREE.Scene): Promise<void> => {
      if (!yoda.avatar) {
        await yoda.createYoda();
      }

      const yodaAvatar = yoda.avatar;
      yodaAvatar.position.y = 0;
      scene.add(yodaAvatar);
    };

    // Cleanup
    this.destroy = (): void => {
      yoda.destroy();
    };
  }
}
