import { Entity } from "./entity";
import { Scene } from "./root";
import { onGuard } from "./utils";

/** mousemove時にhitしたentityを計算する */
export class HoverManager {
  constructor(private _scene: Scene) {}
  cycleState: "doing" | "stop" = "stop";
  prevEntities: Entity[] = [];
  nextEntities: Entity[] = [];
  startCycle() {
    if (this.cycleState === "doing")
      throw new Error("finishCycleが実行されていません");
    this.cycleState = "doing";
    this.prevEntities = this.nextEntities;
    this.nextEntities = [];
  }
  append(entity: Entity) {
    if (entity.hoverable) this.nextEntities.push(entity);
  }
  newEntities(): Entity[] {
    if (this.cycleState === "stop")
      throw new Error("startCycleが実行されていません");
    const result = [];
    this.nextEntities.forEach((nEntity) => {
      const find = this.prevEntities.some((pEntity) => pEntity === nEntity);
      if (!find) result.push(nEntity);
    });
    return result;
  }
  removedEntities(): Entity[] {
    if (this.cycleState === "stop")
      throw new Error("startCycleが実行されていません");
    const result = [];
    this.prevEntities.forEach((pEntity) => {
      const find = this.nextEntities.some((nEntity) => pEntity === nEntity);
      if (!find) result.push(pEntity);
    });
    return result;
  }
  finishCycle() {
    this.cycleState = "stop";
  }
  on<T extends keyof HTMLElementEventMap>(
    ...tuple: [type: T, event: HTMLElementEventMap[T]]
  ) {
    if (onGuard("mousemove", tuple)) {
      const [type, event] = tuple;
      this.startCycle();
      const entities = this._scene.findHitEntities(event);
      entities.forEach((entity) => {
        if (entity.hoverable) this.append(entity);
      });
      const newEntities = this.newEntities();
      const removedEntities = this.removedEntities();
      newEntities.forEach((e) => {
        e.hoverStart();
      });
      removedEntities.forEach((e) => {
        e.hoverEnd();
      });
      this.finishCycle();
    }
  }
}

/** mousedown時にhitしたentityをひとつだけ持っておく */
export class DragManager {
  constructor(private _scene: Scene) {}
  entity?: Entity;
  prevPos?: { x: number; y: number };
  dragStart(entity: Entity, pos: { x: number; y: number }): void {
    if (entity.draggable) {
      this.entity = entity;
      this.prevPos = pos;
    }
  }
  dragingEntity(pos: {
    x: number;
    y: number;
  }): [entity: Entity, distance: { x: number; y: number }] | undefined {
    if (this.entity) {
      return [
        this.entity,
        {
          x: pos.x - (this.prevPos?.x ?? pos.x),
          y: pos.y - (this.prevPos?.y ?? pos.y),
        },
      ];
    }
  }
  dragEnd() {
    this.prevPos = undefined;
    this.entity = undefined;
  }
  on<T extends keyof HTMLElementEventMap>(
    ...tuple: [type: T, event: HTMLElementEventMap[T]]
  ) {
    if (onGuard("mousedown", tuple)) {
      const [type, event] = tuple;
      const entity = this._scene.findHitEntity(event);
      if (entity != null) {
        this.dragStart(entity, this._scene.getMousePos(event));
      }
    }
    if (onGuard("mousemove", tuple)) {
      const [type, event] = tuple;
      const [dragingEntity, distance] =
        this.dragingEntity(this._scene.getMousePos(event)) ?? [];
    }
    if (onGuard("mouseup", tuple)) {
      this.dragEnd();
    }
  }
}

/** mousedownでhitしたentityをぶちこんで、mouseupでもhitしたentityをぶちこみ同じものをclickしたとみなす？ */
export class ClickManager {
  clickState: "mousedown" | "drag" | "end";
  constructor(private _scene: Scene) {}
  mouseDownEntities: Entity[] = [];
  mouseUpEntities: Entity[] = [];

  mouseDownEntity(entity: Entity) {
    this.mouseDownEntities.push(entity);
  }
  mouseUpEntity(entity: Entity) {
    this.mouseUpEntities.push(entity);
  }
  clickedEntity(): Entity[] {
    const result: Entity[] = [];
    this.mouseDownEntities.forEach((dEntity) => {
      const find = this.mouseUpEntities.some((uEntity) => dEntity === uEntity);
      if (find) result.push(dEntity);
    });
    return result;
  }
  clear() {
    this.mouseDownEntities = [];
    this.mouseUpEntities = [];
    this.clickState = "end";
  }
  on<T extends keyof HTMLElementEventMap>(
    ...tuple: [type: T, event: HTMLElementEventMap[T]]
  ) {
    if (onGuard("mousedown", tuple)) {
      const [type, event] = tuple;
      const entity = this._scene.findHitEntity(event);
      if (entity != null) {
        this.clickState = "mousedown";
        this.mouseDownEntity(entity);
      }
    }
    if (onGuard("mousemove", tuple)) {
      const [type, event] = tuple;
      if (this.clickState === "mousedown") {
        this.clickState = "drag";
      }
    }
    if (onGuard("mouseup", tuple)) {
      if (this.clickState === "mousedown") {
        const [type, event] = tuple;
        const entity = this._scene.findHitEntity(event);
        this.mouseUpEntity(entity);
        const clickedEntity = this.clickedEntity();
        clickedEntity.forEach((entity) => {
          entity.click();
        });
      }
      this.clear();
    }
  }
}
