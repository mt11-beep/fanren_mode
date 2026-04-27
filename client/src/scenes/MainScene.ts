import Phaser from "phaser";
import { GAME_BALANCE } from "@xuanfight/shared";
import { Hud } from "../ui/Hud";

type SkillCd = { sword: number; shield: number; burst: number };

export class MainScene extends Phaser.Scene {
  private cursors!: { [key: string]: Phaser.Input.Keyboard.Key };
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private hud!: Hud;
  private playerArrow!: Phaser.GameObjects.Triangle;

  private health: number = GAME_BALANCE.player.maxHealth;
  private mana: number = GAME_BALANCE.player.maxMana;
  private cooldowns: SkillCd = { sword: 0, shield: 0, burst: 0 };
  private shieldEndAt = 0;

  private projectiles!: Phaser.Physics.Arcade.Group;

  constructor() {
    super("main");
  }

  preload() {
    this.createPlaceholderTextures();
  }

  create() {
    this.physics.world.setBounds(0, 0, 2200, 1400);
    this.createRealmMap();

    this.player = this.physics.add.image(640, 360, "cultivator").setCollideWorldBounds(true);
    this.player.setDamping(true).setDrag(0.92).setMaxVelocity(350, 350);

    this.playerArrow = this.add.triangle(640, 360, 0, 18, 14, -14, -14, -14, 0xfff7d6).setDepth(3);

    this.projectiles = this.physics.add.group();

    this.cursors = this.input.keyboard!.addKeys("W,A,S,D,Q,E") as { [key: string]: Phaser.Input.Keyboard.Key };

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.castSword();
      }
    });

    this.hud = new Hud(this);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 2200, 1400);
  }

  update(_time: number, delta: number) {
    this.movePlayer();
    this.rotateToPointer();
    this.handleSkills();
    this.updateResources(delta);
    this.cleanupProjectiles();

    this.hud.render(this.health, this.mana, this.cooldowns);
  }

  private movePlayer() {
    const x = (this.cursors.D.isDown ? 1 : 0) - (this.cursors.A.isDown ? 1 : 0);
    const y = (this.cursors.S.isDown ? 1 : 0) - (this.cursors.W.isDown ? 1 : 0);
    const vec = new Phaser.Math.Vector2(x, y).normalize().scale(GAME_BALANCE.player.moveSpeed);
    this.player.setVelocity(vec.x, vec.y);
  }

  private rotateToPointer() {
    const pointer = this.input.activePointer;
    const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);

    this.playerArrow.setPosition(this.player.x, this.player.y);
    this.playerArrow.setRotation(angle + Math.PI / 2);
  }

  private castSword() {
    const now = performance.now();
    if (now < this.cooldowns.sword || this.mana < GAME_BALANCE.projectile.manaCost) return;

    this.cooldowns.sword = now + GAME_BALANCE.projectile.cooldownMs;
    this.mana -= GAME_BALANCE.projectile.manaCost;

    const pointer = this.input.activePointer;
    const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);

    const sword = this.physics.add.image(this.player.x, this.player.y, "sword");
    sword.setRotation(angle + Math.PI / 2);
    sword.setVelocity(
      Math.cos(angle) * GAME_BALANCE.projectile.speed,
      Math.sin(angle) * GAME_BALANCE.projectile.speed
    );
    sword.setData("expireAt", now + GAME_BALANCE.projectile.lifetimeMs);
    this.projectiles.add(sword);
  }

  private handleSkills() {
    const now = performance.now();

    if (Phaser.Input.Keyboard.JustDown(this.cursors.Q)) {
      const skill = GAME_BALANCE.skills.shield;
      if (now >= this.cooldowns.shield && this.mana >= skill.costMana) {
        this.cooldowns.shield = now + skill.cooldownMs;
        this.shieldEndAt = now + skill.durationMs;
        this.mana -= skill.costMana;

        const ring = this.add.circle(this.player.x, this.player.y, 34, 0x93c5fd, 0.25).setDepth(2);
        this.tweens.add({
          targets: ring,
          alpha: 0,
          scale: 1.6,
          duration: skill.durationMs,
          onUpdate: () => ring.setPosition(this.player.x, this.player.y),
          onComplete: () => ring.destroy()
        });
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.E)) {
      const skill = GAME_BALANCE.skills.burst;
      if (now >= this.cooldowns.burst && this.mana >= skill.costMana) {
        this.cooldowns.burst = now + skill.cooldownMs;
        this.mana -= skill.costMana;

        const aoe = this.add.circle(this.player.x, this.player.y, 12, 0xf59e0b, 0.45).setDepth(2);
        this.tweens.add({
          targets: aoe,
          radius: skill.radius,
          alpha: 0,
          duration: 320,
          onComplete: () => aoe.destroy()
        });
      }
    }
  }

  private updateResources(deltaMs: number) {
    const deltaSec = deltaMs / 1000;
    this.mana = Math.min(GAME_BALANCE.player.maxMana, this.mana + GAME_BALANCE.player.regenManaPerSecond * deltaSec);

    if (performance.now() < this.shieldEndAt) {
      this.health = Math.min(GAME_BALANCE.player.maxHealth, this.health + 4 * deltaSec);
    }
  }

  private cleanupProjectiles() {
    const now = performance.now();
    for (const obj of this.projectiles.getChildren()) {
      const body = obj as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
      if ((body.getData("expireAt") as number) <= now) {
        body.destroy();
      }
    }
  }

  private createRealmMap() {
    this.add.rectangle(1100, 700, 2200, 1400, 0x1f2937);

    for (let i = 0; i < 40; i += 1) {
      const x = Phaser.Math.Between(80, 2120);
      const y = Phaser.Math.Between(80, 1320);
      const r = Phaser.Math.Between(20, 48);
      this.add.circle(x, y, r, 0x14532d, 0.75);
    }

    this.add.ellipse(780, 460, 440, 250, 0x0ea5e9, 0.35);
    this.add.ellipse(1520, 930, 520, 310, 0x0891b2, 0.35);

    this.add
      .text(80, 110, "玄灵秘境（原型地图）", {
        fontFamily: "sans-serif",
        fontSize: "30px",
        color: "#d1fae5"
      })
      .setAlpha(0.8);
  }

  private createPlaceholderTextures() {
    const g = this.add.graphics();

    g.fillStyle(0x22c55e, 1);
    g.fillCircle(16, 16, 16);
    g.generateTexture("cultivator", 32, 32);
    g.clear();

    g.fillStyle(0xf8fafc, 1);
    g.fillTriangle(12, 0, 24, 32, 0, 32);
    g.generateTexture("sword", 24, 32);

    g.destroy();
  }
}
