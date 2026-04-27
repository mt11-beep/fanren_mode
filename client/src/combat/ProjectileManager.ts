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

  spawn(playerX: number, playerY: number, angle: number): ProjectileSprite {
    const offset = GAME_BALANCE.projectile.spawnOffset;
    const spawnX = playerX + Math.cos(angle) * offset;
    const spawnY = playerY + Math.sin(angle) * offset;

    const sword = this.scene.physics.add.image(spawnX, spawnY, "sword") as ProjectileSprite;
    sword.setRotation(angle + Math.PI / 2);
    sword.setActive(true).setVisible(true).setDepth(6);

    const body = sword.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(18, 28, true);
    body.enable = true;

    sword.setVelocity(
      Math.cos(angle) * GAME_BALANCE.projectile.speed,
      Math.sin(angle) * GAME_BALANCE.projectile.speed
    );

    sword.setData("expireAt", performance.now() + GAME_BALANCE.projectile.lifetimeMs);
    sword.setData("hitRadius", GAME_BALANCE.projectile.hitRadius);
    this.group.add(sword);

    return sword;
  }

  spawnTrail(projectile: ProjectileSprite) {
    const trail = this.scene.add.circle(projectile.x, projectile.y, 4, 0xbfdbfe, 0.5).setDepth(5);
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.6,
      duration: 240,
      onComplete: () => trail.destroy()
    });
  }

  getActiveProjectiles(): ProjectileSprite[] {
    return this.group
      .getChildren()
      .map((obj) => obj as ProjectileSprite)
      .filter((projectile) => projectile.active && projectile.visible);
  }

  destroyProjectile(projectile: ProjectileSprite) {
    if (!projectile.active) return;
    projectile.disableBody(true, true);
    projectile.destroy();
  }

  update(worldBounds: Phaser.Geom.Rectangle) {
    const now = performance.now();
    this.group.children.each((obj) => {
      const projectile = obj as ProjectileSprite;
      if (!projectile.active) return true;

      this.spawnTrail(projectile);

      const expired = (projectile.getData("expireAt") as number) <= now;
      const outOfBounds = !worldBounds.contains(projectile.x, projectile.y);
      if (expired || outOfBounds) {
        this.destroyProjectile(projectile);
      }

      return true;
    });
  }
}
