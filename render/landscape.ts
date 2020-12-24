import * as THREE from 'three';
import { landscapeData } from './landscape_data';

export class Landscape {
  private worldHalfWidth: number;
  private worldHalfDepth: number;
  private cubeSize: number;
  private cubeHalfSize: number;
  private data = landscapeData;

  constructor(private worldWidth: number, private worldDepth: number, cubeSize: number) {
    this.worldHalfWidth = worldWidth / 2;
    this.worldHalfDepth = worldDepth / 2;
    this.cubeSize = cubeSize;
    this.cubeHalfSize = cubeSize / 2;
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

    return mesh;
  }
}
