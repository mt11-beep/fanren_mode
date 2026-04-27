import Phaser from "phaser";
import { GAME_BALANCE } from "@xuanfight/shared";
import { ProjectileManager, type ProjectileSprite } from "../combat/ProjectileManager";
import { Player } from "../entities/Player";
import { TrainingDummy } from "../entities/TrainingDummy";
import { DamageText } from "../effects/DamageText";
import { Hud } from "../ui/Hud";

const DEBUG_HIT_LOG = true;
const WORLD_RECT = new Phaser.Geom.Rectangle(0, 0, 2200, 1400);

export class MainScene extends Phaser.Scene {
  private cursors!: { [key: string]: Phaser.Input.Keyboard.Key };
  private player!: Player;
  private projectileManager!: ProjectileManager;
  private hud!: Hud;

  private dummies: TrainingDummy[] = [];
  private killCount = 0;
  private aimAngle = 0;

  private comboCount = 0;
  private comboExpiresAt = 0;
  private combatLogs: string[] = [];
  private paused = false;

  constructor() {
    super("main");
  }

  preload() {
    this.createPlaceholderTextures();
  }

  create() {
    this.physics.world.setBounds(WORLD_RECT.x, WORLD_RECT.y, WORLD_RECT.width, WORLD_RECT.height);
    this.createRealmMap();

    this.player = new Player(this, 640, 360);
    this.projectileManager = new ProjectileManager(this);
    this.spawnTrainingDummies();

    this.cursors = this.input.keyboard!.addKeys("W,A,S,D,Q,E") as { [key: string]: Phaser.Input.Keyboard.Key };
    this.registerInput();

    this.hud = new Hud(this, {
      onTogglePause: () => this.togglePause(),
      onResetArena: () => this.resetArena()
    });
    this.hud.setCombatLogs(["训练开始"]);

    this.cameras.main.startFollow(this.player.body, true, 0.1, 0.1);
    this.cameras.main.setBounds(WORLD_RECT.x, WORLD_RECT.y, WORLD_RECT.width, WORLD_RECT.height);
  }

  update(_time: number, delta: number) {
    const now = performance.now();

    this.aimAngle = this.player.aimAt(this.input.activePointer, this.cameras.main);

    if (!this.paused) {
      this.player.move(this.cursors);
      this.handleSkillInput(now);

      this.player.update(delta, now);
      this.projectileManager.update(WORLD_RECT);
      this.dummies.forEach((dummy) => dummy.update());
      this.checkProjectileHits();

      if (now > this.comboExpiresAt) {
        this.comboCount = 0;
      }
    }

    this.hud.render({
      health: this.player.health,
      mana: this.player.mana,
      cooldowns: this.player.cooldowns,
      kills: this.killCount,
      shieldEndAt: this.player.shieldEndAt,
      comboCount: this.comboCount,
      paused: this.paused
    });
  }

  private registerInput() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.paused || !pointer.leftButtonDown()) return;

      const now = performance.now();
      if (now < this.player.cooldowns.sword || this.player.mana < GAME_BALANCE.projectile.manaCost) {
        return;
      }

      this.player.cooldowns.sword = now + GAME_BALANCE.projectile.cooldownMs;
      this.player.mana -= GAME_BALANCE.projectile.manaCost;

      this.projectileManager.spawn(this.player.body.x, this.player.body.y, this.aimAngle);
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

  private checkProjectileHits() {
    const projectiles = this.projectileManager.getActiveProjectiles();

    projectiles.forEach((projectile) => {
      const projectileRadius = (projectile.getData("hitRadius") as number) ?? 18;

      for (const dummy of this.dummies) {
        if (!dummy.alive || !projectile.active) continue;

        const dummyRadius = (dummy.body.getData("hitRadius") as number) ?? 22;
        const distance = Phaser.Math.Distance.Between(projectile.x, projectile.y, dummy.body.x, dummy.body.y);

        if (distance <= Math.max(40, projectileRadius + dummyRadius)) {
          this.projectileManager.destroyProjectile(projectile);
          this.applyDamageToDummy(dummy, GAME_BALANCE.projectile.damage, projectile.x, projectile.y, 1, "飞剑");
          break;
        }
      }
    });
  }

  private applyDamageToDummy(
    dummy: TrainingDummy,
    damage: number,
    sourceX: number,
    sourceY: number,
    knockbackScale: number,
    sourceLabel: "飞剑" | "震荡术"
  ) {
    const killed = dummy.takeDamage(damage, sourceX, sourceY, knockbackScale);
    DamageText.spawn(this, dummy.body.x, dummy.body.y - 50, damage);

    this.comboCount += 1;
    this.comboExpiresAt = performance.now() + 1600;

    this.pushCombatLog(`${sourceLabel}命中训练假人 -${damage}`);

    if (killed) {
      this.killCount += 1;
      this.pushCombatLog("击败训练假人");
    }

    if (DEBUG_HIT_LOG) {
      // eslint-disable-next-line no-console
      console.debug("[combat] hit dummy", { sourceLabel, damage, killed, hp: dummy.health });
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
        this.applyDamageToDummy(
          dummy,
          skill.damage,
          this.player.body.x,
          this.player.body.y,
          skill.knockbackScale,
          "震荡术"
        );
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

  private pushCombatLog(message: string) {
    this.combatLogs.unshift(message);
    this.combatLogs = this.combatLogs.slice(0, 6);
    this.hud.setCombatLogs(this.combatLogs);
  }

  private togglePause() {
    this.paused = !this.paused;
    this.pushCombatLog(this.paused ? "训练已暂停" : "训练继续");
  }

  private resetArena() {
    this.killCount = 0;
    this.comboCount = 0;
    this.comboExpiresAt = 0;

    this.projectileManager.clearAll();
    this.dummies.forEach((dummy) => dummy.resetToSpawn());

    this.pushCombatLog("训练场已重置");
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

    this.add.rectangle(1100, 700, 2200, 1400).setStrokeStyle(6, 0xfde68a, 0.8);

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

    g.fillStyle(0xdbeafe, 1);
    g.fillTriangle(10, 0, 20, 30, 0, 30);
    g.lineStyle(2, 0x93c5fd, 1);
    g.strokeTriangle(10, 0, 20, 30, 0, 30);
    g.generateTexture("sword", 20, 30);

    g.destroy();
  }
}
