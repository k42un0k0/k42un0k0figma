import { Scene } from "./root";
import { onGuard } from "./utils";

export class Entity {
  visible: boolean;
  selected: boolean = false;
  constructor(protected _scene: Scene) {}
  draw() {}
  /** sceneに対する絶対位置で持つ */
  on<T extends keyof HTMLElementEventMap>(type: T, e: HTMLElementEventMap[T]) {}
  mayHit(pos: { x: number; y: number }): boolean {
    return false;
  }
}

class Group extends Entity {
  selectedEntity: Entity[];
}
export class Rect extends Entity {
  constructor(
    scene: Scene,
    private x: number,
    private y: number,
    private width: number,
    private height: number,
    private radius: number
  ) {
    super(scene);
  }
  draw() {
    this._scene.ctx.save();
    this._scene.ctx.strokeStyle = "rgb(255, 0, 0)";
    this._scene.ctx.fillStyle = "rgba(255, 255, 0, .5)";
    this.roundRect(
      this.x,
      this.y,
      this.width,
      this.height,
      this.radius,
      true,
      false
    );
    this._scene.ctx.restore();
  }
  prevMousePos?: { x: number; y: number };
  on<T extends keyof HTMLElementEventMap>(
    ...tuple: [type: T, event: HTMLElementEventMap[T]]
  ) {
    if (onGuard("mousemove", tuple) && this.selected) {
      const [type, event] = tuple;
      const newMousePos = this._scene.getMousePos(event);
      this.x += newMousePos.x - (this.prevMousePos?.x ?? newMousePos.x);
      this.y += newMousePos.y - (this.prevMousePos?.y ?? newMousePos.y);
      this.prevMousePos = newMousePos;
    }
    if (onGuard("mouseup", tuple) && this.selected) {
      this.prevMousePos = undefined;
    }
  }
  mayHit(pos: { x: number; y: number }) {
    return (
      // 縦長長方形
      (this.x + this.radius < pos.x &&
        pos.x < this.x + this.width - this.radius &&
        this.y < pos.y &&
        pos.y < this.y + this.height) ||
      // 横長長方形
      (this.x < pos.x &&
        pos.x < this.x + this.width &&
        this.y + this.radius < pos.y &&
        pos.y < this.y + this.height - this.radius) ||
      // 左上
      Math.pow(this.x + this.radius - pos.x, 2) +
        Math.pow(this.y + this.radius - pos.y, 2) <=
        Math.pow(this.radius, 2) ||
      // 左下
      Math.pow(this.x + this.radius - pos.x, 2) +
        Math.pow(this.y + this.height - this.radius - pos.y, 2) <=
        Math.pow(this.radius, 2) ||
      // 右上
      Math.pow(this.x + this.width - this.radius - pos.x, 2) +
        Math.pow(this.y + this.radius - pos.y, 2) <=
        Math.pow(this.radius, 2) ||
      // 右下
      Math.pow(this.x + this.width - this.radius - pos.x, 2) +
        Math.pow(this.y + this.height - this.radius - pos.y, 2) <=
        Math.pow(this.radius, 2)
    );
  }
  private roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | { tl: number; tr: number; bl: number; br: number },
    fill: boolean,
    stroke: boolean
  ) {
    const ctx = this._scene.ctx;
    if (typeof stroke === "undefined") {
      stroke = true;
    }
    if (typeof radius === "undefined") {
      radius = 5;
    }
    if (typeof radius === "number") {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height
    );
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }
}
