import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Sandbox } from '../sandbox';
import { Landscape } from './landscape';

export type UseSceneFn = (useScene: (scene: THREE.Scene) => void) => void;

export const WORLD_WIDTH = 70;
export const WORLD_DEPTH = 50;
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
    const cameraFar = 500;
    const camera = new THREE.PerspectiveCamera(cameraFov, cameraAspect, cameraNear, cameraFar);

    // renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(renderer.domElement);

    // lighting
    const ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);

    // camera
    const cameraPosition = new THREE.Vector3(30, 44, 25);
    camera.position.x = cameraPosition.x;
    camera.position.y = cameraPosition.y;
    camera.position.z = cameraPosition.z;

    // add extras
    this.sandbox = new Sandbox(this.scene);

    // done
    this.addListeners();

    // set to state
    this.camera = camera;
    this.scene.background = new THREE.Color(0xbfd1e2);
    this.animate = this.animate.bind(this);
  }

  private async init(): Promise<void> {
    // objects
    this.scene.add(await this.landscape.getObject());
    await this.sandbox.init(this.scene, this.landscape);

    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.screenSpacePanning = true;
    controls.target.set(0, 2, 0);
    controls.update();
    this.controls = controls;
  }

  // TODO greater than negative absolute power of the position, less than absolute power of the position
  // TODO and not closer than 3 feet away from Grogu The Child
  private containCamera() {
    this.camera.position.x = Math.min(this.camera.position.x, this.landscape.getMaxX());
    this.camera.position.z = Math.min(this.camera.position.z, this.landscape.getMaxZ());
    this.camera.position.y = Math.max(
      this.camera.position.y,
      this.landscape.getMinCameraY(this.camera.position.x, this.camera.position.z)
    );
  }

  private animate() {
    this.containCamera();
    this.sandbox.animate(this.camera, this.pressed, this.clock.getElapsedTime());
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
