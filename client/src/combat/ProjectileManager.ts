import Phaser from "phaser";
import { GAME_BALANCE } from "@xuanfight/shared";

export type ProjectileSprite = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

export class ProjectileManager {
  private readonly group: Phaser.Physics.Arcade.Group;

  constructor(private readonly scene: Phaser.Scene) {
    this.group = this.scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: false
    });
  }

  spawn(x: number, y: number, angle: number) {
    const sword = this.scene.physics.add.image(x, y, "sword") as ProjectileSprite;
    sword.setRotation(angle + Math.PI / 2);
    sword.setActive(true).setVisible(true);

    const body = sword.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(14, 14, true);
    body.enable = true;

    sword.setVelocity(
      Math.cos(angle) * GAME_BALANCE.projectile.speed,
      Math.sin(angle) * GAME_BALANCE.projectile.speed
    );

    sword.setData("expireAt", performance.now() + GAME_BALANCE.projectile.lifetimeMs);
    sword.setData("hitRadius", 18);
    this.group.add(sword);

    return sword;
  }

  getActiveProjectiles(): ProjectileSprite[] {
    return this.group
      .getChildren()
      .filter((obj) => obj.active)
      .map((obj) => obj as ProjectileSprite);
  }

  destroyProjectile(projectile: ProjectileSprite) {
    projectile.disableBody(true, true);
    projectile.destroy();
  }

  update() {
    const now = performance.now();
    this.group.children.each((obj) => {
      const body = obj as ProjectileSprite;
      if (!body.active) return;
      if ((body.getData("expireAt") as number) <= now) {
        this.destroyProjectile(body);
      }
    });
  }
}
