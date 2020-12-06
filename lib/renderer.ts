import * as THREE from "three";
// types
import { OrbitControls as THOrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ImprovedNoise as THImprovedNoise } from "three/examples/jsm/math/ImprovedNoise";
import { BufferGeometryUtils as THBufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";

export const renderFactory = (
  BufferGeometryUtils: typeof THBufferGeometryUtils,
  OrbitControls: typeof THOrbitControls,
  ImprovedNoise: typeof THImprovedNoise
) => {
  return class Renderer {
    private camera: THREE.PerspectiveCamera;
    private controls: THOrbitControls;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private worldDepth = 300;
    private worldWidth = 300;
    private worldHalfWidth = 300 / 2;
    private worldHalfDepth = 300 / 2;
    private data: number[];
    private clock: THREE.Clock;

    constructor(private container: Element) {
      this.data = this.generateHeight(this.worldWidth, this.worldDepth);
      this.clock = new THREE.Clock();

      this.animate = this.animate.bind(this);
      this.onWindowResize = this.onWindowResize.bind(this);
    }

    public destroy() {
      this.controls.dispose();
      this.renderer.dispose();
      this.clock.stop();
    }

    public useRenderer() {
      this.init();
      this.animate();
      console.log('loading game');
      return this;
    }

    private init() {
      this.camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        20000
      );
      this.camera.position.y = 3000;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xbfd1e5);

      // sides

      const matrix = new THREE.Matrix4();

      const pxGeometry = new THREE.PlaneBufferGeometry(100, 100);
      (pxGeometry.attributes.uv.array as Array<number>)[1] = 0.5;
      (pxGeometry.attributes.uv.array as Array<number>)[3] = 0.5;
      pxGeometry.rotateY(Math.PI / 2);
      pxGeometry.translate(50, 0, 0);

      const nxGeometry = new THREE.PlaneBufferGeometry(100, 100);
      (nxGeometry.attributes.uv.array as Array<number>)[1] = 0.5;
      (nxGeometry.attributes.uv.array as Array<number>)[3] = 0.5;
      nxGeometry.rotateY(-Math.PI / 2);
      nxGeometry.translate(-50, 0, 0);

      const pyGeometry = new THREE.PlaneBufferGeometry(100, 100);
      (pyGeometry.attributes.uv.array as Array<number>)[5] = 0.5;
      (pyGeometry.attributes.uv.array as Array<number>)[7] = 0.5;
      pyGeometry.rotateX(-Math.PI / 2);
      pyGeometry.translate(0, 50, 0);

      const pzGeometry = new THREE.PlaneBufferGeometry(100, 100);
      (pzGeometry.attributes.uv.array as Array<number>)[1] = 0.5;
      (pzGeometry.attributes.uv.array as Array<number>)[3] = 0.5;
      pzGeometry.translate(0, 0, 50);

      const nzGeometry = new THREE.PlaneBufferGeometry(100, 100);
      (nzGeometry.attributes.uv.array as Array<number>)[1] = 0.5;
      (nzGeometry.attributes.uv.array as Array<number>)[3] = 0.5;
      nzGeometry.rotateY(Math.PI);
      nzGeometry.translate(0, 0, -50);

      //

      const geometries = [];

      for (let z = 0; z < this.worldDepth; z++) {
        for (let x = 0; x < this.worldWidth; x++) {
          const y = this.getY(x, z);

          matrix.makeTranslation(
            x * 100 - this.worldHalfWidth * 100,
            y * 100,
            z * 100 - this.worldHalfDepth * 100
          );

          const px = this.getY(x + 1, z);
          const nx = this.getY(x - 1, z);
          const pz = this.getY(x, z + 1);
          const nz = this.getY(x, z - 1);

          geometries.push(pyGeometry.clone().applyMatrix4(matrix));

          if ((px !== y && px !== y + 1) || x === 0) {
            geometries.push(pxGeometry.clone().applyMatrix4(matrix));
          }

          if ((nx !== y && nx !== y + 1) || x === this.worldWidth - 1) {
            geometries.push(nxGeometry.clone().applyMatrix4(matrix));
          }

          if ((pz !== y && pz !== y + 1) || z === this.worldDepth - 1) {
            geometries.push(pzGeometry.clone().applyMatrix4(matrix));
          }

          if ((nz !== y && nz !== y + 1) || z === 0) {
            geometries.push(nzGeometry.clone().applyMatrix4(matrix));
          }
        }
      }

      const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
      geometry.computeBoundingSphere();

      const texture = new THREE.TextureLoader().load(
        "textures/minecraft/atlas.png"
      );
      texture.magFilter = THREE.NearestFilter;

      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide })
      );
      this.scene.add(mesh);

      const ambientLight = new THREE.AmbientLight(0xcccccc);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.set(1, 1, 0.5).normalize();
      this.scene.add(directionalLight);

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.container.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(
        this.camera,
        this.renderer.domElement
      );

      window.addEventListener("resize", this.onWindowResize, false);
    }

    private onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private generateHeight(width: number, height: number) {
      const data = [];
      const perlin = new ImprovedNoise();
      const size = width * height;
      const z = Math.random() * 100;

      let quality = 2;

      for (let j = 0; j < 4; j++) {
        if (j === 0) for (let i = 0; i < size; i++) data[i] = 0;

        for (let i = 0; i < size; i++) {
          const x = i % width,
            y = (i / width) | 0;
          data[i] += perlin.noise(x / quality, y / quality, z) * quality;
        }

        quality *= 4;
      }

      return data;
    }

    private getY(x: number, z: number) {
      return (this.data[x + z * this.worldWidth] * 0.2) | 0;
    }

    private animate() {
      requestAnimationFrame(this.animate);
      this.render();
    }

    private render() {
      this.renderer.render(this.scene, this.camera);
    }
  };
};

export type Renderer = InstanceType<ReturnType<typeof renderFactory>>;

export const useRenderer = (container: Element): Promise<Renderer>  => {
  // TODO preload assets
  return Promise.all([
    import("three/examples/jsm/utils/BufferGeometryUtils"),
    import("three/examples/jsm/controls/OrbitControls"),
    import("three/examples/jsm/math/ImprovedNoise"),
  ]).then(
    ([{ BufferGeometryUtils }, { OrbitControls }, { ImprovedNoise }]) => {
      const Renderer = renderFactory(
        BufferGeometryUtils,
        OrbitControls,
        ImprovedNoise
      );
      const r = new Renderer(container);
      return r.useRenderer();
    }
  );
};
