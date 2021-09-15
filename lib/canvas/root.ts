import { Entity } from "./entity";
import { onGuard } from "./utils";

type EventType = "select";
export class Scene {
  constructor(private _canvas: HTMLCanvasElement) {
    this._canvas.addEventListener("mouseup", (e) => this.on("mouseup", e));
    this._canvas.addEventListener("mousemove", (e) => this.on("mousemove", e));
    this._canvas.addEventListener("mousedown", (e) => this.on("mousedown", e));
  }
  get ctx(): CanvasRenderingContext2D {
    return this._canvas.getContext("2d");
  }
  on<T extends keyof HTMLElementEventMap>(
    ...tuple: [type: T, event: HTMLElementEventMap[T]]
  ) {
    if (onGuard("mousedown", tuple)) {
      const [type, event] = tuple;
      const entity = this.entities.find((entity) =>
        entity.mayHit(this.getMousePos(event))
      );
      if (entity) {
        if (event.ctrlKey && this.overlay && !this.overlay.some(entity)) {
          this.overlay.append(entity);
        } else {
          this.overlay = new Overlay(entity);
        }
        this.overlay.activate();
        return;
      }
      this.overlay?.deactivate();
      this.overlay = undefined;
    }
    if (onGuard("mousemove", tuple)) {
      const [type, event] = tuple;
      if (this.overlay) {
        this.overlay.on(type, event);
      } else {
        this.entities.forEach((entity) => {
          if (entity.mayHit(this.getMousePos(event))) {
            entity.on(type, event);
            return true;
          }
        });
      }
    }
    if (onGuard("mouseup", tuple)) {
      const [type, event] = tuple;
      this.overlay?.on(type, event);
      this.overlay?.deactivate();
    }
  }
  entities: Entity[] = [];
  overlay?: Overlay;
  append(entity) {
    this.entities.push(entity);
  }

  getMousePos(e: MouseEvent) {
    var rect = this._canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }
  draw() {
    this.ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this.entities.forEach((entity) => {
      entity.draw();
    });
    requestAnimationFrame(this.draw.bind(this));
  }
}

class Overlay {
  entities: Entity[] = [];
  constructor(...entities: Entity[]) {
    this.entities = entities;
  }
  some(entity: Entity): boolean {
    return this.entities.some((e) => e === entity);
  }
  append(entity: Entity) {
    this.entities.push(entity);
  }
  deactivate() {
    this.entities.forEach((entity) => (entity.selected = false));
  }
  activate() {
    this.entities.forEach((entity) => {
      entity.selected = true;
    });
  }
  on<T extends keyof HTMLElementEventMap>(
    type: T,
    event: HTMLElementEventMap[T]
  ) {
    this.entities.forEach((entity) => {
      entity.on(type, event);
    });
  }
}
