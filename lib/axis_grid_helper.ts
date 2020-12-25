import * as THREE from 'three';

export class AxisGridHelper {
  private _visible = false;
  private grid: THREE.GridHelper;
  private axes: THREE.AxesHelper;

  constructor(node: THREE.Object3D, units = 10) {
    const axes = new THREE.AxesHelper();
    (axes.material as { depthTest?: boolean }).depthTest = false;
    axes.renderOrder = 2;
    node.add(axes);

    const grid = new THREE.GridHelper(units, units);
    (grid.material as { depthTest?: boolean }).depthTest = false;
    grid.renderOrder = 1;
    node.add(grid);

    this.grid = grid;
    this.axes = axes;

    this.grid.visible = this._visible;
    this.axes.visible = this._visible;
  }

  get visible(): boolean {
    return this._visible;
  }

  set visible(v: boolean) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}

interface AxisGridConfig {
  node: THREE.Object3D; label: string; units?: number;
}

export function makeAxisGrids(axisGrids: AxisGridConfig[]): void {
  import('dat.gui').then((dat) => {
    const gui = new dat.GUI({ closed: true });

    axisGrids.forEach(({ node, label, units = 10 }) => {
      const helper = new AxisGridHelper(node, units);
      gui.add(helper, 'visible').name(label);
    });

  });
}