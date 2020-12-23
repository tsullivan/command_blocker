import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Landscape } from "./landscape";
import { Yoda } from "./yoda";

const WORLD_WIDTH = 70;
const WORLD_DEPTH = 50;
const CUBE_SIZE = 4;

const cameraPosition = new THREE.Vector3(30, 44, 25);

export class Renderer {
  private clock = new THREE.Clock();
  private scene = new THREE.Scene();
  private renderer = new THREE.WebGLRenderer({ antialias: true });
  private camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 50000);
  private landscape = new Landscape(WORLD_WIDTH, WORLD_DEPTH, CUBE_SIZE);
  private yoda = new Yoda();
  private pressed: string[] = [];
  private controls?: OrbitControls;

  constructor(private container: Element) {
    const { renderer, camera } = this;

    // renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(renderer.domElement);

    // lighting
    const ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1000, 0.5).normalize();
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // camera
    camera.position.x = cameraPosition.x;
    camera.position.y = cameraPosition.y;
    camera.position.z = cameraPosition.z;

    // done
    this.addListeners();

    // set to state
    this.scene.background = new THREE.Color(0xbfd1e2);
    this.renderer = renderer;
    this.camera = camera;
    this.animate = this.animate.bind(this);
  }

  private async init(): Promise<void> {
    // objects
    this.scene.add(await this.landscape.getObject());

    if (!this.yoda.avatar) {
      await this.yoda.createYoda();
    }

    const yodaAvatar = this.yoda.avatar;
    yodaAvatar.position.y = this.landscape.getY(WORLD_WIDTH / 2, WORLD_DEPTH / 2) * CUBE_SIZE + CUBE_SIZE / 2;
    yodaAvatar.castShadow = true;
    yodaAvatar.receiveShadow = false;
    this.scene.add(yodaAvatar);

    const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls");
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
    this.camera.position.y = Math.max(this.camera.position.y, this.landscape.getMinCameraY(this.camera.position.x, this.camera.position.z));
  }

  private animate() {
    requestAnimationFrame(this.animate);

    if (this.yoda.avatar) {
      this.camera.lookAt(this.yoda.avatar.position); // camera always looking at baby yoda

      if (this.pressed['A']) {
        this.yoda.avatar.lookAt(this.camera.position) // very weird
      }
    }

    this.yoda.animate();

    this.containCamera();

    this.renderer.render(this.scene, this.camera);
  }

  public destroy() {
    this.clock.stop();
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

  private addListeners() {
    const registerKey = (key: string) => {
      this.pressed[key] = true;
    };
    const releaseKey = (key: string) => {
      this.pressed[key] = false;
    };

    window.addEventListener('keydown', (e) => {
      registerKey(e.key.toUpperCase());
    })

    window.addEventListener('keyup', (e) => {
      releaseKey(e.key.toUpperCase());
    })

    const doResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", () => {
      doResize();
    }, false);
  }
}

export const useRenderer = async (container: Element): Promise<Renderer> => {
  const r = new Renderer(container);
  return r.useRenderer();
};
