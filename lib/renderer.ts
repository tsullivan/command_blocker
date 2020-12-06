import { MutableRefObject } from "react";
import * as THREE from "three";
import { BufferGeometryUtils as THBufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import { FirstPersonControls as THFirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import { ImprovedNoise as THImprovedNoise } from "three/examples/jsm/math/ImprovedNoise";

export const renderFactory = (
  BufferGeometryUtils: typeof THBufferGeometryUtils,
  FirstPersonControls: typeof THFirstPersonControls,
  ImprovedNoise: typeof THImprovedNoise
) => {
  return class RenderProvider {
    private camera: THREE.PerspectiveCamera;
    private controls: any;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private worldDepth = 200;
    private worldWidth = 200;
    private worldHalfWidth = 100;
    private worldHalfDepth = 100;
    private data: number[];
    private clock: THREE.Clock;

    constructor(private container: Element) {
      this.data = this.generateHeight(this.worldWidth, this.worldDepth);
      this.clock = new THREE.Clock();

      this.animate = this.animate.bind(this);
      this.onWindowResize = this.onWindowResize.bind(this);
    }

    public useRenderer() {
      this.init();
      this.animate();
    }

    private init() {
      this.camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        20000
      );
      this.camera.position.y =
        this.getY(this.worldHalfWidth, this.worldHalfDepth) * 100 + 100;

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
          const h = this.getY(x, z);

          matrix.makeTranslation(
            x * 100 - this.worldHalfWidth * 100,
            h * 100,
            z * 100 - this.worldHalfDepth * 100
          );

          const px = this.getY(x + 1, z);
          const nx = this.getY(x - 1, z);
          const pz = this.getY(x, z + 1);
          const nz = this.getY(x, z - 1);

          geometries.push(pyGeometry.clone().applyMatrix4(matrix));

          if ((px !== h && px !== h + 1) || x === 0) {
            geometries.push(pxGeometry.clone().applyMatrix4(matrix));
          }

          if ((nx !== h && nx !== h + 1) || x === this.worldWidth - 1) {
            geometries.push(nxGeometry.clone().applyMatrix4(matrix));
          }

          if ((pz !== h && pz !== h + 1) || z === this.worldDepth - 1) {
            geometries.push(pzGeometry.clone().applyMatrix4(matrix));
          }

          if ((nz !== h && nz !== h + 1) || z === 0) {
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

      this.controls = new FirstPersonControls(
        this.camera,
        this.renderer.domElement
      );

      this.controls.movementSpeed = 1000;
      this.controls.lookSpeed = 0.125;
      this.controls.lookVertical = true;

      //

      window.addEventListener("resize", this.onWindowResize, false);
    }

    private onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);

      this.controls.handleResize();
    }

    private generateHeight(width: number, height: number) {
      const data = [],
        perlin = new ImprovedNoise(),
        size = width * height,
        z = Math.random() * 100;

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

    //

    private animate() {
      requestAnimationFrame(this.animate);

      this.render();
    }

    private render() {
      this.controls.update(this.clock.getDelta());
      this.renderer.render(this.scene, this.camera);
    }
  };
};

export const useRenderer = (container: Element) => {
  // load imgs

  Promise.all([
    import("three/examples/jsm/utils/BufferGeometryUtils"),
    import("three/examples/jsm/controls/FirstPersonControls"),
    import("three/examples/jsm/math/ImprovedNoise"),
  ]).then(
    ([{ BufferGeometryUtils }, { FirstPersonControls }, { ImprovedNoise }]) => {
      const RenderProvider = renderFactory(
        BufferGeometryUtils,
        FirstPersonControls,
        ImprovedNoise
      );
      const r = new RenderProvider(container);
      // r.useRenderer();
    }
  );
};