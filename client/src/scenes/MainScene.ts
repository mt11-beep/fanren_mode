import Phaser from "phaser";
import { GAME_BALANCE } from "@xuanfight/shared";
import { ProjectileManager, type ProjectileSprite } from "../combat/ProjectileManager";
import { Player } from "../entities/Player";
import { TrainingDummy } from "../entities/TrainingDummy";
import { DamageText } from "../effects/DamageText";
import { Hud } from "../ui/Hud";

const DEBUG_HIT_LOG = true;

export class MainScene extends Phaser.Scene {
  private cursors!: { [key: string]: Phaser.Input.Keyboard.Key };
  private player!: Player;
  private projectileManager!: ProjectileManager;
  private hud!: Hud;

  private dummies: TrainingDummy[] = [];
  private killCount = 0;

  constructor() {
    super("main");
  }

  preload() {
    this.createPlaceholderTextures();
  }

  create() {
    this.physics.world.setBounds(0, 0, 2200, 1400);
    this.createRealmMap();

    this.player = new Player(this, 640, 360);
    this.projectileManager = new ProjectileManager(this);
    this.spawnTrainingDummies();

    this.cursors = this.input.keyboard!.addKeys("W,A,S,D,Q,E") as { [key: string]: Phaser.Input.Keyboard.Key };
    this.registerInput();

    this.hud = new Hud(this);
    this.cameras.main.startFollow(this.player.body, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 2200, 1400);
  }

  update(_time: number, delta: number) {
    const now = performance.now();

    this.player.move(this.cursors);
    this.player.rotateTo(this.input.activePointer, this.cameras.main);
    this.handleSkillInput(now);

    this.player.update(delta, now);
    this.projectileManager.update();
    this.dummies.forEach((d) => d.update());
    this.processProjectileHits();

    this.hud.render({
      health: this.player.health,
      mana: this.player.mana,
      cooldowns: this.player.cooldowns,
      kills: this.killCount,
      shieldEndAt: this.player.shieldEndAt
    });
  }

  private registerInput() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) return;

      const now = performance.now();
      if (now < this.player.cooldowns.sword || this.player.mana < GAME_BALANCE.projectile.manaCost) {
        return;
      }

      this.player.cooldowns.sword = now + GAME_BALANCE.projectile.cooldownMs;
      this.player.mana -= GAME_BALANCE.projectile.manaCost;

      const wp = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
      const angle = Phaser.Math.Angle.Between(this.player.body.x, this.player.body.y, wp.x, wp.y);
      this.projectileManager.spawn(this.player.body.x, this.player.body.y, angle);
    });
  }

  private handleSkillInput(now: number) {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.Q)) {
      const skill = GAME_BALANCE.skills.shield;
      if (now >= this.player.cooldowns.shield && this.player.mana >= skill.costMana) {
        this.player.activateShield(now);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.E)) {
      const skill = GAME_BALANCE.skills.burst;
      if (now >= this.player.cooldowns.burst && this.player.mana >= skill.costMana) {
        this.player.cooldowns.burst = now + skill.cooldownMs;
        this.player.mana -= skill.costMana;

        this.castBurst();
      }
    }
  }

  private processProjectileHits() {
    const projectiles = this.projectileManager.getActiveProjectiles();

    projectiles.forEach((projectile) => {
      const projectileRadius = (projectile.getData("hitRadius") as number) ?? 18;

      for (const dummy of this.dummies) {
        if (!dummy.alive || !projectile.active) continue;

        const dummyRadius = (dummy.body.getData("hitRadius") as number) ?? 22;
        const distance = Phaser.Math.Distance.Between(projectile.x, projectile.y, dummy.body.x, dummy.body.y);
        const hitThreshold = projectileRadius + dummyRadius;

        if (distance <= hitThreshold) {
          this.applyProjectileHit(projectile, dummy);
          break;
        }
      }
    });
  }

  private applyProjectileHit(projectile: ProjectileSprite, dummy: TrainingDummy) {
    this.projectileManager.destroyProjectile(projectile);

    const damage = GAME_BALANCE.projectile.damage;
    const killed = dummy.takeDamage(damage, this.player.body.x, this.player.body.y);
    DamageText.spawn(this, dummy.body.x, dummy.body.y - 50, damage);

    if (killed) this.killCount += 1;

    if (DEBUG_HIT_LOG) {
      // eslint-disable-next-line no-console
      console.debug(`[hit] projectile -> dummy | dmg=${damage} killed=${killed} hp=${dummy.health}`);
      const marker = this.add.circle(dummy.body.x, dummy.body.y, 10, 0xf87171, 0.45).setDepth(9);
      this.tweens.add({
        targets: marker,
        alpha: 0,
        scale: 2,
        duration: 220,
        onComplete: () => marker.destroy()
      });
    }
  }

  private castBurst() {
    const skill = GAME_BALANCE.skills.burst;
    const aoe = this.add.circle(this.player.body.x, this.player.body.y, 12, 0xf59e0b, 0.45).setDepth(2);
    this.tweens.add({
      targets: aoe,
      radius: skill.radius,
      alpha: 0,
      duration: 320,
      onComplete: () => aoe.destroy()
    });

    this.dummies.forEach((dummy) => {
      if (!dummy.alive) return;
      const dist = Phaser.Math.Distance.Between(this.player.body.x, this.player.body.y, dummy.body.x, dummy.body.y);
      if (dist <= skill.radius) {
        const killed = dummy.takeDamage(skill.damage, this.player.body.x, this.player.body.y);
        DamageText.spawn(this, dummy.body.x, dummy.body.y - 50, skill.damage);
        if (killed) this.killCount += 1;
      }
    });
  }

  private spawnTrainingDummies() {
    const points = [
      { x: 980, y: 460 },
      { x: 1340, y: 760 },
      { x: 1720, y: 980 }
    ];
    this.dummies = points.map((p) => new TrainingDummy(this, p.x, p.y));
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
      .text(80, 110, "玄灵秘境（训练场）", {
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

    g.fillStyle(0xeab308, 1);
    g.fillRoundedRect(0, 0, 34, 44, 8);
    g.fillStyle(0x7c2d12, 1);
    g.fillRect(14, 44, 6, 12);
    g.generateTexture("dummy", 34, 56);
    g.clear();

    g.fillStyle(0xf8fafc, 1);
    g.fillTriangle(12, 0, 24, 32, 0, 32);
    g.generateTexture("sword", 24, 32);

    g.destroy();
  }
}
