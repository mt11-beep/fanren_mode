import Phaser from "phaser";
import { GAME_BALANCE } from "@xuanfight/shared";

export class TrainingDummy {
  readonly body: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private readonly hpBarBg: Phaser.GameObjects.Rectangle;
  private readonly hpBar: Phaser.GameObjects.Rectangle;

  health = GAME_BALANCE.trainingDummy.maxHealth;
  alive = true;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
    this.body = scene.physics.add.image(x, y, "dummy").setImmovable(true);
    this.body.body?.setAllowGravity(false);

    this.hpBarBg = scene.add.rectangle(x, y - 42, 56, 8, 0x111827).setDepth(4);
    this.hpBar = scene.add.rectangle(x - 28, y - 42, 56, 6, 0x22c55e).setOrigin(0, 0.5).setDepth(5);
  }

  update() {
    this.hpBarBg.setPosition(this.body.x, this.body.y - 42);
    this.hpBar.setPosition(this.body.x - 28, this.body.y - 42);
    this.hpBarBg.setVisible(this.alive);
    this.hpBar.setVisible(this.alive);
  }

  takeDamage(damage: number, sourceX: number, sourceY: number): boolean {
    if (!this.alive) return false;

    this.health = Math.max(0, this.health - damage);
    const ratio = this.health / GAME_BALANCE.trainingDummy.maxHealth;
    this.hpBar.displayWidth = 56 * ratio;

    this.scene.tweens.add({
      targets: this.body,
      alpha: 0.2,
      duration: 80,
      yoyo: true,
      repeat: 1
    });

    const knock = new Phaser.Math.Vector2(this.body.x - sourceX, this.body.y - sourceY)
      .normalize()
      .scale(GAME_BALANCE.trainingDummy.knockbackForce);
    this.body.setVelocity(knock.x, knock.y);

    if (this.health <= 0) {
      this.dieAndRespawn();
      return true;
    }

    return false;
  }

  private dieAndRespawn() {
    this.alive = false;
    this.body.disableBody(true, true);
    this.hpBar.setVisible(false);
    this.hpBarBg.setVisible(false);

    this.scene.time.delayedCall(GAME_BALANCE.trainingDummy.respawnMs, () => {
      this.health = GAME_BALANCE.trainingDummy.maxHealth;
      this.hpBar.displayWidth = 56;
      this.alive = true;
      this.body.enableBody(false, this.body.x, this.body.y, true, true);
      this.body.setVelocity(0, 0);
      this.body.setAlpha(1);
    });
  }
}
