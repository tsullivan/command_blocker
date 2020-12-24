import * as THREE from 'three';

export class Landscape {
  private worldHalfWidth: number;
  private worldHalfDepth: number;
  private cubeSize: number;
  private cubeHalfSize: number;
  private data: number[] = [];

  constructor(private worldWidth: number, private worldDepth: number, cubeSize: number) {
    this.worldHalfWidth = worldWidth / 2;
    this.worldHalfDepth = worldDepth / 2;
    this.cubeSize = cubeSize;
    this.cubeHalfSize = cubeSize / 2;
  }

  private async generateHeight(): Promise<void> {
    const data = [];
    const { ImprovedNoise } = await import('three/examples/jsm/math/ImprovedNoise');
    const perlin = new ImprovedNoise();
    const size = this.worldWidth * this.worldDepth;
    const z = Math.random() * this.cubeSize;

    let quality = 2;

    for (let j = 0; j < 4; j++) {
      if (j === 0) for (let i = 0; i < size; i++) data[i] = 0;

      for (let i = 0; i < size; i++) {
        const x = i % this.worldWidth,
          y = (i / this.worldWidth) | 0;
        data[i] += perlin.noise(x / quality, y / quality, z) * quality;
      }

      quality *= 4;
    }

    this.data = data;
  }

  public getY(x: number, z: number): number {
    return (this.data[x + z * this.worldWidth] * 0.25) | 0;
  }

  public getMaxX(): number {
    return this.worldWidth * this.cubeSize - this.cubeSize * 2;
  }

  public getMaxZ(): number {
    return this.worldDepth * this.cubeSize - this.cubeSize * 2;
  }

  public getMinCameraY(x: number, z: number): number {
    return this.getY(x, z) * (this.cubeSize * 2);
  }

  public async getObject(): Promise<THREE.Object3D> {
    await this.generateHeight();

    // minecraft blocks: sides
    const pxGeometry = new THREE.PlaneBufferGeometry(this.cubeSize, this.cubeSize);
    (pxGeometry.attributes.uv.array as Array<number>)[1] = 0.5;
    (pxGeometry.attributes.uv.array as Array<number>)[3] = 0.5;
    pxGeometry.rotateY(Math.PI / 2);
    pxGeometry.translate(this.cubeHalfSize, 0, 0);

    const nxGeometry = new THREE.PlaneBufferGeometry(this.cubeSize, this.cubeSize);
    (nxGeometry.attributes.uv.array as Array<number>)[1] = 0.5;
    (nxGeometry.attributes.uv.array as Array<number>)[3] = 0.5;
    nxGeometry.rotateY(-Math.PI / 2);
    nxGeometry.translate(-this.cubeHalfSize, 0, 0);

    const pyGeometry = new THREE.PlaneBufferGeometry(this.cubeSize, this.cubeSize);
    (pyGeometry.attributes.uv.array as Array<number>)[5] = 0.5;
    (pyGeometry.attributes.uv.array as Array<number>)[7] = 0.5;
    pyGeometry.rotateX(-Math.PI / 2);
    pyGeometry.translate(0, this.cubeHalfSize, 0);

    const pzGeometry = new THREE.PlaneBufferGeometry(this.cubeSize, this.cubeSize);
    (pzGeometry.attributes.uv.array as Array<number>)[1] = 0.5;
    (pzGeometry.attributes.uv.array as Array<number>)[3] = 0.5;
    pzGeometry.translate(0, 0, this.cubeHalfSize);

    const nzGeometry = new THREE.PlaneBufferGeometry(this.cubeSize, this.cubeSize);
    (nzGeometry.attributes.uv.array as Array<number>)[1] = 0.5;
    (nzGeometry.attributes.uv.array as Array<number>)[3] = 0.5;
    nzGeometry.rotateY(Math.PI);
    nzGeometry.translate(0, 0, -this.cubeHalfSize);

    // minecraft blocks: landscape
    const geometries = [];

    const matrix = new THREE.Matrix4();

    for (let z = 0; z < this.worldDepth; z++) {
      for (let x = 0; x < this.worldWidth; x++) {
        const y = this.getY(x, z);

        matrix.makeTranslation(
          x * this.cubeSize - this.worldHalfWidth * this.cubeSize,
          y * this.cubeSize,
          z * this.cubeSize - this.worldHalfDepth * this.cubeSize
        );

        geometries.push(pyGeometry.clone().applyMatrix4(matrix));
        geometries.push(pxGeometry.clone().applyMatrix4(matrix));
        geometries.push(nxGeometry.clone().applyMatrix4(matrix));
        geometries.push(pzGeometry.clone().applyMatrix4(matrix));
        geometries.push(nzGeometry.clone().applyMatrix4(matrix));
      }
    }

    const { BufferGeometryUtils } = await import('three/examples/jsm/utils/BufferGeometryUtils');
    const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
    geometry.computeBoundingSphere();

    const texture = new THREE.TextureLoader().load('textures/minecraft/atlas.png');
    texture.magFilter = THREE.NearestFilter;

    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide })
    );
    mesh.receiveShadow = true;

    return mesh;
  }
}
