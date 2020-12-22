import * as THREE from "three";
import { Collada } from "three/examples/jsm/loaders/ColladaLoader";

export class Yoda {
  private yoda: THREE.Scene;
  private clock: THREE.Clock;
  private mixer?: THREE.AnimationMixer;

  constructor() {
    this.clock = new THREE.Clock();
  }

  private async createYoda(): Promise<THREE.Scene> {
    const { ColladaLoader } = await import("three/examples/jsm/loaders/ColladaLoader");
    const loader = new ColladaLoader();
    // baby yoda
    return new Promise(resolve => {
      loader.load(
        "/yoda/babyoda_d1.dae",
        ({ animations, scene: avatar }: Collada) => {
          avatar.traverse((node: THREE.SkinnedMesh) => {
            if (node.isSkinnedMesh) {
              node.frustumCulled = false;
            }
          });

          this.mixer = new THREE.AnimationMixer(avatar);
          this.mixer.clipAction(animations[0]).play();

          resolve(avatar);
        }
      );
    });
  }

  public async getAvatar() {
    if (this.yoda) {
      return this.yoda;
    }
    const yoda = await this.createYoda();
    this.yoda = yoda;
    return yoda;
  }

  public render() {
    const delta = this.clock.getDelta();

    if (this.mixer !== undefined) {
      this.mixer.update(delta);
    }
  }

  public destroy() {
    this.clock.stop();
  }

}