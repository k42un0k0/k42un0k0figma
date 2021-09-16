import { Entity } from "./entity";

/** mousemove時にhitしたentityを計算する */
export class HoverManager {
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
}

/** mousedown時にhitしたentityをひとつだけ持っておく */
export class DragManager {
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
  endDrag() {
    this.prevPos = undefined;
    this.entity = undefined;
  }
}

/** mousedownでhitしたentityをぶちこんで、mouseupでもhitしたentityをぶちこみ同じものをclickしたとみなす？ */
export class ClickManager {
  mouseDownEntities: Entity[] = [];
  mouseUpEntities: Entity[] = [];

  mouseDownTime = 0;
  mouseUpTime = 100000;
  clickDelay = 500;
  mouseDownEntity(entity: Entity) {
    this.mouseDownTime = Date.now();
    this.mouseDownEntities.push(entity);
  }
  mouseUpEntity(entity: Entity) {
    this.mouseUpTime = Date.now();
    this.mouseUpEntities.push(entity);
  }
  clickedEntity(): Entity[] {
    const result: Entity[] = [];
    if (this.mouseUpTime - this.mouseDownTime > this.clickDelay) return result;
    this.mouseDownEntities.forEach((dEntity) => {
      const find = this.mouseUpEntities.some((uEntity) => dEntity === uEntity);
      if (find) result.push(dEntity);
    });
    return result;
  }
  clear() {
    this.mouseDownEntities = [];
    this.mouseUpEntities = [];
    this.mouseDownTime = 0;
    this.mouseUpTime = 100000;
  }
}
