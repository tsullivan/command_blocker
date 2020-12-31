import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Landscape } from './landscape';
import { SpaceObjects } from './space';
import { Yoda } from './yoda';

class Sandbox {
  public init: (scene: THREE.Scene) => Promise<void>;
  public animate: (camera: THREE.Camera, time: number) => void;
  public destroy: () => void;

  constructor(scene: THREE.Scene, landscape: Landscape) {
    const spaceObjects = new SpaceObjects(scene);
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
      yoda.animate(time);
      spaceObjects.animate(time);

      const floor = landscape.getY(landscape.WORLD_WIDTH / 2, landscape.WORLD_DEPTH / 2) * landscape.CUBE_SIZE +
        landscape.CUBE_SIZE / 2;

      yoda.avatar.position.y = floor;
      spaceObjects.getRoot().position.y = floor + 20;

    };

    // Cleanup
    this.destroy = (): void => {
      yoda.destroy();
    };
  }
}


export type UseSceneFn = (useScene: (scene: THREE.Scene) => void) => void;

export const WORLD_WIDTH = 200;
export const WORLD_DEPTH = 200;
export const CUBE_SIZE = 4;

export class Renderer {
  private clock = new THREE.Clock();
  private scene = new THREE.Scene();
  private renderer = new THREE.WebGLRenderer({ antialias: true });
  private camera: THREE.PerspectiveCamera;

  private landscape = new Landscape(WORLD_WIDTH, WORLD_DEPTH, CUBE_SIZE);
  private pressed: string[] = [];
  private controls?: OrbitControls;
  private sandbox: Sandbox;

  constructor(private container: Element) {
    const { renderer } = this;
    const cameraFov = 60;
    const cameraAspect = window.innerWidth / window.innerHeight;
    const cameraNear = 1;
    const cameraFar = 2000;
    const camera = new THREE.PerspectiveCamera(cameraFov, cameraAspect, cameraNear, cameraFar);

    // renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(renderer.domElement);

    // camera
    const cameraPosition = new THREE.Vector3(30, 44, 25);
    camera.position.x = cameraPosition.x;
    camera.position.y = cameraPosition.y;
    camera.position.z = cameraPosition.z;

    // add extras
    this.sandbox = new Sandbox(this.scene, this.landscape);

    // done
    this.addListeners();

    // set to state
    this.camera = camera;
    this.scene.background = new THREE.Color(0x000000);
    this.animate = this.animate.bind(this);
  }

  private async init(): Promise<void> {
    // objects
    this.scene.add(await this.landscape.getObject());
    await this.sandbox.init(this.scene);

    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.screenSpacePanning = true;
    controls.target.set(0, 2, 0);
    controls.update();
    this.controls = controls;
  }

  private animate() {
    this.sandbox.animate(this.camera, this.clock.getElapsedTime());
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  public destroy(): void {
    this.clock.stop();
    this.controls.dispose();
    this.renderer.dispose();
    this.sandbox.destroy();
  }

  public useRenderer(): Renderer {
    this.init().then(() => {
      this.animate();
    });

    return this;
  }

  private addListeners() {
    const registerKey = (key: string) => {
      this.pressed[key] = true;
    };
    const releaseKey = (key: string) => {
      this.pressed[key] = false;
    };

    window.addEventListener('keydown', (e) => {
      registerKey(e.key.toUpperCase());
    });

    window.addEventListener('keyup', (e) => {
      releaseKey(e.key.toUpperCase());
    });

    const doResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener(
      'resize',
      () => {
        doResize();
      },
      false
    );
  }
}

export const useRenderer = async (container: Element): Promise<Renderer> => {
  const r = new Renderer(container);
  return r.useRenderer();
};