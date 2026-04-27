import Phaser from "phaser";
import { GAME_BALANCE } from "@xuanfight/shared";

export class ProjectileManager {
  private readonly group: Phaser.Physics.Arcade.Group;

  constructor(private readonly scene: Phaser.Scene) {
    this.group = this.scene.physics.add.group();
  }

  spawn(x: number, y: number, angle: number) {
    const sword = this.scene.physics.add.image(x, y, "sword");
    sword.setRotation(angle + Math.PI / 2);
    sword.setVelocity(
      Math.cos(angle) * GAME_BALANCE.projectile.speed,
      Math.sin(angle) * GAME_BALANCE.projectile.speed
    );
    sword.setData("expireAt", performance.now() + GAME_BALANCE.projectile.lifetimeMs);
    this.group.add(sword);
  }

  getGroup() {
    return this.group;
  }

  update() {
    const now = performance.now();
    this.group.children.each((obj) => {
      const body = obj as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
      if ((body.getData("expireAt") as number) <= now) {
        body.destroy();
      }
    });
  }
}
