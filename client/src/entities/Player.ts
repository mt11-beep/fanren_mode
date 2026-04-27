import Phaser from "phaser";
import { GAME_BALANCE } from "@xuanfight/shared";

export type CooldownState = {
  sword: number;
  shield: number;
  burst: number;
};

export class Player {
  readonly body: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

  private readonly scene: Phaser.Scene;
  private readonly arrow: Phaser.GameObjects.Triangle;
  private readonly shieldRing: Phaser.GameObjects.Arc;

  readonly cooldowns: CooldownState = { sword: 0, shield: 0, burst: 0 };
  mana = GAME_BALANCE.player.maxMana;
  health = GAME_BALANCE.player.maxHealth;
  shieldEndAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.body = scene.physics.add.image(x, y, "cultivator").setCollideWorldBounds(true);
    this.body.setDamping(true).setDrag(0.92).setMaxVelocity(350, 350);
    this.arrow = scene.add.triangle(x, y, 0, 18, 14, -14, -14, -14, 0xfff7d6).setDepth(4);
    this.shieldRing = scene.add.circle(x, y, 40, 0x93c5fd, 0.18).setVisible(false).setDepth(2);
  }

  move(keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
    const x = (keys.D.isDown ? 1 : 0) - (keys.A.isDown ? 1 : 0);
    const y = (keys.S.isDown ? 1 : 0) - (keys.W.isDown ? 1 : 0);
    const vec = new Phaser.Math.Vector2(x, y).normalize().scale(GAME_BALANCE.player.moveSpeed);
    this.body.setVelocity(vec.x, vec.y);
  }

  rotateTo(pointer: Phaser.Input.Pointer, camera: Phaser.Cameras.Scene2D.Camera) {
    const worldPoint = pointer.positionToCamera(camera) as Phaser.Math.Vector2;
    const angle = Phaser.Math.Angle.Between(this.body.x, this.body.y, worldPoint.x, worldPoint.y);
    this.arrow.setPosition(this.body.x, this.body.y);
    this.arrow.setRotation(angle + Math.PI / 2);
  }

  activateShield(now: number) {
    const skill = GAME_BALANCE.skills.shield;
    this.cooldowns.shield = now + skill.cooldownMs;
    this.shieldEndAt = now + skill.durationMs;
    this.mana -= skill.costMana;
    this.shieldRing.setVisible(true);
  }

  update(deltaMs: number, now: number) {
    const dt = deltaMs / 1000;
    this.mana = Math.min(GAME_BALANCE.player.maxMana, this.mana + GAME_BALANCE.player.regenManaPerSecond * dt);
    if (now < this.shieldEndAt) {
      this.health = Math.min(GAME_BALANCE.player.maxHealth, this.health + 4 * dt);
      this.shieldRing.setPosition(this.body.x, this.body.y);
      this.shieldRing.setScale(1 + 0.05 * Math.sin(now * 0.01));
    } else if (this.shieldRing.visible) {
      this.shieldRing.setVisible(false);
    }
  }

  get shieldActive() {
    return performance.now() < this.shieldEndAt;
  }

  destroy() {
    this.body.destroy();
    this.arrow.destroy();
    this.shieldRing.destroy();
  }
}
