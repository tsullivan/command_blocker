import * as THREE from 'three';
import { Collada } from 'three/examples/jsm/loaders/ColladaLoader';

export class Yoda {
  private clock = new THREE.Clock();

  private mixer?: THREE.AnimationMixer;
  public avatar?: THREE.Scene;

  public async createYoda(): Promise<void> {
    if (this.avatar) {
      return;
    }

    const { ColladaLoader } = await import('three/examples/jsm/loaders/ColladaLoader');
    const loader = new ColladaLoader();
    // baby yoda
    this.avatar = await new Promise((resolve) => {
      loader.load('/yoda/babyoda_d1.dae', ({ animations, scene: avatar }: Collada) => {
        avatar.traverse((node: THREE.SkinnedMesh) => {
          if (node.isSkinnedMesh) {
            node.frustumCulled = false;
          }
        });

        this.mixer = new THREE.AnimationMixer(avatar);
        this.mixer.clipAction(animations[0]).play();

        resolve(avatar);
      });
    });
  }

  public animate(): void {
    const delta = this.clock.getDelta();

    if (this.mixer !== undefined) {
      this.mixer.update(delta);
    }
  }

  public destroy(): void {
    this.clock.stop();
  }
}
