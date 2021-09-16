import { Scene } from "./root";
import { onGuard } from "./utils";

interface TickTrait {
  tick(): void;
}

interface DrawTrait {
  draw(): void;
}
interface EffectTrait {
  effect(): void;
}

interface OnTrait {
  on<T extends keyof HTMLElementEventMap>(type: T, e: HTMLElementEventMap[T]);
}

interface Lifecycle extends TickTrait, DrawTrait, EffectTrait {}

export class Entity implements Lifecycle, OnTrait {
  visible: boolean;
  draggable: boolean = false;
  hoverable: boolean = true;
  selected: boolean = false;
  entities: Entity[] = [];
  constructor(protected _scene: Scene) {}
  effect(): void {}
  draw() {}
  /** sceneに対する絶対位置で持つ */
  on<T extends keyof HTMLElementEventMap>(type: T, e: HTMLElementEventMap[T]) {}
  mayHit(pos: { x: number; y: number }): boolean {
    return false;
  }
  move(distance: { x: number; y: number }) {}
  tick() {}
  click() {
    console.log("click", this);
  }
  hoverStart() {
    console.log("start", this);
  }
  hoverEnd() {
    console.log("end", this);
  }
}

class Group extends Entity {
  selectedEntity: Entity[];
}
export class Rect extends Entity {
  constructor(
    scene: Scene,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public radius: number
  ) {
    super(scene);
  }
  draw() {
    this._scene.ctx.save();
    this._scene.ctx.strokeStyle = "rgb(255, 0, 0)";
    this._scene.ctx.fillStyle = "rgba(0, 255, 0, 1)";
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
  move(distance: { x: number; y: number }) {
    this.x += distance.x;
    this.y += distance.y;
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
