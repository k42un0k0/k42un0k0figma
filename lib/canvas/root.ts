import { Entity, Rect } from "./entity";
import { onGuard } from "./utils";

export class Scene {
  constructor(private _canvas: HTMLCanvasElement) {
    this._canvas.addEventListener("mouseup", (e) => this.on("mouseup", e));
    this._canvas.addEventListener("mousemove", (e) => this.on("mousemove", e));
    this._canvas.addEventListener("mousedown", (e) => this.on("mousedown", e));
    this._canvas.addEventListener("contextmenu",(e)=>{e.preventDefault()})
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
      if (this.overlay == null) this.overlay = new Overlay(this);
      if (entity) {
        if (event.ctrlKey && !this.overlay?.some(entity)) {
          this.overlay.append(entity);
          this.overlay.grab();
          return;
        }
        if (!this.overlay?.some(entity)) this.overlay = new Overlay(this,entity);
        this.overlay.grab();
        return;
      }
      this.overlay?.degrab();
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
      this.overlay?.degrab();
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
    this.overlay?.draw()
    requestAnimationFrame(this.draw.bind(this));
  }
}

class Overlay {
  grabing:boolean=false
  entities: Entity[] = [];
  prevMousePos?: { x: number; y: number };
  constructor(private _scene,...entities: Entity[]) {
    this.entities = entities;
  }
  some(entity: Entity): boolean {
    return this.entities.some((e) => e === entity);
  }
  append(entity: Entity) {
    this.entities.push(entity);
  }
  draw(){
    let minx=1000000,miny=100000,maxx=0,maxy=0;

    this.entities.forEach((entity:Rect)=>{
      minx=Math.min(minx, entity.x)
      miny=Math.min(miny, entity.y)
      maxx=Math.max(maxx, entity.x+entity.width)
      maxy=Math.max(maxy, entity.y+entity.height)
    })
    this._scene.ctx.beginPath()
    this._scene.ctx.rect(minx,miny,maxx-minx,maxy-miny)
    this._scene.ctx.stroke()
  }
  degrab() {
    this.grabing=false
    this.prevMousePos=undefined
  }
  grab() {
    this.grabing=true
  }
  on<T extends keyof HTMLElementEventMap>(
   ...tuple:[ type: T,
    event: HTMLElementEventMap[T]]
  ) {
    if (onGuard("mousemove", tuple) && this.grabing) {
      const [type, event] = tuple;
      const newMousePos = this._scene.getMousePos(event);
      const distance ={x: newMousePos.x - (this.prevMousePos?.x ?? newMousePos.x),
      y: newMousePos.y - (this.prevMousePos?.y ?? newMousePos.y)}
      this.prevMousePos = newMousePos;
      this.entities.forEach((entity) => {
        entity.move(distance);
      });
    }
  }
}