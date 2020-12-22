import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Landscape } from "./landscape";
import { Yoda } from "./yoda";

const WORLD_WIDTH = 16;
const WORLD_DEPTH = 16;
const CUBE_SIZE = 4;

export class Renderer {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private landscape = new Landscape(WORLD_WIDTH, WORLD_DEPTH, CUBE_SIZE);
  private yoda = new Yoda();

  constructor(private container: Element) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbfd1e5);

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(renderer.domElement);
    this.renderer = renderer;

    // lighting
    const ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);

    // camera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 50000);
    camera.position.x = 50;
    camera.position.y = this.landscape.getY(WORLD_WIDTH / 2, WORLD_DEPTH / 2) * CUBE_SIZE + CUBE_SIZE * 2;
    camera.position.z = -48;
    this.camera = camera;

    //
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    window.addEventListener("resize", this.onWindowResize, false);
  }

  private async init(): Promise<void> {
    // objects
    this.scene.add(await this.landscape.getObject());

    const yoda = await this.yoda.getAvatar();
    yoda.position.y = this.landscape.getY(WORLD_WIDTH / 2, WORLD_DEPTH / 2) * CUBE_SIZE + CUBE_SIZE / 2;
    this.scene.add(yoda);

    const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls");
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.screenSpacePanning = true;
    controls.target.set(0, 2, 0);
    controls.update();
    this.controls = controls;
  }

  public destroy() {
    this.controls.dispose();
    this.renderer.dispose();
    this.yoda.destroy();
  }

  public useRenderer() {
    this.init().then(() => {
      this.animate();
    });

    return this;
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }


  private animate() {
    requestAnimationFrame(this.animate);
    this.render();
  }

  private render() {
    this.yoda.render();
    this.renderer.render(this.scene, this.camera);
  }
}

export const useRenderer = async (container: Element): Promise<Renderer> => {
  const r = new Renderer(container);
  return r.useRenderer();
};
