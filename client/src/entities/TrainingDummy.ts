import Phaser from "phaser";
import { GAME_BALANCE } from "@xuanfight/shared";

const DUMMY_MIN_X = 40;
const DUMMY_MAX_X = 2160;
const DUMMY_MIN_Y = 60;
const DUMMY_MAX_Y = 1340;

export class TrainingDummy {
  readonly body: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  readonly spawnX: number;
  readonly spawnY: number;

  private readonly hpBarBg: Phaser.GameObjects.Rectangle;
  private readonly hpBar: Phaser.GameObjects.Rectangle;

  health: number = GAME_BALANCE.trainingDummy.maxHealth;
  alive = true;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
    this.spawnX = x;
    this.spawnY = y;

    this.body = scene.physics.add.image(x, y, "dummy").setImmovable(false).setCollideWorldBounds(true);
    const physicsBody = this.body.body as Phaser.Physics.Arcade.Body;
    physicsBody.setAllowGravity(false);
    physicsBody.setSize(34, 56, true);
    physicsBody.setDamping(true);
    physicsBody.setDrag(0.95);
    physicsBody.enable = true;

    this.body.setData("hitRadius", GAME_BALANCE.trainingDummy.hitRadius);

    this.hpBarBg = scene.add.rectangle(x, y - 42, 56, 8, 0x111827).setDepth(4);
    this.hpBar = scene.add.rectangle(x - 28, y - 42, 56, 6, 0x22c55e).setOrigin(0, 0.5).setDepth(5);
  }

  update() {
    if (this.alive) {
      this.body.x = Phaser.Math.Clamp(this.body.x, DUMMY_MIN_X, DUMMY_MAX_X);
      this.body.y = Phaser.Math.Clamp(this.body.y, DUMMY_MIN_Y, DUMMY_MAX_Y);
    }

    this.hpBarBg.setPosition(this.body.x, this.body.y - 42);
    this.hpBar.setPosition(this.body.x - 28, this.body.y - 42);
    this.hpBarBg.setVisible(this.alive);
    this.hpBar.setVisible(this.alive);
  }

  takeDamage(damage: number, sourceX: number, sourceY: number, knockbackScale = 1): boolean {
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

    const direction = new Phaser.Math.Vector2(this.body.x - sourceX, this.body.y - sourceY);
    if (direction.lengthSq() < 0.001) {
      direction.set(1, 0);
    }

    const knockback = direction
      .normalize()
      .scale(GAME_BALANCE.trainingDummy.knockbackForce * Phaser.Math.Clamp(knockbackScale, 0, 1));

    const clampedVel = knockback.limit(GAME_BALANCE.trainingDummy.maxKnockbackSpeed);
    this.body.setVelocity(clampedVel.x, clampedVel.y);

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

      this.body.enableBody(false, this.spawnX, this.spawnY, true, true);
      const physicsBody = this.body.body as Phaser.Physics.Arcade.Body;
      physicsBody.setAllowGravity(false);
      physicsBody.setSize(34, 56, true);
      physicsBody.setDamping(true);
      physicsBody.setDrag(0.95);
      physicsBody.enable = true;

      this.body.setVelocity(0, 0);
      this.body.setAlpha(1);
      this.body.setCollideWorldBounds(true);
    });
  }
}
